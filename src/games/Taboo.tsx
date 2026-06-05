import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { tabooCards } from '../data/tabooCards';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface TabooProps {
  onComplete: (result: GameResult) => void;
}

export const Taboo: React.FC<TabooProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [describerIdx, setDescriberIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundsPerPlayer] = useState(2);
  const [roundsDone, setRoundsDone] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [cardQueue] = useState([...tabooCards].sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      handleTurnEnd();
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const handleTurnEnd = () => {
    const totalRounds = alivePlayers.length * roundsPerPlayer;
    if (roundsDone + 1 >= totalRounds) {
      setGameOver(true);
    } else {
      const nextDescIdx = (describerIdx + 1) % alivePlayers.length;
      setDescriberIdx(nextDescIdx);
      setRoundsDone(roundsDone + 1);
      setTimeLeft(60);
      setTimerActive(false);
    }
  };

  const handleGotIt = () => {
    const describer = alivePlayers[describerIdx];
    setScores((s) => ({ ...s, [describer.id]: (s[describer.id] || 0) + 1 }));
    setCardIdx((i) => (i + 1) % cardQueue.length);
  };

  const handleSkip = () => {
    setCardIdx((i) => (i + 1) % cardQueue.length);
  };

  const handleTaboo = () => {
    const describer = alivePlayers[describerIdx];
    setScores((s) => ({ ...s, [describer.id]: Math.max(0, (s[describer.id] || 0) - 1) }));
    setCardIdx((i) => (i + 1) % cardQueue.length);
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Taboo Over!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>{scores[p.id] || 0} pts {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}</span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'taboo',
            summary: topPlayer ? `${topPlayer.name} was the best describer!` : 'Everyone struggled!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  const describer = alivePlayers[describerIdx];
  const card = cardQueue[cardIdx % cardQueue.length];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Taboo</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {describer?.name} describes — everyone else guesses
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
            style={{
              backgroundColor: timeLeft <= 10 ? 'rgba(181,64,46,0.3)' : 'rgba(232,163,61,0.2)',
              color: timeLeft <= 10 ? 'var(--ember)' : 'var(--flame)',
              border: `2px solid ${timeLeft <= 10 ? 'var(--ember)' : 'var(--flame)'}`,
            }}>
            {timerActive ? timeLeft : '60'}
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {scores[describer?.id] || 0} pts
          </span>
        </div>
      </div>

      {!timerActive ? (
        <div className="text-center py-6">
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Pass the phone to <span style={{ color: 'var(--ink)' }}>{describer?.name}</span>.
            Everyone else turn away!
          </p>
          <button className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={() => setTimerActive(true)}>
            Start Turn ▶
          </button>
        </div>
      ) : (
        <>
          {/* Card */}
          <div className="rounded-xl p-5 text-center"
            style={{ backgroundColor: 'var(--bg-raise)', border: '2px solid rgba(232,163,61,0.4)' }}>
            <p className="font-display text-3xl font-bold mb-4" style={{ color: 'var(--flame)' }}>
              {card.word}
            </p>
            <div className="space-y-1">
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--crimson)' }}>DO NOT SAY:</p>
              {card.forbidden.map((w) => (
                <p key={w} className="text-sm" style={{ color: 'var(--ember)' }}>✗ {w}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button className="py-3 rounded-xl font-bold"
              style={{ backgroundColor: 'rgba(111,143,106,0.3)', color: 'var(--sage)', border: '1px solid var(--sage)' }}
              onClick={handleGotIt}>
              ✓ Got it!
            </button>
            <button className="py-3 rounded-xl font-bold"
              style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
              onClick={handleSkip}>
              → Skip
            </button>
            <button className="py-3 rounded-xl font-bold"
              style={{ backgroundColor: 'rgba(181,64,46,0.3)', color: 'var(--ember)', border: '1px solid var(--ember)' }}
              onClick={handleTaboo}>
              ✗ Taboo!
            </button>
          </div>

          <button className="w-full py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
            onClick={() => { setTimerActive(false); handleTurnEnd(); }}>
            End Turn Early
          </button>
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {alivePlayers.map((p) => (
          <span key={p.id} className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: p.id === describer?.id ? 'rgba(232,163,61,0.2)' : 'var(--bg-raise)',
              color: p.id === describer?.id ? 'var(--flame)' : 'var(--muted)',
              border: `1px solid ${p.id === describer?.id ? 'var(--flame)' : 'rgba(182,168,146,0.15)'}`,
            }}>
            {p.name}: {scores[p.id] || 0}
          </span>
        ))}
      </div>
    </div>
  );
};
