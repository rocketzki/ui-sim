export type ThemeName = 'whatsapp' | 'messenger' | 'telegram';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  type: 'sender' | 'receiver';
}

export interface Message {
  id: number | string;
  sender: string; // participant id
  content: string;
  timestamp?: string;
  delay?: number;
  typing_duration?: number;
  animations?: {
    entrance?: string;
    typing_indicator?: boolean;
  };
}

export interface ScenarioSettings {
  auto_play?: boolean;
  loop?: boolean;
  typing_speed?: 'slow' | 'normal' | 'fast';
}

export interface Scenario {
  id: string;
  title: string;
  theme: ThemeName;
  participants: Participant[];
  messages: Message[];
  settings: ScenarioSettings;
}

