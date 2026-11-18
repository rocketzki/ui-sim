import React from 'react';

export type ViewType = 'smartphone' | 'pc';

interface ViewSelectorProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ selectedView, onViewChange }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border">
      <span className="text-sm font-medium text-gray-700">View Type:</span>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onViewChange('smartphone')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedView === 'smartphone'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Smartphone</span>
        </button>
        
        <button
          onClick={() => onViewChange('pc')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedView === 'pc'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 0v8h12V4H4z" clipRule="evenodd" />
            <path d="M6 12h8v1H6v-1z" />
          </svg>
          <span className="text-sm font-medium">PC</span>
        </button>
      </div>
    </div>
  );
};
