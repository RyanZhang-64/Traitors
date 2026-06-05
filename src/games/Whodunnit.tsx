import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface WhodunnitProps {
  onComplete: (result: GameResult) => void;
}

export const Whodunnit: React.FC<WhodunnitProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const caseData = masterBank.whodunnit[Math.floor(Math.random() * masterBank.whodunnit.length)];
  const suspects = Object.keys(caseData.solution);

  const [guess, setGuess] = useState('');
  const [playerIndex, setPlayerIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentPlayer = alivePlayers[playerIndex];

  const handleSubmit = () => {
    const correct = guess === caseData.culprit;
    const newScores = { ...scores, [currentPlayer.id]: correct ? 1 : 0 };
    if (playerIndex < alivePlayers.length - 1) {
      setGuess('');
      setScores(newScores);
      setPlayerIndex(playerIndex + 1);
    } else {
      setScores(newScores);
      setSubmitted(true);
    }
  };

  if (submitted) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const topEntry = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === topEntry?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Case Closed</h2>
        <p className="text-lg" style={{ color: 'var(--ink)' }}>
          The culprit was: <span style={{ color: 'var(--ember)' }}>Professor {caseData.culprit}</span>
        </p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{caseData.culprit_rule}</p>
        <div className="w-full max-w-sm space-y-2">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: scores[p.id] ? 'var(--sage)' : 'var(--ember)' }}>
                {scores[p.id] ? '✓ Solved' : '✗ Wrong'} {coinDeltas[p.id] ? `+${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'whodunnit',
            summary: topPlayer ? `${topPlayer.name} cracked the case!` : 'The murderer escaped!',
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
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Whodunnit</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {currentPlayer?.name} is investigating…
        </p>
      </div>

      <div className="rounded-xl p-4 space-y-2"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <h3 className="font-bold text-sm" style={{ color: 'var(--flame)' }}>Clues:</h3>
        {caseData.clues.map((c, i) => (
          <p key={i} className="text-sm" style={{ color: 'var(--ink)' }}>• {c}</p>
        ))}
        <p className="text-sm font-bold mt-2" style={{ color: 'var(--crimson)' }}>
          Rule: {caseData.culprit_rule}
        </p>
      </div>

      <div className="rounded-xl p-4 space-y-2"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--ink)' }}>Suspects:</h3>
        <div className="grid grid-cols-2 gap-2">
          {suspects.map((s) => (
            <button key={s}
              className="py-2 px-3 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: guess === s ? 'var(--crimson)' : 'var(--bg)',
                color: guess === s ? 'white' : 'var(--ink)',
                border: `1px solid ${guess === s ? 'var(--crimson)' : 'rgba(182,168,146,0.2)'}`,
              }}
              onClick={() => setGuess(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleSubmit} disabled={!guess}>
        Accuse {guess || '...'}
      </button>
    </div>
  );
};
