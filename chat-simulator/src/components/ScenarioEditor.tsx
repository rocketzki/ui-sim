import React, { useState } from 'react';
import type { Scenario, Message, Participant, ThemeName } from '@/types/scenario';

interface ScenarioEditorProps {
  onSave: (scenario: Scenario) => void;
  onCancel: () => void;
  initialScenario?: Scenario;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  onSave,
  onCancel,
  initialScenario
}) => {
  const [scenario, setScenario] = useState<Scenario>(
    initialScenario || {
      id: '',
      title: '',
      theme: 'whatsapp',
      participants: [
        { id: 'user1', name: '', avatar: '👤', type: 'sender' },
        { id: 'user2', name: '', avatar: '👤', type: 'receiver' }
      ],
      messages: [],
      settings: {
        auto_play: true,
        loop: false,
        typing_speed: 'normal'
      }
    }
  );

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showMessageEditor, setShowMessageEditor] = useState(false);

  const themes: Array<{ value: ThemeName; label: string }> = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'discord', label: 'Discord' },
    { value: 'slack', label: 'Slack' },
    { value: 'imessage', label: 'iMessage' },
    { value: 'signal', label: 'Signal' },
    { value: 'teams', label: 'Microsoft Teams' }
  ];

  const updateScenario = (updates: Partial<Scenario>) => {
    setScenario(prev => ({ ...prev, ...updates }));
  };

  const updateParticipant = (index: number, updates: Partial<Participant>) => {
    const newParticipants = [...scenario.participants];
    newParticipants[index] = { ...newParticipants[index], ...updates };
    updateScenario({ participants: newParticipants });
  };

  const addMessage = () => {
    const newMessage: Message = {
      id: Date.now(),
      sender: scenario.participants[0]?.id || 'user1',
      content: '',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      delay: 0,
      typing_duration: 1000
    };
    updateScenario({ messages: [...scenario.messages, newMessage] });
  };

  const updateMessage = (index: number, updates: Partial<Message>) => {
    const newMessages = [...scenario.messages];
    newMessages[index] = { ...newMessages[index], ...updates };
    updateScenario({ messages: newMessages });
  };

  const deleteMessage = (index: number) => {
    const newMessages = scenario.messages.filter((_, i) => i !== index);
    updateScenario({ messages: newMessages });
  };

  const handleSave = () => {
    if (!scenario.title.trim()) {
      alert('Please enter a scenario title');
      return;
    }
    if (scenario.participants.some(p => !p.name.trim())) {
      alert('Please enter names for all participants');
      return;
    }
    if (scenario.messages.length === 0) {
      alert('Please add at least one message');
      return;
    }
    onSave(scenario);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Scenario Editor</h2>
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Scenario Title</label>
              <input
                type="text"
                value={scenario.title}
                onChange={(e) => updateScenario({ title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter scenario title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={scenario.theme}
                onChange={(e) => updateScenario({ theme: e.target.value as ThemeName })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {themes.map(theme => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participants */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Participants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenario.participants.map((participant, index) => (
                <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Participant {index + 1}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={participant.name}
                        onChange={(e) => updateParticipant(index, { name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Participant name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Avatar (emoji)</label>
                      <input
                        type="text"
                        value={participant.avatar}
                        onChange={(e) => updateParticipant(index, { avatar: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="👤"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={participant.type}
                        onChange={(e) => updateParticipant(index, { type: e.target.value as 'sender' | 'receiver' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="sender">Sender</option>
                        <option value="receiver">Receiver</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Messages</h3>
              <button
                onClick={addMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                + Add Message
              </button>
            </div>
            <div className="space-y-3">
              {scenario.messages.map((message, index) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Message {index + 1}</h4>
                    <button
                      onClick={() => deleteMessage(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sender</label>
                      <select
                        value={message.sender}
                        onChange={(e) => updateMessage(index, { sender: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {scenario.participants.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Timestamp</label>
                      <input
                        type="text"
                        value={message.timestamp || ''}
                        onChange={(e) => updateMessage(index, { timestamp: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="14:30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Content</label>
                      <textarea
                        value={message.content}
                        onChange={(e) => updateMessage(index, { content: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md h-20"
                        placeholder="Message content"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Delay (ms)</label>
                      <input
                        type="number"
                        value={message.delay || 0}
                        onChange={(e) => updateMessage(index, { delay: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Typing Duration (ms)</label>
                      <input
                        type="number"
                        value={message.typing_duration || 1000}
                        onChange={(e) => updateMessage(index, { typing_duration: parseInt(e.target.value) || 1000 })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scenario.settings.auto_play}
                  onChange={(e) => updateScenario({ 
                    settings: { ...scenario.settings, auto_play: e.target.checked }
                  })}
                  className="mr-2"
                />
                Auto-play scenario
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scenario.settings.loop}
                  onChange={(e) => updateScenario({ 
                    settings: { ...scenario.settings, loop: e.target.checked }
                  })}
                  className="mr-2"
                />
                Loop scenario
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">Typing Speed</label>
                <select
                  value={scenario.settings.typing_speed}
                  onChange={(e) => updateScenario({ 
                    settings: { ...scenario.settings, typing_speed: e.target.value as 'slow' | 'normal' | 'fast' }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



