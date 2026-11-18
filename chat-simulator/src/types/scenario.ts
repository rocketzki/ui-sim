export type ThemeName = 'whatsapp' | 'messenger' | 'telegram' | 'discord' | 'slack' | 'imessage' | 'signal' | 'teams';

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
  // Enhanced features
  reactions?: Array<{ emoji: string; count: number; users: string[] }>;
  attachments?: Array<{
    type: 'image' | 'file' | 'voice' | 'video';
    name: string;
    url?: string;
    size?: string;
  }>;
  reply_to?: string; // message id being replied to
  edited?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  is_voice_message?: boolean;
  voice_duration?: number;
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

