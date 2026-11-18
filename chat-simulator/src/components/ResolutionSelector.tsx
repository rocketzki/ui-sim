import React from 'react';

export interface Resolution {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
}

export const PC_RESOLUTIONS: Resolution[] = [
  {
    id: 'hd',
    name: 'HD (720p)',
    width: 1280,
    height: 720,
    description: 'Standard HD resolution'
  },
  {
    id: 'fhd',
    name: 'Full HD (1080p)',
    width: 1920,
    height: 1080,
    description: 'Most popular desktop resolution'
  },
  {
    id: 'qhd',
    name: 'QHD (1440p)',
    width: 2560,
    height: 1440,
    description: 'High-end gaming monitors'
  },
  {
    id: '4k',
    name: '4K UHD',
    width: 3840,
    height: 2160,
    description: 'Ultra-high definition'
  },
  {
    id: 'ultrawide',
    name: 'Ultrawide (21:9)',
    width: 2560,
    height: 1080,
    description: 'Wide aspect ratio'
  },
  {
    id: 'macbook',
    name: 'MacBook Pro',
    width: 1440,
    height: 900,
    description: 'MacBook Pro 15" resolution'
  },
  {
    id: 'surface',
    name: 'Surface Pro',
    width: 1368,
    height: 912,
    description: 'Microsoft Surface Pro'
  },
  {
    id: 'compact',
    name: 'Compact Desktop',
    width: 1024,
    height: 768,
    description: 'Smaller desktop window'
  }
];

interface ResolutionSelectorProps {
  selectedResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
  viewType: 'smartphone' | 'pc';
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({
  selectedResolution,
  onResolutionChange,
  viewType
}) => {
  if (viewType === 'smartphone') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Resolution
        </label>
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>400 × 600</strong> - Standard mobile portrait
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Desktop Resolution
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PC_RESOLUTIONS.map((resolution) => (
          <button
            key={resolution.id}
            onClick={() => onResolutionChange(resolution)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selectedResolution.id === resolution.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="font-medium text-sm">{resolution.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {resolution.width} × {resolution.height}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {resolution.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
