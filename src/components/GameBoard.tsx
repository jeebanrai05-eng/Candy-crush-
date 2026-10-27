/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  CandyColor,
  SpecialType,
  TileData,
  LevelConfig,
  BoosterType,
  ComboPraise,
  BeamEffect
} from '../types/game';
import {
  BOARD_ROWS,
  BOARD_COLS,
  getRandomColor,
  getCandyImagePath,
  createInitialBoard,
  findMatches,
  findPossibleMoves,
  areAdjacent,
  reshuffleBoard
} from '../utils/engine';
import { soundCtrl } from '../utils/audio';
import candylandLandscapeBg from '../assets/images/candyland_vibrant_landscape_1793055689018.jpg';

// Candy Colors for Particle Crystals
const CANDY_HEX: Record<CandyColor, string> = {
  Red: '#ef4444',
  Orange: '#f97316',
  Yellow: '#eab308',
  Green: '#22c55e',
  Blue: '#3b82f6',
  Purple: '#a855f7'
};

interface ParticleItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

interface GameBoardProps {
  level?: LevelConfig;
  mode: 'levels' | 'arcade' | 'sandbox';
  boosters: Record<string, number>;
  onUseBoosterItem: (id: BoosterType) => void;
  onVictory: (score: number, movesLeft: number) => void;
  onGameOver: (score: number) => void;
  onOpenPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  mode,
  boosters,
  onUseBoosterItem,
  onVictory,
  onGameOver,
  onOpenPause,
  isMuted,
  onToggleMute
}) => {
  const [board, setBoard] = useState<TileData[][]>(() => createInitialBoard(level));
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(() => level?.moves || (mode === 'arcade' ? 30 : 999));
  const [selectedTile, setSelectedTile] = useState<{ r: number; c: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeBooster, setActiveBooster] = useState<BoosterType | null>(null);
  const [comboName, setComboName] = useState<ComboPraise | null>(null);
  const [shake, setShake] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<{ r: number; c: number }>({ r: 4, c: 4 });
  const [fps, setFps] = useState<number>(120);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);
  const [shuffleBanner, setShuffleBanner] = useState<boolean>(false);

  // Drag tracking state for smooth slide gestures
  const dragStartPos = useRef<{ r: number; c: number; x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  // Particle & FX refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleItem[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingScore[]>([]);
  const [beamEffects, setBeamEffects] = useState<BeamEffect[]>([]);
  const nextId = useRef(1);

  // Objectives tracking
  const [objectives, setObjectives] = useState(() => {
    return level?.objectives.map(o => ({ ...o })) || [];
  });

  const gameEnded = useRef(false);

  // 120 FPS Real-Time Particle & Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsCalc = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // clamped dt
      lastTime = currentTime;

      // Calculate instantaneous FPS
      frameCount++;
      if (currentTime - lastFpsCalc >= 500) {
        const calculatedFps = Math.round((frameCount * 1000) / (currentTime - lastFpsCalc));
        setFps(calculatedFps);
        frameCount = 0;
        lastFpsCalc = currentTime;
      }

      // Screen shake decay
      setShake(prev => {
        if (Math.abs(prev.x) < 0.1 && Math.abs(prev.y) < 0.1) return { x: 0, y: 0 };
        return { x: prev.x * 0.9, y: prev.y * 0.9 };
      });

      // Render 120 FPS Particle Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const particles = particlesRef.current;
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.vy += 0.35 * dt * 60; // gravity
            p.rotation += p.vRot * dt * 60;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / p.maxLife);

            if (p.life <= 0) {
              particles.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;

            // Diamond crystal sugar shape
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.8, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.8, 0);
            ctx.closePath();
            ctx.fill();

            // Inner sparkle highlight
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.fillRect(-p.size * 0.25, -p.size * 0.25, p.size * 0.5, p.size * 0.5);

            ctx.restore();
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Spawn sugar crystal burst particles
  const spawnSugarBurst = useCallback((r: number, c: number, color: CandyColor | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cellWidth = canvas.width / BOARD_COLS;
    const cellHeight = canvas.height / BOARD_ROWS;
    const cx = (c + 0.5) * cellWidth;
    const cy = (r + 0.5) * cellHeight;
    const hex = color ? CANDY_HEX[color] : '#fbbf24';

    // 16-20 energetic crystal shards
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 5.5;
      const life = 0.4 + Math.random() * 0.35;
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 12,
        y: cy + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // initial upward kick
        size: 3 + Math.random() * 4.5,
        color: hex,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        life,
        maxLife: life
      });
    }
  }, []);

  const triggerShake = (amount: number = 8) => {
    const angle = Math.random() * Math.PI * 2;
    setShake({
      x: Math.cos(angle) * amount,
      y: Math.sin(angle) * amount
    });
  };

  const addFloatingText = (r: number, c: number, text: string, color: string = '#fde047', size: number = 18) => {
    const id = nextId.current++;
    setFloatingTexts(prev => [
      ...prev,
      {
        id,
        x: (c + 0.5) * 11.11,
        y: (r + 0.5) * 11.11,
        text,
        color,
        fontSize: size
      }
    ]);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 850);
  };

  const addBeam = (type: BeamEffect['type'], r?: number, c?: number, color: string = '#38bdf8') => {
    const id = nextId.current++;
    setBeamEffects(prev => [
      ...prev,
      {
        id,
        type,
        row: r,
        col: c,
        color,
        life: 0,
        maxLife: 0.35
      }
    ]);
    setTimeout(() => {
      setBeamEffects(prev => prev.filter(b => b.id !== id));
    }, 450);
  };

  // Modern Auto-Refresh / Reshuffle with Staggered 3D Wave Animation
  const triggerModernAutoReshuffle = useCallback(async (currBoard: TileData[][]) => {
    setIsProcessing(true);
    setShuffleBanner(true);
    setIsAutoRefreshing(true);
    soundCtrl.playShuffle();
    triggerShake(12);

    // Staggered modern flip wave
    await new Promise(res => setTimeout(res, 380));

    // Reshuffle board guaranteeing at least 2-3 valid moves and zero initial matches
    const reshuffled = reshuffleBoard(currBoard.map(row => row.map(t => ({ ...t }))));
    setBoard(reshuffled);

    await new Promise(res => setTimeout(res, 450));
    setShuffleBanner(false);
    setIsAutoRefreshing(false);
    setIsProcessing(false);

    addFloatingText(4, 4, 'AUTO RESHUFFLED! ⚡', '#38bdf8', 22);
  }, []);

  // Initial mount check to ensure board always has valid 3-candy moves
  useEffect(() => {
    const moves = findPossibleMoves(board);
    if (moves.length === 0) {
      triggerModernAutoReshuffle(board);
    }
  }, [triggerModernAutoReshuffle]);

  // Evaluate Level Objectives
  const checkVictoryConditions = useCallback((currScore: number, currObjs: typeof objectives, moves: number) => {
    if (mode !== 'levels' || gameEnded.current) return;

    const hasOnlyScore = currObjs.length === 1 && currObjs[0].type === 'score';
    let allCompleted = true;
    for (const obj of currObjs) {
      if (obj.type === 'score') {
        if (currScore < obj.target) allCompleted = false;
      } else if (obj.current < obj.target) {
        allCompleted = false;
      }
    }

    // In score levels (e.g. Level 1), player can keep playing until moves run out or 3 stars
    if (hasOnlyScore) {
      const starScores = level?.starScores || [1200, 3000, 6000];
      const hasThreeStars = currScore >= starScores[2];
      if ((allCompleted && moves <= 0) || hasThreeStars) {
        gameEnded.current = true;
        soundCtrl.playVictory();
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 }
        });
        setComboName('SUGAR CRUSH!');
        setTimeout(() => {
          onVictory(currScore, moves);
        }, 1200);
      }
    } else {
      if (allCompleted) {
        gameEnded.current = true;
        soundCtrl.playVictory();
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 }
        });
        setComboName('SUGAR CRUSH!');
        setTimeout(() => {
          onVictory(currScore, moves);
        }, 1200);
      }
    }
  }, [mode, level, onVictory]);

  // Guaranteed Gravity Drop & Infinite Refill: Drops existing candies and fills EVERY empty slot from top
  const dropAndRefillBoard = useCallback(async (inputBoard: TileData[][]): Promise<TileData[][]> => {
    const isObstacle = (t: TileData) => Boolean(t.chocolate || t.frosting > 0);
    const hasCandy = (t: TileData) => Boolean(!isObstacle(t) && (t.color !== null || t.special === 'choco'));

    // Check if any empty cell exists or any tile has visualScale === 0
    let needsRefill = false;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const t = inputBoard[r][c];
        if (!isObstacle(t) && !hasCandy(t)) {
          needsRefill = true;
          break;
        }
        if (t.visualScale === 0) {
          needsRefill = true;
          break;
        }
      }
      if (needsRefill) break;
    }

    if (!needsRefill) return inputBoard;

    const working = inputBoard.map(row => row.map(t => ({ ...t, visualScale: 1 })));
    const newGrid: TileData[][] = inputBoard.map(row => row.map(t => ({ ...t, visualScale: 1 })));
    let maxDropDist = 0;

    for (let c = 0; c < BOARD_COLS; c++) {
      let newSpawnCounter = 1;

      // Scan from bottom to top
      for (let r = BOARD_ROWS - 1; r >= 0; r--) {
        // Obstacles stay fixed in place
        if (isObstacle(working[r][c])) {
          newGrid[r][c] = {
            ...working[r][c],
            dropDist: 0,
            isDropping: false,
            visualScale: 1,
            visualOffsetX: 0,
            visualOffsetY: 0,
            isSwapping: false
          };
          continue;
        }

        if (hasCandy(working[r][c])) {
          // Candy survives in place
          newGrid[r][c] = {
            ...working[r][c],
            dropDist: 0,
            isDropping: false,
            visualScale: 1,
            visualOffsetX: 0,
            visualOffsetY: 0,
            isSwapping: false
          };
        } else {
          // Empty cell! Find lowest available candy above row r
          let foundSrcR = -1;
          for (let scanR = r - 1; scanR >= 0; scanR--) {
            if (hasCandy(working[scanR][c])) {
              foundSrcR = scanR;
              break;
            }
          }

          if (foundSrcR !== -1) {
            // Drop surviving candy from foundSrcR down to r
            const dropDist = r - foundSrcR;
            if (dropDist > maxDropDist) maxDropDist = dropDist;
            newGrid[r][c] = {
              ...working[r][c],
              id: `${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
              color: working[foundSrcR][c].color,
              special: working[foundSrcR][c].special,
              dropDist,
              visualScale: 1,
              visualOffsetX: 0,
              visualOffsetY: 0,
              isSwapping: false,
              isDropping: true,
              isNew: false
            };
            // Mark source cell as consumed
            working[foundSrcR][c].color = null;
            working[foundSrcR][c].special = 'regular';
          } else {
            // No candies above: spawn brand new unlimited candy from above the board
            const skyDropDist = r + 1 + newSpawnCounter;
            if (skyDropDist > maxDropDist) maxDropDist = skyDropDist;
            newGrid[r][c] = {
              ...working[r][c],
              id: `${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
              color: getRandomColor(),
              special: 'regular',
              dropDist: skyDropDist,
              visualScale: 1,
              visualOffsetX: 0,
              visualOffsetY: 0,
              isSwapping: false,
              isDropping: true,
              isNew: true
            };
            newSpawnCounter++;
          }
        }
      }
    }

    // Mount board with drop animations triggered
    setBoard(newGrid.map(row => row.map(t => ({ ...t }))));

    // Wait for the drop animation to finish
    const animWait = Math.min(360, 200 + maxDropDist * 25);
    await new Promise(res => setTimeout(res, animWait));

    // Clear dropDist flags and lock visualScale to 1 so all candies are crisp & fully visible
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        newGrid[r][c].dropDist = 0;
        newGrid[r][c].isDropping = false;
        newGrid[r][c].isNew = false;
        newGrid[r][c].visualScale = 1;
        newGrid[r][c].visualOffsetX = 0;
        newGrid[r][c].visualOffsetY = 0;
        newGrid[r][c].isSwapping = false;
      }
    }
    setBoard(newGrid.map(row => row.map(t => ({ ...t }))));
    await new Promise(res => setTimeout(res, 40));

    return newGrid;
  }, []);

  // Self-healing: if board ever has empty cells or visualScale === 0, automatically refill
  useEffect(() => {
    if (isProcessing) return;
    let hasEmpty = false;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const t = board[r][c];
        if (!t.chocolate && t.frosting === 0 && (!t.color && t.special !== 'choco')) {
          hasEmpty = true;
          break;
        }
        if (t.visualScale === 0) {
          hasEmpty = true;
          break;
        }
      }
      if (hasEmpty) break;
    }

    if (hasEmpty) {
      dropAndRefillBoard(board);
    }
  }, [board, isProcessing, dropAndRefillBoard]);

  // Execute clearing of matched tiles & falling slide cascades from top to bottom
  const processMatchesAndCascades = useCallback(async (
    currentBoard: TileData[][],
    userMoveTile?: { r: number; c: number }
  ) => {
    setIsProcessing(true);
    let workingBoard = currentBoard.map(row => row.map(t => ({ ...t })));
    let comboChain = 0;

    // STEP 1: Refill any empty cells first (e.g. from special combos, hammers, or fish)
    workingBoard = await dropAndRefillBoard(workingBoard);

    // STEP 2: Loop to find matches, pop them, drop & refill until no more matches exist
    while (true) {
      const matchGroups = findMatches(workingBoard, userMoveTile);
      if (matchGroups.length === 0) {
        break; // Board has no more matches!
      }

      comboChain++;
      soundCtrl.playMatch(comboChain);

      if (comboChain === 2) setComboName('Sweet!');
      else if (comboChain === 3) setComboName('Tasty!');
      else if (comboChain === 4) setComboName('Delicious!');
      else if (comboChain >= 5) setComboName('Divine!');

      if (comboChain >= 2) {
        setTimeout(() => setComboName(null), 1000);
      }

      const tilesToClear = new Set<string>();
      const specialsToSpawn: { r: number; c: number; special: SpecialType; color: CandyColor }[] = [];
      let ptsGained = 0;

      for (const group of matchGroups) {
        const pts = group.tiles.length * 30 * comboChain;
        ptsGained += pts;

        const centerTile = group.tiles[Math.floor(group.tiles.length / 2)];
        addFloatingText(centerTile.row, centerTile.col, `+${pts}`, '#fde047', 18);

        setObjectives(prev => prev.map(obj => {
          if (obj.type === 'collect' && obj.color === group.color) {
            return { ...obj, current: Math.min(obj.target, obj.current + group.tiles.length) };
          }
          return obj;
        }));

        if (group.formedSpecial && group.spawnTile) {
          specialsToSpawn.push({
            r: group.spawnTile.r,
            c: group.spawnTile.c,
            special: group.formedSpecial,
            color: group.color
          });
        }

        for (const tile of group.tiles) {
          tilesToClear.add(`${tile.row}-${tile.col}`);

          if (tile.special === 'striped-h') {
            soundCtrl.playStriped();
            triggerShake(6);
            addBeam('row', tile.row, undefined, '#38bdf8');
            for (let c = 0; c < BOARD_COLS; c++) tilesToClear.add(`${tile.row}-${c}`);
          } else if (tile.special === 'striped-v') {
            soundCtrl.playStriped();
            triggerShake(6);
            addBeam('col', undefined, tile.col, '#38bdf8');
            for (let r = 0; r < BOARD_ROWS; r++) tilesToClear.add(`${r}-${tile.col}`);
          } else if (tile.special === 'wrapped') {
            soundCtrl.playWrapped();
            triggerShake(10);
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = tile.row + dr;
                const nc = tile.col + dc;
                if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS) {
                  tilesToClear.add(`${nr}-${nc}`);
                }
              }
            }
          }
        }
      }

      setScore(prev => prev + ptsGained);

      // Trigger pop animation & crystal particles on crushed tiles
      workingBoard = workingBoard.map(row => row.map(t => {
        if (tilesToClear.has(`${t.row}-${t.col}`)) {
          spawnSugarBurst(t.row, t.col, t.color);
          return { ...t, isCrushing: true, visualScale: 0 };
        }
        return t;
      }));
      setBoard(workingBoard.map(row => row.map(t => ({ ...t }))));

      await new Promise(res => setTimeout(res, 160));

      let jelliesClearedCount = 0;
      let chocolateDestroyedCount = 0;
      let frostingDestroyedCount = 0;

      tilesToClear.forEach(coord => {
        const [r, c] = coord.split('-').map(Number);
        const tile = workingBoard[r][c];

        if (tile.jelly > 0) {
          tile.jelly -= 1;
          if (tile.jelly === 0) jelliesClearedCount++;
        }

        const adj = [
          { dr: -1, dc: 0 },
          { dr: 1, dc: 0 },
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 }
        ];

        adj.forEach(({ dr, dc }) => {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS) {
            const neighbor = workingBoard[nr][nc];
            if (neighbor.chocolate) {
              neighbor.chocolate = false;
              neighbor.color = getRandomColor();
              chocolateDestroyedCount++;
              soundCtrl.playWrapped();
            }
            if (neighbor.frosting > 0) {
              neighbor.frosting -= 1;
              if (neighbor.frosting === 0) {
                frostingDestroyedCount++;
                neighbor.color = getRandomColor();
              }
            }
          }
        });

        tile.color = null;
        tile.special = 'regular';
        tile.isCrushing = false;
        tile.visualScale = 1;
      });

      if (jelliesClearedCount > 0) {
        setObjectives(prev => prev.map(o => o.type === 'jelly' ? { ...o, current: Math.min(o.target, o.current + jelliesClearedCount) } : o));
      }
      if (chocolateDestroyedCount > 0) {
        setObjectives(prev => prev.map(o => o.type === 'chocolate' ? { ...o, current: Math.min(o.target, o.current + chocolateDestroyedCount) } : o));
      }
      if (frostingDestroyedCount > 0) {
        setObjectives(prev => prev.map(o => o.type === 'frosting' ? { ...o, current: Math.min(o.target, o.current + frostingDestroyedCount) } : o));
      }

      // Spawn specials formed from match
      for (const sp of specialsToSpawn) {
        workingBoard[sp.r][sp.c].color = sp.color;
        workingBoard[sp.r][sp.c].special = sp.special;
        workingBoard[sp.r][sp.c].visualScale = 1;
        tilesToClear.delete(`${sp.r}-${sp.c}`);
      }

      // Drop surviving candies and refill every empty slot from top
      workingBoard = await dropAndRefillBoard(workingBoard);
    }

    // Final safety check: ensure absolutely zero empty cells exist
    workingBoard = await dropAndRefillBoard(workingBoard);

    // STEP 3: Now check if any 3-matches can be made on the full board
    const possibleMoves = findPossibleMoves(workingBoard);
    if (possibleMoves.length === 0) {
      await triggerModernAutoReshuffle(workingBoard);
    } else {
      setIsProcessing(false);
    }
  }, [spawnSugarBurst, dropAndRefillBoard, triggerModernAutoReshuffle]);

  // --- SMOOTH SLIDE SWAP FEATURE ("TYP SMOOTH ANIMATION SLIDE FEATURE") ---
  const handleSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing) return;

    const t1 = board[r1][c1];
    const t2 = board[r2][c2];

    if (t1.chocolate || t2.chocolate || t1.frosting > 0 || t2.frosting > 0) {
      setSelectedTile(null);
      return;
    }

    setIsProcessing(true);
    setSelectedTile(null);

    // Compute slide offset vector (% of cell width/height)
    const deltaX = (c2 - c1) * 100;
    const deltaY = (r2 - r1) * 100;

    // Step 1: Animate both candies sliding into each other's cell
    const slidingBoard = board.map(row => row.map(t => ({ ...t })));
    slidingBoard[r1][c1].visualOffsetX = deltaX;
    slidingBoard[r1][c1].visualOffsetY = deltaY;
    slidingBoard[r1][c1].isSwapping = true;

    slidingBoard[r2][c2].visualOffsetX = -deltaX;
    slidingBoard[r2][c2].visualOffsetY = -deltaY;
    slidingBoard[r2][c2].isSwapping = true;

    setBoard(slidingBoard);

    // Wait 170ms for the buttery smooth slide transition
    await new Promise(res => setTimeout(res, 170));

    // --- CHECK SPECIAL-TO-SPECIAL COMBOS FIRST ---
    // Combo 1: Color Bomb + Color Bomb (Wipes entire board)
    if (t1.special === 'choco' && t2.special === 'choco') {
      soundCtrl.playChoco();
      triggerShake(16);
      addBeam('cross', 4, 4, '#f59e0b');
      setMovesLeft(m => Math.max(0, m - 1));

      const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          newBoard[r][c].color = null;
          newBoard[r][c].special = 'regular';
          if (newBoard[r][c].jelly > 0) newBoard[r][c].jelly -= 1;
        }
      }
      setScore(s => s + 5000);
      addFloatingText(4, 4, 'BOARD CLEAR! +5,000', '#f59e0b', 24);
      setBoard(newBoard);
      await new Promise(res => setTimeout(res, 260));
      await processMatchesAndCascades(newBoard);
      return;
    }

    // Combo 2: Color Bomb + Striped
    if ((t1.special === 'choco' && (t2.special === 'striped-h' || t2.special === 'striped-v')) ||
        (t2.special === 'choco' && (t1.special === 'striped-h' || t1.special === 'striped-v'))) {
      const targetColor = t1.special === 'choco' ? t2.color : t1.color;
      soundCtrl.playChoco();
      triggerShake(14);
      setMovesLeft(m => Math.max(0, m - 1));

      const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          if (newBoard[r][c].color === targetColor) {
            newBoard[r][c].special = Math.random() > 0.5 ? 'striped-h' : 'striped-v';
          }
        }
      }
      newBoard[r1][c1].special = 'regular';
      newBoard[r1][c1].color = null;
      newBoard[r1][c1].visualScale = 1;
      newBoard[r2][c2].special = 'regular';
      newBoard[r2][c2].color = null;
      newBoard[r2][c2].visualScale = 1;
      setBoard(newBoard);
      await new Promise(res => setTimeout(res, 220));
      await processMatchesAndCascades(newBoard);
      return;
    }

    // Combo 3: Color Bomb + Wrapped
    if ((t1.special === 'choco' && t2.special === 'wrapped') || (t2.special === 'choco' && t1.special === 'wrapped')) {
      const targetColor = t1.special === 'choco' ? t2.color : t1.color;
      soundCtrl.playChoco();
      triggerShake(15);
      setMovesLeft(m => Math.max(0, m - 1));

      const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          if (newBoard[r][c].color === targetColor) {
            newBoard[r][c].special = 'wrapped';
          }
        }
      }
      newBoard[r1][c1].special = 'regular';
      newBoard[r1][c1].color = null;
      newBoard[r1][c1].visualScale = 1;
      newBoard[r2][c2].special = 'regular';
      newBoard[r2][c2].color = null;
      newBoard[r2][c2].visualScale = 1;
      setBoard(newBoard);
      await new Promise(res => setTimeout(res, 220));
      await processMatchesAndCascades(newBoard);
      return;
    }

    // Combo 4: Color Bomb + Regular Candy
    if (t1.special === 'choco' || t2.special === 'choco') {
      const colorToClear = t1.special === 'choco' ? t2.color : t1.color;
      soundCtrl.playChoco();
      triggerShake(10);
      setMovesLeft(m => Math.max(0, m - 1));

      const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
      let cleared = 0;
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          if (newBoard[r][c].color === colorToClear) {
            newBoard[r][c].color = null;
            newBoard[r][c].special = 'regular';
            newBoard[r][c].visualScale = 1;
            if (newBoard[r][c].jelly > 0) newBoard[r][c].jelly -= 1;
            cleared++;
          }
        }
      }
      newBoard[r1][c1].special = 'regular';
      newBoard[r1][c1].color = null;
      newBoard[r1][c1].visualScale = 1;
      newBoard[r2][c2].special = 'regular';
      newBoard[r2][c2].color = null;
      newBoard[r2][c2].visualScale = 1;

      const pts = cleared * 50;
      setScore(s => s + pts);
      addFloatingText(r2, c2, `+${pts}`, '#eab308', 20);
      setBoard(newBoard);
      await new Promise(res => setTimeout(res, 180));
      await processMatchesAndCascades(newBoard);
      return;
    }

    // Combo 5: Striped + Striped
    if ((t1.special === 'striped-h' || t1.special === 'striped-v') &&
        (t2.special === 'striped-h' || t2.special === 'striped-v')) {
      soundCtrl.playStriped();
      triggerShake(10);
      addBeam('cross', r2, c2, '#38bdf8');
      setMovesLeft(m => Math.max(0, m - 1));

      const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
      for (let c = 0; c < BOARD_COLS; c++) newBoard[r2][c].color = null;
      for (let r = 0; r < BOARD_ROWS; r++) newBoard[r][c2].color = null;

      setScore(s => s + 800);
      addFloatingText(r2, c2, 'CROSS BLAST! +800', '#38bdf8', 18);
      setBoard(newBoard);
      await new Promise(res => setTimeout(res, 180));
      await processMatchesAndCascades(newBoard);
      return;
    }

    // Combo 6: Striped + Wrapped
    if (((t1.special === 'striped-h' || t1.special === 'striped-v') && t2.special === 'wrapped') ||
        ((t2.special === 'striped-h' || t2.special === 'striped-v') && t1.special === 'wrapped')) {
      soundCtrl.playStriped();
      soundCtrl.playWrapped();
      triggerShake(14);
      addBeam('mega-cross', r2, c2, '#ec4899');
      setMovesLeft(m => Math.max(0, m - 1));

      const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
      for (let dr = -1; dr <= 1; dr++) {
        const nr = r2 + dr;
        if (nr >= 0 && nr < BOARD_ROWS) {
          for (let c = 0; c < BOARD_COLS; c++) newBoard[nr][c].color = null;
        }
      }
      for (let dc = -1; dc <= 1; dc++) {
        const nc = c2 + dc;
        if (nc >= 0 && nc < BOARD_COLS) {
          for (let r = 0; r < BOARD_ROWS; r++) newBoard[r][nc].color = null;
        }
      }

      setScore(s => s + 1500);
      addFloatingText(r2, c2, 'MEGA BLAST! +1,500', '#ec4899', 22);
      setBoard(newBoard);
      await new Promise(res => setTimeout(res, 220));
      await processMatchesAndCascades(newBoard);
      return;
    }

    // Combo 7: Wrapped + Wrapped
    if (t1.special === 'wrapped' && t2.special === 'wrapped') {
      soundCtrl.playWrapped();
      triggerShake(16);
      setMovesLeft(m => Math.max(0, m - 1));

      const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r2 + dr;
          const nc = c2 + dc;
          if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS) {
            newBoard[nr][nc].color = null;
            if (newBoard[nr][nc].jelly > 0) newBoard[nr][nc].jelly -= 1;
          }
        }
      }

      setScore(s => s + 2000);
      addFloatingText(r2, c2, 'MEGA CRUSH! +2,000', '#a855f7', 22);
      setBoard(newBoard);
      await new Promise(res => setTimeout(res, 220));
      await processMatchesAndCascades(newBoard);
      return;
    }

    // Standard Regular Swap:
    const newBoard = board.map(row => row.map(t => ({ ...t, visualOffsetX: 0, visualOffsetY: 0, isSwapping: false })));
    const color1 = t1.color;
    const spec1 = t1.special;
    newBoard[r1][c1].color = t2.color;
    newBoard[r1][c1].special = t2.special;
    newBoard[r2][c2].color = color1;
    newBoard[r2][c2].special = spec1;

    const matches = findMatches(newBoard, { r: r2, c: c2 });
    if (matches.length > 0) {
      setMovesLeft(m => Math.max(0, m - 1));
      setBoard(newBoard);
      await processMatchesAndCascades(newBoard, { r: r2, c: c2 });
    } else {
      // Invalid move: Slide back smoothly!
      const revertBoard = board.map(row => row.map(t => ({ ...t })));
      revertBoard[r1][c1].visualOffsetX = 0;
      revertBoard[r1][c1].visualOffsetY = 0;
      revertBoard[r2][c2].visualOffsetX = 0;
      revertBoard[r2][c2].visualOffsetY = 0;
      setBoard(revertBoard);
      soundCtrl.playClick();
      await new Promise(res => setTimeout(res, 160));
      setIsProcessing(false);
    }
  };

  // Click on tile handler
  const handleTileClick = (r: number, c: number) => {
    if (isProcessing) return;

    if (activeBooster) {
      applyBoosterToTile(activeBooster, r, c);
      return;
    }

    if (!selectedTile) {
      setSelectedTile({ r, c });
      soundCtrl.playClick();
    } else {
      if (selectedTile.r === r && selectedTile.c === c) {
        setSelectedTile(null);
      } else if (areAdjacent(selectedTile.r, selectedTile.c, r, c)) {
        handleSwap(selectedTile.r, selectedTile.c, r, c);
      } else {
        setSelectedTile({ r, c });
        soundCtrl.playClick();
      }
    }
  };

  // Pointer / Touch Drag handlers for smooth slide gestures
  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    if (isProcessing) return;
    if (activeBooster) {
      applyBoosterToTile(activeBooster, r, c);
      return;
    }
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
    dragStartPos.current = { r, c, x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartPos.current || isProcessing) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    setDragOffset({ x: dx, y: dy });

    const threshold = 22; // responsive swipe threshold
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      const { r, c } = dragStartPos.current;
      dragStartPos.current = null;
      setDragOffset(null);

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal slide
        const targetC = dx > 0 ? c + 1 : c - 1;
        if (targetC >= 0 && targetC < BOARD_COLS) {
          handleSwap(r, c, r, targetC);
        }
      } else {
        // Vertical slide
        const targetR = dy > 0 ? r + 1 : r - 1;
        if (targetR >= 0 && targetR < BOARD_ROWS) {
          handleSwap(r, c, targetR, c);
        }
      }
    }
  };

  const handlePointerUp = (e?: React.PointerEvent, r?: number, c?: number) => {
    if (dragStartPos.current) {
      const startR = r !== undefined ? r : dragStartPos.current.r;
      const startC = c !== undefined ? c : dragStartPos.current.c;
      const dx = e ? Math.abs(e.clientX - dragStartPos.current.x) : 0;
      const dy = e ? Math.abs(e.clientY - dragStartPos.current.y) : 0;
      dragStartPos.current = null;
      setDragOffset(null);

      // If tap/click without dragging past 14px, handle click selection
      if (dx < 14 && dy < 14) {
        handleTileClick(startR, startC);
      }
    } else {
      setDragOffset(null);
    }
  };

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenPause();
        return;
      }

      let { r, c } = cursorPos;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        r = Math.max(0, r - 1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        r = Math.min(BOARD_ROWS - 1, r + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        c = Math.max(0, c - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        c = Math.min(BOARD_COLS - 1, c + 1);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTileClick(cursorPos.r, cursorPos.c);
        return;
      } else {
        return;
      }

      setCursorPos({ r, c });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorPos, selectedTile, activeBooster, isProcessing, onOpenPause]);

  // Apply booster equipment logic
  const applyBoosterToTile = async (booster: BoosterType, r: number, c: number) => {
    if ((boosters[booster] || 0) <= 0 && mode !== 'sandbox') {
      setActiveBooster(null);
      return;
    }

    onUseBoosterItem(booster);
    setActiveBooster(null);

    const newBoard = board.map(row => row.map(t => ({ ...t })));
    const target = newBoard[r][c];

    if (booster === 'lollipop-hammer') {
      soundCtrl.playHammer();
      triggerShake(12);
      addFloatingText(r, c, 'SMASH!', '#ec4899', 20);

      if (target.chocolate) target.chocolate = false;
      if (target.frosting > 0) target.frosting = 0;
      if (target.jelly > 0) target.jelly = 0;
      target.color = null;
      target.special = 'regular';

      setBoard(newBoard);
      await processMatchesAndCascades(newBoard);
    } else if (booster === 'free-switch') {
      if (!selectedTile) {
        setSelectedTile({ r, c });
        addFloatingText(r, c, 'Pick target neighbor', '#8b5cf6', 14);
        setActiveBooster('free-switch');
        return;
      } else {
        soundCtrl.playClick();
        const t1 = newBoard[selectedTile.r][selectedTile.c];
        const t2 = newBoard[r][c];
        const origColor = t1.color;
        const origSpec = t1.special;
        t1.color = t2.color;
        t1.special = t2.special;
        t2.color = origColor;
        t2.special = origSpec;

        setSelectedTile(null);
        setBoard(newBoard);
        await processMatchesAndCascades(newBoard);
      }
    } else if (booster === 'color-bomb-drop') {
      soundCtrl.playChoco();
      triggerShake(10);
      target.special = 'choco';
      target.color = null;
      target.chocolate = false;
      target.frosting = 0;
      addFloatingText(r, c, 'COLOR BOMB!', '#eab308', 20);
      setBoard(newBoard);
    } else if (booster === 'striped-wrapped-drop') {
      soundCtrl.playStriped();
      target.special = 'striped-h';
      target.color = target.color || getRandomColor();
      const neighborC = c < BOARD_COLS - 1 ? c + 1 : c - 1;
      newBoard[r][neighborC].special = 'wrapped';
      newBoard[r][neighborC].color = newBoard[r][neighborC].color || getRandomColor();
      addFloatingText(r, c, 'STRIPED & WRAPPED!', '#3b82f6', 18);
      setBoard(newBoard);
    } else if (booster === 'jelly-fish') {
      soundCtrl.playFish();
      triggerShake(8);
      const candidates: { r: number; c: number }[] = [];
      for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
          if (newBoard[row][col].jelly > 0 || newBoard[row][col].chocolate) {
            candidates.push({ r: row, c: col });
          }
        }
      }
      while (candidates.length < 3) {
        candidates.push({
          r: Math.floor(Math.random() * BOARD_ROWS),
          c: Math.floor(Math.random() * BOARD_COLS)
        });
      }

      for (let i = 0; i < 3; i++) {
        const pick = candidates[i];
        newBoard[pick.r][pick.c].jelly = 0;
        newBoard[pick.r][pick.c].color = null;
        newBoard[pick.r][pick.c].special = 'regular';
        addFloatingText(pick.r, pick.c, '🐠 CHOMP!', '#06b6d4', 16);
      }

      setBoard(newBoard);
      await processMatchesAndCascades(newBoard);
    }
  };

  const handleImmediateBooster = (booster: BoosterType) => {
    if ((boosters[booster] || 0) <= 0 && mode !== 'sandbox') return;

    if (booster === 'extra-moves') {
      onUseBoosterItem('extra-moves');
      soundCtrl.playVictory();
      setMovesLeft(m => m + 5);
      addFloatingText(4, 4, '+5 MOVES!', '#f97316', 22);
    } else if (booster === 'sweet-shuffle') {
      onUseBoosterItem('sweet-shuffle');
      soundCtrl.playShuffle();
      triggerShake(8);
      const shuffled = reshuffleBoard(board.map(row => row.map(t => ({ ...t }))));
      setBoard(shuffled);
      addFloatingText(4, 4, 'RESHUFFLE!', '#10b981', 22);
    }
  };

  useEffect(() => {
    if (gameEnded.current) return;

    checkVictoryConditions(score, objectives, movesLeft);

    if (movesLeft <= 0 && mode === 'levels' && !isProcessing) {
      let allCompleted = true;
      for (const obj of objectives) {
        if (obj.type === 'score' && score < obj.target) allCompleted = false;
        else if (obj.current < obj.target) allCompleted = false;
      }
      if (!allCompleted) {
        gameEnded.current = true;
        soundCtrl.playDefeat();
        setTimeout(() => {
          onGameOver(score);
        }, 800);
      } else {
        gameEnded.current = true;
        soundCtrl.playVictory();
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 }
        });
        setComboName('SUGAR CRUSH!');
        setTimeout(() => {
          onVictory(score, movesLeft);
        }, 1200);
      }
    }
  }, [score, objectives, movesLeft, mode, isProcessing, checkVictoryConditions, onGameOver, onVictory]);

  const starThresholds = level?.starScores || [2000, 5000, 10000];
  const currentStars = score >= starThresholds[2] ? 3 : score >= starThresholds[1] ? 2 : score >= starThresholds[0] ? 1 : 0;
  const starProgress = Math.min(100, Math.round((score / starThresholds[2]) * 100));

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => handlePointerUp(e)}
      className="relative w-full h-full min-h-screen flex flex-col items-center justify-between select-none text-white overflow-x-hidden overflow-y-auto"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(240, 245, 255, 0.3) 100%), url(${candylandLandscapeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Status & Mission Cluster (HUD) */}
      <header className="w-full flex flex-col items-center z-20">
        {/* Curved Violet Ribbon Arch Header from Reference */}
        <div className="w-full candy-arch-header pt-2 pb-2.5 px-3 sm:px-6 rounded-b-[26px] sm:rounded-b-[32px] shadow-xl flex items-center justify-between gap-1.5 sm:gap-4 max-w-xl">
          {/* Level Badge with Crown (Left) */}
          <div className="flex flex-col items-center relative">
            <span className="text-xl -mb-1.5 z-10 drop-shadow">👑</span>
            <div className="candy-level-badge w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center relative shadow-lg">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-purple-100 leading-tight">
                LEVEL
              </span>
              <span className="text-lg sm:text-xl font-black text-white leading-none">
                {mode === 'levels' ? (level?.levelNumber || 1) : mode === 'arcade' ? 'A' : 'S'}
              </span>
              {/* 4 Gold Stars around bottom */}
              <div className="absolute -bottom-1 flex items-center justify-center gap-0.5 text-[8px] sm:text-[9px] text-amber-300 drop-shadow">
                <span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          </div>

          {/* Moves Oval Hero with Gold Stars (Center) */}
          <div className="relative flex items-center justify-center">
            <span className="text-amber-300 text-lg sm:text-2xl drop-shadow absolute -left-3.5 sm:-left-4 z-10 animate-pulse">★</span>
            <div className={`candy-moves-oval px-5 sm:px-7 py-1 rounded-full flex flex-col items-center justify-center min-w-[105px] sm:min-w-[130px] shadow-xl ${
              movesLeft <= 5 ? 'animate-bounce' : ''
            }`}>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-pink-100">
                MOVES
              </span>
              <span className="font-black text-2xl sm:text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] leading-tight tabular-nums">
                {movesLeft}
              </span>
            </div>
            <span className="text-amber-300 text-lg sm:text-2xl drop-shadow absolute -right-3.5 sm:-right-4 z-10 animate-pulse">★</span>
          </div>

          {/* Score Track (Right of Moves) */}
          <div className="flex flex-col items-center justify-center bg-purple-950/70 border-2 border-purple-300/40 rounded-2xl px-2.5 sm:px-3 py-1 min-w-[95px] sm:min-w-[120px] shadow-inner">
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-300 uppercase tracking-widest leading-none mb-0.5">
              SCORE
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono leading-tight">
              {score.toLocaleString()}
            </span>
            {/* Score Progress Track */}
            <div className="w-full flex items-center gap-1 mt-0.5">
              <span className="text-[9px] text-amber-300 leading-none">★</span>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-purple-400/30">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full transition-all duration-300"
                  style={{ width: `${starProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Round Blue Pause Button (Far Right) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundCtrl.playClick();
                onOpenPause();
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600 border-2 sm:border-3 border-white shadow-[0_4px_12px_rgba(2,132,199,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center text-white active:scale-95 transition-transform"
              title="Pause Game (Esc)"
            >
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-4 bg-white rounded-full shadow-sm" />
                <div className="w-1.5 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </button>
          </div>
        </div>

        {/* White Rounded MISSION Card matching uploaded reference */}
        <div className="w-full max-w-xl px-3 pt-4 pb-1 z-20">
          <div className="candy-mission-card relative w-full rounded-[26px] sm:rounded-[32px] p-3.5 sm:p-4 text-slate-800">
            {/* Centered Top Mission Tab with 2 Stars */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-0.5 rounded-full bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 border-2 border-white text-white font-black text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-amber-300 text-xs">★</span>
              <span>MISSION</span>
              <span className="text-amber-300 text-xs">★</span>
            </div>

            {/* Objectives List */}
            <div className="flex flex-col gap-2 mt-1">
              {objectives.length > 0 ? (
                objectives.map((obj, i) => {
                  const currentVal = obj.type === 'score' ? score : obj.current;
                  const isDone = currentVal >= obj.target;
                  const progressPct = Math.min(100, Math.round((currentVal / obj.target) * 100));
                  const remaining = Math.max(0, obj.target - currentVal);

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2.5 py-1.5 px-2.5 rounded-2xl bg-purple-50/50 border border-purple-100"
                    >
                      {/* Left Squircle Icon Container */}
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-100 via-purple-50 to-pink-200 border border-pink-200 shadow-inner flex items-center justify-center shrink-0">
                        {obj.color ? (
                          /* KEEP ORIGINAL CANDY DESIGN EXACTLY AS REQUESTED */
                          <img
                            src={`/images/${obj.color}.png`}
                            alt={obj.color}
                            className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow"
                          />
                        ) : obj.type === 'jelly' ? (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-fuchsia-600 border border-white shadow-inner flex items-center justify-center text-white text-sm">
                            🍮
                          </div>
                        ) : obj.type === 'chocolate' ? (
                          <span className="text-xl">🍫</span>
                        ) : obj.type === 'frosting' ? (
                          <span className="text-xl">🧊</span>
                        ) : (
                          <span className="text-xl">⭐</span>
                        )}
                      </div>

                      {/* Center Title and Smooth 3D Progress Bar */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-black text-slate-800 truncate mb-1">
                          {obj.type === 'jelly'
                            ? `Clear ${obj.target} Jelly Tiles`
                            : obj.type === 'collect' && obj.color
                            ? `Collect ${obj.target} ${obj.color} Candies`
                            : obj.label}
                        </div>
                        {/* 3D Progress Bar */}
                        <div className="w-full h-2.5 sm:h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                : obj.type === 'jelly'
                                ? 'bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-500'
                                : 'bg-gradient-to-r from-emerald-400 to-green-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Right Fraction Pill & Completed / Remaining Status Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="px-2.5 py-1 rounded-full bg-purple-800 text-white font-black text-[11px] font-mono shadow-sm">
                          {currentVal} / {obj.target}
                        </div>
                        {isDone ? (
                          <div className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-sm">
                            <span>✓</span>
                            <span>Completed!</span>
                          </div>
                        ) : (
                          <div className="px-2 py-1 rounded-xl bg-pink-100 border border-pink-200 text-pink-700 font-bold text-[11px] flex items-center gap-1">
                            {obj.color ? (
                              <img src={`/images/${obj.color}.png`} alt="" className="w-3.5 h-3.5 object-contain" />
                            ) : (
                              <span>🍮</span>
                            )}
                            <span>{remaining} left</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-2 text-center text-xs font-bold text-purple-700">
                  Endless Arcade Mode · Match 3 or more candies to score high points!
                </div>
              )}
            </div>

            {/* Bottom Tip Bar with Lightbulb */}
            <div className="mt-2.5 p-2 px-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-2 text-[11px] text-sky-900 font-medium">
              <span className="text-base shrink-0">💡</span>
              <span className="truncate">
                {level?.description || "Match 3 or more candies to clear jelly and complete sweet objectives."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Playfield Container with 120 FPS Particle Canvas & Screen Shake */}
      <main className="relative flex-1 flex items-center justify-center p-2 z-10 w-full max-w-xl">
        {comboName && (
          <div className="absolute z-40 pointer-events-none transform -translate-y-8 animate-bounce">
            <div className="py-2 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-2xl tracking-wider uppercase border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              {comboName}
            </div>
          </div>
        )}

        {/* Modern Auto-Refresh Banner when no 3 matches are left */}
        {shuffleBanner && (
          <div className="absolute z-50 pointer-events-none transform -translate-y-2 animate-bounce">
            <div className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-lg tracking-wider uppercase border-2 border-white/90 shadow-[0_15px_45px_rgba(0,0,0,0.9)] flex items-center gap-3 backdrop-blur-md">
              <span className="text-2xl animate-spin">⚡</span>
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-amber-200 font-bold">NO 3-CANDY MATCH LEFT</span>
                <span className="text-base text-white tracking-widest font-black">AUTO RESHUFFLE!</span>
              </div>
            </div>
          </div>
        )}

        {activeBooster && (
          <div className="absolute top-0 z-40 py-2 px-5 rounded-2xl candy-btn-gold text-amber-950 font-black text-xs uppercase tracking-wide shadow-xl animate-pulse flex items-center gap-2">
            <span>Tap any candy to use {activeBooster}</span>
            <button
              onClick={() => setActiveBooster(null)}
              className="ml-2 px-2 py-0.5 rounded-lg bg-black/25 text-white text-[10px] font-bold hover:bg-black/40"
            >
              Cancel
            </button>
          </div>
        )}

        {/* 9x9 Candy Board Wrapper with Clean Midnight Navy & Neon Border */}
        <div
          className="relative w-full max-w-[450px] aspect-square rounded-[26px] sm:rounded-[30px] p-2 sm:p-2.5 candy-board-clean transition-transform duration-75 overflow-hidden"
          style={{
            transform: `translate3d(${shake.x}px, ${shake.y}px, 0)`
          }}
        >
          {/* 120 FPS Particle Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={450}
            height={450}
            className="absolute inset-0 pointer-events-none z-30 w-full h-full"
          />

          {/* 9x9 Grid with Distinct Dark Checkered Cell Tiles */}
          <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1 sm:gap-1.5 relative candy-board-grid select-none touch-none">
            {board.map((row, r) =>
              row.map((tile, c) => {
                const isSelected = selectedTile?.r === r && selectedTile?.c === c;
                const isCursor = cursorPos.r === r && cursorPos.c === c;
                const isSpecial = tile.special !== 'regular';
                const isChoco = tile.special === 'choco';
                const isCheckeredLight = (r + c) % 2 === 0;

                // Real-time drag delta if being dragged
                const isBeingDragged = dragStartPos.current?.r === r && dragStartPos.current?.c === c && dragOffset;
                const offsetX = isBeingDragged ? dragOffset.x : (tile.visualOffsetX || 0);
                const offsetY = isBeingDragged ? dragOffset.y : (tile.visualOffsetY || 0);

                return (
                  <div
                    key={tile.id}
                    onPointerDown={(e) => handlePointerDown(r, c, e)}
                    onPointerUp={(e) => handlePointerUp(e, r, c)}
                    className={`relative rounded-lg sm:rounded-xl flex items-center justify-center cursor-pointer select-none touch-none transition-shadow ${
                      isSelected
                        ? 'ring-4 ring-amber-300 z-20 shadow-[0_0_15px_rgba(251,191,36,0.9)] scale-105'
                        : isCursor
                        ? 'ring-2 ring-pink-400 z-10'
                        : 'hover:brightness-110'
                    } ${
                      tile.jelly === 2
                        ? 'bg-amber-400/40 border border-amber-300/50'
                        : tile.jelly === 1
                        ? 'bg-pink-500/30 border border-pink-400/40'
                        : isCheckeredLight
                        ? 'candy-tile-cell-light'
                        : 'candy-tile-cell-dark'
                    }`}
                  >
                    {/* Jelly Visual Overlay */}
                    {tile.jelly > 0 && (
                      <div className="absolute inset-0 pointer-events-none rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-400/25 via-pink-500/35 to-rose-600/45 shadow-inner" />
                    )}

                    {/* Frosting Obstacle Block */}
                    {tile.frosting > 0 && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-cyan-200/50 border-2 border-cyan-300/70 rounded-xl backdrop-blur-[1px] shadow-inner">
                        <span className="text-xs sm:text-sm font-black text-cyan-100 drop-shadow">
                          {tile.frosting === 2 ? '🧊🧊' : '🧊'}
                        </span>
                      </div>
                    )}

                    {/* Chocolate Obstacle Block */}
                    {tile.chocolate && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-amber-900 to-amber-950 border-2 border-amber-700 rounded-xl shadow-inner">
                        <span className="text-xs sm:text-sm font-bold text-amber-200">🍫</span>
                      </div>
                    )}

                    {/* Candy Image with 120 FPS Smooth Slide & Drop Animations */}
                    {(tile.color || tile.special === 'choco') && (
                      <div
                        className={`candy-piece w-full h-full flex items-center justify-center ${
                          tile.isSwapping ? 'candy-sliding z-25' : ''
                        } ${
                          tile.dropDist ? 'animate-candy-drop' : ''
                        } ${
                          tile.isCrushing ? 'animate-candy-pop' : ''
                        } ${
                          isAutoRefreshing ? 'animate-modern-shuffle' : ''
                        } ${
                          isChoco ? 'animate-choco-spin' : isSpecial ? 'animate-special-pulse' : ''
                        }`}
                        style={{
                          transform: isBeingDragged
                            ? `translate3d(${offsetX}px, ${offsetY}px, 0)`
                            : tile.dropDist
                            ? undefined
                            : `translate3d(${offsetX}%, ${offsetY}%, 0) scale(${tile.visualScale ?? 1})`,
                          zIndex: isBeingDragged || isSelected ? 25 : tile.isSwapping ? 20 : 1,
                          animationDelay: isAutoRefreshing ? `${((r * 9 + c) % 8) * 35}ms` : undefined,
                          ['--drop-dist' as any]: tile.dropDist || 1,
                          ['--drop-dur' as any]: `${Math.min(360, 180 + (tile.dropDist || 1) * 30)}ms`
                        }}
                      >
                        {/* PRESERVES ALL ORIGINAL CANDY DESIGNS EXACTLY AS PROMISED */}
                        <img
                          src={getCandyImagePath(tile.color, tile.special, tile.chocolate, tile.frosting)}
                          alt={tile.color || 'Candy'}
                          className="w-full h-full object-contain p-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                          draggable={false}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Beam FX Overlays */}
            {beamEffects.map(b => (
              <div
                key={b.id}
                className="absolute inset-0 pointer-events-none z-30"
              >
                {b.type === 'row' && b.row !== undefined && (
                  <div
                    className="absolute left-0 right-0 h-[11.11%] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm animate-pulse"
                    style={{ top: `${b.row * 11.11}%` }}
                  />
                )}
                {b.type === 'col' && b.col !== undefined && (
                  <div
                    className="absolute top-0 bottom-0 w-[11.11%] bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-sm animate-pulse"
                    style={{ left: `${b.col * 11.11}%` }}
                  />
                )}
                {b.type === 'cross' && (
                  <>
                    <div
                      className="absolute left-0 right-0 h-[11.11%] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-sm"
                      style={{ top: `${(b.row || 0) * 11.11}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-[11.11%] bg-gradient-to-b from-transparent via-amber-400 to-transparent blur-sm"
                      style={{ left: `${(b.col || 0) * 11.11}%` }}
                    />
                  </>
                )}
                {b.type === 'mega-cross' && (
                  <>
                    <div
                      className="absolute left-0 right-0 h-[33.33%] bg-gradient-to-r from-transparent via-pink-400 to-transparent blur-md opacity-80"
                      style={{ top: `${Math.max(0, ((b.row || 0) - 1)) * 11.11}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-[33.33%] bg-gradient-to-b from-transparent via-pink-400 to-transparent blur-md opacity-80"
                      style={{ left: `${Math.max(0, ((b.col || 0) - 1)) * 11.11}%` }}
                    />
                  </>
                )}
              </div>
            ))}

            {/* Floating Score Texts */}
            {floatingTexts.map(f => (
              <div
                key={f.id}
                className="absolute z-30 pointer-events-none font-black font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-float-fade"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  color: f.color,
                  fontSize: `${f.fontSize}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Equipment & Boosters Tray from Reference */}
      <footer className="w-full max-w-md px-3 py-2 z-20 flex flex-col items-center gap-1.5">
        <div className="w-full p-2.5 rounded-[28px] sm:rounded-[32px] bg-white/95 backdrop-blur-md border-2 border-purple-200 shadow-xl flex items-center justify-around gap-1">
          {/* 1: Hammer */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveBooster(activeBooster === 'lollipop-hammer' ? null : 'lollipop-hammer');
            }}
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            title="Hammer: Smash any single candy or obstacle"
          >
            <div className="candy-booster-circle w-11 h-11 sm:w-12 sm:h-12 rounded-full relative flex items-center justify-center">
              <span className="text-xl sm:text-2xl drop-shadow">🔨</span>
              <div className="candy-booster-badge absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {mode === 'sandbox' ? '∞' : boosters['lollipop-hammer'] || 0}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-black text-[9px] sm:text-[10px]">
              Hammer
            </span>
          </button>

          {/* 2: Swap / Glove */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveBooster(activeBooster === 'free-switch' ? null : 'free-switch');
            }}
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            title="Swap: Free switch any two adjacent candies"
          >
            <div className="candy-booster-circle w-11 h-11 sm:w-12 sm:h-12 rounded-full relative flex items-center justify-center">
              <span className="text-xl sm:text-2xl drop-shadow">🧤</span>
              <div className="candy-booster-badge absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {mode === 'sandbox' ? '∞' : boosters['free-switch'] || 0}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-black text-[9px] sm:text-[10px]">
              Swap
            </span>
          </button>

          {/* 3: Extra Move */}
          <button
            onClick={() => handleImmediateBooster('extra-moves')}
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            title="Extra Move: Add +5 moves"
          >
            <div className="candy-booster-circle w-11 h-11 sm:w-12 sm:h-12 rounded-full relative flex items-center justify-center">
              <span className="text-xl sm:text-2xl drop-shadow">🔷</span>
              <div className="candy-booster-badge absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {mode === 'sandbox' ? '∞' : boosters['extra-moves'] || 0}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-black text-[9px] sm:text-[10px] whitespace-nowrap">
              Extra Move
            </span>
          </button>

          {/* 4: Fish */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveBooster(activeBooster === 'jelly-fish' ? null : 'jelly-fish');
            }}
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            title="Fish: Send swimming fish to target objectives"
          >
            <div className="candy-booster-circle w-11 h-11 sm:w-12 sm:h-12 rounded-full relative flex items-center justify-center">
              <span className="text-xl sm:text-2xl drop-shadow">🐠</span>
              <div className="candy-booster-badge absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {mode === 'sandbox' ? '∞' : boosters['jelly-fish'] || 0}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-black text-[9px] sm:text-[10px]">
              Fish
            </span>
          </button>

          {/* 5: More / Color Bomb */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveBooster(activeBooster === 'color-bomb-drop' ? null : 'color-bomb-drop');
            }}
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            title="More: Color bomb drop"
          >
            <div className="candy-booster-circle w-11 h-11 sm:w-12 sm:h-12 rounded-full relative flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-white drop-shadow">➕</span>
              <div className="candy-booster-badge absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {mode === 'sandbox' ? '∞' : boosters['color-bomb-drop'] || 0}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-black text-[9px] sm:text-[10px]">
              More
            </span>
          </button>
        </div>

        {/* Bottom Control Hint Pill from Reference */}
        <div className="px-4 py-1 rounded-full bg-purple-100/95 border border-purple-200 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-purple-900">
          <span className="text-xs">🔄</span>
          <span>Drag or Click to Slide Swaps</span>
        </div>
      </footer>
    </div>
  );
};

