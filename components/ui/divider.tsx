import React from 'react';

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = 'Or' }) => {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-800"></div>
      <span className="text-sm text-gray-500">{text}</span>
      <div className="flex-1 h-px bg-gray-800"></div>
    </div>
  );
};
