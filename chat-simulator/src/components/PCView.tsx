import React from 'react';

interface PCViewProps {
  children: React.ReactNode;
  platform: string;
}

export const PCView: React.FC<PCViewProps> = ({ children, platform }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      {/* PC Frame */}
      <div className="relative">
        {/* Monitor Outline */}
        <div className="w-[800px] h-[600px] bg-gray-800 rounded-lg p-2 shadow-2xl">
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
            {/* Title Bar */}
            <div className="bg-gray-200 px-4 py-2 flex justify-between items-center border-b border-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm font-medium text-gray-700 capitalize">
                {platform} - Chat Simulator
              </div>
              <div className="w-16"></div>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-40px)] overflow-hidden">
              {children}
            </div>
          </div>
        </div>

        {/* Monitor Stand */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gray-600 rounded-t-lg"></div>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-40 h-4 bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
};
