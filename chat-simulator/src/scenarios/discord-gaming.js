export const discordGamingScenario = {
  id: 'discord-gaming',
  title: '🎮 Gaming Squad Chat',
  theme: 'discord',
  participants: [
    { id: 'alex', name: 'Alex_Gamer', avatar: '🎯', type: 'sender' },
    { id: 'sarah', name: 'SarahPro', avatar: '⚔️', type: 'receiver' },
    { id: 'mike', name: 'MikeTheTank', avatar: '🛡️', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'alex',
      content: 'Hey squad! Ready for the raid tonight?',
      timestamp: '19:30',
      typing_duration: 1200,
      delay: 1000
    },
    {
      id: 2,
      sender: 'sarah',
      content: 'Absolutely! I\'ve been practicing the new boss mechanics all day',
      timestamp: '19:31',
      typing_duration: 1800,
      delay: 2000,
      reactions: [
        { emoji: '🔥', count: 2, users: ['alex', 'mike'] }
      ]
    },
    {
      id: 3,
      sender: 'mike',
      content: 'Same here! Got my tank build optimized',
      timestamp: '19:32',
      typing_duration: 1400,
      delay: 1500,
      attachments: [
        { type: 'image', name: 'tank_build.png', size: '2.1 MB' }
      ]
    },
    {
      id: 4,
      sender: 'alex',
      content: 'Perfect! Let\'s meet in voice chat at 8 PM sharp',
      timestamp: '19:33',
      typing_duration: 1600,
      delay: 2000,
      reactions: [
        { emoji: '✅', count: 3, users: ['alex', 'sarah', 'mike'] }
      ]
    },
    {
      id: 5,
      sender: 'sarah',
      content: 'Can\'t wait! This is going to be epic',
      timestamp: '19:34',
      typing_duration: 1000,
      delay: 1500,
      reactions: [
        { emoji: '🚀', count: 2, users: ['alex', 'mike'] }
      ]
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



