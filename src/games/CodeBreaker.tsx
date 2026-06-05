import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface CodeBreakerProps {
  onComplete: (result: GameResult) => void;
}

export const CodeBreaker: React.FC<CodeBreakerProps> = ({ onComplete }) => {
  const { players, conclave, activeGame } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));
  const difficulty = (activeGame?.difficulty || 'medium') as 'easy' | 'medium' | 'hard';

  const puzzle = masterBank.code_breaking[difficulty];
  const codeLen = puzzle.solution.length;

  const [guess, setGuess] = useState<string[]>(Array(codeLen).fill(''));
  const [playerIndex, setPlayerIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const currentPlayer = alivePlayers[playerIndex];

  const checkGuess = () => {
    const g = guess.map(Number);
    const correct = g.every((d, i) => d === puzzle.solution[i]);
    return correct;
  };

  const handleSubmit = () => {
    const correct = checkGuess();
    if (!correct) {
      setFeedback('Incorrect! Study the clues again.');
      return;
    }
    const newScores = { ...scores, [currentPlayer.id]: 1 };
    if (playerIndex < alivePlayers.length - 1) {
      setGuess(Array(codeLen).fill(''));
      setFeedback('');
      setScores(newScores);
      setPlayerIndex(playerIndex + 1);
    } else {
      setScores(newScores);
      setSubmitted(true);
    }
  };

  const handleSkip = () => {
    if (playerIndex < alivePlayers.length - 1) {
      setGuess(Array(codeLen).fill(''));
      setFeedback('');
      setPlayerIndex(playerIndex + 1);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Code Cracked!</h2>
        <p style={{ color: 'var(--ink)' }}>The code was: <span style={{ color: 'var(--flame)' }}>{puzzle.solution.join('-')}</span></p>
        <div className="w-full max-w-sm space-y-2">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: scores[p.id] ? 'var(--sage)' : 'var(--ember)' }}>
                {scores[p.id] ? '✓ Correct' : '✗ Wrong'} {coinDeltas[p.id] ? `+${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'code_breaker',
            summary: topPlayer ? `${topPlayer.name} cracked the code!` : 'The code held its secret!',
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
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Code Breaker</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {currentPlayer?.name} — study the clue rows, then guess the code
        </p>
      </div>

      {/* Clue rows */}
      <div className="space-y-2 rounded-xl p-4"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--flame)' }}>Clue Rows:</h3>
        {puzzle.rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex gap-1">
              {row.guess.map((d, j) => (
                <span key={j} className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--flame)', border: '1px solid rgba(232,163,61,0.3)' }}>
                  {d}
                </span>
              ))}
            </div>
            <span className="text-xs flex-1" style={{ color: 'var(--muted)' }}>{row.hint}</span>
          </div>
        ))}
      </div>

      {/* Guess input */}
      <div className="flex justify-center gap-2">
        {Array(codeLen).fill(null).map((_, i) => (
          <input key={i} type="number" min={0} max={9}
            value={guess[i]}
            onChange={(e) => {
              const v = e.target.value.slice(-1);
              const newGuess = [...guess];
              newGuess[i] = v;
              setGuess(newGuess);
            }}
            className="w-12 h-12 text-center text-xl font-bold rounded-lg"
            style={{ backgroundColor: 'var(--bg-raise)', border: '2px solid rgba(232,163,61,0.4)', color: 'var(--ink)' }}
            placeholder="?"
          />
        ))}
      </div>

      {feedback && <p className="text-center text-sm" style={{ color: 'var(--ember)' }}>{feedback}</p>}

      <div className="flex gap-3">
        <button className="flex-1 py-3 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmit} disabled={guess.some((g) => g === '')}>
          Submit Code
        </button>
        <button className="px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
          onClick={handleSkip}>
          Give Up
        </button>
      </div>
    </div>
  );
};
