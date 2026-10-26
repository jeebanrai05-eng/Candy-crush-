/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Wand2, RotateCcw, Zap } from 'lucide-react';
import { GameBoard } from './GameBoard';
import { CANDY_COLORS, BOARD_ROWS, BOARD_COLS } from '../utils/engine';
import { CandyColor, SpecialType, BoosterType } from '../types/game';
import { soundCtrl } from '../utils/audio';

interface ComboLabProps {
  onBackToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ComboLab: React.FC<ComboLabProps> = ({
  onBackToTitle,
  isMuted,
  onToggleMute
}) => {
  const [boardKey, setBoardKey] = useState(1);
  const [activeTab, setActiveTab] = useState<'presets' | 'guide'>('presets');

  // Infinite boosters for sandbox testing
  const sandboxBoosters: Record<string, number> = {
    'lollipop-hammer': 999,
    'free-switch': 999,
    'color-bomb-drop': 999,
    'striped-wrapped-drop': 999,
    'sweet-shuffle': 999,
    'extra-moves': 999,
    'jelly-fish': 999
  };

  const handleResetBoard = () => {
    soundCtrl.playClick();
    setBoardKey(k => k + 1);
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-purple-950 to-slate-950 border-b border-cyan-500/30 px-4 py-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundCtrl.playClick();
              onBackToTitle();
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Title Screen</span>
          </button>
          <div>
            <h1 className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🧪</span> Combo Equipment Lab
            </h1>
            <p className="text-[10px] text-cyan-200/70 hidden sm:block">
              Unlimited moves & infinite boosters — master all special candy equipment combinations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetBoard}
            className="py-1 px-2.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-400/30 text-xs font-bold text-cyan-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Fresh Board</span>
          </button>
        </div>
      </div>

      {/* Main Board View with Infinite Equipment */}
      <div className="flex-1 flex flex-col">
        <GameBoard
          key={boardKey}
          mode="sandbox"
          boosters={sandboxBoosters}
          onUseBoosterItem={() => {}}
          onVictory={() => {}}
          onGameOver={() => {}}
          onOpenPause={onBackToTitle}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      </div>

      {/* Equipment Guide Ribbon at bottom */}
      <div className="bg-purple-950/80 border-t border-purple-500/30 px-4 py-2 z-30 flex items-center justify-between text-xs text-purple-200/90 overflow-x-auto gap-4">
        <div className="flex items-center gap-1.5 font-bold text-amber-300 shrink-0">
          <Sparkles className="w-4 h-4" />
          <span>Special Equipment Combos:</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] whitespace-nowrap">
          <span className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-400/30 text-blue-200">
            Striped + Striped: Cross Blast ┼
          </span>
          <span className="px-2 py-0.5 rounded bg-pink-900/60 border border-pink-400/30 text-pink-200">
            Striped + Wrapped: Mega 3x3 Blast 💥
          </span>
          <span className="px-2 py-0.5 rounded bg-yellow-900/60 border border-yellow-400/30 text-yellow-200">
            Color Bomb + Striped: Color Rockets 🚀
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-400/30 text-purple-200">
            Wrapped + Wrapped: 5x5 Crush 💣
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-400/30 text-amber-200">
            Color Bomb + Color Bomb: Board Wipe ⚡
          </span>
        </div>
      </div>
    </div>
  );
};
