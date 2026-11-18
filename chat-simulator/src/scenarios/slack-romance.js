export const slackRomanceScenario = {
  id: 'slack-romance',
  title: '💕 Slack Coffee Break Romance',
  theme: 'slack',
  participants: [
    { id: 'alex', name: 'Alex Rodriguez', avatar: '☕', type: 'sender' },
    { id: 'jordan', name: 'Jordan Kim', avatar: '📚', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'alex',
      content: 'Hey! I think I saw you at the coffee shop today?',
      timestamp: '15:30',
      typing_duration: 1000,
      delay: 1000
    },
    {
      id: 2,
      sender: 'jordan',
      content: 'Oh! Were you the one reading "The Great Gatsby"?',
      timestamp: '15:31',
      typing_duration: 1500,
      delay: 2000,
      reactions: [
        { emoji: 'books', count: 1, users: ['alex'] }
      ]
    },
    {
      id: 3,
      sender: 'alex',
      content: 'Yes! And you were studying calculus, right?',
      timestamp: '15:32',
      typing_duration: 1200,
      delay: 1500
    },
    {
      id: 4,
      sender: 'jordan',
      content: 'Haha yes! I was struggling with derivatives :sweat_smile:',
      timestamp: '15:33',
      typing_duration: 1800,
      delay: 2000,
      reactions: [
        { emoji: 'sweat_smile', count: 1, users: ['alex'] }
      ]
    },
    {
      id: 5,
      sender: 'alex',
      content: 'I could help with that! I\'m actually a math tutor.',
      timestamp: '15:34',
      typing_duration: 1400,
      delay: 1500,
      reactions: [
        { emoji: 'mortar_board', count: 1, users: ['jordan'] }
      ]
    },
    {
      id: 6,
      sender: 'jordan',
      content: 'Really? That would be amazing!',
      timestamp: '15:35',
      typing_duration: 1000,
      delay: 2000,
      reactions: [
        { emoji: 'sparkles', count: 1, users: ['alex'] }
      ]
    },
    {
      id: 7,
      sender: 'alex',
      content: 'How about we meet at the same coffee shop tomorrow?',
      timestamp: '15:36',
      typing_duration: 1600,
      delay: 1500
    },
    {
      id: 8,
      sender: 'jordan',
      content: 'Perfect! But only if you let me buy you coffee as thanks :coffee:',
      timestamp: '15:37',
      typing_duration: 2000,
      delay: 2000,
      reactions: [
        { emoji: 'coffee', count: 2, users: ['alex', 'jordan'] }
      ]
    },
    {
      id: 9,
      sender: 'alex',
      content: 'Deal! See you tomorrow at 2 PM :blush:',
      timestamp: '15:38',
      typing_duration: 1200,
      delay: 1500,
      reactions: [
        { emoji: 'heart', count: 1, users: ['jordan'] }
      ]
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



