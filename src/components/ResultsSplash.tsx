import React, { useEffect, useState } from 'react';
import type { Player } from '../store/useStore';
import type { GameResult } from '../store/useStore';

interface ResultsSplashProps {
  result: GameResult;
  players: Player[];
  onContinue: () => void;
}

export const ResultsSplash: React.FC<ResultsSplashProps> = ({ result, players, onContinue }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(t);
  }, []);

  const sortedDeltas = Object.entries(result.coinDeltas)
    .filter(([, delta]) => delta > 0)
    .sort(([, a], [, b]) => b - a);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(20,17,14,0.95)' }}
    >
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-700 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h2 className="font-display text-4xl font-bold candle-flicker" style={{ color: 'var(--flame)' }}>
          {result.summary}
        </h2>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {sortedDeltas.map(([id, delta], i) => {
            const player = getPlayer(id);
            if (!player) return null;
            return (
              <div
                key={id}
                className="chip-reveal flex items-center justify-between p-3 rounded-lg"
                style={{
                  animationDelay: `${i * 200}ms`,
                  backgroundColor: 'var(--bg-raise)',
                  border: `1px solid rgba(182,168,146,0.2)`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: 'var(--flame)' }}>
                    #{i + 1}
                  </span>
                  <span style={{ color: 'var(--ink)' }}>{player.name}</span>
                </div>
                <span className="font-bold text-lg" style={{ color: 'var(--flame-hi)' }}>
                  +{delta} coins
                </span>
              </div>
            );
          })}
        </div>

        {result.tells.length > 0 && (
          <div className="text-sm text-center max-w-sm" style={{ color: 'var(--muted)' }}>
            <span className="font-bold" style={{ color: 'var(--flame)' }}>Tell: </span>
            {result.tells[0]}
          </div>
        )}

        <button
          className="mt-4 px-8 py-3 rounded-lg font-bold text-base transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={onContinue}
        >
          Continue ▶
        </button>
      </div>
    </div>
  );
};
