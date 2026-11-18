export const slackWorkplaceScenario = {
  id: 'slack-workplace',
  title: '💼 Team Standup Meeting',
  theme: 'slack',
  participants: [
    { id: 'manager', name: 'Sarah Chen', avatar: '👩‍💼', type: 'sender' },
    { id: 'dev1', name: 'Alex Rodriguez', avatar: '👨‍💻', type: 'receiver' },
    { id: 'dev2', name: 'Emma Wilson', avatar: '👩‍💻', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'manager',
      content: 'Good morning team! Let\'s start our daily standup',
      timestamp: '09:00',
      typing_duration: 1200,
      delay: 1000
    },
    {
      id: 2,
      sender: 'dev1',
      content: 'Morning! Yesterday I completed the user authentication feature',
      timestamp: '09:01',
      typing_duration: 1500,
      delay: 2000,
      attachments: [
        { type: 'file', name: 'auth_feature_pr.pdf', size: '1.2 MB' }
      ]
    },
    {
      id: 3,
      sender: 'dev2',
      content: 'Great work Alex! I finished the database optimization',
      timestamp: '09:02',
      typing_duration: 1400,
      delay: 1500,
      reactions: [
        { emoji: '👍', count: 2, users: ['manager', 'dev1'] }
      ]
    },
    {
      id: 4,
      sender: 'manager',
      content: 'Excellent progress! Today I\'d like you both to focus on the API integration',
      timestamp: '09:03',
      typing_duration: 1800,
      delay: 2000,
      attachments: [
        { type: 'file', name: 'api_specs.docx', size: '856 KB' }
      ]
    },
    {
      id: 5,
      sender: 'dev1',
      content: 'Sounds good! I\'ll start with the endpoints',
      timestamp: '09:04',
      typing_duration: 1000,
      delay: 1500,
      reactions: [
        { emoji: '✅', count: 1, users: ['manager'] }
      ]
    },
    {
      id: 6,
      sender: 'dev2',
      content: 'I\'ll handle the data validation layer',
      timestamp: '09:05',
      typing_duration: 1200,
      delay: 2000,
      reactions: [
        { emoji: '🚀', count: 1, users: ['manager'] }
      ]
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



