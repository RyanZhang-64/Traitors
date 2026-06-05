import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { categoryRouletteCategories } from '../data/triviaQuestions';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface CategoryRouletteProps {
  onComplete: (result: GameResult) => void;
}

export const CategoryRoulette: React.FC<CategoryRouletteProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [spinning, setSpinning] = useState(false);
  const [selectedCat, setSelectedCat] = useState<typeof categoryRouletteCategories[0] | null>(null);
  const [currentQ, setCurrentQ] = useState('');
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);

  const MAX_ROUNDS = 5;
  const CATEGORIES = categoryRouletteCategories;

  const handleSpin = () => {
    setSpinning(true);
    const targetIdx = Math.floor(Math.random() * CATEGORIES.length);
    const totalAngle = 720 + targetIdx * (360 / CATEGORIES.length);
    setSpinAngle((prev) => prev + totalAngle);

    setTimeout(() => {
      setSpinning(false);
      const cat = CATEGORIES[targetIdx];
      setSelectedCat(cat);
      const q = cat.questions[Math.floor(Math.random() * cat.questions.length)];
      setCurrentQ(q);
    }, 1500);
  };

  const handleAward = (playerId: string) => {
    setScores((s) => ({ ...s, [playerId]: (s[playerId] || 0) + 1 }));
    if (round + 1 >= MAX_ROUNDS) {
      setGameOver(true);
    } else {
      setRound((r) => r + 1);
      setSelectedCat(null);
      setCurrentQ('');
    }
  };

  const handleSkip = () => {
    if (round + 1 >= MAX_ROUNDS) {
      setGameOver(true);
    } else {
      setRound((r) => r + 1);
      setSelectedCat(null);
      setCurrentQ('');
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Roulette Complete!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0} pts {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'category_roulette',
            summary: topPlayer ? `${topPlayer.name} won the roulette!` : 'No clear winner!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Category Roulette</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Round {round + 1}/{MAX_ROUNDS} — spin to get a category!</p>
      </div>

      {/* Wheel visualization */}
      <div className="flex justify-center">
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center relative"
          style={{
            background: `conic-gradient(${CATEGORIES.map((c, i) =>
              `hsl(${i * (360 / CATEGORIES.length)}, 60%, 35%) ${i * (100 / CATEGORIES.length)}% ${(i + 1) * (100 / CATEGORIES.length)}%`
            ).join(', ')})`,
            border: '4px solid var(--flame)',
            transform: `rotate(${spinAngle}deg)`,
            transition: spinning ? 'transform 1.5s cubic-bezier(0.1, 0.8, 0.2, 1)' : 'none',
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <div key={i}
              className="absolute text-center"
              style={{
                transform: `rotate(${i * (360 / CATEGORIES.length) + 30}deg) translateY(-60px) rotate(-${i * (360 / CATEGORIES.length) + 30}deg)`,
                fontSize: '9px',
                color: 'white',
                fontWeight: 'bold',
                width: '40px',
              }}>
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      {!selectedCat ? (
        <button
          className="w-full py-4 rounded-xl font-display text-xl font-bold transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSpin}
          disabled={spinning}>
          {spinning ? 'Spinning...' : 'Spin the Wheel!'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl p-4 text-center"
            style={{ backgroundColor: 'rgba(232,163,61,0.15)', border: '2px solid var(--flame)' }}>
            <p className="font-bold text-sm" style={{ color: 'var(--flame)' }}>{selectedCat.name.toUpperCase()}</p>
            <p className="font-display text-xl mt-2" style={{ color: 'var(--ink)' }}>{currentQ}</p>
          </div>

          <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
            First to buzz in and answer correctly wins the point!
          </p>

          <div className="grid grid-cols-2 gap-2">
            {alivePlayers.map((p) => (
              <button key={p.id}
                className="py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--sage)', color: 'white' }}
                onClick={() => handleAward(p.id)}>
                ✓ {p.name}
              </button>
            ))}
          </div>

          <button className="w-full py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={handleSkip}>
            No one got it — next question
          </button>
        </div>
      )}
    </div>
  );
};
