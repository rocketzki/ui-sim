import React from 'react';

interface SmartphoneViewProps {
  children: React.ReactNode;
  platform: string;
}

export const SmartphoneView: React.FC<SmartphoneViewProps> = ({ children, platform }) => {
  const getStatusBarColor = () => {
    switch (platform) {
      case 'whatsapp': return 'bg-green-600';
      case 'messenger': return 'bg-blue-600';
      case 'discord': return 'bg-indigo-600';
      case 'slack': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getAppIcon = () => {
    switch (platform) {
      case 'whatsapp': return '📱';
      case 'messenger': return '💬';
      case 'discord': return '🎮';
      case 'slack': return '💼';
      default: return '📱';
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      {/* Phone Frame */}
      <div className="relative">
        {/* Phone Outline */}
        <div className="w-80 h-[640px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
            {/* Status Bar */}
            <div className={`${getStatusBarColor()} text-white px-6 py-2 flex justify-between items-center text-sm font-medium`}>
              <div className="flex items-center space-x-1">
                <span>9:41</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <span className="text-xs">100%</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* App Header */}
            <div className={`${getStatusBarColor()} text-white px-4 py-3 flex items-center space-x-3`}>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg">
                {getAppIcon()}
              </div>
              <div className="flex-1">
                <h1 className="font-semibold text-lg capitalize">{platform}</h1>
                <p className="text-xs opacity-90">Online</p>
              </div>
              <div className="flex space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-120px)] overflow-hidden">
              {children}
            </div>

            {/* Navigation Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  </svg>
                  <span className="text-xs text-blue-500 font-medium">Chats</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-400">Contacts</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-400">Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
      </div>
    </div>
  );
};
