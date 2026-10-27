/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Star,
  Play,
  Lock,
  Sparkles,
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Award
} from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../utils/levels';
import { LevelConfig, LevelObjective } from '../types/game';
import { soundCtrl } from '../utils/audio';
import candylandCastleBg from '../assets/images/candyland_castle_bg_1793088184076.jpg';

interface LevelMapProps {
  unlockedLevel: number;
  levelStars: Record<number, number>;
  levelHighScores: Record<number, number>;
  coins: number;
  lives: number;
  totalStars: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onSelectLevel: (levelNumber: number) => void;
  onBackToTitle: () => void;
  justCompletedLevel?: number | null; // e.g. 4
  newlyUnlockedLevel?: number | null; // e.g. 5
}

// 12 Level coordinates along a winding S-curve ascending path (percentage of width: X, percentage of total height: Y)
// We render bottom-up (Level 1 near bottom at Y=90%, Level 12 near top at Y=8%)
interface LevelNodeCoord {
  levelNumber: number;
  xPct: number; // 0 to 100
  yPct: number; // 0 to 100
  themeColor: string;
  badgeEmoji: string;
}

const LEVEL_COORDS: LevelNodeCoord[] = [
  { levelNumber: 1, xPct: 50, yPct: 91, themeColor: '#ef4444', badgeEmoji: '🍬' },
  { levelNumber: 2, xPct: 24, yPct: 83, themeColor: '#f97316', badgeEmoji: '🍫' },
  { levelNumber: 3, xPct: 28, yPct: 75, themeColor: '#eab308', badgeEmoji: '🍮' },
  { levelNumber: 4, xPct: 68, yPct: 67, themeColor: '#22c55e', badgeEmoji: '🍭' },
  { levelNumber: 5, xPct: 78, yPct: 59, themeColor: '#3b82f6', badgeEmoji: '🍫' },
  { levelNumber: 6, xPct: 45, yPct: 51, themeColor: '#a855f7', badgeEmoji: '💣' },
  { levelNumber: 7, xPct: 20, yPct: 43, themeColor: '#ec4899', badgeEmoji: '🧊' },
  { levelNumber: 8, xPct: 35, yPct: 35, themeColor: '#06b6d4', badgeEmoji: '🌈' },
  { levelNumber: 9, xPct: 74, yPct: 27, themeColor: '#8b5cf6', badgeEmoji: '🍮' },
  { levelNumber: 10, xPct: 65, yPct: 19, themeColor: '#f43f5e', badgeEmoji: '🌪️' },
  { levelNumber: 11, xPct: 32, yPct: 12, themeColor: '#10b981', badgeEmoji: '🏭' },
  { levelNumber: 12, xPct: 50, yPct: 5, themeColor: '#eab308', badgeEmoji: '👑' }
];

