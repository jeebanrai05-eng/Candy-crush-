/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Award, RotateCcw, Play, ArrowRight, X, Volume2, VolumeX, Plus, Sparkles, Check } from 'lucide-react';
import { CAMPAIGN_LEVELS, INITIAL_BOOSTERS } from '../utils/levels';
import { LevelConfig, BoosterType } from '../types/game';
import { soundCtrl } from '../utils/audio';

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
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelNumber,
  onResume,
  onRestart,
  onExitToTitle,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-purple-900 to-slate-950 border-2 border-purple-400/50 rounded-3xl p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <h2 className="text-2xl font-black text-amber-300 tracking-wider uppercase mb-1">Game Paused</h2>
        <p className="text-xs text-purple-200/70 mb-6">Take a breather, the candy won't melt!</p>

        <div className="space-y-3">
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
