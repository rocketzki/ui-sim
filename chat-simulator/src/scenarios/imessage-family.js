export const imessageFamilyScenario = {
  id: 'imessage-family',
  title: '👨‍👩‍👧‍👦 Family Group Chat',
  theme: 'imessage',
  participants: [
    { id: 'mom', name: 'Mom', avatar: '👩', type: 'sender' },
    { id: 'dad', name: 'Dad', avatar: '👨', type: 'receiver' },
    { id: 'daughter', name: 'Emma', avatar: '👧', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'mom',
      content: 'Hey everyone! How was your day?',
      timestamp: '18:45',
      typing_duration: 1200,
      delay: 1000
    },
    {
      id: 2,
      sender: 'daughter',
      content: 'Great! I aced my math test today!',
      timestamp: '18:46',
      typing_duration: 1000,
      delay: 2000,
      attachments: [
        { type: 'image', name: 'test_score.jpg', size: '1.8 MB' }
      ]
    },
    {
      id: 3,
      sender: 'dad',
      content: 'That\'s amazing sweetie! So proud of you',
      timestamp: '18:47',
      typing_duration: 1400,
      delay: 1500,
      reactions: [
        { emoji: '🎉', count: 2, users: ['mom', 'dad'] }
      ]
    },
    {
      id: 4,
      sender: 'mom',
      content: 'We should celebrate! Pizza night?',
      timestamp: '18:48',
      typing_duration: 1000,
      delay: 2000,
      reactions: [
        { emoji: '🍕', count: 3, users: ['mom', 'dad', 'daughter'] }
      ]
    },
    {
      id: 5,
      sender: 'daughter',
      content: 'Yes! Can we get extra cheese?',
      timestamp: '18:49',
      typing_duration: 1000,
      delay: 1500,
      reactions: [
        { emoji: '🧀', count: 2, users: ['mom', 'dad'] }
      ]
    },
    {
      id: 6,
      sender: 'dad',
      content: 'Absolutely! Ordering now',
      timestamp: '18:50',
      typing_duration: 800,
      delay: 2000,
      status: 'read'
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



