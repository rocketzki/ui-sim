import React from 'react';
import { ChatSimulator } from '@/components/Chat/ChatSimulator';
import type { Scenario } from '@/types/scenario';

const demoScenario: Scenario = {
  id: 'demo-chat',
  title: 'Demo Conversation',
  theme: 'whatsapp',
  participants: [
    { id: 'user1', name: 'Jan', avatar: '👤', type: 'sender' },
    { id: 'user2', name: 'Anna', avatar: '👩', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'user1',
      content: 'Cześć!',
      timestamp: '14:20',
      typing_duration: 1000
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-md">
        <ChatSimulator scenario={demoScenario} theme="whatsapp" />
      </div>
    </div>
  );
}

