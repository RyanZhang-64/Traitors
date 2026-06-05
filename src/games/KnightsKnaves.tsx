import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface KnightsKnavesProps {
  onComplete: (result: GameResult) => void;
}

export const KnightsKnaves: React.FC<KnightsKnavesProps> = ({ onComplete }) => {
  const { players, conclave, activeGame } = useStore();
  const difficulty = (activeGame?.difficulty || 'medium') as 'easy' | 'medium' | 'hard';

  const puzzles = masterBank.knights_knaves.filter((p) => p.difficulty === difficulty);
  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)] || masterBank.knights_knaves[0];

  const [guesses, setGuesses] = useState<Record<string, string>>({ A: '', B: '', C: '' });
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));
  const currentPlayer = alivePlayers[currentPlayerIndex];

  const handleSubmit = () => {
    const correct = Object.keys(puzzle.solution).every(
      (k) => guesses[k as keyof typeof guesses]?.toLowerCase() === puzzle.solution[k as keyof typeof puzzle.solution].toLowerCase()
    );

    const newScores = { ...scores };
    if (correct) {
      newScores[currentPlayer.id] = (newScores[currentPlayer.id] || 0) + 1;
    }

    if (currentPlayerIndex < alivePlayers.length - 1) {
      setGuesses({ A: '', B: '', C: '' });
      setScores(newScores);
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      setScores(newScores);
      setSubmitted(true);
    }
  };

  if (submitted) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const topScorer = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === topScorer?.[0]);

    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Results</h2>
        <div className="w-full max-w-sm space-y-3">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] ? '✓ Correct' : '✗ Wrong'} {coinDeltas[p.id] ? `+${coinDeltas[p.id]} coins` : ''}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center" style={{ color: 'var(--muted)' }}>
          <p>Solution: A={puzzle.solution.A}, B={puzzle.solution.B}, C={puzzle.solution.C}</p>
        </div>
        <button
          className="px-8 py-3 rounded-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'knights_knaves',
            summary: topPlayer ? `${topPlayer.name} solved the puzzle!` : 'No one solved it!',
            coinDeltas,
            shieldsAwarded: {},
            suspicionDeltas: {},
            tells: scores[players.find(p=>p.role==='traitor')?.id||''] ? ['A Traitor solved the logic puzzle'] : [],
            timestamp: Date.now(),
          })}
        >
          Continue ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Knights & Knaves</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Knights always tell the truth. Knaves always lie.
        </p>
      </div>

      <div
        className="w-full p-4 rounded-xl space-y-3"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}
      >
        <h3 className="font-display text-lg" style={{ color: 'var(--ink)' }}>Statements:</h3>
        {Object.entries(puzzle.statements).map(([person, stmt]) => (
          <div key={person} className="flex gap-3">
            <span className="font-bold w-4" style={{ color: 'var(--flame)' }}>{person}:</span>
            <span style={{ color: 'var(--ink)' }}>&quot;{stmt}&quot;</span>
          </div>
        ))}
      </div>

      <div className="w-full text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Player {currentPlayerIndex + 1}/{alivePlayers.length}: <span style={{ color: 'var(--ink)' }}>{currentPlayer?.name}</span>
        </p>
      </div>

      <div className="w-full space-y-3">
        {(['A', 'B', 'C'] as const).map((person) => (
          <div key={person} className="flex items-center gap-3">
            <span className="font-bold w-4" style={{ color: 'var(--flame)' }}>{person}:</span>
            <div className="flex gap-2 flex-1">
              {['Knight', 'Knave'].map((type) => (
                <button
                  key={type}
                  className="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
                  style={{
                    backgroundColor: guesses[person] === type ? (type === 'Knight' ? 'var(--sage)' : 'var(--ember)') : 'var(--bg-raise)',
                    color: guesses[person] === type ? 'white' : 'var(--muted)',
                    border: `1px solid ${guesses[person] === type ? (type === 'Knight' ? 'var(--sage)' : 'var(--ember)') : 'rgba(182,168,146,0.2)'}`,
                  }}
                  onClick={() => setGuesses({ ...guesses, [person]: type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleSubmit}
        disabled={!guesses.A || !guesses.B || !guesses.C}
      >
        Submit Answer
      </button>
    </div>
  );
};
