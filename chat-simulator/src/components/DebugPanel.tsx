import React, { useState, useEffect } from 'react';

interface DebugPanelProps {
  taskId: string | null;
  progress: number;
  status: string;
  error: string | null;
}

interface PythonLogs {
  success: boolean;
  logs: string;
  errors: string;
  timestamp: string;
}

interface PythonStatus {
  success: boolean;
  status: string;
  pythonService?: any;
  error?: string;
  timestamp: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  taskId,
  progress,
  status,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPythonLogs, setShowPythonLogs] = useState(false);
  const [pythonLogs, setPythonLogs] = useState<PythonLogs | null>(null);
  const [pythonStatus, setPythonStatus] = useState<PythonStatus | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchPythonLogs = async () => {
    setLoadingLogs(true);
    try {
      // Since we're connecting directly to Python, we'll create a simple log viewer
      // that shows the current status instead of fetching from Node.js server
      const response = await fetch('http://localhost:5000/health');
      const healthData = await response.json();
      
      setPythonLogs({
        success: true,
        logs: `Python Service Health Check:\n${JSON.stringify(healthData, null, 2)}\n\nTo view full logs, run:\n./view-python-logs.sh`,
        errors: '',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to fetch Python logs:', error);
      setPythonLogs({
        success: false,
        logs: '',
        errors: 'Failed to connect to Python service. Make sure it\'s running on port 5000.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchPythonStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      setPythonStatus({
        success: true,
        status: 'healthy',
        pythonService: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to fetch Python status:', error);
      setPythonStatus({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    if (showPythonLogs && !pythonLogs) {
      fetchPythonLogs();
      fetchPythonStatus();
    }
  }, [showPythonLogs, pythonLogs]);

  if (!taskId && !error) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        🐛 Debug {isOpen ? '▼' : '▶'}
      </button>
      
      {isOpen && (
        <div className="mt-2 bg-white border rounded-lg shadow-lg p-3 min-w-80 max-w-96">
          <div className="text-sm font-medium mb-2">Debug Information</div>
          
          <div className="space-y-1 text-xs">
            <div><strong>Task ID:</strong> {taskId || 'None'}</div>
            <div><strong>Status:</strong> {status}</div>
            <div><strong>Progress:</strong> {progress}%</div>
            {error && (
              <div className="text-red-600">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
          
          <div className="mt-3 border-t pt-2">
            <button
              onClick={() => setShowPythonLogs(!showPythonLogs)}
              className="text-xs text-blue-600 hover:text-blue-800 mb-2"
            >
              🐍 Python Service {showPythonLogs ? '▼' : '▶'}
            </button>
            
            {showPythonLogs && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={fetchPythonLogs}
                    disabled={loadingLogs}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loadingLogs ? 'Loading...' : 'Refresh Logs'}
                  </button>
                  <button
                    onClick={fetchPythonStatus}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Check Status
                  </button>
                </div>
                
                {pythonStatus && (
                  <div className="text-xs">
                    <div><strong>Python Service:</strong> 
                      <span className={`ml-1 ${pythonStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                        {pythonStatus.status}
                      </span>
                    </div>
                    {pythonStatus.pythonService && (
                      <div><strong>Health:</strong> {JSON.stringify(pythonStatus.pythonService)}</div>
                    )}
                    {pythonStatus.error && (
                      <div className="text-red-600"><strong>Error:</strong> {pythonStatus.error}</div>
                    )}
                  </div>
                )}
                
                {pythonLogs && (
                  <div className="text-xs">
                    <div className="font-medium mb-1">Recent Logs:</div>
                    <div className="bg-gray-100 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                      {pythonLogs.success ? (
                        <div>
                          {pythonLogs.logs && (
                            <div className="whitespace-pre-wrap">{pythonLogs.logs}</div>
                          )}
                          {pythonLogs.errors && (
                            <div className="text-red-600 whitespace-pre-wrap">{pythonLogs.errors}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-600">Failed to fetch logs: {pythonLogs.errors}</div>
                      )}
                    </div>
                    <div className="text-gray-500 mt-1">
                      Last updated: {new Date(pythonLogs.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Check browser console and server logs for more details
          </div>
        </div>
      )}
    </div>
  );
};
