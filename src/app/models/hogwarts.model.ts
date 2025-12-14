/**
 * HOGWARTS FLYING GAME MODELS
 * 
 * LLD: Data structures for Harry Potter themed broomstick game
 * 
 * Purpose:
 * - Define game entities (player, spells, mystery boxes)
 * - House system with colors
 * - Reward system for mystery boxes
 * - Game state management
 */

export enum HogwartsHouse {
  SLYTHERIN = 'slytherin',
  GRYFFINDOR = 'gryffindor',
  HUFFLEPUFF = 'hufflepuff',
  RAVENCLAW = 'ravenclaw'
}

export interface HouseConfig {
  name: HogwartsHouse;
  color: string;
  capeColor: string;
  displayName: string;
}

export const HOUSE_CONFIGS: Record<HogwartsHouse, HouseConfig> = {
  [HogwartsHouse.SLYTHERIN]: {
    name: HogwartsHouse.SLYTHERIN,
    color: '#1a472a',
    capeColor: '#2a623d',
    displayName: 'Slytherin'
  },
  [HogwartsHouse.GRYFFINDOR]: {
    name: HogwartsHouse.GRYFFINDOR,
    color: '#740001',
    capeColor: '#ae0001',
    displayName: 'Gryffindor'
  },
  [HogwartsHouse.HUFFLEPUFF]: {
    name: HogwartsHouse.HUFFLEPUFF,
    color: '#ecb939',
    capeColor: '#f0c75e',
    displayName: 'Hufflepuff'
  },
  [HogwartsHouse.RAVENCLAW]: {
    name: HogwartsHouse.RAVENCLAW,
    color: '#0e1a40',
    capeColor: '#222f5b',
    displayName: 'Ravenclaw'
  }
};

export enum SpellType {
  STUPEFY = 'stupefy',
  INCENDIO = 'incendio',
  GLACIUS = 'glacius',
  CONFRINGO = 'confringo'
}

export interface Spell {
  id: string;
  type: SpellType;
  x: number;
  y: number;
  speed: number;
  effect: string;
  color: string;
}

export interface MysteryBox {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  reward?: Reward;
}

export enum RewardType {
  GIFT_CARD = 'gift_card',
  CLOTHING = 'clothing',
  ACCESSORY = 'accessory',
  DATE = 'date',
  EXPERIENCE = 'experience',
  PERSONAL = 'personal',
  MISC = 'misc'
}

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  icon: string;
  revealed: boolean;
}

/**
 * Generate random gift card amount
 */
export function getRandomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const POSSIBLE_REWARDS: Reward[] = [
  {
    id: 'letter',
    type: RewardType.PERSONAL,
    name: 'Handwritten Letter',
    description: 'A heartfelt letter for you',
    icon: '✉️',
    revealed: false
  },
  {
    id: 'tshirt',
    type: RewardType.CLOTHING,
    name: 'Comfy T-Shirt',
    description: 'Stylish and comfortable tee',
    icon: '👕',
    revealed: false
  },
  {
    id: 'uber',
    type: RewardType.GIFT_CARD,
    name: 'Uber Gift Card',
    description: `₹${getRandomAmount(1000, 1500)} Uber Credit`,
    icon: '🚗',
    revealed: false
  },
  {
    id: 'amazon',
    type: RewardType.GIFT_CARD,
    name: 'Amazon Gift Card',
    description: `₹${getRandomAmount(1000, 1500)} Amazon Voucher`,
    icon: '📦',
    revealed: false
  },
  {
    id: 'zomato',
    type: RewardType.GIFT_CARD,
    name: 'Zomato Gift Card',
    description: `₹${getRandomAmount(1000, 1500)} Food Credit`,
    icon: '🍕',
    revealed: false
  },
  {
    id: 'socks',
    type: RewardType.CLOTHING,
    name: 'Cozy Socks',
    description: 'Warm and fuzzy house socks',
    icon: '🧦',
    revealed: false
  },
  {
    id: 'sweatshirt',
    type: RewardType.CLOTHING,
    name: 'Premium Sweatshirt',
    description: 'Warm hoodie for chilly days',
    icon: '🧥',
    revealed: false
  },
  {
    id: 'date-brunch',
    type: RewardType.DATE,
    name: 'Brunch Date',
    description: 'Cozy brunch at your favorite spot',
    icon: '🥞',
    revealed: false
  },
  {
    id: 'random-wish',
    type: RewardType.EXPERIENCE,
    name: 'Random Wish',
    description: 'One wish of your choice, granted!',
    icon: '⭐',
    revealed: false
  },
  {
    id: 'gadget-support',
    type: RewardType.MISC,
    name: 'Tech Decor ',
    description: 'A little something for your setup',
    icon: '�',
    revealed: false
  },
  {
    id: 'vietnamese-coffee',
    type: RewardType.EXPERIENCE,
    name: 'Vietnamese Cold Coffee',
    description: 'Vietnamese coffee experience',
    icon: '☕',
    revealed: false
  },
  {
    id: 'Candle',
    type: RewardType.PERSONAL,
    name: 'New aromatic candle',
    description: 'No amount of candle is too many candle',
    icon: '🕯️',
    revealed: false
  },
  {
    id: 'date-cafe',
    type: RewardType.DATE,
    name: 'Cafe Date',
    description: 'Relaxing afternoon at a cozy cafe',
    icon: '☕',
    revealed: false
  },
  {
    id: 'date-nightout',
    type: RewardType.DATE,
    name: 'Night Out Date',
    description: 'Evening adventure in the city',
    icon: '�',
    revealed: false
  },
  {
    id: 'date-cozy',
    type: RewardType.DATE,
    name: 'Cozy In-House Date',
    description: 'Chill movie night at home',
    icon: '🏠',
    revealed: false
  },
  {
    id: 'horror-movie',
    type: RewardType.EXPERIENCE,
    name: 'Horror Movie Night',
    description: 'Scary movie marathon with snacks',
    icon: '🎬',
    revealed: false
  },
  {
    id: 'surprise',
    type: RewardType.MISC,
    name: 'Surprise Gift',
    description: 'A mysterious surprise awaits...',
    icon: '🎁',
    revealed: false
  }
];

export interface Player {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  isStunned: boolean;
  isBurning: boolean;
  isFrozen: boolean;
  isExploding: boolean;
  house: HogwartsHouse;
  lives: number;
  maxLives: number;
}

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  isFinished: boolean;
  showScratchCards: boolean;
  collectedBoxes: MysteryBox[];
  distance: number;
  finishLine: number;
  collectedRewards: Reward[];
}

export const SPELL_EFFECTS: Record<SpellType, { effect: string; color: string; duration: number }> = {
  [SpellType.STUPEFY]: {
    effect: 'Stunned! Falling from broom...',
    color: '#ff0000',
    duration: 2000
  },
  [SpellType.INCENDIO]: {
    effect: 'On Fire! Burning sensation...',
    color: '#ff6600',
    duration: 3000
  },
  [SpellType.GLACIUS]: {
    effect: 'Frozen! Cannot move...',
    color: '#00ccff',
    duration: 2500
  },
  [SpellType.CONFRINGO]: {
    effect: 'Explosion! Blasted off broom...',
    color: '#ff9900',
    duration: 2000
  }
};
