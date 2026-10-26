/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Play, Map, ShoppingBag, FlaskConical, Award } from 'lucide-react';
import { soundCtrl } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: (mode: 'levels' | 'arcade' | 'sandbox', levelNumber?: number) => void;
  onOpenLevelSelect: () => void;
  onOpenShop: () => void;
  onOpenSandbox: () => void;
  totalStars: number;
  unlockedLevel: number;
  coins: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenShop,
  onOpenSandbox,
  totalStars,
  unlockedLevel,
  coins,
  isMuted,
  onToggleMute
}) => {
  // Listen for Enter / Space to start current level
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        soundCtrl.playClick();
        onStartGame('levels', unlockedLevel);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, unlockedLevel]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between overflow-hidden select-none bg-radial from-pink-900/60 via-purple-950/80 to-slate-950 text-white p-6 sm:p-8">
      {/* Background Decorative Candies floating */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        {[
          { src: '/images/Red.png', top: '10%', left: '8%', size: 68, dur: '7s', delay: '0s' },
          { src: '/images/Yellow-Wrapped.png', top: '22%', right: '12%', size: 76, dur: '9s', delay: '1s' },
          { src: '/images/Blue-Striped-Horizontal.png', bottom: '25%', left: '10%', size: 72, dur: '8s', delay: '2s' },
          { src: '/images/Choco.png', bottom: '15%', right: '14%', size: 84, dur: '10s', delay: '0.5s' },
          { src: '/images/Green.png', top: '48%', left: '5%', size: 56, dur: '6s', delay: '1.5s' },
          { src: '/images/Purple-Striped-Vertical.png', top: '55%', right: '6%', size: 64, dur: '7.5s', delay: '2.5s' },
        ].map((candy, i) => (
          <img
            key={i}
            src={candy.src}
            alt=""
            className="absolute drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-bounce"
            style={{
              top: candy.top,
              left: candy.left,
              right: candy.right,
              bottom: candy.bottom,
              width: candy.size,
              height: candy.size,
              animationDuration: candy.dur,
              animationDelay: candy.delay
            }}
          />
        ))}
      </div>

      {/* Top Bar Status Clusters */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold tracking-wide">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 backdrop-blur-sm shadow-inner">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="tabular-nums">{totalStars}</span>
            <span className="text-amber-400/70 font-normal">Stars</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 backdrop-blur-sm shadow-inner">
            <span className="text-sm">🪙</span>
            <span className="tabular-nums">{coins}</span>
            <span className="text-emerald-400/70 font-normal">Coins</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundCtrl.playClick();
              onToggleMute();
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white/90 hover:scale-105 active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-300" />}
          </button>
        </div>
      </header>

      {/* Centerpiece Hero: Bespoke SVG Title Lockup */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-2xl px-4 py-8">
        <div className="relative mb-6 transform hover:scale-102 transition-transform duration-500">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/30 via-amber-400/30 to-purple-500/30 blur-2xl rounded-full pointer-events-none" />

          {/* Bespoke Inline SVG Title Lockup */}
          <svg viewBox="0 0 680 180" className="w-full max-w-lg sm:max-w-xl h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            <defs>
              <linearGradient id="candyPinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff9ec7" />
                <stop offset="35%" stopColor="#ff4081" />
                <stop offset="70%" stopColor="#e91e63" />
                <stop offset="100%" stopColor="#c2185b" />
              </linearGradient>
              <linearGradient id="candyYellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff59d" />
                <stop offset="30%" stopColor="#ffeb3b" />
                <stop offset="70%" stopColor="#fbc02d" />
                <stop offset="100%" stopColor="#f57f17" />
              </linearGradient>
              <linearGradient id="candyCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f7fa" />
                <stop offset="35%" stopColor="#26c6da" />
                <stop offset="85%" stopColor="#0097a7" />
              </linearGradient>
              <filter id="candyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.7" />
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#ff4081" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* CANDY Lettering */}
            <text
              x="340"
              y="75"
              textAnchor="middle"
              fill="url(#candyPinkGrad)"
              stroke="#ffffff"
              strokeWidth="9"
              strokeLinejoin="round"
              paintOrder="stroke fill"
              fontSize="78"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="3"
              filter="url(#candyGlow)"
            >
              CANDY
            </text>

            {/* CRUSH Lettering */}
            <text
              x="340"
              y="145"
              textAnchor="middle"
              fill="url(#candyYellowGrad)"
              stroke="#4a148c"
              strokeWidth="11"
              strokeLinejoin="round"
              paintOrder="stroke fill"
              fontSize="86"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="5"
              filter="url(#candyGlow)"
            >
              CRUSH
            </text>

            {/* DELUXE Badge Banner */}
            <rect x="235" y="152" width="210" height="26" rx="13" fill="#ec4899" stroke="#ffffff" strokeWidth="2.5" />
            <text
              x="340"
              y="170"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              letterSpacing="4"
            >
              ★ DELUXE ★
            </text>
          </svg>
        </div>

        <p className="text-pink-200/90 text-sm sm:text-base font-medium mb-8 max-w-md drop-shadow">
          Equip lollipop hammers, combine striped & wrapped candies, ignite color bombs, and master 12 sweet levels!
        </p>

        {/* Primary Start CTA Button */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm mb-6">
          <button
            onClick={() => {
              soundCtrl.playClick();
              onStartGame('levels', unlockedLevel);
            }}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 hover:from-amber-300 hover:via-amber-400 hover:to-orange-500 text-slate-950 font-black text-xl tracking-wider uppercase shadow-[0_10px_25px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.7)] active:translate-y-0.5 transition-all flex items-center justify-center gap-3 border-2 border-amber-200"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Play Level {unlockedLevel}</span>
          </button>

          {/* Navigation Action Buttons Grid */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={() => {
                soundCtrl.playClick();
                onOpenLevelSelect();
              }}
              className="py-2.5 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/30 text-xs font-bold text-purple-200 transition-all flex flex-col items-center gap-1 hover:border-purple-300/60 active:scale-95 shadow-md"
            >
              <Map className="w-4 h-4 text-purple-300" />
              <span>Level Map</span>
            </button>

            <button
              onClick={() => {
                soundCtrl.playClick();
                onOpenShop();
              }}
              className="py-2.5 px-3 rounded-xl bg-pink-900/60 hover:bg-pink-800/80 border border-pink-400/30 text-xs font-bold text-pink-200 transition-all flex flex-col items-center gap-1 hover:border-pink-300/60 active:scale-95 shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-pink-300" />
              <span>Equipment</span>
            </button>

            <button
              onClick={() => {
                soundCtrl.playClick();
                onOpenSandbox();
              }}
              className="py-2.5 px-3 rounded-xl bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-400/30 text-xs font-bold text-cyan-200 transition-all flex flex-col items-center gap-1 hover:border-cyan-300/60 active:scale-95 shadow-md"
            >
              <FlaskConical className="w-4 h-4 text-cyan-300" />
              <span>Combo Lab</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundCtrl.playClick();
              onStartGame('arcade');
            }}
            className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white/90 hover:text-white transition-all flex items-center justify-center gap-2 mt-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Endless Arcade Mode (High Score Frenzy)</span>
          </button>
        </div>
      </div>

      {/* Flat Control-Hint Footer Line */}
      <footer className="w-full text-center z-10 py-2 border-t border-white/10 text-xs text-white/60 tracking-wider">
        <span>Drag or Click Swap Candies</span>
        <span className="mx-2 text-white/30">·</span>
        <span>Space / Enter Select</span>
        <span className="mx-2 text-white/30">·</span>
        <span>Arrows / WASD Navigate</span>
        <span className="mx-2 text-white/30">·</span>
        <span>Esc Pause</span>
      </footer>
    </div>
  );
};
