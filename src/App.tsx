import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Magnet, 
  Shield, 
  Dice5, 
  Flame, 
  Trophy, 
  Coins, 
  Play, 
  Settings, 
  ShoppingBag,
  ChevronRight,
  RotateCcw,
  Home,
  X,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHARACTERS, Character, CharacterType, GameState } from './types';
import Game from './Game';
import { cn } from './lib/utils';

const INITIAL_STATE: GameState = {
  score: 0,
  coins: 0,
  totalCoins: 0,
  level: 1,
  multiplier: 1,
  isGameOver: false,
  isPaused: false,
  highScore: 0,
  selectedCharacter: 'SPEEDSTER',
  unlockedCharacters: ['SPEEDSTER'],
  lastDailyReward: null,
  streak: 0,
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('neon-dash-save');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_STATE, ...parsed, isGameOver: false, isPaused: false, score: 0, coins: 0 };
    }
    return INITIAL_STATE;
  });

  const [screen, setScreen] = useState<'MENU' | 'GAME' | 'SHOP' | 'GAMEOVER'>('MENU');
  const [currentScore, setCurrentScore] = useState(0);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    localStorage.setItem('neon-dash-save', JSON.stringify({
      totalCoins: gameState.totalCoins,
      highScore: gameState.highScore,
      unlockedCharacters: gameState.unlockedCharacters,
      selectedCharacter: gameState.selectedCharacter,
      streak: gameState.streak,
      lastDailyReward: gameState.lastDailyReward
    }));
  }, [gameState.totalCoins, gameState.highScore, gameState.unlockedCharacters, gameState.selectedCharacter]);

  const startGame = () => {
    setCurrentScore(0);
    setCurrentCoins(0);
    setCurrentLevel(1);
    setScreen('GAME');
  };

  const handleGameOver = (score: number, coins: number) => {
    const isNewHighScore = score > gameState.highScore;
    setGameState(prev => ({
      ...prev,
      totalCoins: prev.totalCoins + coins,
      highScore: Math.max(prev.highScore, score)
    }));
    setScreen('GAMEOVER');
    if (isNewHighScore) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [CHARACTERS.find(c => c.id === gameState.selectedCharacter)?.color || '#00f2ff', '#ffffff']
      });
    }
  };

  const selectCharacter = (id: CharacterType) => {
    if (gameState.unlockedCharacters.includes(id)) {
      setGameState(prev => ({ ...prev, selectedCharacter: id }));
    }
  };

  const buyCharacter = (char: Character) => {
    if (gameState.totalCoins >= char.price) {
      setGameState(prev => ({
        ...prev,
        totalCoins: prev.totalCoins - char.price,
        unlockedCharacters: [...prev.unlockedCharacters, char.id],
        selectedCharacter: char.id
      }));
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [char.color, '#ffffff']
      });
    }
  };

  const selectedChar = CHARACTERS.find(c => c.id === gameState.selectedCharacter)!;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      <AnimatePresence mode="wait">
        {screen === 'MENU' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full p-6 space-y-8"
          >
            <div className="text-center space-y-2">
              <motion.h1 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-6xl font-black tracking-tighter italic neon-glow-cyan"
              >
                NEON DASH
              </motion.h1>
              <p className="text-neon-cyan/60 font-mono text-sm tracking-widest uppercase">Hyper Rewards Edition</p>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-neon-yellow" />
                <span className="font-mono font-bold">{gameState.highScore}</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-neon-magenta" />
                <span className="font-mono font-bold">{gameState.totalCoins}</span>
              </div>
            </div>

            <div className="w-full max-w-md space-y-4">
              <button
                onClick={startGame}
                className="w-full py-6 bg-neon-cyan text-black font-black text-2xl rounded-2xl flex items-center justify-center space-x-3 hover:scale-105 transition-transform active:scale-95 shadow-[0_0_30px_rgba(0,242,255,0.5)]"
              >
                <Play className="w-8 h-8 fill-current" />
                <span>START RUN</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setScreen('SHOP')}
                  className="py-4 bg-white/10 rounded-2xl flex items-center justify-center space-x-2 border border-white/10 hover:bg-white/20 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-bold">CHARACTERS</span>
                </button>
                <button className="py-4 bg-white/10 rounded-2xl flex items-center justify-center space-x-2 border border-white/10 opacity-50 cursor-not-allowed">
                  <Settings className="w-5 h-5" />
                  <span className="font-bold">SETTINGS</span>
                </button>
              </div>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 w-full justify-center no-scrollbar">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => selectCharacter(char.id)}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all",
                    gameState.selectedCharacter === char.id ? "scale-110 border-white" : "border-transparent opacity-40",
                    !gameState.unlockedCharacters.includes(char.id) && "grayscale"
                  )}
                  style={{ backgroundColor: char.color + '22' }}
                >
                  {char.id === 'SPEEDSTER' && <Zap className="w-8 h-8" style={{ color: char.color }} />}
                  {char.id === 'MAGNET' && <Magnet className="w-8 h-8" style={{ color: char.color }} />}
                  {char.id === 'SHIELD' && <Shield className="w-8 h-8" style={{ color: char.color }} />}
                  {char.id === 'LUCKY' && <Dice5 className="w-8 h-8" style={{ color: char.color }} />}
                  {char.id === 'TITAN' && <Flame className="w-8 h-8" style={{ color: char.color }} />}
                  
                  {!gameState.unlockedCharacters.includes(char.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {screen === 'GAME' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-full"
          >
            <Game
              character={selectedChar}
              onGameOver={handleGameOver}
              onScoreUpdate={setCurrentScore}
              onCoinUpdate={setCurrentCoins}
              onLevelUp={setCurrentLevel}
              isPaused={gameState.isPaused}
            />
            
            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
              <div className="space-y-1">
                <div className="text-4xl font-black italic tracking-tighter neon-glow-cyan">{currentScore}</div>
                <div className="flex items-center space-x-2 text-neon-magenta font-mono font-bold">
                  <Coins className="w-4 h-4" />
                  <span>{currentCoins}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                  <span className="text-xs font-bold tracking-widest uppercase">Level {currentLevel}</span>
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    className="h-full bg-neon-cyan progress-bar-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentScore % 1000) / 10}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'SHOP' && (
          <motion.div
            key="shop"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-black z-50 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setScreen('MENU')} className="p-2 bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black italic tracking-tighter">CHARACTER SHOP</h2>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <Coins className="w-4 h-4 text-neon-magenta" />
                <span className="font-mono font-bold">{gameState.totalCoins}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
              {CHARACTERS.map(char => {
                const isUnlocked = gameState.unlockedCharacters.includes(char.id);
                const isSelected = gameState.selectedCharacter === char.id;
                const canAfford = gameState.totalCoins >= char.price;

                return (
                  <div 
                    key={char.id}
                    className={cn(
                      "p-5 rounded-3xl border-2 flex items-center space-x-4 transition-all",
                      isSelected ? "border-white bg-white/5" : "border-white/10 bg-white/2"
                    )}
                  >
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: char.color + '22' }}
                    >
                      {char.id === 'SPEEDSTER' && <Zap className="w-8 h-8" style={{ color: char.color }} />}
                      {char.id === 'MAGNET' && <Magnet className="w-8 h-8" style={{ color: char.color }} />}
                      {char.id === 'SHIELD' && <Shield className="w-8 h-8" style={{ color: char.color }} />}
                      {char.id === 'LUCKY' && <Dice5 className="w-8 h-8" style={{ color: char.color }} />}
                      {char.id === 'TITAN' && <Flame className="w-8 h-8" style={{ color: char.color }} />}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-black text-lg">{char.name}</h3>
                      <p className="text-sm text-white/60 leading-tight">{char.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ability:</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: char.color }}>{char.ability}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {isUnlocked ? (
                        <button
                          onClick={() => selectCharacter(char.id)}
                          className={cn(
                            "px-4 py-2 rounded-xl font-bold text-sm",
                            isSelected ? "bg-white text-black" : "bg-white/10 text-white"
                          )}
                        >
                          {isSelected ? 'SELECTED' : 'SELECT'}
                        </button>
                      ) : (
                        <button
                          onClick={() => buyCharacter(char)}
                          disabled={!canAfford}
                          className={cn(
                            "px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2",
                            canAfford ? "bg-neon-magenta text-white" : "bg-white/5 text-white/30"
                          )}
                        >
                          <Coins className="w-4 h-4" />
                          <span>{char.price}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {screen === 'GAMEOVER' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-neon-magenta font-black text-4xl italic tracking-tighter">RUN OVER</h2>
              <p className="text-white/40 font-mono text-xs tracking-widest uppercase">You reached Level {currentLevel}</p>
            </div>

            <div className="w-full max-w-xs grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Score</div>
                <div className="text-2xl font-black italic">{currentScore}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Coins</div>
                <div className="text-2xl font-black italic text-neon-magenta">+{currentCoins}</div>
              </div>
            </div>

            {currentScore >= gameState.highScore && currentScore > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-neon-yellow/10 border border-neon-yellow/30 px-6 py-2 rounded-full"
              >
                <span className="text-neon-yellow font-bold text-sm tracking-widest uppercase">New High Score!</span>
              </motion.div>
            )}

            <div className="w-full max-w-xs space-y-4">
              <button
                onClick={startGame}
                className="w-full py-5 bg-white text-black font-black text-xl rounded-2xl flex items-center justify-center space-x-3 hover:scale-105 transition-transform active:scale-95"
              >
                <RotateCcw className="w-6 h-6" />
                <span>TRY AGAIN</span>
              </button>
              <button
                onClick={() => setScreen('MENU')}
                className="w-full py-5 bg-white/10 text-white font-black text-xl rounded-2xl flex items-center justify-center space-x-3 border border-white/10 hover:bg-white/20 transition-colors"
              >
                <Home className="w-6 h-6" />
                <span>MAIN MENU</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
