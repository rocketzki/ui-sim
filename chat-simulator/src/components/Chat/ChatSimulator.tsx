import React, { useEffect, useMemo, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message, Scenario, ThemeName } from '@/types/scenario';

interface ChatSimulatorProps {
  scenario: Scenario;
  theme?: ThemeName;
  onMessageSent?: (message: Message) => void;
  onScenarioComplete?: () => void;
  onError?: (error: Error) => void;
}

class ScenarioEngine {
  private scenario: Scenario | null = null;
  private isPlaying = false;
  private timeoutId: number | null = null;
  onMessage?: (message: Message) => void;
  onTypingStart?: (sender: string) => void;
  onTypingEnd?: () => void;

  loadScenario(scenario: Scenario) {
    this.scenario = scenario;
  }

  stop() {
    this.isPlaying = false;
    if (this.timeoutId !== null) window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }

  play() {
    if (!this.scenario || this.isPlaying) return;
    this.isPlaying = true;
    this.run(0);
  }

  private run(index: number) {
    if (!this.scenario) return;
    const message = this.scenario.messages[index];
    if (!message) {
      this.isPlaying = false;
      return;
    }

    const typingDuration = message.typing_duration ?? 800;
    const delay = message.delay ?? 0;

    this.timeoutId = window.setTimeout(() => {
      this.onTypingStart?.(message.sender);
      this.timeoutId = window.setTimeout(() => {
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
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const engine = useMemo(() => new ScenarioEngine(), []);

  useEffect(() => {
    setMessages([]);
    engine.stop();
    engine.loadScenario(scenario);
    engine.onMessage = (message) => setMessages((prev) => [...prev, message]);
    engine.onTypingStart = (sender) => setIsTyping(sender);
    engine.onTypingEnd = () => setIsTyping(null);
    if (scenario.settings.auto_play) engine.play();
    return () => engine.stop();
  }, [scenario, engine]);

  return (
    <div className={`chat-simulator theme-${theme} bg-white`}>
      <div className="p-3 border-b text-sm font-medium">{scenario.title}</div>
      <div className="h-[540px] overflow-y-auto p-3 space-y-2">
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
    </div>
  );
};

