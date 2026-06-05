import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface EstimationChallengeProps {
  onComplete: (result: GameResult) => void;
}

export const EstimationChallenge: React.FC<EstimationChallengeProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [questions] = useState(() => [...masterBank.estimation].sort(() => Math.random() - 0.5).slice(0, 6));
  const [qIdx, setQIdx] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, number>>({});
  const [allGuesses, setAllGuesses] = useState<Record<string, Record<string, number>>>({});
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});
  const [totalScores, setTotalScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);

  const currentQ = questions[qIdx];
  const currentPlayer = alivePlayers[currentPlayerIdx];

  const handleSubmitGuess = () => {
    const val = parseFloat(currentInput);
    if (isNaN(val)) return;
    const newGuesses = { ...guesses, [currentPlayer.id]: val };
    setGuesses(newGuesses);
    setCurrentInput('');

    if (currentPlayerIdx < alivePlayers.length - 1) {
      setCurrentPlayerIdx(currentPlayerIdx + 1);
    } else {
      // All guessed — calculate scores
      const answer = currentQ.answer;
      const distances = Object.entries(newGuesses).map(([id, g]) => ({
        id,
        distance: Math.abs(g - answer),
        guess: g,
      })).sort((a, b) => a.distance - b.distance);

      const qScores: Record<string, number> = {};
      distances.forEach((d, i) => {
        qScores[d.id] = Math.max(0, 4 - i);
      });
      setRoundScores(qScores);
      setAllGuesses(prev => ({ ...prev, [qIdx]: newGuesses }));

      const newTotal = { ...totalScores };
      Object.entries(qScores).forEach(([id, s]) => {
        newTotal[id] = (newTotal[id] || 0) + s;
      });
      setTotalScores(newTotal);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) {
      setGameOver(true);
    } else {
      setQIdx(qIdx + 1);
      setGuesses({});
      setCurrentPlayerIdx(0);
      setShowResult(false);
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(totalScores, alivePlayers);
    const top = Object.entries(totalScores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Estimation Complete!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (totalScores[b.id] || 0) - (totalScores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {totalScores[p.id] || 0} pts {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'estimation_challenge',
            summary: topPlayer ? `${topPlayer.name} had the best estimates!` : 'No estimates were spot on!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (showResult) {
    const answer = currentQ.answer;
    const sorted = Object.entries(guesses)
      .map(([id, g]) => ({ id, guess: g, dist: Math.abs(g - answer) }))
      .sort((a, b) => a.dist - b.dist);

    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h3 className="font-display text-xl font-bold" style={{ color: 'var(--flame)' }}>
            Q{qIdx + 1} Result
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{currentQ.q}</p>
          <p className="text-2xl font-bold mt-2" style={{ color: 'var(--flame-hi)' }}>
            {answer.toLocaleString()} {currentQ.unit}
          </p>
        </div>
        <div className="space-y-2">
          {sorted.map((item, rank) => {
            const p = alivePlayers.find(p => p.id === item.id);
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-raise)', border: `1px solid ${rank === 0 ? 'rgba(232,163,61,0.4)' : 'rgba(182,168,146,0.15)'}` }}>
                <span className="font-bold w-6" style={{ color: rank === 0 ? 'var(--flame)' : 'var(--muted)' }}>
                  #{rank + 1}
                </span>
                <span className="flex-1" style={{ color: 'var(--ink)' }}>{p?.name}</span>
                <span style={{ color: 'var(--muted)' }}>{item.guess.toLocaleString()}</span>
                <span className="text-xs" style={{ color: rank === 0 ? 'var(--sage)' : 'var(--muted)' }}>
                  off by {item.dist.toLocaleString()}
                </span>
                <span className="font-bold text-sm" style={{ color: 'var(--flame)' }}>
                  +{roundScores[item.id] || 0}
                </span>
              </div>
            );
          })}
        </div>
        <button className="w-full py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleNext}>
          {qIdx + 1 < questions.length ? 'Next Question →' : 'See Final Scores'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
          Q{qIdx + 1}/{questions.length}
        </h2>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          {currentPlayer?.name}'s guess
        </span>
      </div>

      <div className="rounded-xl p-5 text-center"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <p className="font-display text-xl" style={{ color: 'var(--ink)' }}>{currentQ.q}</p>
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>in {currentQ.unit}</p>
      </div>

      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        Guessed: {Object.keys(guesses).map(id => alivePlayers.find(p => p.id === id)?.name).join(', ')}
      </div>

      <div className="flex gap-2">
        <input type="number" value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuess()}
          placeholder={`${currentPlayer?.name}'s answer (${currentQ.unit})...`}
          className="flex-1 text-lg text-center"
        />
        <button className="px-5 py-2 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmitGuess} disabled={!currentInput}>
          →
        </button>
      </div>
    </div>
  );
};
