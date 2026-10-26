/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GameBoard } from './components/GameBoard';
import { ComboLab } from './components/ComboLab';
import {
  LevelSelectModal,
  EquipmentShopModal,
  PauseModal,
  VictoryModal,
  GameOverModal,
  ReleaseModal
} from './components/Modals';
import { CAMPAIGN_LEVELS, loadPlayerProgress, savePlayerProgress } from './utils/levels';
import { LevelConfig, BoosterType } from './types/game';
import { soundCtrl } from './utils/audio';

export default function App() {
  const [progress, setProgress] = useState(loadPlayerProgress);
  const [screen, setScreen] = useState<'title' | 'playing' | 'sandbox'>('title');
  const [mode, setMode] = useState<'levels' | 'arcade' | 'sandbox'>('levels');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);

  // Modals state
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showPause, setShowPause] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showRelease, setShowRelease] = useState<boolean>(false);

  // Victory / Game over stats
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalMovesLeft, setFinalMovesLeft] = useState<number>(0);
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [gameKey, setGameKey] = useState<number>(1);

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => soundCtrl.getMuted());

  // Save progress changes
  useEffect(() => {
    savePlayerProgress(progress);
  }, [progress]);

  const handleToggleMute = () => {
    const muted = soundCtrl.toggleMute();
    setIsMuted(muted);
  };

  const currentLevelConfig: LevelConfig =
    CAMPAIGN_LEVELS.find(l => l.levelNumber === currentLevelNumber) || CAMPAIGN_LEVELS[0];

  // Start game with specified mode
  const handleStartGame = (gameMode: 'levels' | 'arcade' | 'sandbox', levelNumber?: number) => {
    setMode(gameMode);
    if (levelNumber) {
      setCurrentLevelNumber(levelNumber);
    }
    setShowLevelSelect(false);
    setShowVictory(false);
    setShowGameOver(false);
    setShowPause(false);
    setGameKey(k => k + 1);

    if (gameMode === 'sandbox') {
      setScreen('sandbox');
    } else {
      setScreen('playing');
    }
  };

  // Booster consumption
  const handleUseBooster = (id: BoosterType) => {
    if (mode === 'sandbox') return;
    setProgress(prev => {
      const current = prev.boosters[id] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        boosters: {
          ...prev.boosters,
          [id]: current - 1
        }
      };
    });
  };

  // Buy equipment booster in shop
  const handleBuyBooster = (id: BoosterType, cost: number) => {
    setProgress(prev => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        boosters: {
          ...prev.boosters,
          [id]: (prev.boosters[id] || 0) + 1
        }
      };
    });
  };

  // Free refill equipment for testing/demo
  const handleFreeRefill = () => {
    setProgress(prev => {
      const updatedBoosters = { ...prev.boosters };
      Object.keys(updatedBoosters).forEach(k => {
        updatedBoosters[k] = (updatedBoosters[k] || 0) + 3;
      });
      return {
        ...prev,
        coins: prev.coins + 500,
        boosters: updatedBoosters
      };
    });
  };

  // Victory celebration trigger
  const handleVictory = (score: number, movesLeft: number) => {
    const starsThreshold = currentLevelConfig.starScores;
    const bonus = movesLeft * 150;
    const total = score + bonus;
    const stars = total >= starsThreshold[2] ? 3 : total >= starsThreshold[1] ? 2 : 1;

    setFinalScore(score);
    setFinalMovesLeft(movesLeft);
    setEarnedStars(stars);

    const coinsReward = 60 + stars * 20;

    setProgress(prev => {
      const existingStars = prev.stars[currentLevelNumber] || 0;
      const bestStars = Math.max(existingStars, stars);
      const existingHigh = prev.highScores[currentLevelNumber] || 0;
      const bestHigh = Math.max(existingHigh, total);
      const nextUnlocked = Math.max(prev.unlockedLevel, Math.min(12, currentLevelNumber + 1));

      return {
        ...prev,
        unlockedLevel: nextUnlocked,
        stars: {
          ...prev.stars,
          [currentLevelNumber]: bestStars
        },
        highScores: {
          ...prev.highScores,
          [currentLevelNumber]: bestHigh
        },
        coins: prev.coins + coinsReward
      };
    });

    setShowVictory(true);
  };

  // Game over trigger
  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setShowGameOver(true);
  };

  // Use extra moves booster from GameOver modal
  const handleUseExtraMovesOnGameOver = () => {
    if ((progress.boosters['extra-moves'] || 0) > 0) {
      handleUseBooster('extra-moves');
      setShowGameOver(false);
      // restarts with extra moves
    }
  };

  // Next level progression
  const handleNextLevel = () => {
    setShowVictory(false);
    if (currentLevelNumber < CAMPAIGN_LEVELS.length) {
      setCurrentLevelNumber(c => c + 1);
      setGameKey(k => k + 1);
    } else {
      setScreen('title');
    }
  };

  // Total stars calculated across all levels
  const totalStars = Object.values(progress.stars).reduce((sum, s) => sum + s, 0);

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 font-sans select-none overflow-x-hidden">
      {/* Title Screen View */}
      {screen === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenSandbox={() => handleStartGame('sandbox')}
          onOpenRelease={() => setShowRelease(true)}
          totalStars={totalStars}
          unlockedLevel={progress.unlockedLevel}
          coins={progress.coins}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Playing Board View */}
      {screen === 'playing' && (
        <GameBoard
          key={gameKey}
          level={mode === 'levels' ? currentLevelConfig : undefined}
          mode={mode}
          boosters={progress.boosters}
          onUseBoosterItem={handleUseBooster}
          onVictory={handleVictory}
          onGameOver={handleGameOver}
          onOpenPause={() => setShowPause(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Sandbox / Combo Lab View */}
      {screen === 'sandbox' && (
        <ComboLab
          onBackToTitle={() => setScreen('title')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Level Select Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          unlockedLevel={progress.unlockedLevel}
          levelStars={progress.stars}
          levelHighScores={progress.highScores}
          onSelectLevel={(lvl) => handleStartGame('levels', lvl)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* Equipment Shop Modal */}
      {showShop && (
        <EquipmentShopModal
          coins={progress.coins}
          boosters={progress.boosters}
          onBuyBooster={handleBuyBooster}
          onFreeRefill={handleFreeRefill}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Pause Modal */}
      {showPause && (
        <PauseModal
          levelNumber={currentLevelNumber}
          onResume={() => setShowPause(false)}
          onRestart={() => {
            setShowPause(false);
            setGameKey(k => k + 1);
          }}
          onExitToTitle={() => {
            setShowPause(false);
            setScreen('title');
          }}
          onOpenRelease={() => {
            setShowPause(false);
            setShowRelease(true);
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Victory / Sugar Crush Modal */}
      {showVictory && (
        <VictoryModal
          level={currentLevelConfig}
          score={finalScore}
          stars={earnedStars}
          movesRemaining={finalMovesLeft}
          bonusScore={finalMovesLeft * 150}
          coinsEarned={60 + earnedStars * 20}
          onNextLevel={handleNextLevel}
          onReplay={() => {
            setShowVictory(false);
            setGameKey(k => k + 1);
          }}
          onExitToTitle={() => {
            setShowVictory(false);
            setScreen('title');
          }}
        />
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <GameOverModal
          level={currentLevelConfig}
          score={finalScore}
          hasExtraMovesBooster={(progress.boosters['extra-moves'] || 0) > 0}
          onUseExtraMoves={handleUseExtraMovesOnGameOver}
          onRestart={() => {
            setShowGameOver(false);
            setGameKey(k => k + 1);
          }}
          onExitToTitle={() => {
            setShowGameOver(false);
            setScreen('title');
          }}
        />
      )}

      {/* Release & APK Download Modal */}
      {showRelease && (
        <ReleaseModal
          onClose={() => setShowRelease(false)}
        />
      )}
    </div>
  );
}
