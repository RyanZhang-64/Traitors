import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { gameRegistry } from '../games';
import { Scheduler } from '../services/Scheduler';

export const Hub: React.FC = () => {
  const store = useStore();
  const { players, scheduler, menu, setMenu, rerollMenu, setActiveGame, advanceChooserQueue } = store;

  const [offered, setOffered] = useState<typeof gameRegistry>([]);

  useEffect(() => {
    advanceChooserQueue();
    if (!menu || menu.offered.length === 0) {
      const state = useStore.getState();
      const curated = Scheduler.curateMenu(gameRegistry, state);
      const ids = curated.map((m) => m.id);
      setMenu(ids);
      setOffered(curated);
    } else {
      const modules = menu.offered
        .map((id) => gameRegistry.find((m) => m.id === id))
        .filter(Boolean) as typeof gameRegistry;
      setOffered(modules);
    }
  }, []);

  const chooser = players.find((p) => p.id === scheduler.currentChooser);

  const handleChoose = (moduleId: string) => {
    setActiveGame(moduleId, 'medium');
  };

  const handleReroll = () => {
    if (menu?.rerollUsed) return;
    const state = useStore.getState();
    const curated = Scheduler.curateMenu(gameRegistry, state);
    const ids = curated.map((m) => m.id);
    rerollMenu(ids);
    setOffered(curated);
  };

  const handleHostPick = () => {
    if (offered.length > 0) {
      const random = offered[Math.floor(Math.random() * offered.length)];
      handleChoose(random.id);
    }
  };

  const typeIcons: Record<string, string> = {
    deduction: '🔍',
    trivia: '❓',
    word: '📝',
    estimation: '📊',
    creative: '🎨',
    memory: '🧠',
    reflex: '⚡',
    social: '👥',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8 stage-enter">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Choose the next challenge</p>
          <h2
            className="font-display text-3xl font-bold"
            style={{ color: 'var(--ink)' }}
          >
            {chooser ? chooser.name : 'Host'}, your turn
          </h2>
        </div>

        {/* Game cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {offered.map((module) => (
            <button
              key={module.id}
              className="p-4 rounded-xl text-left transition-all hover:scale-105 hover:shadow-lg group"
              style={{
                backgroundColor: 'var(--bg-raise)',
                border: '1px solid rgba(182,168,146,0.2)',
              }}
              onClick={() => handleChoose(module.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{typeIcons[module.type] || '🎮'}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(182,168,146,0.1)', color: 'var(--muted)' }}
                >
                  ~{module.estMinutes}m
                </span>
              </div>
              <h3
                className="font-display text-xl font-bold mb-1 group-hover:text-[var(--flame)] transition-colors"
                style={{ color: 'var(--ink)' }}
              >
                {module.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {module.tagline}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{
                    backgroundColor: 'rgba(182,168,146,0.08)',
                    color: 'var(--muted)',
                    border: '1px solid rgba(182,168,146,0.15)',
                  }}
                >
                  {module.type}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{
                    backgroundColor: module.energy === 'high' ? 'rgba(232,163,61,0.1)' : 'rgba(111,143,106,0.1)',
                    color: module.energy === 'high' ? 'var(--flame)' : 'var(--sage)',
                  }}
                >
                  {module.energy} energy
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Reroll + host pick */}
        <div className="flex justify-center gap-4">
          <button
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-30"
            style={{
              backgroundColor: 'var(--bg-raise)',
              color: 'var(--muted)',
              border: '1px solid rgba(182,168,146,0.2)',
            }}
            onClick={handleReroll}
            disabled={menu?.rerollUsed}
          >
            Reroll the table ↻{menu?.rerollUsed ? ' (used)' : ''}
          </button>
          <button
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: 'rgba(142,36,51,0.15)',
              color: 'var(--muted)',
              border: '1px solid rgba(142,36,51,0.2)',
            }}
            onClick={handleHostPick}
          >
            Host picks ▶
          </button>
        </div>
      </div>
    </div>
  );
};
