/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Star,
  Award,
  RotateCcw,
  Play,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  Check,
  Download,
  Smartphone,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Package
} from 'lucide-react';
import { CAMPAIGN_LEVELS, INITIAL_BOOSTERS } from '../utils/levels';
import { LevelConfig, BoosterType } from '../types/game';
import { soundCtrl } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';

// --- Level Select Modal ---
interface LevelSelectModalProps {
  unlockedLevel: number;
  levelStars: Record<number, number>;
  levelHighScores: Record<number, number>;
  onSelectLevel: (lvl: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  unlockedLevel,
  levelStars,
  levelHighScores,
  onSelectLevel,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-gradient-to-b from-purple-900 via-indigo-950 to-slate-950 border-2 border-pink-400/50 rounded-3xl p-6 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <div>
              <h2 className="text-xl font-black text-amber-300 tracking-wide uppercase">Candy Kingdom Map</h2>
              <p className="text-xs text-purple-200/70">Select a level to embark on your sweet adventure</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundCtrl.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Levels Grid */}
        <div className="flex-1 overflow-y-auto py-6 grid grid-cols-2 sm:grid-cols-3 gap-3.5 pr-1">
          {CAMPAIGN_LEVELS.map((lvl) => {
            const isUnlocked = lvl.levelNumber <= unlockedLevel;
            const stars = levelStars[lvl.levelNumber] || 0;
            const highScore = levelHighScores[lvl.levelNumber] || 0;

            return (
              <button
                key={lvl.levelNumber}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    soundCtrl.playClick();
                    onSelectLevel(lvl.levelNumber);
                  }
                }}
                className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-purple-800/60 to-purple-950/80 hover:from-purple-700/80 hover:to-pink-950/90 border-purple-400/50 hover:border-pink-300 shadow-md hover:scale-102 cursor-pointer'
                    : 'bg-slate-900/40 border-slate-700/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-7 h-7 rounded-full bg-pink-500/30 border border-pink-400/50 flex items-center justify-center text-xs font-black text-pink-200">
                      {lvl.levelNumber}
                    </span>
                    {isUnlocked ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600 fill-slate-700/50'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">🔒</span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white truncate">{lvl.name}</h3>
                  <p className="text-[11px] text-pink-200/60 line-clamp-2 mt-0.5">{lvl.description}</p>
                </div>

                {isUnlocked && (
                  <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[10px] text-purple-300/80 font-mono">
                    <span>Moves: {lvl.moves}</span>
                    {highScore > 0 && <span className="text-amber-300/90">{highScore} pts</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Equipment Shop Modal ---
interface EquipmentShopModalProps {
  coins: number;
  boosters: Record<string, number>;
  onBuyBooster: (id: BoosterType, cost: number) => void;
  onFreeRefill: () => void;
  onClose: () => void;
}

export const EquipmentShopModal: React.FC<EquipmentShopModalProps> = ({
  coins,
  boosters,
  onBuyBooster,
  onFreeRefill,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 border-2 border-amber-400/40 rounded-3xl p-6 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <div>
              <h2 className="text-xl font-black text-amber-300 tracking-wide uppercase">Booster Equipment Shop</h2>
              <p className="text-xs text-purple-200/70">Equip powerful candy gear to conquer tough levels</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm">
              <span>🪙</span>
              <span>{coins}</span>
            </div>
            <button
              onClick={() => {
                soundCtrl.playClick();
                onClose();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {INITIAL_BOOSTERS.map((equip) => {
            const currentCount = boosters[equip.id] || 0;
            const canAfford = coins >= equip.cost;

            return (
              <div
                key={equip.id}
                className="p-3.5 rounded-2xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-between gap-4 hover:border-purple-400/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 border border-pink-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {equip.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{equip.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] font-bold text-pink-300">
                        Owned: {currentCount}
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/70 mt-0.5 leading-relaxed">{equip.description}</p>
                  </div>
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => {
                    soundCtrl.playClick();
                    onBuyBooster(equip.id, equip.cost);
                  }}
                  className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    canAfford
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-md active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  <span>+1</span>
                  <span className="font-mono">({equip.cost} 🪙)</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer with Free Refill (for demo/fun testing) */}
        <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-purple-300/80">
          <span>Need more gear for testing?</span>
          <button
            onClick={() => {
              soundCtrl.playVictory();
              onFreeRefill();
            }}
            className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claim +3 All Equipment & 500 Coins</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Pause Modal ---
interface PauseModalProps {
  levelNumber?: number;
  onResume: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  onOpenRelease?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelNumber,
  onResume,
  onRestart,
  onExitToTitle,
  onOpenRelease,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-purple-900 to-slate-950 border-2 border-purple-400/50 rounded-3xl p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <h2 className="text-2xl font-black text-amber-300 tracking-wider uppercase mb-1">Game Paused</h2>
        <p className="text-xs text-purple-200/70 mb-6">Take a breather, the candy won't melt!</p>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundCtrl.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={() => {
              soundCtrl.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-800/60 hover:bg-purple-700/80 border border-purple-400/30 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
          </button>

          {onOpenRelease && (
            <button
              onClick={() => {
                soundCtrl.playClick();
                onOpenRelease();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600/70 to-teal-600/70 hover:from-emerald-500/80 hover:to-teal-500/80 border border-emerald-400/40 text-emerald-200 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Download APK / Release Info</span>
            </button>
          )}

          <button
            onClick={() => {
              soundCtrl.playClick();
              onToggleMute();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs transition-all flex items-center justify-center gap-2"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          <button
            onClick={() => {
              soundCtrl.playClick();
              onExitToTitle();
            }}
            className="w-full py-2 px-4 rounded-xl text-xs text-purple-300/80 hover:text-white transition-colors"
          >
            Return to Title Screen
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Victory / Sugar Crush Modal ---
interface VictoryModalProps {
  level: LevelConfig;
  score: number;
  stars: number;
  movesRemaining: number;
  bonusScore: number;
  coinsEarned: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onExitToTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  stars,
  movesRemaining,
  bonusScore,
  coinsEarned,
  onNextLevel,
  onReplay,
  onExitToTitle
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-pink-900 via-purple-950 to-slate-950 border-3 border-amber-400 rounded-3xl p-6 text-center shadow-[0_25px_60px_rgba(245,158,11,0.4)] overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/20 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-block py-1 px-4 rounded-full bg-pink-500/30 border border-pink-400/50 text-xs font-black text-pink-200 uppercase tracking-widest mb-2">
          Sugar Crush!
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-500 tracking-wider uppercase drop-shadow">
          Level {level.levelNumber} Cleared!
        </h2>
        <p className="text-xs text-purple-200/80 mb-4">{level.name}</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((s) => {
            const hasStar = s <= stars;
            return (
              <div
                key={s}
                className={`relative transform transition-all duration-500 ${
                  hasStar ? 'scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]' : 'scale-90 opacity-40'
                }`}
              >
                <Star
                  className={`w-12 h-12 ${
                    hasStar
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600 fill-slate-800'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Score & Rewards Breakdown */}
        <div className="bg-purple-950/60 border border-purple-500/30 rounded-2xl p-4 my-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-purple-200">
            <span>Base Score</span>
            <span className="font-mono font-bold text-white text-sm">{score.toLocaleString()}</span>
          </div>
          {movesRemaining > 0 && (
            <div className="flex justify-between items-center text-amber-300">
              <span>{movesRemaining} Remaining Moves Bonus</span>
              <span className="font-mono font-bold">+{bonusScore.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-2 border-t border-purple-500/30 flex justify-between items-center text-sm font-bold text-white">
            <span>Total Score</span>
            <span className="font-mono text-amber-300 text-base">{(score + bonusScore).toLocaleString()}</span>
          </div>
          <div className="pt-1 flex justify-between items-center text-emerald-300 font-semibold">
            <span>Rewards Earned</span>
            <span className="font-mono">+{coinsEarned} 🪙 Coins</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundCtrl.playClick();
              onNextLevel();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 hover:from-amber-300 hover:to-orange-500 text-slate-950 font-black text-base tracking-wider uppercase shadow-[0_8px_20px_rgba(245,158,11,0.5)] active:scale-98 transition-all flex items-center justify-center gap-2 border border-amber-200"
          >
            <span>Next Level</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundCtrl.playClick();
                onReplay();
              }}
              className="py-2.5 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/30 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                soundCtrl.playClick();
                onExitToTitle();
              }}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-purple-200 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Game Over Modal ---
interface GameOverModalProps {
  level: LevelConfig;
  score: number;
  hasExtraMovesBooster: boolean;
  onUseExtraMoves: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  hasExtraMovesBooster,
  onUseExtraMoves,
  onRestart,
  onExitToTitle
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border-2 border-rose-500/50 rounded-3xl p-6 text-center shadow-[0_20px_50px_rgba(225,29,72,0.3)]">
        <span className="text-4xl mb-2 inline-block">💔</span>
        <h2 className="text-2xl font-black text-rose-400 tracking-wider uppercase mb-1">Out of Moves!</h2>
        <p className="text-xs text-purple-200/70 mb-5">You ran out of moves before reaching all sweet targets.</p>

        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-3 mb-5 text-xs text-purple-200">
          <div className="flex justify-between items-center">
            <span>Score Reached</span>
            <span className="font-mono font-bold text-white">{score.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {hasExtraMovesBooster ? (
            <button
              onClick={() => {
                soundCtrl.playClick();
                onUseExtraMoves();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-orange-400 to-amber-600 hover:from-orange-300 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Use +5 Moves Booster</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundCtrl.playClick();
                onRestart();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm tracking-wide uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}

          <button
            onClick={() => {
              soundCtrl.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-400/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Level</span>
          </button>

          <button
            onClick={() => {
              soundCtrl.playClick();
              onExitToTitle();
            }}
            className="w-full py-2 px-4 rounded-xl text-xs text-purple-300/80 hover:text-white transition-colors"
          >
            Return to Title Screen
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Release & APK Download Modal ---
interface ReleaseModalProps {
  onClose: () => void;
}

export const ReleaseModal: React.FC<ReleaseModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  const apkUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/candy-crush-deluxe.apk`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(apkUrl);
    setCopied(true);
    soundCtrl.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 border-2 border-emerald-400/50 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(16,185,129,0.3)] text-white overflow-hidden my-auto">
        {/* Glow Header */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 uppercase tracking-wide">
                  Release & APK Center
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-[10px] font-mono font-bold text-emerald-300">
                  v1.2.0
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/70">Candy Crush Deluxe Official Android APK</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundCtrl.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Primary Download & Install Action Grid */}
        <div className="space-y-3 mb-5">
          {/* Direct APK Download Button */}
          <a
            href="/candy-crush-deluxe.apk"
            download="candy-crush-deluxe.apk"
            onClick={() => soundCtrl.playVictory()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-500 text-slate-950 font-black text-sm sm:text-base tracking-wide uppercase transition-all shadow-[0_10px_25px_rgba(16,185,129,0.4)] active:scale-98 flex items-center justify-between border-2 border-emerald-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-black/15 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Download APK Package</div>
                <div className="text-[11px] font-medium text-emerald-950/80">Direct Android APK (candy-crush-deluxe.apk)</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-950 text-emerald-300 text-xs font-mono font-bold">
              ~560 KB
            </span>
          </a>

          {/* 1-Tap Native Install (WebAPK) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={async () => {
                soundCtrl.playClick();
                await install();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:from-amber-400 hover:via-orange-400 hover:to-pink-500 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-md active:scale-98 flex items-center justify-between border-2 border-amber-200"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-slate-950" />
                <div className="text-left">
                  <div className="leading-tight">Direct 1-Tap Android Install</div>
                  <div className="text-[11px] font-medium text-amber-950/80">Installs directly to Home Screen (WebAPK)</div>
                </div>
              </div>
              <span className="text-xs bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                1-TAP
              </span>
            </button>
          )}

          {isInstalled && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center gap-2.5 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>App is already installed on your device as standalone application!</span>
            </div>
          )}

          {/* Copy Direct APK Link */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/60 border border-purple-400/20 text-xs">
            <span className="text-purple-300/80 truncate flex-1 font-mono text-[11px] px-1 select-all">
              {apkUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-purple-200 text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy APK URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Release Package Info */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between text-purple-200/90 pb-1.5 border-b border-white/10">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Package Details
            </span>
            <span className="font-mono text-emerald-300 font-bold">com.candycrush.deluxe</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-white/60">Version: </span>
              <span className="text-white font-mono font-bold">1.2.0-stable</span>
            </div>
            <div>
              <span className="text-white/60">Target: </span>
              <span className="text-white font-semibold">Android 8.0+ / Mobile Web</span>
            </div>
            <div>
              <span className="text-white/60">Frame Rate: </span>
              <span className="text-emerald-400 font-mono font-bold">120 FPS Ultra-Smooth</span>
            </div>
            <div>
              <span className="text-white/60">Offline Mode: </span>
              <span className="text-cyan-300 font-semibold">Supported (PWA)</span>
            </div>
          </div>
        </div>

        {/* Installation Instructions (Nepali & English) */}
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-400/20 text-[11px] text-purple-200/90 space-y-2 mb-4">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Android Phone मा कसरी चलाउने? (Easy Guide)</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-white/80">
            <li>माथि <strong>&quot;Download APK Package&quot;</strong> button थिचेर APK फाइल download गर्नुहोस्।</li>
            <li>वा Browser को तीनवटा थोप्ला (Menu) मा गएर <strong>&quot;Install App&quot;</strong> वा <strong>&quot;Add to Home Screen&quot;</strong> थिच्नुहोस्।</li>
            <li>तपाईंको फोनको Home Screen मा Candy Crush Deluxe App आफै आउँछ र full screen मा 120 FPS मा चल्छ!</li>
          </ol>
          {isIOS && (
            <p className="pt-1 text-pink-300/90 border-t border-purple-400/20">
              <strong>iPhone / iOS प्रयोगकर्ता:</strong> Safari को <strong>Share</strong> button थिची <strong>&quot;Add to Home Screen&quot;</strong> छान्नुहोस्।
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundCtrl.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
        >
          Close Release Center
        </button>
      </div>
    </div>
  );
};

