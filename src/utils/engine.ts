/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandyColor, SpecialType, TileData, LevelConfig } from '../types/game';

export const CANDY_COLORS: CandyColor[] = ['Blue', 'Orange', 'Green', 'Yellow', 'Red', 'Purple'];
export const BOARD_ROWS = 9;
export const BOARD_COLS = 9;

export function getRandomColor(): CandyColor {
  return CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
}

export function getCandyImagePath(color: CandyColor | null, special: SpecialType, chocolate?: boolean, frosting?: number): string {
  if (chocolate) {
    // Chocolate block representation
    return '/images/Choco.png';
  }
  if (special === 'choco') {
    return '/images/Choco.png';
  }
  if (!color) {
    return '/images/blank.png';
  }
  if (special === 'striped-h') {
    return `/images/${color}-Striped-Horizontal.png`;
  }
  if (special === 'striped-v') {
    return `/images/${color}-Striped-Vertical.png`;
  }
  if (special === 'wrapped') {
    return `/images/${color}-Wrapped.png`;
  }
  return `/images/${color}.png`;
}

export function createInitialBoard(level?: LevelConfig): TileData[][] {
  const board: TileData[][] = [];
  
  // Decide jelly layout if level specifies
  const jellyCoords = new Set<string>();
  if (level?.initialJellyCount) {
    // Generate symmetrical or centered jelly layout
    const count = Math.min(level.initialJellyCount, 81);
    const centerR = 4;
    const centerC = 4;
    const candidates: [number, number, number][] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const dist = Math.abs(r - centerR) + Math.abs(c - centerC);
        candidates.push([r, c, dist]);
      }
    }
    candidates.sort((a, b) => a[2] - b[2]);
    for (let i = 0; i < count; i++) {
      jellyCoords.add(`${candidates[i][0]}-${candidates[i][1]}`);
    }
  }

  // Decide chocolate positions if level has chocolate
  const chocoCoords = new Set<string>();
  if (level?.hasChocolate) {
    chocoCoords.add('8-0');
    chocoCoords.add('8-8');
    if (level.levelNumber >= 10) {
      chocoCoords.add('8-1');
      chocoCoords.add('8-7');
    }
  }

  // Decide frosting positions if level has frosting
  const frostingCoords = new Set<string>();
  if (level?.hasFrosting) {
    const frostRows = [3, 4, 5];
    const frostCols = [2, 3, 5, 6];
    frostRows.forEach(r => {
      frostCols.forEach(c => {
        if (!chocoCoords.has(`${r}-${c}`)) {
          frostingCoords.add(`${r}-${c}`);
        }
      });
    });
  }

  for (let r = 0; r < BOARD_ROWS; r++) {
    const row: TileData[] = [];
    for (let c = 0; c < BOARD_COLS; c++) {
      const coord = `${r}-${c}`;
      let isChoco = chocoCoords.has(coord);
      let frostLevel = frostingCoords.has(coord) ? (level && level.levelNumber >= 9 ? 2 : 1) : 0;
      let jellyLevel = jellyCoords.has(coord) ? (level && level.levelNumber >= 9 ? 2 : 1) : 0;

      // Avoid forming matches on initial spawn
      let color = getRandomColor();
      while (
        (c >= 2 && row[c - 1]?.color === color && row[c - 2]?.color === color) ||
        (r >= 2 && board[r - 1]?.[c]?.color === color && board[r - 2]?.[c]?.color === color)
      ) {
        color = getRandomColor();
      }

        row.push({
          id: `${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
          row: r,
          col: c,
          color: isChoco ? null : color,
          special: 'regular',
          jelly: jellyLevel,
          frosting: frostLevel,
          chocolate: isChoco,
          visualOffsetY: 0,
          visualOffsetX: 0,
          visualScale: 1,
          visualScaleX: 1,
          visualScaleY: 1
        });
    }
    board.push(row);
  }

  return board;
}

export interface MatchGroup {
  tiles: TileData[];
  color: CandyColor;
  orientation: 'horizontal' | 'vertical' | 'intersection';
  formedSpecial: SpecialType | null;
  spawnTile?: { r: number; c: number };
}

// Find all matches on board and determine created special candies
export function findMatches(board: TileData[][], userSwapTile?: { r: number; c: number }): MatchGroup[] {
  const horizontalRuns: TileData[][] = [];
  const verticalRuns: TileData[][] = [];

  // Check horizontal
  for (let r = 0; r < BOARD_ROWS; r++) {
    let currentRun: TileData[] = [];
    for (let c = 0; c < BOARD_COLS; c++) {
      const tile = board[r][c];
      if (!tile.color || tile.special === 'choco' || tile.chocolate || tile.frosting > 0) {
        if (currentRun.length >= 3) {
          horizontalRuns.push([...currentRun]);
        }
        currentRun = [];
        continue;
      }

      if (currentRun.length === 0) {
        currentRun.push(tile);
      } else if (currentRun[0].color === tile.color) {
        currentRun.push(tile);
      } else {
        if (currentRun.length >= 3) {
          horizontalRuns.push([...currentRun]);
        }
        currentRun = [tile];
      }
    }
    if (currentRun.length >= 3) {
      horizontalRuns.push([...currentRun]);
    }
  }

  // Check vertical
  for (let c = 0; c < BOARD_COLS; c++) {
    let currentRun: TileData[] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      const tile = board[r][c];
      if (!tile.color || tile.special === 'choco' || tile.chocolate || tile.frosting > 0) {
        if (currentRun.length >= 3) {
          verticalRuns.push([...currentRun]);
        }
        currentRun = [];
        continue;
      }

      if (currentRun.length === 0) {
        currentRun.push(tile);
      } else if (currentRun[0].color === tile.color) {
        currentRun.push(tile);
      } else {
        if (currentRun.length >= 3) {
          verticalRuns.push([...currentRun]);
        }
        currentRun = [tile];
      }
    }
    if (currentRun.length >= 3) {
      verticalRuns.push([...currentRun]);
    }
  }

  const groups: MatchGroup[] = [];

  // Check for intersections (T / L shape) -> Wrapped Candy
  const matchedTilesSet = new Set<string>();
  const intersections: { hIdx: number; vIdx: number; tile: TileData }[] = [];

  horizontalRuns.forEach((hRun, hIdx) => {
    verticalRuns.forEach((vRun, vIdx) => {
      if (hRun[0].color === vRun[0].color) {
        for (const hTile of hRun) {
          for (const vTile of vRun) {
            if (hTile.row === vTile.row && hTile.col === vTile.col) {
              intersections.push({ hIdx, vIdx, tile: hTile });
            }
          }
        }
      }
    });
  });

  const usedH = new Set<number>();
  const usedV = new Set<number>();

  // Process intersections first
  for (const inter of intersections) {
    if (usedH.has(inter.hIdx) || usedV.has(inter.vIdx)) continue;
    usedH.add(inter.hIdx);
    usedV.add(inter.vIdx);

    const hRun = horizontalRuns[inter.hIdx];
    const vRun = verticalRuns[inter.vIdx];
    const combined = Array.from(new Set([...hRun, ...vRun]));

    groups.push({
      tiles: combined,
      color: hRun[0].color!,
      orientation: 'intersection',
      formedSpecial: 'wrapped',
      spawnTile: { r: inter.tile.row, c: inter.tile.col }
    });
  }

  // Process remaining horizontal runs
  horizontalRuns.forEach((hRun, idx) => {
    if (usedH.has(idx)) return;
    const len = hRun.length;
    let formedSpecial: SpecialType | null = null;
    let spawnTile: { r: number; c: number } | undefined;

    if (len >= 5) {
      formedSpecial = 'choco';
    } else if (len === 4) {
      formedSpecial = 'striped-v'; // horizontal line creates vertical stripe (Candy Crush rule)
    }

    if (formedSpecial) {
      // prefer the tile user moved
      if (userSwapTile && hRun.some(t => t.row === userSwapTile.r && t.col === userSwapTile.c)) {
        spawnTile = { r: userSwapTile.r, c: userSwapTile.c };
      } else {
        const mid = Math.floor(len / 2);
        spawnTile = { r: hRun[mid].row, c: hRun[mid].col };
      }
    }

    groups.push({
      tiles: hRun,
      color: hRun[0].color!,
      orientation: 'horizontal',
      formedSpecial,
      spawnTile
    });
  });

  // Process remaining vertical runs
  verticalRuns.forEach((vRun, idx) => {
    if (usedV.has(idx)) return;
    const len = vRun.length;
    let formedSpecial: SpecialType | null = null;
    let spawnTile: { r: number; c: number } | undefined;

    if (len >= 5) {
      formedSpecial = 'choco';
    } else if (len === 4) {
      formedSpecial = 'striped-h'; // vertical line creates horizontal stripe
    }

    if (formedSpecial) {
      if (userSwapTile && vRun.some(t => t.row === userSwapTile.r && t.col === userSwapTile.c)) {
        spawnTile = { r: userSwapTile.r, c: userSwapTile.c };
      } else {
        const mid = Math.floor(len / 2);
        spawnTile = { r: vRun[mid].row, c: vRun[mid].col };
      }
    }

    groups.push({
      tiles: vRun,
      color: vRun[0].color!,
      orientation: 'vertical',
      formedSpecial,
      spawnTile
    });
  });

  return groups;
}

// Check if two coordinates are adjacent
export function areAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
}

// Find if any valid moves exist on the board
export function findPossibleMoves(board: TileData[][]): { r1: number; c1: number; r2: number; c2: number }[] {
  const possible: { r1: number; c1: number; r2: number; c2: number }[] = [];

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 }
  ];

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const tile1 = board[r][c];
      if (tile1.chocolate || tile1.frosting > 0) continue;

      for (const dir of directions) {
        const nr = r + dir.dr;
        const nc = c + dir.dc;
        if (nr >= BOARD_ROWS || nc >= BOARD_COLS) continue;
        const tile2 = board[nr][nc];
        if (tile2.chocolate || tile2.frosting > 0) continue;

        // If either is choco, it's always a valid move
        if (tile1.special === 'choco' || tile2.special === 'choco') {
          possible.push({ r1: r, c1: c, r2: nr, c2: nc });
          continue;
        }

        // Test swapping
        const origColor1 = tile1.color;
        const origSpec1 = tile1.special;
        const origColor2 = tile2.color;
        const origSpec2 = tile2.special;

        tile1.color = origColor2;
        tile1.special = origSpec2;
        tile2.color = origColor1;
        tile2.special = origSpec1;

        const matches = findMatches(board);

        // Restore
        tile1.color = origColor1;
        tile1.special = origSpec1;
        tile2.color = origColor2;
        tile2.special = origSpec2;

        if (matches.length > 0) {
          possible.push({ r1: r, c1: c, r2: nr, c2: nc });
        }
      }
    }
  }

  return possible;
}

// Reshuffle the board candies when no moves are left, ensuring at least valid moves exist
export function reshuffleBoard(board: TileData[][]): TileData[][] {
  const candies: { color: CandyColor; special: SpecialType }[] = [];

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const t = board[r][c];
      if (!t.chocolate && t.frosting === 0) {
        candies.push({
          color: t.color || getRandomColor(),
          special: t.special === 'choco' ? 'choco' : (t.special || 'regular')
        });
      }
    }
  }

  let attempts = 0;
  let bestBoard = board;

  while (attempts < 30) {
    attempts++;
    for (let i = candies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candies[i], candies[j]] = [candies[j], candies[i]];
    }

    let idx = 0;
    const testBoard = board.map(row => row.map(t => ({ ...t })));
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const t = testBoard[r][c];
        if (!t.chocolate && t.frosting === 0) {
          const item = candies[idx++] || { color: getRandomColor(), special: 'regular' as SpecialType };
          t.color = item.color;
          t.special = item.special;
          t.visualScale = 1;
        }
      }
    }

    const matches = findMatches(testBoard);
    const moves = findPossibleMoves(testBoard);

    if (matches.length === 0 && moves.length >= 2) {
      return testBoard;
    }
    if (moves.length > 0) {
      bestBoard = testBoard;
    }
  }

  // Guarantee at least one valid match-3 opportunity if needed
  for (let r = 1; r < BOARD_ROWS - 1; r++) {
    for (let c = 1; c < BOARD_COLS - 2; c++) {
      const t1 = bestBoard[r][c];
      const t2 = bestBoard[r][c + 1];
      const tTarget = bestBoard[r + 1][c + 2];
      if (!t1.chocolate && !t2.chocolate && !tTarget.chocolate && t1.frosting === 0 && t2.frosting === 0 && tTarget.frosting === 0) {
        const targetColor = getRandomColor();
        t1.color = targetColor;
        t1.visualScale = 1;
        t2.color = targetColor;
        t2.visualScale = 1;
        tTarget.color = targetColor;
        tTarget.visualScale = 1;
        return bestBoard;
      }
    }
  }

  return bestBoard;
}
