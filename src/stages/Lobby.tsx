import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Persistence } from '../services/Persistence';

export const Lobby: React.FC = () => {
  const { players, addPlayer, removePlayer, setConfig, config, setStage, loadSession, resetSession } = useStore();
  const [nameInput, setNameInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const canBegin = players.length >= 6;

  const handleAdd = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || players.length >= 10) return;
    if (players.find((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return;
    addPlayer(trimmed);
    setNameInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleBegin = () => {
    setStage('onboarding');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await Persistence.importFromFile(file);
      loadSession(data);
    } catch {
      // silent fail
    }
  };

  const handleExport = () => {
    const state = Persistence.load();
    if (state) {
      Persistence.exportToFile(JSON.parse(state));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-12 pb-8 stage-enter">
      {/* Title */}
      <div className="text-center mb-10">
        <h1
          className="font-display text-6xl font-bold tracking-[0.15em] candle-flicker"
          style={{
            color: 'var(--flame)',
            textShadow: '0 0 30px rgba(232,163,61,0.6), 0 0 60px rgba(232,163,61,0.3)',
          }}
        >
          THE TRAITORS
        </h1>
        <p className="mt-3 text-base tracking-widest" style={{ color: 'var(--muted)' }}>
          A party game of deception &amp; deduction
        </p>
        <div className="mt-2 w-32 h-px mx-auto" style={{ backgroundColor: 'var(--flame)', opacity: 0.3 }} />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Player list */}
        <div className="space-y-3">
          <h2 className="font-display text-xl" style={{ color: 'var(--ink)' }}>
            Players ({players.length}/10)
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter player name..."
              className="flex-1"
              maxLength={20}
              disabled={players.length >= 10}
            />
            <button
              className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 disabled:opacity-40"
              style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
              onClick={handleAdd}
              disabled={!nameInput.trim() || players.length >= 10}
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {players.map((p) => (
              <div
                key={p.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm chip-reveal"
                style={{
                  backgroundColor: 'var(--bg-raise)',
                  border: '1px solid rgba(232,163,61,0.3)',
                  color: 'var(--ink)',
                }}
              >
                {p.name}
                <button
                  className="w-4 h-4 rounded-full flex items-center justify-center text-xs hover:bg-[rgba(142,36,51,0.4)] transition-all"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => removePlayer(p.id)}
                >
                  ×
                </button>
              </div>
            ))}
            {players.length < 6 && (
              <span className="text-xs self-center" style={{ color: 'var(--muted)' }}>
                {6 - players.length} more needed to begin
              </span>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h2 className="font-display text-xl" style={{ color: 'var(--ink)' }}>Settings</h2>

          {/* Length */}
          <div className="space-y-2">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>Night length</label>
            <div className="flex gap-2">
              {[150, 180].map((mins) => (
                <button
                  key={mins}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: config.targetMinutes === mins ? 'var(--flame)' : 'var(--bg-raise)',
                    color: config.targetMinutes === mins ? '#14110E' : 'var(--muted)',
                    border: `1px solid ${config.targetMinutes === mins ? 'var(--flame)' : 'rgba(182,168,146,0.2)'}`,
                  }}
                  onClick={() => setConfig({ targetMinutes: mins })}
                >
                  {mins === 150 ? '2½ hours' : '3 hours'}
                </button>
              ))}
            </div>
          </div>

          {/* Chooser policy */}
          <div className="space-y-2">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>Challenge chooser</label>
            <div className="flex gap-2">
              {(['rotation', 'winner', 'vote'] as const).map((policy) => (
                <button
                  key={policy}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                  style={{
                    backgroundColor: config.chooserPolicy === policy ? 'var(--flame)' : 'var(--bg-raise)',
                    color: config.chooserPolicy === policy ? '#14110E' : 'var(--muted)',
                    border: `1px solid ${config.chooserPolicy === policy ? 'var(--flame)' : 'rgba(182,168,146,0.2)'}`,
                  }}
                  onClick={() => setConfig({ chooserPolicy: policy })}
                >
                  {policy}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>Game mode</label>
            <div className="flex gap-2">
              {(['traitors', 'party'] as const).map((mode) => (
                <button
                  key={mode}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                  style={{
                    backgroundColor: config.mode === mode ? 'var(--flame)' : 'var(--bg-raise)',
                    color: config.mode === mode ? '#14110E' : 'var(--muted)',
                    border: `1px solid ${config.mode === mode ? 'var(--flame)' : 'rgba(182,168,146,0.2)'}`,
                  }}
                  onClick={() => setConfig({ mode })}
                >
                  {mode === 'traitors' ? 'The Traitors' : 'Party Mode'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            className="w-full py-4 rounded-xl font-display text-xl font-bold tracking-widest transition-all disabled:opacity-30"
            style={{
              backgroundColor: canBegin ? 'var(--flame)' : 'rgba(182,168,146,0.1)',
              color: canBegin ? '#14110E' : 'var(--muted)',
              boxShadow: canBegin ? '0 0 30px rgba(232,163,61,0.4)' : 'none',
            }}
            onClick={handleBegin}
            disabled={!canBegin}
          >
            Begin the Night ▶
          </button>

          <div className="flex gap-2">
            <button
              className="flex-1 py-2 rounded-lg text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-raise)',
                color: 'var(--muted)',
                border: '1px solid rgba(182,168,146,0.2)',
              }}
              onClick={() => fileRef.current?.click()}
            >
              Import Session
            </button>
            <button
              className="flex-1 py-2 rounded-lg text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-raise)',
                color: 'var(--muted)',
                border: '1px solid rgba(182,168,146,0.2)',
              }}
              onClick={handleExport}
            >
              Export Session
            </button>
            <button
              className="flex-1 py-2 rounded-lg text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: 'rgba(142,36,51,0.15)',
                color: 'var(--crimson)',
                border: '1px solid rgba(142,36,51,0.3)',
              }}
              onClick={resetSession}
            >
              Reset
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>
    </div>
  );
};
