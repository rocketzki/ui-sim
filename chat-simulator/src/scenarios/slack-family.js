export const slackFamilyScenario = {
  id: 'slack-family',
  title: '👨‍👩‍👧‍👦 Slack Family Channel',
  theme: 'slack',
  participants: [
    { id: 'mom', name: 'Mom Admin', avatar: '👩', type: 'sender' },
    { id: 'dad', name: 'Dad Mod', avatar: '👨', type: 'receiver' }
  ],
  messages: [
    {
      id: 1,
      sender: 'mom',
      content: 'Hey honey, we need to talk about Thanksgiving.',
      timestamp: '19:45',
      typing_duration: 1200,
      delay: 1000
    },
    {
      id: 2,
      sender: 'dad',
      content: 'What about it? I thought we were going to your sister\'s.',
      timestamp: '19:46',
      typing_duration: 1500,
      delay: 2000
    },
    {
      id: 3,
      sender: 'mom',
      content: 'Well... Sarah called. She wants us to come to her place instead.',
      timestamp: '19:47',
      typing_duration: 1800,
      delay: 1500,
      reactions: [
        { emoji: 'thinking_face', count: 1, users: ['dad'] }
      ]
    },
    {
      id: 4,
      sender: 'dad',
      content: 'Sarah? But we haven\'t spoken to her in years.',
      timestamp: '19:48',
      typing_duration: 1400,
      delay: 2000
    },
    {
      id: 5,
      sender: 'mom',
      content: 'I know, but she says she wants to make amends.',
      timestamp: '19:49',
      typing_duration: 1200,
      delay: 1500,
      reactions: [
        { emoji: 'handshake', count: 1, users: ['dad'] }
      ]
    },
    {
      id: 6,
      sender: 'dad',
      content: 'After what happened with the inheritance? I don\'t know...',
      timestamp: '19:50',
      typing_duration: 1800,
      delay: 2000,
      reactions: [
        { emoji: 'confused', count: 1, users: ['mom'] }
      ]
    },
    {
      id: 7,
      sender: 'mom',
      content: 'She says she was wrong. That she was hurt and acted out.',
      timestamp: '19:51',
      typing_duration: 2000,
      delay: 1500
    },
    {
      id: 8,
      sender: 'dad',
      content: 'What do you think? Do you believe her?',
      timestamp: '19:52',
      typing_duration: 1200,
      delay: 2000
    },
    {
      id: 9,
      sender: 'mom',
      content: 'I think... I think it\'s time to forgive. Family is important.',
      timestamp: '19:53',
      typing_duration: 2200,
      delay: 1500,
      reactions: [
        { emoji: 'heart', count: 1, users: ['dad'] }
      ]
    },
    {
      id: 10,
      sender: 'dad',
      content: 'You\'re right. Let\'s give her another chance. For the kids\' sake.',
      timestamp: '19:54',
      typing_duration: 1800,
      delay: 2000,
      reactions: [
        { emoji: 'white_check_mark', count: 2, users: ['mom', 'dad'] }
      ]
    }
  ],
  settings: {
    auto_play: true,
    loop: false,
    typing_speed: 'normal'
  }
};



