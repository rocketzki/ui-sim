export const superheroActionScenario = {
  id: 'superhero-action',
  title: '🦸‍♂️ Hero\'s Call',
  theme: 'telegram',
  participants: [
    { id: 'hero', name: 'Lightning Strike', avatar: '⚡', type: 'sender' },
    { id: 'citizen', name: 'Emergency Dispatch', avatar: '🚨', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'citizen',
      content: 'Lightning Strike! We need your help downtown!',
      timestamp: '21:15',
      typing_duration: 1000,
      delay: 1000
    },
    {
      id: 2,
      sender: 'hero',
      content: 'What\'s the situation?',
      timestamp: '21:16',
      typing_duration: 800,
      delay: 1500
    },
    {
      id: 3,
      sender: 'citizen',
      content: 'Dr. Chaos has taken hostages at the bank! He\'s threatening to detonate something.',
      timestamp: '21:17',
      typing_duration: 2000,
      delay: 2000
    },
    {
      id: 4,
      sender: 'hero',
      content: 'I\'m on my way. ETA 2 minutes.',
      timestamp: '21:18',
      typing_duration: 1000,
      delay: 1500
    },
    {
      id: 5,
      sender: 'citizen',
      content: 'Be careful! He\'s got some kind of energy weapon.',
      timestamp: '21:19',
      typing_duration: 1400,
      delay: 2000
    },
    {
      id: 6,
      sender: 'hero',
      content: 'I\'ve dealt with him before. What are his demands?',
      timestamp: '21:20',
      typing_duration: 1200,
      delay: 1500
    },
    {
      id: 7,
      sender: 'citizen',
      content: 'He wants the city to release his brother from prison.',
      timestamp: '21:21',
      typing_duration: 1500,
      delay: 2000
    },
    {
      id: 8,
      sender: 'hero',
      content: 'I\'m here. I can see the building. Going in now.',
      timestamp: '21:22',
      typing_duration: 1000,
      delay: 1500
    },
    {
      id: 9,
      sender: 'citizen',
      content: 'Good luck, Lightning Strike! The hostages are on the 3rd floor.',
      timestamp: '21:23',
      typing_duration: 1800,
      delay: 2000
    },
    {
      id: 10,
      sender: 'hero',
      content: 'Hostages are safe. Dr. Chaos is contained. Mission complete.',
      timestamp: '21:28',
      typing_duration: 1600,
      delay: 3000
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



