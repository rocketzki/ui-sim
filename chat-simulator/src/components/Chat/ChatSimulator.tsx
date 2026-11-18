import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { GifProgressBar } from '@/components/GifProgressBar';
import { DebugPanel } from '@/components/DebugPanel';
import { ViewSelector, ViewType } from '@/components/ViewSelector';
import { SmartphoneView } from '@/components/SmartphoneView';
import { PCView } from '@/components/PCView';
import { ResolutionSelector, PC_RESOLUTIONS, Resolution } from '@/components/ResolutionSelector';
import { usePythonGifGenerator } from '@/hooks/usePythonGifGenerator';
import type { Message, Scenario, ThemeName } from '@/types/scenario';

interface ChatSimulatorProps {
  scenario: Scenario;
  theme?: ThemeName;
  onMessageSent?: (message: Message) => void;
  onScenarioComplete?: () => void;
  onError?: (error: Error) => void;
  showReplayButton?: boolean;
  onGifComplete?: (message: string) => void;
  onGifError?: (message: string) => void;
}

class ScenarioEngine {
  private scenario: Scenario | null = null;
  private isPlaying = false;
  private isPaused = false;
  private timeoutId: number | null = null;
  private currentMessageIndex = 0;
  onMessage?: (message: Message) => void;
  onTypingStart?: (sender: string) => void;
  onTypingEnd?: () => void;

  loadScenario(scenario: Scenario) {
    this.scenario = scenario;
    this.currentMessageIndex = 0;
    this.isPaused = false;
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentMessageIndex = 0;
    if (this.timeoutId !== null) window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }

  pause() {
    this.isPaused = true;
    if (this.timeoutId !== null) window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }

  resume() {
    if (!this.scenario || !this.isPaused) return;
    this.isPaused = false;
    this.isPlaying = true;
    this.run(this.currentMessageIndex);
  }

  play() {
    if (!this.scenario || this.isPlaying) return;
    this.isPlaying = true;
    this.isPaused = false;
    this.currentMessageIndex = 0;
    this.run(0);
  }

  private run(index: number) {
    if (!this.scenario || this.isPaused) return;
    const message = this.scenario.messages[index];
    if (!message) {
      this.isPlaying = false;
      return;
    }

    this.currentMessageIndex = index;
    const typingDuration = message.typing_duration ?? 800;
    const delay = message.delay ?? 0;

    this.timeoutId = window.setTimeout(() => {
      if (this.isPaused) return;
      this.onTypingStart?.(message.sender);
      this.timeoutId = window.setTimeout(() => {
        if (this.isPaused) return;
        this.onTypingEnd?.();
        this.onMessage?.(message);
        this.run(index + 1);
      }, typingDuration);
    }, delay);
  }
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({
  scenario,
  theme = 'whatsapp',
  showReplayButton = true,
  onGifComplete,
  onGifError,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewType>('smartphone');
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(PC_RESOLUTIONS[0]); // Default to HD
  const engine = useMemo(() => new ScenarioEngine(), []);
  const chatRef = useRef<HTMLDivElement>(null);
  const { generateGif, downloadGif, isGenerating, progress, error, downloadUrl, taskId } = usePythonGifGenerator();

  const handleReplay = () => {
    setMessages([]);
    setIsComplete(false);
    setIsPlaying(true);
    setIsPaused(false);
    engine.stop();
    engine.loadScenario(scenario);
    engine.play();
  };

  const handlePause = () => {
    setIsPaused(true);
    engine.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsPlaying(true);
    engine.resume();
  };

  const handleGenerateGif = async () => {
    try {
      const downloadUrl = await generateGif(scenario, {
        width: selectedView === 'pc' ? selectedResolution.width : 400,
        height: selectedView === 'pc' ? selectedResolution.height : 600,
        quality: 10,
        delay: 1000,
        theme: theme,
        viewType: selectedView,
      });
      
      if (downloadUrl) {
        const resolutionSuffix = selectedView === 'pc' ? `_${selectedResolution.width}x${selectedResolution.height}` : '_mobile';
        const filename = `${scenario.title.replace(/[^a-zA-Z0-9]/g, '_')}_${theme}${resolutionSuffix}.gif`;
        downloadGif(downloadUrl, filename);
        onGifComplete?.(`GIF "${filename}" generated successfully!`);
      }
    } catch (error) {
      console.error('Failed to generate GIF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onGifError?.(`Failed to generate GIF: ${errorMessage}`);
    }
  };

  useEffect(() => {
    setMessages([]);
    setIsComplete(false);
    setIsPlaying(true);
    setIsPaused(false);
    engine.stop();
    engine.loadScenario(scenario);
    engine.onMessage = (message) => {
      setMessages((prev) => {
        const newMessages = [...prev, message];
        // Check if this is the last message
        if (message.id === scenario.messages[scenario.messages.length - 1]?.id) {
          setIsComplete(true);
          setIsPlaying(false);
          setIsPaused(false);
        }
        return newMessages;
      });
    };
    engine.onTypingStart = (sender) => setIsTyping(sender);
    engine.onTypingEnd = () => setIsTyping(null);
    if (scenario.settings.auto_play) engine.play();
    return () => engine.stop();
  }, [scenario, engine]);

  const renderChatContent = () => (
    <div className={`chat-simulator theme-${theme} h-full flex flex-col`} ref={chatRef}>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSent={message.sender === scenario.participants[0]?.id}
          />
        ))}
        {isTyping && (
          <TypingIndicator sender={isTyping} />
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
          <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <ViewSelector 
        selectedView={selectedView} 
        onViewChange={setSelectedView} 
      />
      
      {/* Resolution Selector */}
      <ResolutionSelector
        selectedResolution={selectedResolution}
        onResolutionChange={setSelectedResolution}
        viewType={selectedView}
      />
      
      {/* Controls */}
      <div className="p-3 bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">{scenario.title}</span>
          <div className="flex gap-2">
            {isPlaying && !isPaused && !isComplete && (
              <button
                onClick={handlePause}
                className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                ⏸️ Pause
              </button>
            )}
            {isPaused && !isComplete && (
              <button
                onClick={handleResume}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                ▶️ Resume
              </button>
            )}
            {showReplayButton && (isComplete || isPaused) && (
              <button
                onClick={handleReplay}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🔄 Replay
              </button>
            )}
            <button
              onClick={handleGenerateGif}
              disabled={isGenerating}
              className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? `🎬 ${progress}%` : '🎬 GIF'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-2 bg-red-100 text-red-700 text-xs rounded mb-3">
            GIF Error: {error}
          </div>
        )}
        
        <GifProgressBar 
          progress={progress}
          isGenerating={isGenerating}
          error={error}
          taskId={taskId}
        />
      </div>
      
      {/* View Container */}
      {selectedView === 'smartphone' ? (
        <SmartphoneView platform={theme}>
          {renderChatContent()}
        </SmartphoneView>
      ) : (
        <PCView platform={theme}>
          {renderChatContent()}
        </PCView>
      )}
      
      <DebugPanel 
        taskId={taskId}
        progress={progress}
        status={isGenerating ? 'processing' : error ? 'failed' : 'idle'}
        error={error}
      />
    </div>
  );
};

