import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface TimelineProps {
  onComplete: (result: GameResult) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const data = masterBank.timeline[Math.floor(Math.random() * masterBank.timeline.length)];
  const shuffled = [...data.items_shuffled].sort(() => Math.random() - 0.5);
  const [order, setOrder] = useState<string[]>(shuffled);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const currentPlayer = alivePlayers[playerIndex];

  const moveUp = (i: number) => {
    if (i === 0) return;
    const newOrder = [...order];
    [newOrder[i - 1], newOrder[i]] = [newOrder[i], newOrder[i - 1]];
    setOrder(newOrder);
  };

  const moveDown = (i: number) => {
    if (i === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[i + 1], newOrder[i]] = [newOrder[i], newOrder[i + 1]];
    setOrder(newOrder);
  };

  const countCorrect = () => {
    return order.filter((item, i) => item === data.correct_order[i]).length;
  };

  const isInOrder = () => {
    return order.every((item, i) => item === data.correct_order[i]);
  };

  const handleSubmit = () => {
    const correct = countCorrect();
    const totalScore = isInOrder() ? 4 : correct;
    const newScores = { ...scores, [currentPlayer.id]: totalScore };
    if (playerIndex < alivePlayers.length - 1) {
      setOrder([...data.items_shuffled].sort(() => Math.random() - 0.5));
      setScores(newScores);
      setPlayerIndex(playerIndex + 1);
    } else {
      setScores(newScores);
      setSubmitted(true);
    }
  };

  if (submitted) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Timeline Complete!</h2>
        <div className="space-y-2 text-sm w-full max-w-sm">
          <p className="font-bold" style={{ color: 'var(--muted)' }}>Correct order:</p>
          {data.correct_order.map((item, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--ink)' }}>
              {i + 1}. {item} <span style={{ color: 'var(--muted)' }}>({data.years[item as keyof typeof data.years] < 0
                ? `${Math.abs(data.years[item as keyof typeof data.years])} BC`
                : data.years[item as keyof typeof data.years]})</span>
            </p>
          ))}
        </div>
        <div className="w-full max-w-sm space-y-2">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>{scores[p.id] || 0}/{shuffled.length} {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}</span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'timeline',
            summary: topPlayer ? `${topPlayer.name} nailed the timeline!` : 'History stumped everyone!',
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
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Timeline</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Theme: <span style={{ color: 'var(--ink)' }}>{data.theme}</span> — arrange in chronological order
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          {currentPlayer?.name}'s turn — use ↑↓ to reorder
        </p>
      </div>

      <div className="space-y-2">
        {order.map((item, i) => (
          <div key={item}
            className="flex items-center gap-2 p-3 rounded-xl transition-all"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
            <span className="w-6 font-bold text-center" style={{ color: 'var(--flame)' }}>{i + 1}</span>
            <span className="flex-1 text-sm" style={{ color: 'var(--ink)' }}>{item}</span>
            <div className="flex gap-1">
              <button className="w-7 h-7 rounded flex items-center justify-center text-sm"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
                onClick={() => moveUp(i)} disabled={i === 0}>↑</button>
              <button className="w-7 h-7 rounded flex items-center justify-center text-sm"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
                onClick={() => moveDown(i)} disabled={i === order.length - 1}>↓</button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 rounded-xl font-bold"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleSubmit}>
        Lock in Order
      </button>
    </div>
  );
};
