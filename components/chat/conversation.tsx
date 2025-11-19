'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ConversationProps {
  messages: Message[];
}

export const Conversation: React.FC<ConversationProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSending } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            {message.role === 'assistant' && (
              <div className="shrink-0 w-8 h-8 bg-linear-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            )}

            <div
              className={`flex flex-col max-w-3xl ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#2a2a2a] text-white'
                    : 'bg-transparent text-gray-300'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 px-2">
                {formatTime(message.created_at)}
              </span>
            </div>

            {message.role === 'user' && (
              <div className="shrink-0 w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator when AI is generating response */}
        {isSending && (
          <div className="flex gap-4 justify-start animate-fadeIn">
            <div className="shrink-0 w-8 h-8 bg-linear-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col max-w-3xl items-start">
              <div className="rounded-2xl px-4 py-3 bg-transparent text-gray-300">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
