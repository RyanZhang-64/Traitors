import React from 'react';
import { useStore } from '../store/useStore';
import { Persistence } from '../services/Persistence';

export const Recap: React.FC = () => {
  const { players, history, traitorIds, resetSession, setStage, conclave } = useStore();

  const sortedPlayers = [...players].sort((a, b) => b.coins - a.coins);
  const winner = sortedPlayers[0];

  const traitorWin = traitorIds.some((id) => conclave.aliveIds.includes(id));

  const handleExport = () => {
    const state = { players, history, traitorIds, winner: winner?.name, traitorWin };
    Persistence.exportToFile(state);
  };

  const handleNewNight = () => {
    resetSession();
  };

  const handlePlayAgain = () => {
    const currentPlayers = players.map((p) => p.name);
    resetSession();
    // Re-add same players
    const store = useStore.getState();
    currentPlayers.forEach((name) => store.addPlayer(name));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-20 pb-8 stage-enter overflow-y-auto">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1
            className="font-display text-5xl font-bold candle-flicker"
            style={{ color: 'var(--flame)', textShadow: '0 0 30px rgba(232,163,61,0.5)' }}
          >
            The Night Ends
          </h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>
            {traitorWin ? 'The Traitors claimed victory' : 'The Faithful prevailed'}
          </p>
        </div>

        {/* Crowns */}
        <div className="flex gap-4 justify-center">
          <div
            className="flex-1 p-4 rounded-xl text-center"
            style={{
              backgroundColor: 'rgba(232,163,61,0.1)',
              border: '1px solid rgba(232,163,61,0.3)',
            }}
          >
            <div className="text-3xl mb-2">👑</div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Coin Crown</p>
            <p className="font-display text-xl font-bold mt-1" style={{ color: 'var(--flame)' }}>
              {winner?.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{winner?.coins} coins</p>
          </div>
          <div
            className="flex-1 p-4 rounded-xl text-center"
            style={{
              backgroundColor: traitorWin ? 'rgba(142,36,51,0.15)' : 'rgba(111,143,106,0.15)',
              border: `1px solid ${traitorWin ? 'var(--ember)' : 'var(--sage)'}`,
            }}
          >
            <div className="text-3xl mb-2">{traitorWin ? '🗡️' : '🛡️'}</div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Victory Crown</p>
            <p
              className="font-display text-xl font-bold mt-1"
              style={{ color: traitorWin ? 'var(--ember)' : 'var(--sage)' }}
            >
              {traitorWin ? 'The Traitors' : 'The Faithful'}
            </p>
          </div>
        </div>

        {/* Final standings */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(182,168,146,0.2)' }}
        >
          <div
            className="px-4 py-3"
            style={{ backgroundColor: 'rgba(232,163,61,0.1)', borderBottom: '1px solid rgba(182,168,146,0.15)' }}
          >
            <h2 className="font-display text-lg" style={{ color: 'var(--flame)' }}>Final Standings</h2>
          </div>
          {sortedPlayers.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center px-4 py-3"
              style={{
                borderBottom: '1px solid rgba(182,168,146,0.08)',
                backgroundColor: i === 0 ? 'rgba(232,163,61,0.05)' : 'transparent',
              }}
            >
              <span
                className="w-6 font-bold text-sm mr-3"
                style={{ color: i === 0 ? 'var(--flame)' : 'var(--muted)' }}
              >
                #{i + 1}
              </span>
              <span className="flex-1 font-medium" style={{ color: 'var(--ink)' }}>
                {p.name}
              </span>
              <span
                className="text-xs mr-3 font-bold"
                style={{ color: traitorIds.includes(p.id) ? 'var(--ember)' : 'var(--sage)' }}
              >
                {traitorIds.includes(p.id) ? 'TRAITOR' : 'FAITHFUL'}
              </span>
              <span className="font-bold" style={{ color: 'var(--flame)' }}>
                {p.coins}
              </span>
            </div>
          ))}
        </div>

        {/* Game history */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(182,168,146,0.2)' }}
        >
          <div
            className="px-4 py-3"
            style={{ backgroundColor: 'rgba(232,163,61,0.05)', borderBottom: '1px solid rgba(182,168,146,0.15)' }}
          >
            <h2 className="font-display text-lg" style={{ color: 'var(--ink)' }}>
              {history.length} Games Played
            </h2>
          </div>
          {history.map((result, i) => (
            <div
              key={i}
              className="px-4 py-2 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(182,168,146,0.05)' }}
            >
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                {result.moduleId}
              </span>
              <span className="text-xs" style={{ color: 'var(--ink)' }}>
                {result.summary}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={handlePlayAgain}
          >
            Play Again (Same Players)
          </button>
          <button
            className="flex-1 py-3 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={handleNewNight}
          >
            New Night
          </button>
        </div>
        <button
          className="w-full py-2 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
          onClick={handleExport}
        >
          Export Results
        </button>
      </div>
    </div>
  );
};
