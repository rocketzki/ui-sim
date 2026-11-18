import React, { useState, useEffect, useRef } from 'react';
import type { ScenarioType } from '@/utils/scenarioLoader';

interface ScenarioTypeSelectorProps {
  scenarioTypes: ScenarioType[];
  selectedTypeId: string | null;
  onTypeSelect: (typeId: string) => void;
  selectedPlatform: string | null;
  onPlatformSelect: (platform: string) => void;
}

const platformIcons: Record<string, string> = {
  'WhatsApp': '💬',
  'Messenger': '💙',
  'Telegram': '✈️',
  'Discord': '🎮',
  'Slack': '💼',
  'iMessage': '📱',
  'Signal': '🔒',
  'Teams': '🏢'
};

export const ScenarioTypeSelector: React.FC<ScenarioTypeSelectorProps> = ({
  scenarioTypes,
  selectedTypeId,
  onTypeSelect,
  selectedPlatform,
  onPlatformSelect
}) => {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpandedType(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTypeClick = (typeId: string) => {
    if (expandedType === typeId) {
      setExpandedType(null);
    } else {
      setExpandedType(typeId);
      onTypeSelect(typeId);
    }
  };

  const handlePlatformClick = (platform: string) => {
    onPlatformSelect(platform);
    setExpandedType(null); // Close the menu after selection
  };

  return (
    <div className="p-4" ref={containerRef}>
      <h3 className="text-sm font-medium mb-3 text-gray-600 uppercase tracking-wide">Scenario Types</h3>
      <div className="space-y-1">
        {scenarioTypes.map((type) => (
          <div key={type.id}>
            <button
              onClick={() => handleTypeClick(type.id)}
              className={`w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-center space-x-3 ${
                selectedTypeId === type.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-xl">{type.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">{type.name}</div>
                <div className="text-xs text-gray-500">{type.platforms?.length || 0} platforms</div>
              </div>
              <div className={`transform transition-transform duration-200 ${
                expandedType === type.id ? 'rotate-180' : ''
              }`}>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {/* Platform Selection Menu */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedType === type.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="pl-4 pr-2 py-2 bg-gray-50 border-l-2 border-blue-200 ml-4">
                <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                  Choose Platform
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {type.platforms?.map((platform) => (
                    <button
                      key={platform.platform}
                      onClick={() => handlePlatformClick(platform.platform)}
                      className={`p-2 rounded-md border transition-all duration-200 text-center ${
                        selectedPlatform === platform.platform
                          ? 'border-blue-500 bg-blue-100 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-sm mb-1">{platformIcons[platform.platform] || '📱'}</div>
                      <div className="font-medium text-gray-800 text-xs">{platform.platform}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
