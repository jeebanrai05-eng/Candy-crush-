/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Map,
  ShoppingBag,
  FlaskConical,
  Settings,
  Home,
  Users,
  Star,
  Plus,
  Heart,
  Coins,
  Sparkles,
  ChevronRight,
  Trophy,
  Gift
} from 'lucide-react';
import { soundCtrl } from '../utils/audio';
import {
  DailyGiftModal,
  SpinWheelModal,
  FreeCoinsModal,
  LeaderboardModal,
  EventsModal,
  FriendsModal,
  SettingsModal
} from './HomeModals';
import candylandCastleBg from '../assets/images/candyland_castle_bg_1793088184076.jpg';

interface TitleScreenProps {
  onStartGame: (mode: 'levels' | 'arcade' | 'sandbox', levelNumber?: number) => void;
  onOpenLevelSelect: () => void;
  onOpenShop: () => void;
  onOpenSandbox: () => void;
  totalStars: number;
  unlockedLevel: number;
  coins: number;
  lives?: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onAddCoins?: (amount: number) => void;
  onAddBooster?: (boosterId: string, count: number) => void;
  onResetProgress?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenShop,
  onOpenSandbox,
  totalStars,
  unlockedLevel,
  coins,
  lives = 5,
  isMuted,
  onToggleMute,
  onAddCoins,
  onAddBooster,
  onResetProgress
}) => {
  // Modal states for all real-time features
  const [showDailyGift, setShowDailyGift] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showFreeCoins, setShowFreeCoins] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Active Bottom Nav Tab
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'events' | 'friends' | 'settings'>('home');

  // Interactive Cheer speech bubble
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  // Keyboard shortcut: Space / Enter to Play
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

  const handleMascotClick = () => {
    soundCtrl.playVictory();
    const greetings = [
      'Welcome to Candy Kingdom! 🍭',
      "Let's crush some sweet candies! 🍬",
      'Ready for Level ' + unlockedLevel + '? You can do it! ⭐',
      'Spin the lucky wheel for prizes! 🎡',
      'Combine Striped & Wrapped for mega explosions! 💥'
    ];
    const picked = greetings[Math.floor(Math.random() * greetings.length)];
    setSpeechBubble(picked);
    setTimeout(() => setSpeechBubble(null), 3500);
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between overflow-x-hidden select-none text-white p-2 sm:p-4">
      {/* 3D Pixar Candyland Castle Panoramic Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-102 transition-transform duration-1000"
        style={{
          backgroundImage: `url(${candylandCastleBg})`,
          backgroundPosition: 'center 30%'
        }}
      />
      {/* Subtle atmospheric vignette and sunbeam radiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/15 via-transparent to-purple-950/50 pointer-events-none" />

      {/* Floating Original Candies & Sparkles across the sky */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-55">
        {[
          { src: '/images/Red.png', top: '14%', left: '7%', size: 48, dur: '6s', delay: '0s' },
          { src: '/images/Yellow.png', top: '24%', right: '8%', size: 52, dur: '7.5s', delay: '1s' },
          { src: '/images/Blue.png', bottom: '32%', left: '5%', size: 50, dur: '8s', delay: '2s' },
          { src: '/images/Green.png', bottom: '26%', right: '7%', size: 46, dur: '6.5s', delay: '1.5s' },
          { src: '/images/Purple.png', top: '50%', left: '4%', size: 42, dur: '7s', delay: '0.5s' },
          { src: '/images/Choco.png', top: '48%', right: '5%', size: 48, dur: '9s', delay: '2.5s' }
        ].map((c, i) => (
          <img
            key={i}
            src={c.src}
            alt=""
            className="absolute drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)] animate-bounce"
            style={{
              top: c.top,
              left: c.left,
              right: c.right,
              bottom: c.bottom,
              width: c.size,
              height: c.size,
              animationDuration: c.dur,
              animationDelay: c.delay
            }}
          />
        ))}
      </div>

      {/* ----------------- TOP HUD STATUS BAR ----------------- */}
      <header className="w-full max-w-xl flex items-center justify-between z-20 gap-1 sm:gap-2 pt-1 px-1">
        {/* Left Princess Avatar with Royal Crown */}
        <button
          onClick={handleMascotClick}
          className="relative flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          title="Candy Princess Profile"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-pink-400 via-purple-500 to-indigo-600 border-3 border-white shadow-[0_6px_16px_rgba(147,51,234,0.45)] flex items-center justify-center text-2xl sm:text-3xl drop-shadow relative overflow-hidden">
            <span className="transform translate-y-0.5">👸</span>
          </div>
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-base sm:text-lg drop-shadow filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            👑
          </span>
        </button>

        {/* Stars Pill */}
        <button
          onClick={() => {
            soundCtrl.playClick();
            onOpenLevelSelect();
          }}
          className="candy-hud-pill px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-transform"
          title="Total Kingdom Stars"
        >
          <span className="text-amber-300 text-sm sm:text-base leading-none">★</span>
          <span className="font-mono font-black text-xs sm:text-sm text-white tabular-nums">{totalStars}</span>
          <span className="text-[9px] font-black uppercase text-purple-200 hidden xs:inline">STARS</span>
        </button>

        {/* Coins Pill with + Button */}
        <button
          onClick={() => {
            soundCtrl.playClick();
            onOpenShop();
          }}
          className="candy-hud-coin px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-transform"
          title="Kingdom Coins"
        >
          <span className="text-base leading-none">🪙</span>
          <span className="font-mono font-black text-xs sm:text-sm text-white tabular-nums">{coins}</span>
          <span className="text-[9px] font-black uppercase text-amber-200 hidden xs:inline">COINS</span>
          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[10px] ml-0.5 shadow-sm">
            +
          </div>
        </button>

        {/* Lives / Hearts Pill with + Button */}
        <button
          onClick={() => {
            soundCtrl.playClick();
            setShowFriends(true);
          }}
          className="candy-hud-heart px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-transform"
          title="Hearts / Lives"
        >
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white leading-none" />
          <span className="font-mono font-black text-xs sm:text-sm text-white tabular-nums">{lives}</span>
          <span className="text-[9px] font-black uppercase text-pink-200 hidden xs:inline">FULL</span>
          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[10px] ml-0.5 shadow-sm">
            +
          </div>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            soundCtrl.playClick();
            setShowSettings(true);
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 border-2.5 border-white shadow-[0_4px_12px_rgba(2,132,199,0.5)] flex items-center justify-center text-white active:scale-95 transition-transform shrink-0"
          title="Game Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </header>

      {/* ----------------- CENTER BODY WITH SIDE BADGES & SEAMLESS LOGO ----------------- */}
      <div className="relative w-full max-w-xl flex-1 flex flex-col items-center justify-center my-auto py-2 z-10">
        {/* Left Floating Frosted Badges: Daily Gift & Spin Wheel */}
        <div className="absolute left-1 top-2 sm:top-6 flex flex-col gap-3 z-30">
          {/* Daily Gift Badge */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setShowDailyGift(true);
            }}
            className="flex flex-col items-center group active:scale-95 transition-transform"
            title="Daily Sweet Gift"
          >
            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/25 backdrop-blur-md border-2 border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-1 hover:bg-white/35 transition-colors">
              <span className="text-2xl sm:text-3xl drop-shadow animate-bounce">🎁</span>
              {/* Alert Notification Dot */}
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 border-2 border-white text-white font-black text-[10px] flex items-center justify-center shadow">
                !
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-purple-900/90 border border-purple-300 text-[9px] font-black text-amber-200 mt-1 shadow-md whitespace-nowrap">
              Daily Gift
            </div>
            <span className="text-[8px] font-mono text-purple-950 font-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
              23h 45m
            </span>
          </button>

          {/* Spin Wheel Badge */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setShowSpinWheel(true);
            }}
            className="flex flex-col items-center group active:scale-95 transition-transform"
            title="Lucky Spin Wheel"
          >
            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white/25 backdrop-blur-md border-2 border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center p-1 hover:bg-white/35 transition-colors">
              <span className="text-2xl sm:text-3xl drop-shadow animate-spin" style={{ animationDuration: '8s' }}>
                🎡
              </span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-purple-900/90 border border-purple-300 text-[9px] font-black text-amber-200 mt-1 shadow-md whitespace-nowrap">
              Spin Wheel
            </div>
            <span className="text-[8px] font-mono text-purple-950 font-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
              05h 30m
            </span>
          </button>
        </div>

        {/* Right Floating Frosted Badges: Free Coins & Leaderboard */}
        <div className="absolute right-1 top-2 sm:top-6 flex flex-col gap-3 z-30">
          {/* Free Coins Badge */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setShowFreeCoins(true);
            }}
            className="flex flex-col items-center group active:scale-95 transition-transform"
            title="Free Coins Treasure Chest"
          >
            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/25 backdrop-blur-md border-2 border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-1 hover:bg-white/35 transition-colors">
              <span className="text-2xl sm:text-3xl drop-shadow">🪙</span>
              {/* Alert Notification Dot */}
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 border-2 border-white text-white font-black text-[10px] flex items-center justify-center shadow">
                !
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-amber-600/95 border border-amber-300 text-[9px] font-black text-white mt-1 shadow-md whitespace-nowrap">
              Free Coins
            </div>
            <span className="text-[8px] font-black text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
              Collect Now
            </span>
          </button>

          {/* Leaderboard Badge */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setShowLeaderboard(true);
            }}
            className="flex flex-col items-center group active:scale-95 transition-transform"
            title="Kingdom Leaderboard"
          >
            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/25 backdrop-blur-md border-2 border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-1 hover:bg-white/35 transition-colors">
              <span className="text-2xl sm:text-3xl drop-shadow">🏆</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-purple-900/90 border border-purple-300 text-[9px] font-black text-amber-200 mt-1 shadow-md whitespace-nowrap">
              Leaderboard
            </div>
          </button>
        </div>

        {/* ----------------- BESPOKE VECTOR CANDY CRUSH DELUXE EMBLEM (ZERO WHITE BOX) ----------------- */}
        <div className="relative flex flex-col items-center my-1 z-20 w-full max-w-sm sm:max-w-md">
          {/* Ambient Multi-Color Halo Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/35 via-amber-400/35 to-purple-500/35 blur-2xl rounded-full pointer-events-none" />

          {/* Orbiting Original Candies around the emblem */}
          <div className="relative w-full flex items-center justify-center">
            {/* SVG 3D Candy Typography & Royal Crown */}
            <svg
              viewBox="0 0 540 220"
              className="w-full max-w-[340px] sm:max-w-[420px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transform hover:scale-102 transition-transform duration-300 select-none pointer-events-none"
            >
              <defs>
                {/* Crown Gold Gradient */}
                <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fffde7" />
                  <stop offset="25%" stopColor="#ffd54f" />
                  <stop offset="70%" stopColor="#ffb300" />
                  <stop offset="100%" stopColor="#f57f17" />
                </linearGradient>

                {/* CANDY Pink Gradient */}
                <linearGradient id="candyPink" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe4f0" />
                  <stop offset="20%" stopColor="#ff69b4" />
                  <stop offset="65%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#be185d" />
                </linearGradient>

                {/* CRUSH Honey Yellow Gradient */}
                <linearGradient id="crushYellow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fffde7" />
                  <stop offset="25%" stopColor="#fde047" />
                  <stop offset="65%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>

                {/* Ribbon Purple Gradient */}
                <linearGradient id="ribbonPurple" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="40%" stopColor="#a855f7" />
                  <stop offset="80%" stopColor="#7e22ce" />
                  <stop offset="100%" stopColor="#581c87" />
                </linearGradient>

                {/* Soft 3D Glow Filter */}
                <filter id="candyGlow3D" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.7" />
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#ff4081" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* 3D Golden Crown Sitting on Top */}
              <g transform="translate(200, 4) scale(0.7)">
                {/* Crown Base & Arches */}
                <path
                  d="M 15 65 L 30 25 L 55 50 L 100 8 L 145 50 L 170 25 L 185 65 Z"
                  fill="url(#crownGrad)"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
                {/* Crown Band */}
                <rect x="15" y="62" width="170" height="18" rx="9" fill="url(#crownGrad)" stroke="#ffffff" strokeWidth="4" />
                {/* Jewels on Crown */}
                <circle cx="100" cy="18" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <circle cx="30" cy="32" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <circle cx="170" cy="32" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <circle cx="60" cy="71" r="4" fill="#ef4444" />
                <circle cx="100" cy="71" r="5" fill="#3b82f6" />
                <circle cx="140" cy="71" r="4" fill="#10b981" />
              </g>

              {/* "CANDY" 3D Puffy Lettering */}
              <text
                x="270"
                y="112"
                textAnchor="middle"
                fill="url(#candyPink)"
                stroke="#ffffff"
                strokeWidth="11"
                strokeLinejoin="round"
                paintOrder="stroke fill"
                fontSize="76"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="4"
                filter="url(#candyGlow3D)"
              >
                CANDY
              </text>

              {/* "CRUSH" 3D Puffy Golden Lettering */}
              <text
                x="270"
                y="176"
                textAnchor="middle"
                fill="url(#crushYellow)"
                stroke="#3b0764"
                strokeWidth="13"
                strokeLinejoin="round"
                paintOrder="stroke fill"
                fontSize="86"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="5"
                filter="url(#candyGlow3D)"
              >
                CRUSH
              </text>

              {/* 3D Purple Ribbon Banner for "DELUXE" */}
              <g transform="translate(135, 180)">
                {/* Ribbon Shape with Folded Ends */}
                <path
                  d="M 15 5 L 255 5 L 270 20 L 255 35 L 15 35 L 0 20 Z"
                  fill="url(#ribbonPurple)"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <text
                  x="135"
                  y="26"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="17"
                  fontWeight="900"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="5"
                >
                  ★ DELUXE ★
                </text>
              </g>
            </svg>
          </div>

          {/* Translucent Frosted Violet Description Banner */}
          <div className="mt-2 px-4 py-1.5 rounded-full bg-purple-950/70 border-2 border-purple-300/60 shadow-lg backdrop-blur-md max-w-sm sm:max-w-md text-center flex items-center justify-center gap-1.5">
            <span className="text-amber-300 text-xs">👑</span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-purple-100 leading-tight">
              12 Candy Kingdoms, Lollipop Boosters, 120 FPS high-refresh rate & pure sweet matching excitement!
            </span>
          </div>
        </div>

        {/* ----------------- BIG GREEN CANDY CANE PLAY BUTTON ----------------- */}
        <div className="w-full max-w-xs sm:max-w-sm mt-3 mb-2 z-20 flex justify-center">
          <div className="candy-cane-container w-full">
            <button
              onClick={() => {
                soundCtrl.playClick();
                onStartGame('levels', unlockedLevel);
              }}
              className="candy-play-green w-full py-3.5 sm:py-4 px-6 rounded-full flex items-center justify-center gap-3 active:scale-98 transition-all"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 fill-emerald-700 ml-0.5" />
              </div>
              <span className="font-black text-xl sm:text-2xl text-white tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                PLAY LEVEL {unlockedLevel}
              </span>
            </button>
          </div>
        </div>

        {/* ----------------- 3 MODE ACTION CARDS ----------------- */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-md px-2 z-20 mb-2">
          {/* Level Map */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              onOpenLevelSelect();
            }}
            className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-300 shadow-[0_6px_16px_rgba(126,34,206,0.4)] flex items-center justify-between text-white active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg">🗺️</span>
              <span className="text-xs font-black tracking-wide">Level Map</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-purple-200" />
          </button>

          {/* Equipment */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              onOpenShop();
            }}
            className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-pink-500 to-rose-600 border-2 border-pink-300 shadow-[0_6px_16px_rgba(236,72,153,0.4)] flex items-center justify-between text-white active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg">🎒</span>
              <span className="text-xs font-black tracking-wide">Equipment</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-pink-200" />
          </button>

          {/* Combo Lab */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              onOpenSandbox();
            }}
            className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-cyan-500 to-blue-600 border-2 border-cyan-300 shadow-[0_6px_16px_rgba(6,182,212,0.4)] flex items-center justify-between text-white active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg">🧪</span>
              <span className="text-xs font-black tracking-wide">Combo Lab</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />
          </button>
        </div>

        {/* ----------------- ENDLESS ARCADE BANNER ----------------- */}
        <div className="w-full max-w-md px-2 z-20 mb-1">
          <button
            onClick={() => {
              soundCtrl.playClick();
              onStartGame('arcade');
            }}
            className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-800 border-2 border-purple-300/80 shadow-md flex items-center justify-between text-white active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-sm">★</span>
              <span className="text-xs font-black tracking-wide text-amber-200">
                Endless Arcade High-Score Frenzy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-300" />
          </button>
        </div>

        {/* ----------------- INTERACTIVE SWEET CHEER (SEAMLESS - ZERO WHITE BOX) ----------------- */}
        <div className="absolute left-2 bottom-1 z-30 pointer-events-auto flex items-end gap-2">
          {speechBubble && (
            <div className="bg-white/95 backdrop-blur-md border-2 border-pink-400 text-slate-800 px-3 py-1.5 rounded-2xl shadow-xl text-xs font-black whitespace-nowrap animate-bounce mb-2">
              {speechBubble}
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-pink-400 rotate-45" />
            </div>
          )}
          <button
            onClick={handleMascotClick}
            className="px-3 py-1.5 rounded-2xl bg-white/25 backdrop-blur-md border-2 border-white/70 shadow-lg flex items-center gap-2 text-white hover:bg-white/35 active:scale-95 transition-all"
            title="Tap for Sweet Cheer!"
          >
            <span className="text-2xl drop-shadow animate-bounce">🍭</span>
            <div className="text-left leading-none hidden xs:block">
              <div className="text-[9px] font-black uppercase text-amber-200">Sweet Cheer</div>
              <div className="text-[11px] font-bold text-white">Tap Me! ✨</div>
            </div>
          </button>
        </div>
      </div>

      {/* ----------------- BOTTOM NAVIGATION DOCK ----------------- */}
      <footer className="w-full max-w-md px-2 pb-1 z-30">
        <div className="candy-nav-dock w-full rounded-[28px] sm:rounded-[32px] p-2 flex items-center justify-around gap-1">
          {/* 1: Home */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveTab('home');
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'home'
                ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white shadow-md'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-black">Home</span>
          </button>

          {/* 2: Shop */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveTab('shop');
              onOpenShop();
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'shop'
                ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white shadow-md'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-black">Shop</span>
          </button>

          {/* 3: Events (Center Raised Badge) */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveTab('events');
              setShowEvents(true);
            }}
            className="flex flex-col items-center -mt-4 group active:scale-95 transition-transform"
          >
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-purple-600 to-indigo-800 border-3 border-white shadow-xl flex items-center justify-center text-amber-300">
              <Star className="w-6 h-6 fill-amber-300" />
              {/* Alert Badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border border-white text-white font-black text-[9px] flex items-center justify-center shadow">
                !
              </div>
            </div>
            <span className="text-[10px] font-black text-purple-900 mt-0.5">Events</span>
          </button>

          {/* 4: Friends */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveTab('friends');
              setShowFriends(true);
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white shadow-md'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-black">Friends</span>
          </button>

          {/* 5: Settings */}
          <button
            onClick={() => {
              soundCtrl.playClick();
              setActiveTab('settings');
              setShowSettings(true);
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white shadow-md'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-black">Settings</span>
          </button>
        </div>
      </footer>

      {/* ----------------- INTERACTIVE REAL-TIME MODALS ----------------- */}
      <DailyGiftModal
        isOpen={showDailyGift}
        onClose={() => setShowDailyGift(false)}
        canClaim={true}
        timeLeftText="00:00:00 (Ready!)"
        onClaim={(coinsReward, boosterReward) => {
          if (onAddCoins) onAddCoins(coinsReward);
          if (boosterReward && onAddBooster) onAddBooster(boosterReward, 1);
          setShowDailyGift(false);
        }}
      />

      <SpinWheelModal
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        canSpin={true}
        timeLeftText="Ready to Spin!"
        onReward={(rewardType, amount) => {
          if (rewardType === 'coins' && onAddCoins) {
            onAddCoins(amount);
          } else if (onAddBooster) {
            onAddBooster(rewardType, amount);
          }
        }}
      />

      <FreeCoinsModal
        isOpen={showFreeCoins}
        onClose={() => setShowFreeCoins(false)}
        onCollect={(amount) => {
          if (onAddCoins) onAddCoins(amount);
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        playerScore={coins * 12 + totalStars * 500}
        playerStars={totalStars}
      />

      <EventsModal
        isOpen={showEvents}
        onClose={() => setShowEvents(false)}
        onStartEvent={() => {
          onStartGame('levels', unlockedLevel);
        }}
      />

      <FriendsModal
        isOpen={showFriends}
        onClose={() => setShowFriends(false)}
        onSendLives={() => {
          // Sent lives to friends
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onResetProgress={() => {
          if (onResetProgress) onResetProgress();
        }}
      />
    </div>
  );
};
