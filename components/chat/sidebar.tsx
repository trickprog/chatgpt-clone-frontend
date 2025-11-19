"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useRouter } from "next/navigation";
import { ChatHeader } from "./chat-header";

export const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    conversations,
    currentConversation,
    messages,
    selectConversation,
    createNewConversation,
    deleteConversation,
  } = useChat();
  const router = useRouter();

  // Handle click outside to close sidebar on desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleNewChat = async () => {
    // Don't create a new conversation if the current one is empty
    if (currentConversation && messages.length === 0) {
      return;
    }
    await createNewConversation();
    closeSidebar();
  };

  const handleSelectConversation = async (id: string) => {
    await selectConversation(id);
    closeSidebar();
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      await deleteConversation(id);
    }
  };

  return (
    <>
      {/* Backdrop - Mobile only */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-500 opacity-40 z-40 lg:hidden transition-opacity duration-200"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${
          !isSidebarOpen ? "cursor-e-resize" : "cursor-default"
        } static top-0 left-0 h-full bg-[#0a0a0a] border-r border-gray-800 z-50 transition-[width] duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
        onClick={(e) => {
          if (!isSidebarOpen) {
            e.stopPropagation();
            setIsSidebarOpen(true);
          }
        }}
      >
        <div 
          className="flex flex-col h-full overflow-hidden"
          onClick={(e) => {
            if (isSidebarOpen) {
              e.stopPropagation();
            }
          }}
        >
          {/* New Chat Button */}
          <div
            className={`flex items-center ${
              isSidebarOpen ? "justify-between" : "justify-center"
            } gap-3 px-4 mt-4 mb-8 transition-[w-64] duration-700 ease-in-out`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <g clipPath="url(#clip0_156_48)">
                  <path
                    d="M5.00074 0V5.00073H14.9993V14.9993H20V0H5.00074Z"
                    fill="white"
                  />
                  <path
                    d="M5.00074 5.00073H0V20H14.9993V14.9993H5.00074V5.00073Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_156_48">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              className={`cursor-pointer shrink-0 transition-opacity duration-200 ${
                isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3.5V20.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 9.4C3 7.15979 3 6.03968 3.43597 5.18404C3.81947 4.43139 4.43139 3.81947 5.18404 3.43597C6.03968 3 7.15979 3 9.4 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03968 21 7.15979 21 9.4V14.6C21 16.8402 21 17.9603 20.564 18.816C20.1805 19.5686 19.5686 20.1805 18.816 20.564C17.9603 21 16.8402 21 14.6 21H9.4C7.15979 21 6.03968 21 5.18404 20.564C4.43139 20.1805 3.81947 19.5686 3.43597 18.816C3 17.9603 3 16.8402 3 14.6V9.4Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Quick Actions */}
          <ul
            className={`flex ${
              isSidebarOpen ? "flex-col" : "flex-col items-center"
            } gap-3 px-2 transition-all duration-200`}
          >
            <li
              onClick={(e) => {
                e.stopPropagation();
                handleNewChat();
              }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors min-w-0 ${
                currentConversation && messages.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-900 cursor-pointer"
              }`}
              title={currentConversation && messages.length === 0 ? "Start chatting first" : "New Chat"}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M3 9.4C3 7.15979 3 6.03968 3.43597 5.18404C3.81947 4.43139 4.43139 3.81947 5.18404 3.43597C6.03968 3 7.15979 3 9.4 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03968 21 7.15979 21 9.4V14.6C21 16.8402 21 17.9603 20.564 18.816C20.1805 19.5686 19.5686 20.1805 18.816 20.564C17.9603 21 16.8402 21 14.6 21H9.4C7.15979 21 6.03968 21 5.18404 20.564C4.43139 20.1805 3.81947 19.5686 3.43597 18.816C3 17.9603 3 16.8402 3 14.6V9.4Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5 12L12 12M12 12L8.5 12M12 12L12 8.5M12 12L12 15.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`text-white text-sm whitespace-nowrap transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                New Chat
              </span>
            </li>

            <li className="flex items-center gap-3 hover:bg-gray-900 p-2 rounded-lg cursor-pointer transition-colors min-w-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M15.0115 5.97707V18.0229C15.0115 20.6679 18.3282 21.9765 20.1523 20.1524C21.9764 18.3283 20.6679 15.0115 18.0229 15.0115H5.97707C3.33209 15.0115 2.02354 18.3283 3.84764 20.1524C5.67174 21.9765 8.98853 20.6679 8.98853 18.0229V5.97707C8.98853 3.33209 5.67174 2.02355 3.84764 3.84765C2.02355 5.67175 3.33209 8.98854 5.97707 8.98854H18.0229C20.6679 8.98854 21.9764 5.67175 20.1523 3.84765C18.3283 2.02355 15.0115 3.33209 15.0115 5.97707Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`text-white text-sm whitespace-nowrap transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                Quick Actions
              </span>
            </li>

            <li className="flex items-center gap-3 hover:bg-gray-900 p-2 rounded-lg cursor-pointer transition-colors min-w-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M7.7215 17.7767C9.00169 18.853 10.6455 19.5 12.4383 19.5C16.5227 19.5 19.8336 16.1421 19.8336 12C19.8336 11.4665 19.7787 10.946 19.6743 10.4441M7.7215 17.7767C6.08525 16.401 5.04304 14.3239 5.04304 12C5.04304 7.85786 8.35403 4.5 12.4383 4.5C15.9966 4.5 18.9679 7.04862 19.6743 10.4441M7.7215 17.7767C9.52922 17.3576 11.6798 16.4839 13.8489 15.2138C16.3729 13.736 18.4259 12.0117 19.6743 10.4441M7.7215 17.7767C5.47594 18.2973 3.75946 18.1165 3.19377 17.1229C2.6111 16.0993 3.37556 14.4346 5.04291 12.6647M19.6743 10.4441C20.8315 8.99101 21.2974 7.67255 20.8062 6.80976C20.3081 5.93485 18.9179 5.69005 17.06 5.99933"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`text-white text-sm whitespace-nowrap transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                Spaces
              </span>
            </li>

            <li className="flex items-center gap-3 hover:bg-gray-900 p-2 rounded-lg cursor-pointer transition-colors min-w-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M12 12.75V12.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 12.75V12.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 12.75V12.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4397 3.33805 14.8005 3.93911 16.0072C4.39285 16.9182 3.76327 18.1473 3.52336 19.044C3.29066 19.9137 4.08631 20.7093 4.95601 20.4766C5.85267 20.2367 7.0818 19.6071 7.99278 20.0609C9.19953 20.6619 10.5603 21 12 21Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`text-white text-sm whitespace-nowrap transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                Chat History
              </span>
            </li>
          </ul>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto mt-4">
            <div
              className={`px-2 space-y-1 transition-opacity duration-200 ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              {isSidebarOpen &&
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectConversation(conv.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors group flex items-center justify-between gap-2 cursor-pointer ${
                      currentConversation?.id === conv.id
                        ? "bg-gray-800"
                        : "hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 truncate font-medium">
                        {conv.title}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all p-1"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}

              {isSidebarOpen && conversations.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No conversations yet
                </div>
              )}
            </div>
          </div>

          {/* Footer - User Profile */}
          <div className="p-4 border-t border-gray-800">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3 transition-opacity duration-200">
                <div className="w-8 h-8 bg-linear-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    User
                  </p>
                  <button
                    onClick={() => {
                      router.push("/login");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="w-full flex items-center justify-center transition-opacity duration-200"
                title="User Profile"
              >
                <div className="w-8 h-8 bg-linear-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
