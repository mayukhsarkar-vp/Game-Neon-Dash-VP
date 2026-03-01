import React, { useEffect, useRef, useState } from 'react';
import { Character, CharacterType } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'obstacle' | 'coin' | 'powerup' | 'chest';
  color: string;
  collected?: boolean;
}

interface GameProps {
  character: Character;
  onGameOver: (score: number, coins: number) => void;
  onScoreUpdate: (score: number) => void;
  onCoinUpdate: (coins: number) => void;
  onLevelUp: (level: number) => void;
  isPaused: boolean;
}

const Game: React.FC<GameProps> = ({
  character,
  onGameOver,
  onScoreUpdate,
  onCoinUpdate,
  onLevelUp,
  isPaused
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const stateRef = useRef({
    playerY: 0,
    playerVelocity: 0,
    playerX: 100,
    objects: [] as GameObject[],
    particles: [] as Particle[],
    distance: 0,
    score: 0,
    coins: 0,
    level: 1,
    gameSpeed: 5,
    lastTime: 0,
    hasShield: character.id === 'SHIELD',
    combo: 0,
    comboTimer: 0,
    difficultyTimer: 0,
  });

  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    stateRef.current.playerY = dimensions.height / 2;
  }, [dimensions]);

  const jump = () => {
    if (isPaused) return;
    stateRef.current.playerVelocity = -12 * (character.id === 'SPEEDSTER' ? 1.1 : 1);
    
    // Jump particles
    for (let i = 0; i < 5; i++) {
      stateRef.current.particles.push({
        x: stateRef.current.playerX,
        y: stateRef.current.playerY + 20,
        vx: -Math.random() * 5,
        vy: Math.random() * 2 - 1,
        life: 1,
        color: character.color,
        size: Math.random() * 4 + 2
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') jump();
    };
    const handleTouch = () => jump();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch);
    window.addEventListener('mousedown', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleTouch);
    };
  }, [isPaused, character]);

  const spawnObject = () => {
    const types: GameObject['type'][] = ['obstacle', 'coin', 'coin', 'coin', 'powerup', 'chest'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let color = '#fff';
    let width = 30;
    let height = 30;

    switch (type) {
      case 'obstacle':
        color = '#ff0000';
        width = 40;
        height = 40 + Math.random() * 100;
        break;
      case 'coin':
        color = '#ffff00';
        width = 20;
        height = 20;
        break;
      case 'powerup':
        color = '#00ff00';
        width = 25;
        height = 25;
        break;
      case 'chest':
        color = '#ff00ff';
        width = 35;
        height = 35;
        break;
    }

    stateRef.current.objects.push({
      x: dimensions.width + 100,
      y: Math.random() * (dimensions.height - 100) + 50,
      width,
      height,
      type,
      color
    });
  };

  const update = (time: number) => {
    if (isPaused) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const dt = (time - stateRef.current.lastTime) / 16.67;
    stateRef.current.lastTime = time;

    // Gravity
    stateRef.current.playerVelocity += 0.6 * dt;
    stateRef.current.playerY += stateRef.current.playerVelocity * dt;

    // Boundaries
    if (stateRef.current.playerY < 0) {
      stateRef.current.playerY = 0;
      stateRef.current.playerVelocity = 0;
    }
    if (stateRef.current.playerY > dimensions.height - 40) {
      stateRef.current.playerY = dimensions.height - 40;
      stateRef.current.playerVelocity = 0;
    }

    // Difficulty scaling
    stateRef.current.difficultyTimer += dt;
    if (stateRef.current.difficultyTimer > 1200) { // Approx 20 seconds
      stateRef.current.level += 1;
      stateRef.current.gameSpeed += 0.5;
      stateRef.current.difficultyTimer = 0;
      onLevelUp(stateRef.current.level);
    }

    // Score
    stateRef.current.distance += stateRef.current.gameSpeed * dt;
    const newScore = Math.floor(stateRef.current.distance / 10);
    if (newScore !== stateRef.current.score) {
      stateRef.current.score = newScore;
      onScoreUpdate(stateRef.current.score);
    }

    // Spawn objects
    if (Math.random() < 0.02 * stateRef.current.gameSpeed) {
      spawnObject();
    }

    // Update objects
    stateRef.current.objects = stateRef.current.objects.filter(obj => {
      obj.x -= stateRef.current.gameSpeed * dt;

      // Magnet effect
      if (character.id === 'MAGNET' && (obj.type === 'coin' || obj.type === 'chest')) {
        const dx = stateRef.current.playerX - obj.x;
        const dy = stateRef.current.playerY - obj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
          obj.x += dx * 0.1;
          obj.y += dy * 0.1;
        }
      }

      // Collision detection
      const playerRect = {
        x: stateRef.current.playerX,
        y: stateRef.current.playerY,
        w: 40,
        h: 40
      };

      if (
        !obj.collected &&
        playerRect.x < obj.x + obj.width &&
        playerRect.x + playerRect.w > obj.x &&
        playerRect.y < obj.y + obj.height &&
        playerRect.y + playerRect.h > obj.y
      ) {
        if (obj.type === 'obstacle') {
          if (stateRef.current.hasShield) {
            stateRef.current.hasShield = false;
            obj.collected = true;
            // Shield break particles
            for (let i = 0; i < 20; i++) {
              stateRef.current.particles.push({
                x: obj.x,
                y: obj.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: '#00ff00',
                size: Math.random() * 6 + 2
              });
            }
            return false;
          } else {
            onGameOver(stateRef.current.score, stateRef.current.coins);
            return false;
          }
        } else {
          obj.collected = true;
          if (obj.type === 'coin') {
            const coinVal = 1 * (character.id === 'LUCKY' ? (Math.random() > 0.8 ? 5 : 1) : 1);
            stateRef.current.coins += coinVal;
            onCoinUpdate(stateRef.current.coins);
            // Coin particles
            for (let i = 0; i < 8; i++) {
              stateRef.current.particles.push({
                x: obj.x,
                y: obj.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: '#ffff00',
                size: Math.random() * 4 + 2
              });
            }
          } else if (obj.type === 'chest') {
            const chestVal = Math.floor(Math.random() * 50) + 20;
            stateRef.current.coins += chestVal;
            onCoinUpdate(stateRef.current.coins);
            // Chest particles
            for (let i = 0; i < 30; i++) {
              stateRef.current.particles.push({
                x: obj.x,
                y: obj.y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1,
                color: '#ff00ff',
                size: Math.random() * 6 + 2
              });
            }
          }
          return false;
        }
      }

      return obj.x > -100;
    });

    // Update particles
    stateRef.current.particles = stateRef.current.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= 0.02 * dt;
      return p.life > 0;
    });

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw background grid (neon style)
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const offset = (stateRef.current.distance % gridSize);
    for (let x = -offset; x < dimensions.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
      ctx.stroke();
    }
    for (let y = 0; y < dimensions.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
      ctx.stroke();
    }

    // Draw particles
    stateRef.current.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw objects
    stateRef.current.objects.forEach(obj => {
      ctx.fillStyle = obj.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = obj.color;
      
      if (obj.type === 'coin') {
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2, obj.y + obj.height/2, obj.width/2, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'obstacle') {
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      } else {
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
      
      ctx.shadowBlur = 0;
    });

    // Draw player
    ctx.fillStyle = character.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = character.color;
    ctx.fillRect(stateRef.current.playerX, stateRef.current.playerY, 40, 40);
    
    // Shield visual
    if (stateRef.current.hasShield) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(stateRef.current.playerX + 20, stateRef.current.playerY + 20, 35, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="block w-full h-full"
    />
  );
};

export default Game;
