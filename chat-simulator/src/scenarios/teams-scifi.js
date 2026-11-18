export const teamsScifiScenario = {
  id: 'teams-scifi',
  title: '🚀 Teams Space Mission Control',
  theme: 'teams',
  participants: [
    { id: 'commander', name: 'Commander Chen', avatar: '👨‍🚀', type: 'sender' },
    { id: 'mission-control', name: 'Mission Control', avatar: '🛰️', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'commander',
      content: 'Mission Control, this is Commander Chen. We\'ve reached Mars orbit.',
      timestamp: '14:22:15',
      typing_duration: 2000,
      delay: 1000
    },
    {
      id: 2,
      sender: 'mission-control',
      content: 'Copy that, Commander. How are the systems looking?',
      timestamp: '14:22:45',
      typing_duration: 1500,
      delay: 2000
    },
    {
      id: 3,
      sender: 'commander',
      content: 'All systems nominal. The anomaly we detected earlier has intensified.',
      timestamp: '14:23:10',
      typing_duration: 1800,
      delay: 1500,
      reactions: [
        { emoji: '⚠️', count: 1, users: ['mission-control'] }
      ]
    },
    {
      id: 4,
      sender: 'mission-control',
      content: 'What kind of anomaly? Can you describe it?',
      timestamp: '14:23:35',
      typing_duration: 1200,
      delay: 2000
    },
    {
      id: 5,
      sender: 'commander',
      content: 'It\'s like a... shimmering portal. About 50 meters in diameter.',
      timestamp: '14:24:00',
      typing_duration: 2200,
      delay: 1500,
      attachments: [
        { type: 'file', name: 'portal_scan_data.docx', size: '3.2 MB' }
      ]
    },
    {
      id: 6,
      sender: 'mission-control',
      content: 'Portal? Commander, please confirm your readings.',
      timestamp: '14:24:25',
      typing_duration: 1400,
      delay: 2000,
      reactions: [
        { emoji: '🤔', count: 1, users: ['commander'] }
      ]
    },
    {
      id: 7,
      sender: 'commander',
      content: 'Confirmed. It\'s definitely not natural. Should we investigate?',
      timestamp: '14:24:50',
      typing_duration: 1600,
      delay: 1500
    },
    {
      id: 8,
      sender: 'mission-control',
      content: 'Negative, Commander. Return to base immediately. This is beyond our mission parameters.',
      timestamp: '14:25:15',
      typing_duration: 2000,
      delay: 2000,
      reactions: [
        { emoji: '❌', count: 1, users: ['commander'] }
      ]
    },
    {
      id: 9,
      sender: 'commander',
      content: 'Mission Control... I think we\'re being pulled toward it. We can\'t break free!',
      timestamp: '14:25:40',
      typing_duration: 2500,
      delay: 1500,
      reactions: [
        { emoji: '🚨', count: 1, users: ['mission-control'] }
      ]
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



