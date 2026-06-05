import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export const Intermission: React.FC = () => {
  const { players, conclave, history, markIntermissionDone, setStage, scheduler } = useStore();
  const [countdown, setCountdown] = useState(300);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [started, countdown]);

  const sortedPlayers = [...players]
    .filter((p) => p.status !== 'out')
    .sort((a, b) => b.coins - a.coins);

  const traitorCount = players.filter((p) => p.role === 'traitor' && conclave.aliveIds.includes(p.id)).length;
  const banished = players.filter((p) => p.status === 'ghost');

  const handleResume = () => {
    markIntermissionDone();
    setStage('hub');
  };

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8 stage-enter">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1
            className="font-display text-5xl font-bold candle-flicker"
            style={{ color: 'var(--flame)', textShadow: '0 0 30px rgba(232,163,61,0.4)' }}
          >
            Halftime
          </h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>
            {banished.length} banished · {conclave.aliveIds.length} remain
          </p>
          {scheduler.actNumber < 2 && (
            <p className="mt-1 text-sm italic" style={{ color: 'var(--muted)' }}>
              The shadows grow longer — suspicion runs deep...
            </p>
          )}
        </div>

        {/* League standings */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(182,168,146,0.2)' }}
        >
          <div
            className="px-4 py-3"
            style={{ backgroundColor: 'rgba(232,163,61,0.1)', borderBottom: '1px solid rgba(182,168,146,0.15)' }}
          >
            <h2 className="font-display text-lg" style={{ color: 'var(--flame)' }}>League Standings</h2>
          </div>
          <div className="divide-y divide-[rgba(182,168,146,0.1)]">
            {sortedPlayers.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center px-4 py-3 transition-all ${
                  p.status === 'ghost' ? 'opacity-40' : 'opacity-100'
                }`}
                style={{ backgroundColor: i === 0 ? 'rgba(232,163,61,0.05)' : 'transparent' }}
              >
                <span
                  className="w-6 font-bold text-sm mr-3"
                  style={{ color: i === 0 ? 'var(--flame)' : 'var(--muted)' }}
                >
                  #{i + 1}
                </span>
                <span className="flex-1 font-medium" style={{ color: 'var(--ink)' }}>
                  {p.name}
                  {p.status === 'ghost' && (
                    <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>(ghost)</span>
                  )}
                </span>
                <span className="font-bold" style={{ color: 'var(--flame)' }}>
                  {p.coins}
                </span>
                {p.shields > 0 && (
                  <span className="ml-2 text-sm" style={{ color: 'var(--sage)' }}>🛡{p.shields}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}
          >
            <div className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
              {history.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Games played</div>
          </div>
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}
          >
            <div className="font-display text-2xl font-bold" style={{ color: 'var(--crimson)' }}>
              {banished.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Banished</div>
          </div>
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}
          >
            <div className="font-display text-2xl font-bold" style={{ color: 'var(--sage)' }}>
              {conclave.aliveIds.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Remaining</div>
          </div>
        </div>

        {/* Break timer */}
        {!started ? (
          <button
            className="w-full py-3 rounded-xl font-bold text-base"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={() => setStarted(true)}
          >
            Start 5-Minute Break
          </button>
        ) : (
          <div className="text-center space-y-4">
            <div className="font-display text-5xl font-bold" style={{ color: 'var(--flame)' }}>
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Break in progress...</p>
            <button
              className="w-full py-3 rounded-xl font-bold text-base"
              style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
              onClick={handleResume}
            >
              Resume the Night →
            </button>
          </div>
        )}

        {!started && (
          <button
            className="w-full py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={handleResume}
          >
            Skip break — Resume now
          </button>
        )}
      </div>
    </div>
  );
};
