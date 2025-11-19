import React from "react";
import { Logo } from "@/components/ui";
import { ChatInput } from "./chat-input";

export const ChatState: React.FC = () => {
  return (
    <>
  <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="flex justify-center">
          <Logo size="3xl" showtext={false} />
        </div>
        <div className="w-full">
          <ChatInput />
        </div>
      </div>
    </div>
    </>
  );
};
