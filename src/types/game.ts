/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CandyColor = 'Blue' | 'Orange' | 'Green' | 'Yellow' | 'Red' | 'Purple';

export type SpecialType = 'regular' | 'striped-h' | 'striped-v' | 'wrapped' | 'choco';

export interface TileData {
  id: string;
  row: number;
  col: number;
  color: CandyColor | null; // null for empty/blank or obstacles
  special: SpecialType;
  jelly: number; // 0: none, 1: single jelly, 2: double jelly
  frosting: number; // 0: none, 1: single frosting, 2: thick frosting
  chocolate: boolean; // true if chocolate obstacle
  visualOffsetY?: number; // visual offset in % for sliding swap animation
  visualOffsetX?: number; // visual offset in % for sliding swap animation
  visualScale?: number; // scale during popping/crushing
  visualScaleX?: number; // squash and stretch X
  visualScaleY?: number; // squash and stretch Y
  dropDist?: number; // number of rows dropped for CSS falling drop animation
  isCrushing?: boolean;
  isDropping?: boolean;
  isSwapping?: boolean;
  isNew?: boolean;
}

export type BoosterType = 
  | 'lollipop-hammer'
  | 'free-switch'
  | 'color-bomb-drop'
  | 'striped-wrapped-drop'
  | 'sweet-shuffle'
  | 'extra-moves'
  | 'jelly-fish';

export interface BoosterEquipment {
  id: BoosterType;
  name: string;
  icon: string;
  description: string;
  count: number;
  cost: number;
  color: string;
}

export type GameMode = 'levels' | 'arcade' | 'sandbox';

export type GameScreen = 'title' | 'level-select' | 'playing' | 'booster-shop';

export type ComboPraise = 'Sweet!' | 'Tasty!' | 'Delicious!' | 'Divine!' | 'SUGAR CRUSH!';

export interface LevelObjective {
  type: 'score' | 'jelly' | 'collect' | 'frosting' | 'chocolate';
  target: number;
  current: number;
  color?: CandyColor;
  label: string;
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  description: string;
  moves: number;
  targetScore: number;
  starScores: [number, number, number];
  objectives: LevelObjective[];
  initialJellyCount?: number;
  hasChocolate?: boolean;
  hasFrosting?: boolean;
  specialStartBoost?: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'star' | 'square' | 'sparkle';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  life: number;
}

export interface BeamEffect {
  id: number;
  type: 'row' | 'col' | 'cross' | 'mega-cross' | 'lightning';
  row?: number;
  col?: number;
  targetX?: number;
  targetY?: number;
  startX?: number;
  startY?: number;
  color: string;
  life: number;
  maxLife: number;
}
