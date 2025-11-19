'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isSending, currentConversation, createNewConversation } = useChat();

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const messageToSend = message.trim();
    setMessage(''); // Clear input immediately

    try {
      // If no current conversation, create one
      if (!currentConversation) {
        const newConv = await createNewConversation();
        if (!newConv) {
          alert('Failed to create conversation');
          return;
        }
        // The context will handle setting the current conversation
      }
      
      await sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageToSend); // Restore message on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end bg-[#1a1a1a] border border-gray-800 rounded-xl">
        <button
          type="button"
          className="absolute left-3 bottom-3 p-1 text-gray-400 hover:text-white transition-colors"
          disabled={isSending}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isSending ? "Sending..." : "Ask something..."}
          rows={1}
          disabled={isSending}
          className="flex-1 pl-11 pr-24 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none max-h-[300px] overflow-y-auto disabled:opacity-50"
        />
        
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-white transition-colors"
            disabled={isSending}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
          
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <svg
                className="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {isSending && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI is thinking...
        </p>
      )}
    </form>
  );
};
