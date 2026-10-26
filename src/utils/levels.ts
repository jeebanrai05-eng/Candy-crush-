/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, BoosterEquipment } from '../types/game';

export const INITIAL_BOOSTERS: BoosterEquipment[] = [
  {
    id: 'lollipop-hammer',
    name: 'Lollipop Hammer',
    icon: '🔨',
    description: 'Smash and clear any single candy, jelly, or obstacle tile without using a move.',
    count: 3,
    cost: 100,
    color: '#ec4899'
  },
  {
    id: 'free-switch',
    name: 'Free Hand Switch',
    icon: '🧤',
    description: 'Swap any two adjacent candies even if they do not create an immediate match.',
    count: 2,
    cost: 150,
    color: '#8b5cf6'
  },
  {
    id: 'color-bomb-drop',
    name: 'Color Bomb Drop',
    icon: '🍫',
    description: 'Drop a delicious sprinkle Color Bomb onto any chosen tile.',
    count: 2,
    cost: 200,
    color: '#eab308'
  },
  {
    id: 'striped-wrapped-drop',
    name: 'Striped & Wrapped',
    icon: '🍬',
    description: 'Spawn a Striped candy and a Wrapped candy adjacent for an explosive mega cross.',
    count: 2,
    cost: 220,
    color: '#3b82f6'
  },
  {
    id: 'sweet-shuffle',
    name: 'Sweet Reshuffle',
    icon: '🔀',
    description: 'Scramble all candies on the board for a fresh set of potential combos.',
    count: 2,
    cost: 80,
    color: '#10b981'
  },
  {
    id: 'extra-moves',
    name: '+5 Extra Moves',
    icon: '➕',
    description: 'Add 5 additional moves to help you complete challenging level objectives.',
    count: 3,
    cost: 120,
    color: '#f97316'
  },
  {
    id: 'jelly-fish',
    name: 'Candy Fish Swarm',
    icon: '🐠',
    description: 'Release 3 candy fish that seek out and devour jelly tiles and target goals.',
    count: 2,
    cost: 160,
    color: '#06b6d4'
  }
];

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Candy Meadow',
    description: 'Welcome to the Candy Kingdom! Match 3 or more candies to reach the target score.',
    moves: 18,
    targetScore: 1200,
    starScores: [1200, 2500, 4000],
    objectives: [
      { type: 'score', target: 1200, current: 0, label: 'Score 1,200 points' }
    ]
  },
  {
    levelNumber: 2,
    name: 'Striped Valley',
    description: 'Match 4 candies in a row or column to create power Striped Candies!',
    moves: 20,
    targetScore: 2800,
    starScores: [2800, 5000, 8000],
    objectives: [
      { type: 'score', target: 2800, current: 0, label: 'Score 2,800 points' },
      { type: 'collect', target: 20, current: 0, color: 'Red', label: 'Collect 20 Red Candies' }
    ]
  },
  {
    levelNumber: 3,
    name: 'Jelly Kingdom',
    description: 'Clear all the sweet jelly underneath the candies by matching over them.',
    moves: 22,
    targetScore: 3500,
    starScores: [3500, 6000, 9500],
    initialJellyCount: 16,
    objectives: [
      { type: 'jelly', target: 16, current: 0, label: 'Clear 16 Jelly Tiles' }
    ]
  },
  {
    levelNumber: 4,
    name: 'Wrapped Wonders',
    description: 'Form T or L shapes with 5 candies to craft explosive Wrapped Candies!',
    moves: 22,
    targetScore: 4500,
    starScores: [4500, 7500, 11000],
    initialJellyCount: 24,
    objectives: [
      { type: 'jelly', target: 24, current: 0, label: 'Clear 24 Jelly Tiles' },
      { type: 'collect', target: 25, current: 0, color: 'Blue', label: 'Collect 25 Blue Candies' }
    ]
  },
  {
    levelNumber: 5,
    name: 'Chocolate Cavern',
    description: 'Chocolate will spread if not cleared! Match adjacent candies to clear it.',
    moves: 24,
    targetScore: 5000,
    starScores: [5000, 8500, 13000],
    hasChocolate: true,
    objectives: [
      { type: 'chocolate', target: 8, current: 0, label: 'Destroy 8 Chocolate Blocks' },
      { type: 'score', target: 5000, current: 0, label: 'Score 5,000 points' }
    ]
  },
  {
    levelNumber: 6,
    name: 'Choco Bomb Bazaar',
    description: 'Match 5 candies in a straight line to create the mighty Color Bomb!',
    moves: 25,
    targetScore: 8000,
    starScores: [8000, 13000, 20000],
    objectives: [
      { type: 'score', target: 8000, current: 0, label: 'Score 8,000 points' },
      { type: 'collect', target: 30, current: 0, color: 'Yellow', label: 'Collect 30 Yellow Candies' }
    ]
  },
  {
    levelNumber: 7,
    name: 'Frosting Fortress',
    description: 'Crunchy sugar frosting blocks your path. Make adjacent matches to break it down.',
    moves: 26,
    targetScore: 7000,
    starScores: [7000, 12000, 18000],
    hasFrosting: true,
    objectives: [
      { type: 'frosting', target: 14, current: 0, label: 'Break 14 Frosting Blocks' },
      { type: 'score', target: 7000, current: 0, label: 'Score 7,000 points' }
    ]
  },
  {
    levelNumber: 8,
    name: 'Rainbow Rapids',
    description: 'Combine special candies together! Try swapping Striped with Wrapped or Color Bomb.',
    moves: 26,
    targetScore: 10000,
    starScores: [10000, 16000, 25000],
    initialJellyCount: 28,
    objectives: [
      { type: 'jelly', target: 28, current: 0, label: 'Clear 28 Jelly Tiles' },
      { type: 'collect', target: 35, current: 0, color: 'Purple', label: 'Collect 35 Purple Candies' }
    ]
  },
  {
    levelNumber: 9,
    name: 'Double Jelly Dungeon',
    description: 'Tough double-layer jellies require two matches to completely dissolve.',
    moves: 28,
    targetScore: 12000,
    starScores: [12000, 19000, 28000],
    initialJellyCount: 32,
    hasFrosting: true,
    objectives: [
      { type: 'jelly', target: 32, current: 0, label: 'Clear 32 Double Jellies' }
    ]
  },
  {
    levelNumber: 10,
    name: 'Candy Cyclone',
    description: 'Creeping chocolate and frosting barriers challenge your strategic combos!',
    moves: 28,
    targetScore: 15000,
    starScores: [15000, 23000, 34000],
    hasChocolate: true,
    hasFrosting: true,
    objectives: [
      { type: 'chocolate', target: 12, current: 0, label: 'Clear 12 Chocolate' },
      { type: 'collect', target: 30, current: 0, color: 'Green', label: 'Collect 30 Green Candies' }
    ]
  },
  {
    levelNumber: 11,
    name: 'Sugar Factory',
    description: 'Massive combination challenge: Break all frosting and dissolve all jellies!',
    moves: 30,
    targetScore: 20000,
    starScores: [20000, 30000, 45000],
    initialJellyCount: 36,
    hasFrosting: true,
    objectives: [
      { type: 'jelly', target: 36, current: 0, label: 'Clear 36 Jellies' },
      { type: 'frosting', target: 16, current: 0, label: 'Break 16 Frosting' }
    ]
  },
  {
    levelNumber: 12,
    name: "Sugar King's Palace",
    description: 'The ultimate sweet championship! Use all your boosters and master special combos.',
    moves: 32,
    targetScore: 30000,
    starScores: [30000, 45000, 65000],
    initialJellyCount: 40,
    hasChocolate: true,
    hasFrosting: true,
    objectives: [
      { type: 'score', target: 30000, current: 0, label: 'Score 30,000 points' },
      { type: 'jelly', target: 40, current: 0, label: 'Clear 40 Jellies' },
      { type: 'collect', target: 40, current: 0, color: 'Orange', label: 'Collect 40 Orange Candies' }
    ]
  }
];

export interface PlayerProgress {
  unlockedLevel: number;
  stars: Record<number, number>; // levelNumber -> stars (1-3)
  highScores: Record<number, number>; // levelNumber -> score
  coins: number;
  boosters: Record<string, number>;
}

const STORAGE_KEY = 'candy_crush_progress_v2';

export function loadPlayerProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  const defaultBoosters: Record<string, number> = {};
  INITIAL_BOOSTERS.forEach(b => {
    defaultBoosters[b.id] = b.count;
  });

  return {
    unlockedLevel: 1,
    stars: {},
    highScores: {},
    coins: 450,
    boosters: defaultBoosters
  };
}

export function savePlayerProgress(prog: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
  } catch {
    // ignore
  }
}
