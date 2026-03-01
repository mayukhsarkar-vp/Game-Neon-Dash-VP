export type CharacterType = 'SPEEDSTER' | 'MAGNET' | 'SHIELD' | 'LUCKY' | 'TITAN';

export interface Character {
  id: CharacterType;
  name: string;
  ability: string;
  description: string;
  color: string;
  icon: string;
  price: number;
  stats: {
    speed: number;
    magnet: number;
    luck: number;
    power: number;
  };
}

export const CHARACTERS: Character[] = [
  {
    id: 'SPEEDSTER',
    name: 'Speedster',
    ability: 'Turbo Dash',
    description: 'Moves faster, good for quick scoring',
    color: '#00f2ff', // Cyan
    icon: 'Zap',
    price: 0,
    stats: { speed: 1.5, magnet: 1, luck: 1, power: 1 }
  },
  {
    id: 'MAGNET',
    name: 'Magnet Master',
    ability: 'Coin Attraction',
    description: 'Attracts coins automatically from a distance',
    color: '#ff00ff', // Magenta
    icon: 'Magnet',
    price: 1000,
    stats: { speed: 1, magnet: 3, luck: 1, power: 1 }
  },
  {
    id: 'SHIELD',
    name: 'Shield Guardian',
    ability: 'Extra Life',
    description: 'Can survive one collision per run',
    color: '#00ff00', // Green
    icon: 'Shield',
    price: 2500,
    stats: { speed: 1, magnet: 1, luck: 1, power: 1 }
  },
  {
    id: 'LUCKY',
    name: 'Lucky Trickster',
    ability: 'Rare Loot',
    description: 'Higher chance of finding rare chests and big coins',
    color: '#ffff00', // Yellow
    icon: 'Dice5',
    price: 5000,
    stats: { speed: 1, magnet: 1, luck: 3, power: 1 }
  },
  {
    id: 'TITAN',
    name: 'Power Titan',
    ability: 'Double Score',
    description: 'Score multiplier is doubled during power-ups',
    color: '#ff4400', // Orange/Red
    icon: 'Flame',
    price: 10000,
    stats: { speed: 1, magnet: 1, luck: 1, power: 3 }
  }
];

export interface GameState {
  score: number;
  coins: number;
  totalCoins: number;
  level: number;
  multiplier: number;
  isGameOver: boolean;
  isPaused: boolean;
  highScore: number;
  selectedCharacter: CharacterType;
  unlockedCharacters: CharacterType[];
  lastDailyReward: number | null;
  streak: number;
}
