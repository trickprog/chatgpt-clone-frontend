"use client";

import {
  Sidebar,
  ChatHeader,
  ChatState,
  ChatInput,
  Conversation,
} from "@/components/chat";
import { ChatProvider, useChat } from "@/contexts/ChatContext";

function ChatPageContent() {
  const { messages, currentConversation, isLoading } = useChat();

  // Show conversation if there are messages or a current conversation
  const hasMessages = messages.length > 0;

  if (isLoading && !currentConversation) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] ">
      <Sidebar />

      <div className="w-full">
        {/* Chat Area - Show either empty state */}
        {hasMessages ? <Conversation messages={messages} /> : <ChatState />}

        {/* Input - Show if there's messages */}
        {hasMessages && (
          <div className="bg-[#0a0a0a] p-10">
            <div className="max-w-4xl mx-auto">
              <ChatInput />
            </div>
          </div>
        )}
      </div>
      <ChatHeader />
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}
