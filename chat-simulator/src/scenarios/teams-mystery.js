export const teamsMysteryScenario = {
  id: 'teams-mystery',
  title: '🔍 Teams Investigation Unit',
  theme: 'teams',
  participants: [
    { id: 'detective', name: 'Sarah Chen', avatar: '🕵️‍♀️', type: 'sender' },
    { id: 'witness', name: 'Emma Wilson', avatar: '👩', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'detective',
      content: 'Hi Emma, I need to ask you about last night.',
      timestamp: '09:15',
      typing_duration: 1200,
      delay: 1000
    },
    {
      id: 2,
      sender: 'witness',
      content: 'I already told the other officer everything...',
      timestamp: '09:16',
      typing_duration: 1500,
      delay: 2000
    },
    {
      id: 3,
      sender: 'detective',
      content: 'I know this is difficult, but your testimony is crucial.',
      timestamp: '09:17',
      typing_duration: 1800,
      delay: 1500,
      reactions: [
        { emoji: '👍', count: 1, users: ['witness'] }
      ]
    },
    {
      id: 4,
      sender: 'witness',
      content: 'I saw him... around 11 PM. He was arguing with someone.',
      timestamp: '09:18',
      typing_duration: 2000,
      delay: 2000
    },
    {
      id: 5,
      sender: 'detective',
      content: 'Can you describe the other person?',
      timestamp: '09:19',
      typing_duration: 1000,
      delay: 1500
    },
    {
      id: 6,
      sender: 'witness',
      content: 'Tall, wearing a dark hoodie... I couldn\'t see their face.',
      timestamp: '09:20',
      typing_duration: 2200,
      delay: 2000,
      reactions: [
        { emoji: '😰', count: 1, users: ['detective'] }
      ]
    },
    {
      id: 7,
      sender: 'detective',
      content: 'Anything else? Even the smallest detail could help.',
      timestamp: '09:21',
      typing_duration: 1600,
      delay: 1500
    },
    {
      id: 8,
      sender: 'witness',
      content: 'Wait... I think I heard them mention "the warehouse" before they left.',
      timestamp: '09:22',
      typing_duration: 2500,
      delay: 2000,
      reactions: [
        { emoji: '🎯', count: 1, users: ['detective'] }
      ]
    },
    {
      id: 9,
      sender: 'detective',
      content: 'Thank you, Emma. This could be the breakthrough we needed.',
      timestamp: '09:23',
      typing_duration: 1800,
      delay: 1500,
      reactions: [
        { emoji: '✅', count: 2, users: ['detective', 'witness'] }
      ]
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



