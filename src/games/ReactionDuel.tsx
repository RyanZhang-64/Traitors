import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface ReactionDuelProps {
  onComplete: (result: GameResult) => void;
}

export const ReactionDuel: React.FC<ReactionDuelProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [phase, setPhase] = useState<'waiting' | 'ready' | 'green' | 'result'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [falseStart, setFalseStart] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);
  const [lockedOut, setLockedOut] = useState<string[]>([]);
  const MAX_ROUNDS = Math.min(8, alivePlayers.length * 2);

  useEffect(() => {
    if (phase !== 'ready') return;
    const delay = 2000 + Math.random() * 4000;
    const t = setTimeout(() => {
      setPhase('green');
      setStartTime(Date.now());
    }, delay);
    return () => clearTimeout(t);
  }, [phase]);

  const handleTap = (playerId: string) => {
    if (lockedOut.includes(playerId)) return;

    if (phase === 'ready') {
      // False start!
      setFalseStart(playerId);
      setLockedOut(l => [...l, playerId]);
      setPhase('result');
      setTimeout(() => {
        setFalseStart(null);
        setLockedOut([]);
        nextRound();
      }, 2000);
      return;
    }

    if (phase === 'green') {
      const ms = Date.now() - startTime;
      setReactionTime(ms);
      setWinner(playerId);
      setScores(s => ({ ...s, [playerId]: (s[playerId] || 0) + 1 }));
      setPhase('result');
      setTimeout(nextRound, 2500);
    }
  };

  const nextRound = () => {
    if (round + 1 >= MAX_ROUNDS) {
      setGameOver(true);
    } else {
      setRound(r => r + 1);
      setWinner(null);
      setFalseStart(null);
      setPhase('waiting');
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Lightning reflexes!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0} wins {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'reaction_duel',
            summary: topPlayer ? `${topPlayer.name} has lightning reflexes!` : 'Everyone was slow!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  const bgColor = phase === 'green' ? '#22c55e' : phase === 'ready' ? '#EF4444' : '#14110E';

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Reaction Duel</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Round {round + 1}/{MAX_ROUNDS}</p>
      </div>

      {/* Main reaction zone */}
      <div
        className="w-full rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none"
        style={{
          height: '200px',
          backgroundColor: bgColor,
          border: `3px solid ${phase === 'green' ? '#22c55e' : 'rgba(182,168,146,0.2)'}`,
          boxShadow: phase === 'green' ? '0 0 40px rgba(34,197,94,0.5)' : 'none',
        }}>
        {phase === 'waiting' && (
          <div className="text-center">
            <p className="font-display text-2xl" style={{ color: 'var(--muted)' }}>Get Ready...</p>
            <button className="mt-4 px-6 py-2 rounded-xl font-bold"
              style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
              onClick={() => setPhase('ready')}>
              Start Round
            </button>
          </div>
        )}
        {phase === 'ready' && (
          <p className="font-display text-3xl font-bold" style={{ color: 'white' }}>WAIT...</p>
        )}
        {phase === 'green' && (
          <p className="font-display text-4xl font-bold" style={{ color: 'white' }}>TAP NOW!</p>
        )}
        {phase === 'result' && winner && (
          <div className="text-center">
            <p className="font-display text-3xl font-bold" style={{ color: 'white' }}>
              {players.find(p => p.id === winner)?.name}!
            </p>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>{reactionTime}ms</p>
          </div>
        )}
        {phase === 'result' && falseStart && (
          <div className="text-center">
            <p className="font-display text-2xl font-bold" style={{ color: 'white' }}>FALSE START!</p>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {players.find(p => p.id === falseStart)?.name} tapped too early
            </p>
          </div>
        )}
      </div>

      {/* Player tap buttons */}
      {(phase === 'ready' || phase === 'green') && (
        <div className="grid grid-cols-2 gap-2">
          {alivePlayers.map((p) => (
            <button key={p.id}
              className="py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
              style={{
                backgroundColor: phase === 'green' ? 'rgba(34,197,94,0.3)' : 'var(--bg-raise)',
                color: phase === 'green' ? '#22c55e' : 'var(--muted)',
                border: `2px solid ${phase === 'green' ? '#22c55e' : 'rgba(182,168,146,0.2)'}`,
              }}
              onClick={() => handleTap(p.id)}
              disabled={lockedOut.includes(p.id)}>
              {p.name} {lockedOut.includes(p.id) ? '(OUT)' : ''}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {alivePlayers.map((p) => (
          <span key={p.id} className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}>
            {p.name}: {scores[p.id] || 0}
          </span>
        ))}
      </div>
    </div>
  );
};
