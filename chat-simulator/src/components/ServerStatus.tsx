import React, { useState, useEffect } from 'react';

interface ServerStatusProps {
  onServerReady?: () => void;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ onServerReady }) => {
  const [isServerRunning, setIsServerRunning] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (response.ok) {
          setIsServerRunning(true);
          onServerReady?.();
        } else {
          setIsServerRunning(false);
        }
      } catch (error) {
        setIsServerRunning(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkServerStatus();
    
    // Check every 5 seconds
    const interval = setInterval(checkServerStatus, 5000);
    
    return () => clearInterval(interval);
  }, [API_BASE_URL, onServerReady]);

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="text-sm">Checking server...</span>
      </div>
    );
  }

  if (!isServerRunning) {
    return (
      <div className="text-orange-600">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚠️</span>
          <span className="text-sm font-medium">Server Offline</span>
        </div>
        <div className="text-xs text-gray-500">
          Run: <span className="font-mono bg-gray-100 px-1 rounded">cd server && npm run dev</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600">
      <span className="text-lg">✅</span>
      <span className="text-sm">Server Connected</span>
    </div>
  );
};
