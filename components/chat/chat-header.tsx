
import React from "react";

export const ChatHeader: React.FC = () => {
  return (
    <header className="">
      <div className="flex items-center justify-end px-4 py-3 ">
        <div className="rounded-full bg-white px-1 py-1">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.5937 11.3404C18.1503 16.0745 13.4152 19.4334 8.75903 18.4091C-0.0676434 16.4675 1.01808 3.4604 9.83838 2.65625C5.6616 8.23096 12.943 15.4611 18.5937 11.3404Z"
              stroke="#101010"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </header>
  );
};
