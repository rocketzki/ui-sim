import { useState, useCallback } from 'react';
import type { Scenario } from '@/types/scenario';

interface GifGenerationOptions {
  width?: number;
  height?: number;
  quality?: number;
  delay?: number;
  theme?: string;
  viewType?: 'smartphone' | 'pc';
}

interface PythonGifResponse {
  success: boolean;
  filename?: string;
  error?: string;
}

interface GifGeneratorState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  taskId: string | null;
  downloadUrl: string | null;
}

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5000';

export const usePythonGifGenerator = () => {
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
      width = options.viewType === 'pc' ? 1280 : 400,
      height = options.viewType === 'pc' ? 720 : 600,
      quality = 10,
      delay = 1000,
      theme = 'whatsapp',
      viewType = 'smartphone'
    } = options;

    setState({ 
      isGenerating: true, 
      progress: 0, 
      error: null, 
      taskId: null, 
      downloadUrl: null 
    });

    try {
      console.log('🐍 DEBUG: Starting direct Python GIF generation');
      console.log('🐍 DEBUG: Python API URL:', PYTHON_API_URL);
      console.log('🐍 DEBUG: Scenario:', scenario);
      console.log('🐍 DEBUG: Options:', { width, height, quality, delay, theme });
      
      // Generate a unique task ID
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setState(prev => ({ ...prev, taskId }));

      // Simulate progress updates since Python service doesn't provide real-time progress
      const progressInterval = setInterval(() => {
        setState(prev => {
          const newProgress = Math.min(prev.progress + Math.random() * 10, 90);
          return { ...prev, progress: newProgress };
        });
      }, 500);

      // Prepare frames data - we'll create a simple animation based on the scenario
      const framesBase64 = await createScenarioFrames(scenario, { width, height, theme, viewType });
      
      console.log('🐍 DEBUG: Sending request to Python service with', framesBase64.length, 'frames');
      
      // Call Python service directly
      const response = await fetch(`${PYTHON_API_URL}/generate-gif`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frames: framesBase64,
          width: width,
          height: height,
          duration: delay,
          loop: 0,
          task_id: taskId
        }),
      });

      console.log('🐍 DEBUG: Python response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🐍 DEBUG: Python error response:', errorText);
        throw new Error(`Python service error: ${response.status} - ${errorText}`);
      }

      const data: PythonGifResponse = await response.json();
      console.log('🐍 DEBUG: Python response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'Python GIF generation failed');
      }

      // Download the GIF from Python service
      const downloadUrl = `${PYTHON_API_URL}/download/${data.filename}`;
      
      clearInterval(progressInterval);
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        progress: 100, 
        downloadUrl 
      }));

      console.log('🐍 DEBUG: GIF generation completed! Download URL:', downloadUrl);
      return downloadUrl;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('🐍 DEBUG: Python GIF Generation Error:', errorMessage);
      
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

  const createScenarioFrames = async (scenario: Scenario, options: { width: number; height: number; theme: string; viewType: string }): Promise<string[]> => {
    // Create a simple HTML canvas to generate frames
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    // Add roundRect polyfill if not available
    if (!ctx.roundRect) {
      ctx.roundRect = function(x: number, y: number, width: number, height: number, radius: number) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }

    const frames: string[] = [];
    const messageCount = Math.min(scenario.messages.length, 8); // Reduced for better fit with new spacing
    
    // Calculate available space based on view type
    let headerHeight: number;
    let inputHeight: number;
    let statusBarHeight: number;
    
    if (options.viewType === 'smartphone') {
      statusBarHeight = 30;
      headerHeight = 60;
      inputHeight = 60;
    } else {
      statusBarHeight = 35; // Title bar height
      headerHeight = 60;   // Header height
      inputHeight = 60;    // Input area height
    }
    
    const totalUsedHeight = statusBarHeight + headerHeight + inputHeight;
    const availableHeight = options.height - totalUsedHeight;
    const maxMessages = Math.floor(availableHeight / 95); // 80px per message + 15px timestamp spacing
    const finalMessageCount = Math.min(messageCount, maxMessages);
    
    // Create frames showing progressive message appearance
    for (let i = 0; i < finalMessageCount; i++) {
      // Clear canvas
      ctx.fillStyle = getThemeBackground(options.theme);
      ctx.fillRect(0, 0, options.width, options.height);
      
      // Draw chat interface
      drawChatInterface(ctx, options.width, options.height, options.theme, options.viewType);
      
      // Draw messages up to current frame
      for (let j = 0; j <= i; j++) {
        const message = scenario.messages[j];
        if (message) {
          const participant = scenario.participants.find(p => p.id === message.sender);
          const isSent = participant?.type === 'sender';
          drawMessage(ctx, message, j, options.width, options.height, options.theme, isSent, options.viewType);
        }
      }
      
      // Add some empty frames at the end for pause effect
      if (i === finalMessageCount - 1) {
        // Add 2 more frames with all messages visible
        for (let k = 0; k < 2; k++) {
          const pauseFrame = document.createElement('canvas');
          pauseFrame.width = options.width;
          pauseFrame.height = options.height;
          const pauseCtx = pauseFrame.getContext('2d');
          
          if (pauseCtx) {
            pauseCtx.fillStyle = getThemeBackground(options.theme);
            pauseCtx.fillRect(0, 0, options.width, options.height);
            drawChatInterface(pauseCtx, options.width, options.height, options.theme, options.viewType);
            
            for (let j = 0; j < finalMessageCount; j++) {
              const message = scenario.messages[j];
              if (message) {
                const participant = scenario.participants.find(p => p.id === message.sender);
                const isSent = participant?.type === 'sender';
                drawMessage(pauseCtx, message, j, options.width, options.height, options.theme, isSent, options.viewType);
              }
            }
            
            const dataURL = pauseFrame.toDataURL('image/png');
            const base64Data = dataURL.split(',')[1];
            frames.push(base64Data);
          }
        }
      }
      
      // Convert canvas to base64 data URL
      const dataURL = canvas.toDataURL('image/png');
      // Extract base64 data (remove "data:image/png;base64," prefix)
      const base64Data = dataURL.split(',')[1];
      frames.push(base64Data);
    }
    
    return frames;
  };

  const getThemeBackground = (theme: string): string => {
    const themes: Record<string, string> = {
      whatsapp: '#e5ddd5',
      messenger: '#f0f2f5',
      discord: '#36393f',
      slack: '#f8f8f8'
    };
    return themes[theme] || themes.whatsapp;
  };

  const getThemeHeaderTextColor = (theme: string): string => {
    const themes: Record<string, string> = {
      whatsapp: '#ffffff',
      messenger: '#ffffff',
      discord: '#ffffff',
      slack: '#ffffff',
      telegram: '#ffffff',
      signal: '#ffffff',
      teams: '#ffffff',
      imessage: '#ffffff'
    };
    return themes[theme] || themes.whatsapp;
  };

  const drawChatInterface = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: string, viewType: string = 'smartphone') => {
    if (viewType === 'smartphone') {
      drawSmartphoneInterface(ctx, width, height, theme);
    } else {
      drawPCInterface(ctx, width, height, theme);
    }
  };

  const drawSmartphoneInterface = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: string) => {
    // Draw realistic smartphone chat background
    const bgColor = getThemeBackground(theme);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle pattern/texture to background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 20) {
      for (let j = 0; j < height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
    }
    
    // Draw status bar
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, 30);
    
    // Status bar text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('9:41', 15, 20);
    
    // Battery icon
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width - 35, 8, 20, 10);
    ctx.fillRect(width - 15, 10, 2, 6);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(width - 33, 10, 16, 6);
    
    // Signal bars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const barHeight = 4 + i * 2;
      ctx.fillRect(width - 60 + i * 4, 20 - barHeight, 2, barHeight);
    }
    
    // Draw app header
    const headerY = 30;
    const headerHeight = 60;
    const headerGradient = ctx.createLinearGradient(0, headerY, 0, headerY + headerHeight);
    headerGradient.addColorStop(0, getThemeHeaderColor(theme));
    headerGradient.addColorStop(1, adjustColorBrightness(getThemeHeaderColor(theme), -20));
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, headerY, width, headerHeight);
    
    // App icon with platform-specific styling
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(25, headerY + 30, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Platform-specific icon
    ctx.fillStyle = getThemeHeaderTextColor(theme);
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    const platformIcon = getPlatformIcon(theme);
    ctx.fillText(platformIcon, 25, headerY + 35);
    
    // App name
    ctx.fillStyle = getThemeHeaderTextColor(theme);
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(theme.charAt(0).toUpperCase() + theme.slice(1), 50, headerY + 35);
    
    // Online status
    ctx.font = '12px Arial';
    ctx.fillText('Online', 50, headerY + 50);
    
    // Action buttons
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(width - 25, headerY + 30, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width - 50, headerY + 30, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw input area at bottom
    const inputHeight = 60;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, height - inputHeight, width, inputHeight);
    
    // Input field with better styling
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.roundRect(10, height - 45, width - 60, 30, 20);
    ctx.fill();
    
    // Input field border
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(10, height - 45, width - 60, 30, 20);
    ctx.stroke();
    
    // Send button with better styling
    ctx.fillStyle = getThemeHeaderColor(theme);
    ctx.beginPath();
    ctx.roundRect(width - 45, height - 45, 30, 30, 15);
    ctx.fill();
    
    // Send button icon
    ctx.fillStyle = getThemeHeaderTextColor(theme);
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('→', width - 30, height - 25);
    
    // Draw input placeholder
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Type a message...', 20, height - 25);
  };

  const drawPCInterface = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: string) => {
    // Draw PC chat interface with desktop-like appearance
    const bgColor = getThemeBackground(theme);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle desktop pattern/texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < width; i += 30) {
      for (let j = 0; j < height; j += 30) {
        if ((i + j) % 60 === 0) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
    }
    
    // Draw window shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(2, 2, width, height);
    
    // Draw main window background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw title bar with macOS-style gradient
    const titleGradient = ctx.createLinearGradient(0, 0, 0, 35);
    titleGradient.addColorStop(0, '#f5f5f5');
    titleGradient.addColorStop(0.5, '#e8e8e8');
    titleGradient.addColorStop(1, '#d8d8d8');
    ctx.fillStyle = titleGradient;
    ctx.fillRect(0, 0, width, 35);
    
    // Title bar border
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 35);
    ctx.lineTo(width, 35);
    ctx.stroke();
    
    // macOS-style window controls
    ctx.fillStyle = '#ff5f57';
    ctx.beginPath();
    ctx.arc(20, 17, 7, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.arc(45, 17, 7, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#28ca42';
    ctx.beginPath();
    ctx.arc(70, 17, 7, 0, 2 * Math.PI);
    ctx.fill();
    
    // Window title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${theme.charAt(0).toUpperCase() + theme.slice(1)} Chat`, width / 2, 22);
    
    // Draw sidebar for desktop layout - scale with resolution
    const sidebarWidth = Math.min(Math.max(250, width * 0.2), width * 0.3);
    const sidebarGradient = ctx.createLinearGradient(0, 35, sidebarWidth, 35);
    sidebarGradient.addColorStop(0, '#f8f9fa');
    sidebarGradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = sidebarGradient;
    ctx.fillRect(0, 35, sidebarWidth, height - 35);
    
    // Sidebar border
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sidebarWidth, 35);
    ctx.lineTo(sidebarWidth, height);
    ctx.stroke();
    
    // Draw header in main content area
    const headerY = 35;
    const headerHeight = 60;
    const headerGradient = ctx.createLinearGradient(sidebarWidth, headerY, sidebarWidth, headerY + headerHeight);
    headerGradient.addColorStop(0, getThemeHeaderColor(theme));
    headerGradient.addColorStop(1, adjustColorBrightness(getThemeHeaderColor(theme), -20));
    ctx.fillStyle = headerGradient;
    ctx.fillRect(sidebarWidth, headerY, width - sidebarWidth, headerHeight);
    
    // Platform icon in header
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(sidebarWidth + 30, headerY + 30, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = getThemeHeaderTextColor(theme);
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'center';
    const platformIcon = getPlatformIcon(theme);
    ctx.fillText(platformIcon, sidebarWidth + 30, headerY + 36);
    
    // Header text
    ctx.fillStyle = getThemeHeaderTextColor(theme);
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Chat Simulation', sidebarWidth + 60, headerY + 30);
    
    // Online status
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.fillText('Online', sidebarWidth + 60, headerY + 45);
    
    // Draw input area at bottom
    const inputHeight = 60;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(sidebarWidth, height - inputHeight, width - sidebarWidth, inputHeight);
    
    // Input area border
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sidebarWidth, height - inputHeight);
    ctx.lineTo(width, height - inputHeight);
    ctx.stroke();
    
    // Input field with modern styling
    ctx.fillStyle = 'white';
    ctx.fillRect(sidebarWidth + 15, height - 40, width - sidebarWidth - 100, 30);
    
    // Input field border and shadow
    ctx.strokeStyle = '#ced4da';
    ctx.lineWidth = 1;
    ctx.strokeRect(sidebarWidth + 15, height - 40, width - sidebarWidth - 100, 30);
    
    // Input placeholder
    ctx.fillStyle = '#6c757d';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Type a message...', sidebarWidth + 20, height - 20);
    
    // Send button with modern styling
    const sendButtonGradient = ctx.createLinearGradient(width - 60, height - 35, width - 60, height - 10);
    sendButtonGradient.addColorStop(0, getThemeHeaderColor(theme));
    sendButtonGradient.addColorStop(1, adjustColorBrightness(getThemeHeaderColor(theme), -20));
    ctx.fillStyle = sendButtonGradient;
    ctx.fillRect(width - 60, height - 35, 50, 25);
    
    // Send button border
    ctx.strokeStyle = adjustColorBrightness(getThemeHeaderColor(theme), -30);
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 60, height - 35, 50, 25);
    
    // Send button text
    ctx.fillStyle = getThemeHeaderTextColor(theme);
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Send', width - 35, height - 20);
    
    // Add sidebar content
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Conversations', 15, 60);
    
    // Add some conversation items
    const conversations = ['General Chat', 'Team Discussion', 'Project Updates'];
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    
    conversations.forEach((conv, index) => {
      const y = 80 + (index * 25);
      ctx.fillText(conv, 15, y);
      
      // Add unread indicator for first conversation
      if (index === 0) {
        ctx.fillStyle = '#dc3545';
        ctx.beginPath();
        ctx.arc(sidebarWidth - 15, y - 5, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#6c757d';
      }
    });
    
    // Add user profile section
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.fillText('Profile', 15, height - 80);
    
    // User avatar
    ctx.fillStyle = '#007bff';
    ctx.beginPath();
    ctx.arc(25, height - 50, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('U', 25, height - 45);
    
    // User name
    ctx.fillStyle = '#495057';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
    ctx.textAlign = 'left';
    ctx.fillText('User Name', 45, height - 45);
  };

  const getThemeHeaderColor = (theme: string): string => {
    const themes: Record<string, string> = {
      whatsapp: '#075e54',
      messenger: '#1877f2',
      discord: '#2f3136',
      slack: '#4a154b'
    };
    return themes[theme] || themes.whatsapp;
  };

  const drawMessage = (ctx: CanvasRenderingContext2D, message: any, index: number, width: number, height: number, theme: string, isSent: boolean = false, viewType: string = 'smartphone') => {
    // Calculate starting position based on view type
    let startY: number;
    let sidebarWidth = 0;
    
    if (viewType === 'smartphone') {
      startY = 90; // Status bar (30) + header (60)
    } else {
      startY = 95; // Title bar (35) + header (60)
      sidebarWidth = Math.min(Math.max(250, width * 0.2), width * 0.3);
    }
    
    const y = startY + (index * 80); // Start below header with more spacing
    const bubbleWidth = Math.min((width - sidebarWidth) * 0.6, viewType === 'pc' ? Math.min(600, width * 0.4) : 300);
    const bubbleHeight = 60; // Increased height for better text spacing
    const x = isSent ? width - bubbleWidth - 20 : sidebarWidth + 20;
    
    // Message bubble with rounded corners and shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, bubbleWidth, bubbleHeight, 15);
    ctx.fill();
    
    ctx.fillStyle = isSent ? getThemeSentColor(theme) : getThemeReceivedColor(theme);
    ctx.beginPath();
    ctx.roundRect(x, y, bubbleWidth, bubbleHeight, 15);
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, bubbleWidth, bubbleHeight, 15);
    ctx.stroke();
    
    // Message text
    ctx.fillStyle = isSent ? getThemeSentTextColor(theme) : getThemeReceivedTextColor(theme);
    const fontSize = viewType === 'pc' ? Math.min(18, Math.max(14, width / 80)) : 14;
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial`;
    ctx.textAlign = 'left';
    
    // Wrap text if too long
    const maxWidth = bubbleWidth - 20;
    const words = message.content.split(' ');
    let line = '';
    let lineY = y + 20;
    let lineCount = 0;
    const maxLines = 3; // Limit to 3 lines to prevent overflow
    
    for (let n = 0; n < words.length && lineCount < maxLines; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x + 10, lineY);
        line = words[n] + ' ';
        lineY += 18;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    // Draw remaining text or ellipsis if truncated
    if (lineCount >= maxLines && words.length > 0) {
      ctx.fillText(line.substring(0, line.length - 3) + '...', x + 10, lineY);
    } else {
      ctx.fillText(line, x + 10, lineY);
    }
    
    // Timestamp - positioned outside the bubble to avoid overlap
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    const timestampFontSize = viewType === 'pc' ? Math.min(14, Math.max(10, width / 100)) : 10;
    ctx.font = `${timestampFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial`;
    ctx.textAlign = isSent ? 'right' : 'left';
    const timestampY = y + bubbleHeight + 15; // Position below the bubble
    ctx.fillText(message.timestamp, isSent ? x + bubbleWidth : x, timestampY);
  };

  const getThemeSentColor = (theme: string): string => {
    const themes: Record<string, string> = {
      whatsapp: '#dcf8c6',
      messenger: '#1877f2',
      discord: '#5865f2',
      slack: '#1264a3'
    };
    return themes[theme] || themes.whatsapp;
  };

  const getThemeReceivedColor = (theme: string): string => {
    const themes: Record<string, string> = {
      whatsapp: '#ffffff',
      messenger: '#e4e6ea',
      discord: '#40444b',
      slack: '#ffffff'
    };
    return themes[theme] || themes.whatsapp;
  };

  const getThemeSentTextColor = (theme: string): string => {
    const themes: Record<string, string> = {
      whatsapp: '#000000',
      messenger: '#ffffff',
      discord: '#ffffff',
      slack: '#ffffff'
    };
    return themes[theme] || themes.whatsapp;
  };

  const getThemeReceivedTextColor = (theme: string): string => {
    const themes: Record<string, string> = {
      whatsapp: '#000000',
      messenger: '#000000',
      discord: '#dcddde',
      slack: '#1d1c1d'
    };
    return themes[theme] || themes.whatsapp;
  };

  const adjustColorBrightness = (color: string, amount: number): string => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Adjust brightness
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const getPlatformIcon = (theme: string): string => {
    const icons: Record<string, string> = {
      whatsapp: '💬',
      messenger: '💬',
      discord: '🎮',
      slack: '💼',
      telegram: '✈️',
      signal: '🔒'
    };
    return icons[theme] || '💬';
  };

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
