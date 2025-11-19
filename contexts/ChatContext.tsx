'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { apiService, Message, Conversation } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Actions
  loadConversations: () => Promise<void>;
  createNewConversation: (title?: string) => Promise<Conversation | null>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const conversationsChannelRef = useRef<RealtimeChannel | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Set up real-time subscription for conversation updates
  useEffect(() => {
    // Subscribe to conversation updates (title changes, etc.)
    const conversationsChannel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('Conversation updated via realtime:', payload.new);
          const updatedConversation = payload.new as Conversation;
          
          // Update conversations list
          setConversations((prev) =>
            prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
          );
          
          // Update current conversation if it's the one that changed
          if (currentConversation?.id === updatedConversation.id) {
            setCurrentConversation(updatedConversation);
          }
        }
      )
      .subscribe();

    conversationsChannelRef.current = conversationsChannel;

    // Cleanup
    return () => {
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current);
      }
    };
  }, [currentConversation?.id]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!currentConversation) {
      // Clean up subscription if no conversation
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Clean up polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Set up Supabase realtime subscription
    const channel = supabase
      .channel(`messages:${currentConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        (payload) => {
          console.log('New message received via realtime:', payload.new);
          const newMessage = payload.new as Message;
          
          setMessages((prev) => {
            // Check if message already exists
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Stop sending state when assistant responds
          if (newMessage.role === 'assistant') {
            setIsSending(false);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Fallback: Poll for new messages every 2 seconds
    // This ensures we get messages even if realtime fails
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const latestMessages = await apiService.getMessages(currentConversation.id);
        setMessages(latestMessages);
        
        // Check if we received an assistant message
        const hasAssistantResponse = latestMessages.some(
          m => m.role === 'assistant' && 
          new Date(m.created_at).getTime() > Date.now() - 3000 // within last 3 seconds
        );
        
        if (hasAssistantResponse) {
          setIsSending(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [currentConversation?.id]);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getConversations();
      setConversations(data);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewConversation = useCallback(async (title?: string) => {
    try {
      setError(null);
      const newConv = await apiService.createConversation(title);
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (err: any) {
      console.error('Failed to create conversation:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [conversation, messagesData] = await Promise.all([
        apiService.getConversation(conversationId),
        apiService.getMessages(conversationId),
      ]);
      
      setCurrentConversation(conversation);
      setMessages(messagesData);
    } catch (err: any) {
      console.error('Failed to select conversation:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation || !content.trim()) return;

    try {
      setIsSending(true);
      setError(null);
      
      // Optimistically add user message to UI
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: currentConversation.id,
        content: content.trim(),
        role: 'user',
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, tempUserMessage]);
      
      // Send message to backend
      const response = await apiService.sendMessage(currentConversation.id, content.trim());
      
      // Replace temp message with real one
      setMessages((prev) => 
        prev.map(m => m.id === tempUserMessage.id ? response.message : m)
      );
      
      // The assistant response will come via realtime subscription or polling
      
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message);
      setIsSending(false);
      
      // Remove temp message on error
      setMessages((prev) => prev.filter(m => !m.id.startsWith('temp-')));
    }
  }, [currentConversation]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setError(null);
      await apiService.deleteConversation(conversationId);
      
      setConversations((prev) => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
      setError(err.message);
    }
  }, [currentConversation]);

  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      setError(null);
      const updated = await apiService.updateConversation(conversationId, title);
      
      setConversations((prev) =>
        prev.map(c => c.id === conversationId ? updated : c)
      );
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(updated);
      }
    } catch (err: any) {
      console.error('Failed to update conversation:', err);
      setError(err.message);
    }
  }, [currentConversation]);

  const value: ChatContextType = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    error,
    loadConversations,
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    updateConversationTitle,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
