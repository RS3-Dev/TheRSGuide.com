export const playerPaths = [
  {
    id: 'new-player',
    title: 'New Player',
    description: 'Your first steps in RuneScape. Get set up, learn the basics, and find your first goals.',
    image: 'https://media.thersguide.com/images/getting-started/new-player.webp',
    imagePosition: '55% 60%',
    guides: [
      { label: 'Welcome to RuneScape', path: '/setup', description: 'An introduction to the game and this guide.' },
      { label: 'Set up your interface', path: '/setup/interface-setup', description: 'Get comfortable with your screen and controls.' },
      { label: 'Learn combat basics', path: '/getting-started', description: 'Understand abilities, adrenaline, and combat.' },
      { label: 'Choose your first goals', path: '/guides/early-game', description: 'Useful quests and unlocks for a new account.' },
    ],
  },
  {
    id: 'returning-player',
    title: 'Returning Player',
    description: 'Back in Gielinor? Refresh your setup, get comfortable with combat, and pick up your progression.',
    image: 'https://media.thersguide.com/images/getting-started/returning-player.webp',
    imagePosition: '40% 35%',
    guides: [
      { label: 'Refresh your settings', path: '/setup/recommended-settings', description: 'Review the settings that make everyday play easier.' },
      { label: 'Explore combat styles', path: '/getting-started/combat-styles', description: 'Get familiar with melee, ranged, magic, and necromancy.' },
      { label: 'Plan your gear upgrades', path: '/guides/gear-recommendations', description: 'Find equipment recommendations for your combat style.' },
      { label: 'Find your progression goals', path: '/guides', description: 'Browse early, mid, and late game unlocks.' },
    ],
  },
  {
    id: 'osrs-player',
    title: 'OSRS Player',
    description: 'Know Old School? Get familiar with RuneScape’s interface, abilities, and skill training.',
    image: 'https://media.thersguide.com/images/getting-started/osrs-player.webp',
    imagePosition: '60% 25%',
    guides: [
      { label: 'Set up your interface', path: '/setup/interface-setup', description: 'Find your way around RuneScape’s customizable interface.' },
      { label: 'Understand ability combat', path: '/getting-started', description: 'Learn how abilities and adrenaline work.' },
      { label: 'Choose a combat mode', path: '/getting-started/combat-settings/combat-mode', description: 'Get familiar with Revolution and manual combat.' },
      { label: 'Explore skill training', path: '/guides/skill-training', description: 'Find training methods for familiar and new skills.' },
    ],
  },
] as const
