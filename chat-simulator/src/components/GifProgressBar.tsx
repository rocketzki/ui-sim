import React from 'react';

interface GifProgressBarProps {
  progress: number;
  isGenerating: boolean;
  error: string | null;
  taskId: string | null;
}

export const GifProgressBar: React.FC<GifProgressBarProps> = ({
  progress,
  isGenerating,
  error,
  taskId
}) => {
  if (!isGenerating && !error) return null;

  const getStatusText = () => {
    if (error) return '❌ Generation Failed';
    if (progress === 0) return '🚀 Starting generation...';
    if (progress < 25) return '📸 Capturing frames...';
    if (progress < 50) return '🎬 Processing animation...';
    if (progress < 75) return '⚙️ Optimizing GIF...';
    if (progress < 100) return '💾 Finalizing...';
    return '✅ Complete!';
  };

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (progress === 0) return 'bg-blue-500';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 100) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {getStatusText()}
        </span>
        <span className="text-sm text-gray-500">
          {progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${Math.max(progress, 5)}%` }}
        />
      </div>
      
      {taskId && (
        <div className="text-xs text-gray-500">
          Task ID: {taskId.substring(0, 8)}...
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-600 mt-2">
          Error: {error}
        </div>
      )}
    </div>
  );
};
