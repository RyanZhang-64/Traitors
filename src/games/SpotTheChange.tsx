import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface SpotTheChangeProps {
  onComplete: (result: GameResult) => void;
}

interface Scene {
  title: string;
  items: { id: string; label: string; x: number; y: number; size: number; color: string }[];
  changes: string[]; // ids that changed
}

const generateScene = (): Scene => {
  const items = [
    { id: 'moon', label: '🌙', x: 20, y: 15, size: 40, color: '#F6C66B' },
    { id: 'castle', label: '🏰', x: 40, y: 50, size: 60, color: '#8B6DB0' },
    { id: 'tree1', label: '🌲', x: 10, y: 60, size: 45, color: '#6F8F6A' },
    { id: 'tree2', label: '🌲', x: 75, y: 60, size: 45, color: '#6F8F6A' },
    { id: 'candle', label: '🕯️', x: 60, y: 30, size: 35, color: '#E8A33D' },
    { id: 'bird', label: '🦅', x: 80, y: 20, size: 30, color: '#B6A892' },
    { id: 'cloud', label: '☁️', x: 50, y: 10, size: 35, color: '#9999BB' },
    { id: 'stone', label: '💎', x: 25, y: 75, size: 28, color: '#6699CC' },
  ];
  return { title: 'Castle at Night', items, changes: [] };
};

export const SpotTheChange: React.FC<SpotTheChangeProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const sceneA = generateScene();
  const changeCount = 3;
  const allIds = sceneA.items.map(i => i.id);
  const changedIds = [...allIds].sort(() => Math.random() - 0.5).slice(0, changeCount);

  const sceneB: Scene = {
    ...sceneA,
    items: sceneA.items.map(item =>
      changedIds.includes(item.id)
        ? { ...item, label: '❓', color: '#555555' }
        : item
    ),
    changes: changedIds,
  };

  const [viewing, setViewing] = useState<'A' | 'B' | 'guess'>('A');
  const [selected, setSelected] = useState<string[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showViewTime, setShowViewTime] = useState(10);
  const [viewTimer, setViewTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (viewing === 'A') {
      const t = setTimeout(() => setViewing('B'), 5000);
      return () => clearTimeout(t);
    }
    if (viewing === 'B') {
      const t = setTimeout(() => setViewing('guess'), 5000);
      return () => clearTimeout(t);
    }
  }, [viewing]);

  const currentPlayer = alivePlayers[playerIdx];

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < changeCount) {
      setSelected([...selected, id]);
    }
  };

  const handleSubmit = () => {
    const correct = selected.filter(s => changedIds.includes(s)).length;
    const newScores = { ...scores, [currentPlayer.id]: correct };
    if (playerIdx < alivePlayers.length - 1) {
      setScores(newScores);
      setPlayerIdx(playerIdx + 1);
      setSelected([]);
      setViewing('A');
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
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Spot the Change!</h2>
        <p style={{ color: 'var(--muted)' }}>Changed items: {changedIds.join(', ')}</p>
        <div className="w-full max-w-sm space-y-2">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0}/{changeCount} found {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'spot_the_change',
            summary: topPlayer ? `${topPlayer.name} spotted the most changes!` : 'Nobody noticed the changes!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  const renderScene = (scene: Scene, clickable = false) => (
    <div className="relative w-full rounded-xl overflow-hidden"
      style={{ height: '180px', backgroundColor: '#0A0806', border: '1px solid rgba(182,168,146,0.2)' }}>
      {scene.items.map(item => (
        <button key={item.id}
          className={`absolute text-2xl flex items-center justify-center rounded-lg transition-all ${
            clickable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          }`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: 'translate(-50%, -50%)',
            width: `${item.size}px`,
            height: `${item.size}px`,
            backgroundColor: selected.includes(item.id) ? 'rgba(232,163,61,0.3)' : 'transparent',
            border: selected.includes(item.id) ? '2px solid var(--flame)' : '2px solid transparent',
          }}
          onClick={() => clickable && toggleSelect(item.id)}
          disabled={!clickable}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Spot the Change</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {currentPlayer?.name} — memorise the scene, find {changeCount} differences
        </p>
      </div>

      {viewing === 'A' && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-center" style={{ color: 'var(--sage)' }}>SCENE A — memorise it! (5s)</p>
          {renderScene(sceneA)}
        </div>
      )}

      {viewing === 'B' && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-center" style={{ color: 'var(--flame)' }}>SCENE B — study changes! (5s)</p>
          {renderScene(sceneB)}
        </div>
      )}

      {viewing === 'guess' && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-center" style={{ color: 'var(--ink)' }}>
            Tap the {changeCount} changed items! ({selected.length}/{changeCount} selected)
          </p>
          {renderScene(sceneB, true)}
          <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={handleSubmit}
            disabled={selected.length !== changeCount}>
            Submit Answers
          </button>
        </div>
      )}
    </div>
  );
};
