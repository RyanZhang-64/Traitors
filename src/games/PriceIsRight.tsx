import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface PriceIsRightProps {
  onComplete: (result: GameResult) => void;
}

const DEFAULT_ITEMS = [
  { name: 'A quality chef knife', price: 0 },
  { name: 'A round-trip flight to Spain', price: 0 },
  { name: 'A standard bicycle', price: 0 },
  { name: 'A mid-range smartphone', price: 0 },
  { name: 'A gym membership (1 year)', price: 0 },
  { name: 'A bottle of fine whisky', price: 0 },
];

export const PriceIsRight: React.FC<PriceIsRightProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [items, setItems] = useState(DEFAULT_ITEMS.map(i => ({ ...i })));
  const [setupDone, setSetupDone] = useState(false);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, number>>({});
  const [playerIdx, setPlayerIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});
  const [totalScores, setTotalScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);

  const currentItem = items[currentItemIdx];
  const currentPlayer = alivePlayers[playerIdx];

  const handleSetupItem = (idx: number, price: number) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], price };
    setItems(newItems);
  };

  const handleStartGame = () => {
    if (items.every(i => i.price > 0)) {
      setSetupDone(true);
    }
  };

  const handleSubmitGuess = () => {
    const val = parseFloat(currentInput);
    if (isNaN(val) || val <= 0) return;
    const newGuesses = { ...guesses, [currentPlayer.id]: val };
    setGuesses(newGuesses);
    setCurrentInput('');

    if (playerIdx < alivePlayers.length - 1) {
      setPlayerIdx(playerIdx + 1);
    } else {
      const price = currentItem.price;
      // Closest without going over wins
      const valid = Object.entries(newGuesses)
        .filter(([, g]) => g <= price)
        .sort((a, b) => b[1] - a[1]);

      const qScores: Record<string, number> = {};
      if (valid.length > 0) {
        valid.forEach(([id], i) => {
          qScores[id] = Math.max(0, 4 - i);
        });
      } else {
        // All over — closest to price wins (even over)
        const sorted = Object.entries(newGuesses)
          .sort((a, b) => Math.abs(a[1] - price) - Math.abs(b[1] - price));
        sorted.forEach(([id], i) => {
          qScores[id] = Math.max(0, 3 - i);
        });
      }

      setRoundScores(qScores);
      const newTotal = { ...totalScores };
      Object.entries(qScores).forEach(([id, s]) => {
        newTotal[id] = (newTotal[id] || 0) + s;
      });
      setTotalScores(newTotal);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (currentItemIdx + 1 >= items.length) {
      setGameOver(true);
    } else {
      setCurrentItemIdx(currentItemIdx + 1);
      setGuesses({});
      setPlayerIdx(0);
      setShowResult(false);
    }
  };

  if (!setupDone) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>The Price Is Right</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Host: enter the real prices</p>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
              <span className="flex-1 text-sm" style={{ color: 'var(--ink)' }}>{item.name}</span>
              <input type="number" placeholder="£ price"
                value={item.price || ''}
                onChange={(e) => handleSetupItem(i, parseFloat(e.target.value) || 0)}
                className="w-24 text-right text-sm"
              />
            </div>
          ))}
        </div>
        <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleStartGame}
          disabled={!items.every(i => i.price > 0)}>
          Start Game ▶
        </button>
      </div>
    );
  }

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(totalScores, alivePlayers);
    const top = Object.entries(totalScores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Come On Down!</h2>
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
            moduleId: 'price_is_right',
            summary: topPlayer ? `${topPlayer.name} knows their prices!` : 'No one bid right!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (showResult) {
    const price = currentItem.price;
    const sorted = Object.entries(guesses)
      .map(([id, g]) => ({ id, guess: g }))
      .sort((a, b) => {
        const aValid = a.guess <= price;
        const bValid = b.guess <= price;
        if (aValid && !bValid) return -1;
        if (!aValid && bValid) return 1;
        return b.guess - a.guess;
      });

    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <h3 className="font-display text-xl font-bold text-center" style={{ color: 'var(--flame)' }}>
          {currentItem.name}
        </h3>
        <p className="text-center text-3xl font-bold" style={{ color: 'var(--flame-hi)' }}>
          £{price.toLocaleString()}
        </p>
        <div className="space-y-2">
          {sorted.map((item, rank) => {
            const p = alivePlayers.find(p => p.id === item.id);
            const over = item.guess > price;
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-raise)', border: `1px solid ${over ? 'rgba(181,64,46,0.3)' : rank === 0 ? 'rgba(232,163,61,0.4)' : 'rgba(182,168,146,0.15)'}` }}>
                <span className="flex-1" style={{ color: 'var(--ink)' }}>{p?.name}</span>
                <span style={{ color: over ? 'var(--ember)' : 'var(--ink)' }}>
                  £{item.guess.toLocaleString()} {over ? '(OVER)' : ''}
                </span>
                <span className="font-bold" style={{ color: 'var(--flame)' }}>
                  +{roundScores[item.id] || 0}
                </span>
              </div>
            );
          })}
        </div>
        <button className="w-full py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleNext}>
          {currentItemIdx + 1 < items.length ? 'Next Item →' : 'See Final Scores'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
          Item {currentItemIdx + 1}/{items.length}
        </h2>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          {currentPlayer?.name}'s bid
        </span>
      </div>

      <div className="rounded-xl p-6 text-center"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <p className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>{currentItem.name}</p>
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Closest without going over wins!</p>
      </div>

      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        Bids in: {Object.keys(guesses).map(id => alivePlayers.find(p => p.id === id)?.name).join(', ')}
      </p>

      <div className="flex gap-2">
        <span className="flex items-center px-3 font-bold" style={{ color: 'var(--flame)' }}>£</span>
        <input type="number" min={0} value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuess()}
          placeholder="Enter bid..."
          className="flex-1 text-lg text-center"
        />
        <button className="px-5 py-2 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmitGuess} disabled={!currentInput}>
          Bid!
        </button>
      </div>
    </div>
  );
};
