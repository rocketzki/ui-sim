import { useState, useCallback } from 'react';
import type { Scenario } from '@/types/scenario';

interface GifGenerationOptions {
  width?: number;
  height?: number;
  quality?: number;
  delay?: number;
  theme?: string;
}

interface GifTaskStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

interface GifGeneratorState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  taskId: string | null;
  downloadUrl: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useServerGifGenerator = () => {
  const [state, setState] = useState<GifGeneratorState>({
    isGenerating: false,
    progress: 0,
    error: null,
    taskId: null,
    downloadUrl: null,
  });

  const generateGif = useCallback(async (
    scenario: Scenario,
    options: GifGenerationOptions = {}
  ): Promise<string | null> => {
    const {
      width = 400,
      height = 600,
      quality = 10,
      delay = 1000,
      theme = 'whatsapp'
    } = options;

    setState({ 
      isGenerating: true, 
      progress: 0, 
      error: null, 
      taskId: null, 
      downloadUrl: null 
    });

    try {
      console.log('🔍 DEBUG: Starting GIF generation request');
      console.log('🔍 DEBUG: API_BASE_URL:', API_BASE_URL);
      console.log('🔍 DEBUG: Scenario:', scenario);
      console.log('🔍 DEBUG: Options:', { width, height, quality, delay, theme });
      
      // Submit task to server
      const requestBody = {
        scenario,
        options: { width, height, quality, delay, theme }
      };
      
      console.log('🔍 DEBUG: Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/api/gif/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 DEBUG: Error response:', errorText);
        if (response.status === 0 || response.status >= 500) {
          throw new Error('Server is not running. Please start the backend server first.');
        }
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 DEBUG: Response data:', data);
      const taskId = data.taskId;

      console.log('🔍 DEBUG: Task ID received:', taskId);
      setState(prev => ({ ...prev, taskId }));

      // Poll for status updates
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            console.log(`🔍 DEBUG: Polling status for task ${taskId}`);
            const statusResponse = await fetch(`${API_BASE_URL}/api/gif/status/${taskId}`);
            
            console.log(`🔍 DEBUG: Status response status:`, statusResponse.status);
            console.log(`🔍 DEBUG: Status response ok:`, statusResponse.ok);
            
            if (!statusResponse.ok) {
              const errorText = await statusResponse.text();
              console.log(`🔍 DEBUG: Status check error response:`, errorText);
              throw new Error(`Status check failed: ${statusResponse.status} - ${errorText}`);
            }

            const status: GifTaskStatus = await statusResponse.json();
            
            console.log('🔍 DEBUG: GIF Generation Status:', status); // Debug logging
            
            setState(prev => ({
              ...prev,
              progress: status.progress,
              error: status.error || null,
              downloadUrl: status.downloadUrl || null,
            }));

            if (status.status === 'completed' && status.downloadUrl) {
              console.log(`🔍 DEBUG: Task completed! Download URL: ${status.downloadUrl}`);
              clearInterval(pollInterval);
              setState(prev => ({ ...prev, isGenerating: false }));
              resolve(status.downloadUrl);
            } else if (status.status === 'failed') {
              console.log(`🔍 DEBUG: Task failed! Error: ${status.error}`);
              clearInterval(pollInterval);
              setState(prev => ({ 
                ...prev, 
                isGenerating: false, 
                error: status.error || 'GIF generation failed' 
              }));
              reject(new Error(status.error || 'GIF generation failed'));
            } else {
              console.log(`🔍 DEBUG: Task still processing. Status: ${status.status}, Progress: ${status.progress}%`);
            }
          } catch (error) {
            clearInterval(pollInterval);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('🔍 DEBUG: GIF Generation Error:', errorMessage); // Debug logging
            console.error('🔍 DEBUG: Error stack:', error);
            setState(prev => ({ 
              ...prev, 
              isGenerating: false, 
              error: errorMessage 
            }));
            reject(error);
          }
        }, 500); // Poll every 500ms for more responsive updates

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setState(prev => ({ 
            ...prev, 
            isGenerating: false, 
            error: 'GIF generation timed out' 
          }));
          reject(new Error('GIF generation timed out'));
        }, 300000);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({ 
        isGenerating: false, 
        progress: 0, 
        error: errorMessage, 
        taskId: null, 
        downloadUrl: null 
      });
      return null;
    }
  }, []);

  const downloadGif = useCallback((downloadUrl: string, filename: string = 'chat-simulation.gif') => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      error: null,
      taskId: null,
      downloadUrl: null,
    });
  }, []);

  return {
    generateGif,
    downloadGif,
    reset,
    isGenerating: state.isGenerating,
    progress: state.progress,
    error: state.error,
    taskId: state.taskId,
    downloadUrl: state.downloadUrl,
  };
};
