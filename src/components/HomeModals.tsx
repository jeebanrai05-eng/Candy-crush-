/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Gift,
  Trophy,
  Users,
  Sparkles,
  Check,
  RotateCw,
  Coins,
  Heart,
  Volume2,
  VolumeX,
  Music,
  Info,
  Calendar,
  Zap,
  Star
} from 'lucide-react';
import { soundCtrl } from '../utils/audio';

// --- Daily Gift Modal ---
interface DailyGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: (coins: number, boosterId?: string) => void;
  canClaim: boolean;
  timeLeftText: string;
}

export const DailyGiftModal: React.FC<DailyGiftModalProps> = ({
  isOpen,
  onClose,
  onClaim,
  canClaim,
  timeLeftText
}) => {
  if (!isOpen) return null;

  const days = [
    { day: 1, reward: '100 Coins', icon: '🪙', coins: 100 },
    { day: 2, reward: '1 Lollipop Hammer', icon: '🔨', coins: 50, booster: 'lollipop-hammer' },
    { day: 3, reward: '150 Coins', icon: '🪙', coins: 150 },
    { day: 4, reward: '1 Free Switch', icon: '🧤', coins: 50, booster: 'free-switch' },
    { day: 5, reward: '200 Coins', icon: '🪙', coins: 200 },
    { day: 6, reward: '1 Color Bomb', icon: '🍫', coins: 100, booster: 'color-bomb-drop' },
    { day: 7, reward: 'MEGA CHEST: 500 Coins + 3 Gear', icon: '🎁', coins: 500, booster: 'lollipop-hammer' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-900 via-indigo-950 to-slate-950 border-3 border-amber-400 rounded-3xl p-5 text-center shadow-[0_20px_60px_rgba(245,158,11,0.4)]">
        {/* Close Button */}
        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-4xl mb-1 animate-bounce">🎁</div>
        <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wide">Daily Sweet Gift</h2>
        <p className="text-xs text-purple-200/80 mb-4">Log in daily to unlock sweet boosters and golden coins!</p>

        {/* 7-Day Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {days.slice(0, 4).map((d) => (
            <div
              key={d.day}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 ${
                d.day === 1
                  ? 'bg-amber-500/25 border-amber-300 text-amber-200 ring-2 ring-amber-400/50 shadow-md'
                  : 'bg-white/5 border-white/15 text-white/70'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-amber-300">Day {d.day}</span>
              <span className="text-2xl drop-shadow">{d.icon}</span>
              <span className="text-[9px] font-bold truncate max-w-[65px]">{d.reward}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {days.slice(4).map((d) => (
            <div
              key={d.day}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 ${
                d.day === 7
                  ? 'col-span-1 bg-gradient-to-r from-pink-600/40 to-purple-600/40 border-pink-400 text-pink-200 ring-2 ring-pink-400/50'
                  : 'bg-white/5 border-white/15 text-white/70'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-amber-300">Day {d.day}</span>
              <span className="text-2xl drop-shadow">{d.icon}</span>
              <span className="text-[9px] font-bold truncate max-w-[80px]">{d.reward}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {canClaim ? (
          <button
            onClick={() => {
              soundCtrl.playVictory();
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
              onClaim(200, 'lollipop-hammer');
            }}
            className="w-full py-3.5 px-6 rounded-2xl candy-play-green text-slate-950 font-black text-lg tracking-wider uppercase shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-900 fill-amber-900" />
            <span>Claim 200 Coins & Hammer!</span>
          </button>
        ) : (
          <div className="py-3 px-4 rounded-2xl bg-white/10 border border-white/20 text-xs text-purple-200 font-bold flex items-center justify-center gap-2">
            <span>Next Gift Available In:</span>
            <span className="font-mono text-amber-300 text-sm">{timeLeftText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Lucky Spin Wheel Modal ---
interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (type: string, amount: number) => void;
  canSpin: boolean;
  timeLeftText: string;
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  onReward,
  canSpin,
  timeLeftText
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  if (!isOpen) return null;

  const PRIZES = [
    { label: '+250 Coins', icon: '🪙', type: 'coins', amount: 250, color: '#f59e0b' },
    { label: '+1 Hammer', icon: '🔨', type: 'lollipop-hammer', amount: 1, color: '#ec4899' },
    { label: '+500 Coins', icon: '💰', type: 'coins', amount: 500, color: '#10b981' },
    { label: '+1 Color Bomb', icon: '🍫', type: 'color-bomb-drop', amount: 1, color: '#8b5cf6' },
    { label: '+1 Free Switch', icon: '🧤', type: 'free-switch', amount: 1, color: '#06b6d4' },
    { label: '+5 Moves', icon: '➕', type: 'extra-moves', amount: 1, color: '#f97316' },
    { label: '+100 Coins', icon: '🪙', type: 'coins', amount: 100, color: '#eab308' },
    { label: '+1 Candy Fish', icon: '🐠', type: 'jelly-fish', amount: 1, color: '#3b82f6' }
  ];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);
    soundCtrl.playClick();

    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = extraSpins * 360 + prizeIndex * segmentAngle + segmentAngle / 2;

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const prize = PRIZES[PRIZES.length - 1 - (prizeIndex % PRIZES.length)];
      setWonPrize(prize.label);
      soundCtrl.playVictory();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onReward(prize.type, prize.amount);
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 border-3 border-amber-400 rounded-3xl p-5 text-center shadow-[0_20px_60px_rgba(245,158,11,0.4)] flex flex-col items-center">
        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wide mb-1">Lucky Candy Wheel</h2>
        <p className="text-xs text-purple-200/80 mb-4">Spin the wheel to win delicious prizes!</p>

        {/* Wheel Container with Pointer */}
        <div className="relative w-64 h-64 my-2 flex items-center justify-center">
          {/* Top Pointer */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* Rotating Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-300 shadow-[0_8px_30px_rgba(0,0,0,0.8)] relative overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
          >
            {PRIZES.map((p, idx) => {
              const angle = (360 / PRIZES.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%'
                  }}
                >
                  <div
                    className="w-full h-1/2 flex flex-col items-center pt-2 text-[10px] font-black text-white drop-shadow"
                    style={{ backgroundColor: p.color }}
                  >
                    <span>{p.icon}</span>
                    <span className="scale-90">{p.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wheel Center Peg */}
          <div className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 border-3 border-white shadow-lg flex items-center justify-center text-slate-950 font-black text-xs z-10">
            ★
          </div>
        </div>

        {wonPrize && (
          <div className="mt-2 py-1.5 px-4 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-black text-sm animate-bounce">
            🎉 You Won: {wonPrize}!
          </div>
        )}

        {/* Spin CTA Button */}
        <div className="w-full mt-4">
          {canSpin || !spinning ? (
            <button
              disabled={spinning}
              onClick={handleSpin}
              className={`w-full py-3 px-6 rounded-2xl font-black text-lg tracking-wider uppercase shadow-xl flex items-center justify-center gap-2 ${
                spinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'candy-play-green text-slate-950'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
              <span>{spinning ? 'Spinning...' : 'SPIN THE WHEEL!'}</span>
            </button>
          ) : (
            <div className="py-2.5 px-4 rounded-2xl bg-white/10 border border-white/20 text-xs text-purple-200 font-bold">
              Next Free Spin In: <span className="font-mono text-amber-300">{timeLeftText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Free Coins Modal ---
interface FreeCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollect: (amount: number) => void;
}

export const FreeCoinsModal: React.FC<FreeCoinsModalProps> = ({
  isOpen,
  onClose,
  onCollect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-amber-950 via-purple-950 to-slate-950 border-3 border-amber-400 rounded-3xl p-5 text-center shadow-[0_20px_60px_rgba(245,158,11,0.5)]">
        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-5xl mb-2 animate-bounce">🪙</div>
        <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wide">Free Treasure Coins</h2>
        <p className="text-xs text-purple-200/80 mb-5">Open the golden treasure chest to claim free kingdom coins!</p>

        <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-4 mb-5 flex items-center justify-center gap-3">
          <span className="text-3xl">💰</span>
          <div className="text-left">
            <span className="text-xs font-bold text-amber-200 uppercase">Chest Reward</span>
            <div className="text-2xl font-black text-amber-300 font-mono">+350 Coins</div>
          </div>
        </div>

        <button
          onClick={() => {
            soundCtrl.playVictory();
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            onCollect(350);
            onClose();
          }}
          className="w-full py-3.5 px-6 rounded-2xl candy-play-green text-slate-950 font-black text-lg tracking-wider uppercase shadow-xl flex items-center justify-center gap-2"
        >
          <Coins className="w-5 h-5" />
          <span>Collect 350 Coins Now!</span>
        </button>
      </div>
    </div>
  );
};

// --- Leaderboard Modal ---
interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerScore: number;
  playerStars: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerScore,
  playerStars
}) => {
  if (!isOpen) return null;

  const LEADERS = [
    { rank: 1, name: 'SugarQueen_99', stars: 36, score: '482,900', badge: '👑' },
    { rank: 2, name: 'CandyKnight', stars: 34, score: '425,120', badge: '🥈' },
    { rank: 3, name: 'ChocoMaster', stars: 31, score: '389,450', badge: '🥉' },
    { rank: 4, name: 'SweetTooth_Alex', stars: 28, score: '341,200' },
    { rank: 5, name: 'JellyCrusher', stars: 24, score: '298,800' },
    { rank: 6, name: 'You (Candy Champion)', stars: playerStars, score: `${playerScore.toLocaleString()}`, isUser: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[85vh] bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-950 border-3 border-amber-400 rounded-3xl p-5 flex flex-col shadow-[0_20px_60px_rgba(245,158,11,0.4)]">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-amber-300 uppercase tracking-wide">Kingdom Leaderboard</h2>
          </div>
          <button
            onClick={() => {
              soundCtrl.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {LEADERS.map((l) => (
            <div
              key={l.rank}
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                l.isUser
                  ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400 text-white'
                  : 'bg-white/5 border-white/10 text-white/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-800 text-amber-300 font-black text-xs flex items-center justify-center">
                  {l.badge || `#${l.rank}`}
                </span>
                <div>
                  <div className="text-xs font-black">{l.name}</div>
                  <div className="text-[10px] text-purple-200/70">★ {l.stars} Stars Cleared</div>
                </div>
              </div>
              <div className="font-mono font-bold text-amber-300 text-xs">{l.score} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Events & Tournaments Modal ---
interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartEvent: () => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({
  isOpen,
  onClose,
  onStartEvent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-950 via-pink-950 to-slate-950 border-3 border-pink-400 rounded-3xl p-5 text-center shadow-[0_20px_60px_rgba(236,72,153,0.4)]">
        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-4xl mb-1 animate-pulse">⭐</div>
        <h2 className="text-2xl font-black text-pink-300 uppercase tracking-wide">Kingdom Sweet Events</h2>
        <p className="text-xs text-purple-200/80 mb-4">Compete in special limited-time candy tournaments!</p>

        <div className="space-y-3 mb-5 text-left">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-400/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-pink-200 uppercase">Jelly Blitz Challenge</div>
              <div className="text-[10px] text-pink-300/70">Clear 100 jellies for 500 Coins + 2 Hammers</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-pink-500 text-white font-black text-[10px]">ACTIVE</span>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-900/40 to-purple-900/40 border border-amber-400/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-amber-200 uppercase">Weekend Star Frenzy</div>
              <div className="text-[10px] text-amber-300/70">Earn Double 2x Coins on all campaign levels</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">2X BONUS</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundCtrl.playClick();
            onStartEvent();
            onClose();
          }}
          className="w-full py-3.5 px-6 rounded-2xl candy-play-green text-slate-950 font-black text-base tracking-wider uppercase shadow-xl flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>Enter Event Challenge</span>
        </button>
      </div>
    </div>
  );
};

// --- Friends / Community Modal ---
interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendLives: () => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  onSendLives
}) => {
  const [sent, setSent] = useState(false);
  if (!isOpen) return null;

  const FRIENDS = [
    { name: 'Lily Sweet', level: 8, status: 'Online', avatar: '🌸' },
    { name: 'Ben Sugar', level: 11, status: 'Sent you a life!', avatar: '🧁' },
    { name: 'Chloe Jelly', level: 5, status: 'Active 2h ago', avatar: '🍭' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-indigo-950 to-slate-950 border-3 border-cyan-400 rounded-3xl p-5 text-center shadow-[0_20px_60px_rgba(6,182,212,0.4)]">
        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-4xl mb-1">👥</div>
        <h2 className="text-2xl font-black text-cyan-300 uppercase tracking-wide">Candy Friends</h2>
        <p className="text-xs text-purple-200/80 mb-4">Send & receive free lives with your sweet friends!</p>

        <div className="space-y-2 mb-5 text-left">
          {FRIENDS.map((f, i) => (
            <div key={i} className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{f.avatar}</span>
                <div>
                  <div className="text-xs font-black text-white">{f.name}</div>
                  <div className="text-[10px] text-cyan-200/70">{f.status}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-800 text-purple-200 font-bold">
                Lvl {f.level}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            soundCtrl.playVictory();
            setSent(true);
            onSendLives();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          }}
          className="w-full py-3 px-6 rounded-2xl candy-btn-blue text-white font-black text-sm tracking-wider uppercase shadow-xl flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
          <span>{sent ? 'Lives Sent to Friends!' : 'Send Free Lives to All'}</span>
        </button>
      </div>
    </div>
  );
};

// --- Settings Modal ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  onResetProgress
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-purple-950 to-slate-950 border-3 border-purple-400 rounded-3xl p-5 text-center shadow-[0_20px_60px_rgba(168,85,247,0.4)]">
        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wide mb-1">Game Settings</h2>
        <p className="text-xs text-purple-200/80 mb-5">Configure audio, controls, and performance.</p>

        <div className="space-y-3 mb-6 text-left">
          {/* Sound FX Toggle */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              <div>
                <div className="text-xs font-black text-white">Audio & Effects</div>
                <div className="text-[10px] text-purple-200/70">{isMuted ? 'Muted' : 'Sweet Sound FX Active'}</div>
              </div>
            </div>
            <button
              onClick={() => {
                soundCtrl.playClick();
                onToggleMute();
              }}
              className={`px-3 py-1 rounded-full text-xs font-black ${
                isMuted ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
              }`}
            >
              {isMuted ? 'OFF' : 'ON'}
            </button>
          </div>

          {/* 120 FPS High-Refresh Info */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-black text-white">120 FPS Ultra Smooth</div>
                <div className="text-[10px] text-purple-200/70">Hardware Accelerated Animations</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-xs">
              ACTIVE
            </span>
          </div>

          {/* Reset Progress */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-rose-300">Reset All Progress</div>
              <div className="text-[10px] text-purple-200/70">Start journey from Level 1</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset your progress to Level 1?')) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="px-2.5 py-1 rounded-full bg-rose-600/50 hover:bg-rose-600 border border-rose-400 text-white font-bold text-[10px]"
            >
              Reset
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs"
        >
          Done
        </button>
      </div>
    </div>
  );
};