export const LevelMap: React.FC<LevelMapProps> = ({
  unlockedLevel,
  levelStars,
  levelHighScores,
  coins,
  lives,
  totalStars,
  isMuted,
  onToggleMute,
  onSelectLevel,
  onBackToTitle,
  justCompletedLevel,
  newlyUnlockedLevel
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedLvlConfig, setSelectedLvlConfig] = useState<LevelConfig | null>(null);

  // Avatar position state (interpolated between Node A and Node B during shifting animation)
  const [avatarPos, setAvatarPos] = useState<{ xPct: number; yPct: number }>({
    xPct: 50,
    yPct: 91
  });
  const [isShifting, setIsShifting] = useState(false);
  const [shiftPhase, setShiftPhase] = useState<'idle' | 'starBurstA' | 'hopping' | 'unlockedB'>('idle');
  const [unlockedLevelState, setUnlockedLevelState] = useState(unlockedLevel);

  // Initial centering & A to B animation handling
  useEffect(() => {
    // If just won a level (e.g. A to B shifting animation requested)
    if (justCompletedLevel && newlyUnlockedLevel && newlyUnlockedLevel > justCompletedLevel) {
      const coordA = LEVEL_COORDS.find(c => c.levelNumber === justCompletedLevel) || LEVEL_COORDS[0];
      const coordB = LEVEL_COORDS.find(c => c.levelNumber === newlyUnlockedLevel) || LEVEL_COORDS[0];

      // Start avatar at Level A
      setAvatarPos({ xPct: coordA.xPct, yPct: coordA.yPct });
      setIsShifting(true);
      setShiftPhase('starBurstA');

      // Scroll to Level A area smoothly
      if (containerRef.current) {
        const scrollTarget = (coordA.yPct / 100) * containerRef.current.scrollHeight - window.innerHeight / 2;
        containerRef.current.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
      }

      // Step 1: Star burst at Node A
      const timer1 = setTimeout(() => {
        soundCtrl.playVictory();
        setShiftPhase('hopping');
        soundCtrl.playLevelShiftHop();

        // Animate avatar from A to B over 1.6 seconds
        const startTime = performance.now();
        const duration = 1600;

        const animateHop = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          // Ease in-out cubic
          const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          // Parabolic hop arc (vertical bounce during glide)
          const hopOffset = Math.sin(progress * Math.PI) * 4;

          const curX = coordA.xPct + (coordB.xPct - coordA.xPct) * ease;
          const curY = coordA.yPct + (coordB.yPct - coordA.yPct) * ease - hopOffset;

          setAvatarPos({ xPct: curX, yPct: curY });

          if (progress < 1) {
            requestAnimationFrame(animateHop);
          } else {
            // Arrived at Node B!
            setAvatarPos({ xPct: coordB.xPct, yPct: coordB.yPct });
            setShiftPhase('unlockedB');
            setUnlockedLevelState(newlyUnlockedLevel);
            soundCtrl.playLevelUnlock();

            confetti({
              particleCount: 80,
              spread: 70,
              origin: { x: coordB.xPct / 100, y: Math.max(0.1, (coordB.yPct / 100) * 0.8) },
              colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#ffffff']
            });

            // Automatically open Level B preview card
            const nextConfig = CAMPAIGN_LEVELS.find(l => l.levelNumber === newlyUnlockedLevel);
            if (nextConfig) {
              setTimeout(() => {
                setSelectedLvlConfig(nextConfig);
                setIsShifting(false);
              }, 600);
            }
          }
        };

        requestAnimationFrame(animateHop);
      }, 700);

      return () => clearTimeout(timer1);
    } else {
      // Normal positioning: pin avatar on current unlocked level
      const currentCoord = LEVEL_COORDS.find(c => c.levelNumber === unlockedLevel) || LEVEL_COORDS[0];
      setAvatarPos({ xPct: currentCoord.xPct, yPct: currentCoord.yPct });

      // Auto-scroll to current unlocked level
      if (containerRef.current) {
        setTimeout(() => {
          if (!containerRef.current) return;
          const scrollTarget = (currentCoord.yPct / 100) * containerRef.current.scrollHeight - window.innerHeight / 2;
          containerRef.current.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
        }, 150);
      }
    }
  }, [justCompletedLevel, newlyUnlockedLevel, unlockedLevel]);

  // Construct SVG Path String connecting all 12 level nodes smoothly
  const buildSvgPath = () => {
    let d = '';
    LEVEL_COORDS.forEach((coord, i) => {
      if (i === 0) {
        d += `M ${coord.xPct} ${coord.yPct}`;
      } else {
        const prev = LEVEL_COORDS[i - 1];
        const midY = (prev.yPct + coord.yPct) / 2;
        // Cubic bezier curve for smooth winding candy trail
        d += ` C ${prev.xPct} ${midY}, ${coord.xPct} ${midY}, ${coord.xPct} ${coord.yPct}`;
      }
    });
    return d;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950 text-white select-none">
      {/* ----------------- FIXED TOP HUD ----------------- */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 bg-slate-950/75 backdrop-blur-md border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundCtrl.playClick();
              onBackToTitle();
            }}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 border-2 border-white/60 flex items-center justify-center text-white active:scale-95 transition-all shadow-md"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wider leading-none drop-shadow">
              Candy Kingdom
            </h1>
            <span className="text-[10px] text-pink-200 font-bold">12 Sweet Kingdoms Map</span>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          {/* Stars */}
          <div className="px-2.5 py-1 rounded-full bg-purple-900/90 border border-purple-300 flex items-center gap-1 shadow">
            <span className="text-amber-300 text-xs">★</span>
            <span className="font-mono font-black text-xs text-white">{totalStars}</span>
          </div>

          {/* Coins */}
          <div className="px-2.5 py-1 rounded-full bg-amber-600/90 border border-amber-300 flex items-center gap-1 shadow">
            <span className="text-xs">🪙</span>
            <span className="font-mono font-black text-xs text-white">{coins}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              onToggleMute();
            }}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/50 flex items-center justify-center text-white text-xs"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>
        </div>
      </header>

      {/* ----------------- VERTICAL SCROLLABLE CANDY MAP CANVAS ----------------- */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-y-auto overflow-x-hidden relative scroll-smooth pt-16 pb-24"
      >
        {/* Candy Kingdom World Height Container (2800px tall for smooth winding journey) */}
        <div
          className="relative w-full max-w-lg mx-auto"
          style={{ height: '2400px' }}
        >
          {/* Scenic Candy Kingdom Panorama Background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85 pointer-events-none"
            style={{
              backgroundImage: `url(${candylandCastleBg})`,
              backgroundSize: '100% auto',
              backgroundRepeat: 'repeat-y'
            }}
          />
          {/* Gradient overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-purple-950/45 to-purple-950/80 pointer-events-none" />

          {/* Decorative Candyland Landmarks along the way */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden text-3xl opacity-75">
            <div className="absolute top-[3%] left-[12%] animate-bounce" style={{ animationDuration: '6s' }}>🏰 Sugar Castle</div>
            <div className="absolute top-[14%] right-[10%]">🏭 Cookie Factory</div>
            <div className="absolute top-[29%] left-[8%]">🌈 Rainbow Falls</div>
            <div className="absolute top-[41%] right-[12%]">🧊 Frosting Glaciers</div>
            <div className="absolute top-[57%] left-[15%]">🍫 Chocolate Mines</div>
            <div className="absolute top-[73%] right-[8%]">🍮 Jelly Lagoon</div>
            <div className="absolute top-[88%] left-[10%]">🍭 Lollipop Woods</div>
          </div>

          {/* SVG Winding Road Path with Candy-Cane dashed line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="roadGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="pathShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Thick Outer Road Bed */}
            <path
              d={buildSvgPath()}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#pathShadow)"
            />

            {/* Red & Yellow Striped Center Trail */}
            <path
              d={buildSvgPath()}
              fill="none"
              stroke="url(#roadGlow)"
              strokeWidth="2.2"
              strokeDasharray="2 1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* ----------------- 12 INTERACTIVE LEVEL NODES ----------------- */}
          {LEVEL_COORDS.map((coord) => {
            const config = CAMPAIGN_LEVELS.find(l => l.levelNumber === coord.levelNumber);
            const isUnlocked = coord.levelNumber <= unlockedLevelState;
            const isCompleted = coord.levelNumber < unlockedLevelState;
            const isCurrent = coord.levelNumber === unlockedLevelState;
            const stars = levelStars[coord.levelNumber] || 0;
            const isTargetB = shiftPhase === 'unlockedB' && coord.levelNumber === newlyUnlockedLevel;

            return (
              <div
                key={coord.levelNumber}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                style={{
                  left: `${coord.xPct}%`,
                  top: `${coord.yPct}%`
                }}
              >
                {/* 3 Stars Floating Above Node for Completed Levels */}
                {isCompleted && (
                  <div className="flex items-center gap-0.5 -mb-1 z-30 drop-shadow">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars
                            ? 'text-amber-300 fill-amber-300 filter drop-shadow-[0_1px_3px_rgba(245,158,11,0.8)]'
                            : 'text-slate-600 fill-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Level Node Circle */}
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    soundCtrl.playClick();
                    if (config) setSelectedLvlConfig(config);
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-xl transition-all duration-300 group ${
                    isCurrent
                      ? 'scale-110 shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-pulse'
                      : isCompleted
                      ? 'hover:scale-105 shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
                      : 'opacity-65 grayscale cursor-not-allowed shadow-md'
                  }`}
                  style={{
                    backgroundColor: isUnlocked ? coord.themeColor : '#334155',
                    border: isCurrent ? '4px solid #ffffff' : isCompleted ? '3.5px solid #fef08a' : '3px solid #64748b'
                  }}
                >
                  {/* Expanding Shockwave when newly unlocked */}
                  {isTargetB && (
                    <div className="absolute -inset-4 rounded-full border-4 border-amber-300 animate-ping pointer-events-none" />
                  )}

                  {/* Candy Sheen Highlight */}
                  <div className="absolute top-1 left-2 right-2 h-4 rounded-full bg-white/40 pointer-events-none" />

                  {isUnlocked ? (
                    <div className="flex flex-col items-center justify-center leading-none">
                      <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                        {coord.levelNumber}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase text-amber-200 mt-0.5 tracking-tighter">
                          PLAY
                        </span>
                      )}
                    </div>
                  ) : (
                    <Lock className="w-5 h-5 text-slate-300" />
                  )}

                  {/* Crown for Level 12 */}
                  {coord.levelNumber === 12 && isUnlocked && (
                    <span className="absolute -top-4 text-xl drop-shadow">👑</span>
                  )}
                </button>

                {/* Level Title Tag Pill */}
                <div
                  className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border shadow-md whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 border-white'
                      : isUnlocked
                      ? 'bg-purple-900/90 text-purple-100 border-purple-400/50'
                      : 'bg-slate-800/80 text-slate-400 border-slate-600/40'
                  }`}
                >
                  {config?.name || `Level ${coord.levelNumber}`}
                </div>
              </div>
            );
          })}

          {/* ----------------- ANIMATED PLAYER AVATAR MARKER (A TO B SHIFTING ANIMATION) ----------------- */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full z-40 pointer-events-none transition-transform duration-75"
            style={{
              left: `${avatarPos.xPct}%`,
              top: `${avatarPos.yPct}%`
            }}
          >
            {/* Speech bubble / status indicator during shifting */}
            {isShifting && (
              <div className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black shadow-lg mb-1 whitespace-nowrap animate-bounce text-center">
                {shiftPhase === 'starBurstA' ? 'Level Cleared! ⭐' : shiftPhase === 'hopping' ? 'Traveling to Next Level... 🍬' : 'New Level Unlocked! 🎉'}
              </div>
            )}

            {/* Princess Pin Avatar */}
            <div className="relative flex flex-col items-center">
              <span className="text-lg -mb-2 z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce">
                👑
              </span>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 border-3 border-white shadow-[0_8px_20px_rgba(236,72,153,0.7)] flex items-center justify-center text-2xl relative overflow-hidden">
                <span className="transform translate-y-0.5">👸</span>
              </div>
              {/* Pointer triangle */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-0.5 drop-shadow" />
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- LEVEL PREVIEW MODAL ----------------- */}
      {selectedLvlConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-purple-900 via-indigo-950 to-slate-950 border-3 border-amber-400 rounded-3xl p-5 text-center shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Crown & Level Header */}
            <span className="text-3xl mb-1 inline-block">👑</span>
            <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wide">
              Level {selectedLvlConfig.levelNumber}
            </h2>
            <p className="text-xs font-bold text-pink-200 mb-3">{selectedLvlConfig.name}</p>

            {/* Description */}
            <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-400/30 text-xs text-purple-100 mb-4 text-left leading-relaxed">
              {selectedLvlConfig.description}
            </div>

            {/* Objectives */}
            <div className="space-y-2 mb-4 text-left">
              <div className="text-[10px] font-black uppercase text-amber-200 tracking-wider">
                Missions & Target:
              </div>
              {selectedLvlConfig.objectives.map((obj: LevelObjective, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-purple-900/40 border border-purple-500/20 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {obj.color ? (
                      <img src={`/images/${obj.color}.png`} alt="" className="w-5 h-5 object-contain" />
                    ) : obj.type === 'jelly' ? (
                      <span className="text-base">🍮</span>
                    ) : obj.type === 'chocolate' ? (
                      <span className="text-base">🍫</span>
                    ) : (
                      <span className="text-base">⭐</span>
                    )}
                    <span className="text-white font-medium">{obj.label}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300">{obj.target}</span>
                </div>
              ))}
            </div>

            {/* Stars & High Score */}
            <div className="flex items-center justify-around py-2 px-3 rounded-xl bg-black/40 border border-purple-500/20 text-xs mb-4">
              <div className="flex items-center gap-1">
                <span>Best:</span>
                <span className="font-mono font-bold text-amber-300">
                  {levelHighScores[selectedLvlConfig.levelNumber] || 0} pts
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= (levelStars[selectedLvlConfig.levelNumber] || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600 fill-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  soundCtrl.playClick();
                  const targetLvl = selectedLvlConfig.levelNumber;
                  setSelectedLvlConfig(null);
                  onSelectLevel(targetLvl);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 hover:from-amber-300 hover:to-orange-500 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_8px_20px_rgba(245,158,11,0.5)] active:scale-98 transition-all flex items-center justify-center gap-2 border border-amber-200"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Play Level {selectedLvlConfig.levelNumber}</span>
              </button>

              <button
                onClick={() => {
                  soundCtrl.playClick();
                  setSelectedLvlConfig(null);
                }}
                className="w-full py-2 px-4 rounded-xl text-xs text-purple-300/80 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
