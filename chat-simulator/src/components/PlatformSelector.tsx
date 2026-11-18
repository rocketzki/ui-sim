import React from 'react';
import type { ScenarioType } from '@/utils/scenarioLoader';

interface PlatformSelectorProps {
  selectedType: ScenarioType | null;
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

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedType,
  selectedPlatform,
  onPlatformSelect
}) => {
  if (!selectedType) return null;

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-3 text-gray-600 uppercase tracking-wide">
        {selectedType.icon} {selectedType.name} Platforms
      </h3>
      <div className="space-y-2">
        {selectedType.platforms.map((platform) => (
          <button
            key={platform.platform}
            onClick={() => onPlatformSelect(platform.platform)}
            className={`w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-center space-x-3 ${
              selectedPlatform === platform.platform
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="text-xl">{platformIcons[platform.platform] || '📱'}</div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">{platform.platform}</div>
              <div className="text-xs text-gray-500">{platform.scenarios?.length || 0} scenarios</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
