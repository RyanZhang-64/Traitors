import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { PlayerChip } from './PlayerChip';
import { HostToolbar } from './HostToolbar';

export const HUD: React.FC = () => {
  const { stage, players, scheduler, config, hostMode, conclave } = useStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!scheduler.startedAt) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - scheduler.startedAt) / 60000));
    }, 10000);
    setElapsed(Math.floor((Date.now() - scheduler.startedAt) / 60000));
    return () => clearInterval(interval);
  }, [scheduler.startedAt]);

  if (stage === 'lobby' || stage === 'onboarding') return null;

  const topPlayers = [...players]
    .filter((p) => p.status !== 'out')
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 4);

  const chooser = players.find((p) => p.id === scheduler.currentChooser);

  const targetMins = config.targetMinutes;
  const elapsedH = Math.floor(elapsed / 60);
  const elapsedM = elapsed % 60;
  const targetH = Math.floor(targetMins / 60);
  const targetM = targetMins % 60;
  const elapsedStr = elapsedH > 0 ? `${elapsedH}:${elapsedM.toString().padStart(2, '0')}` : `${elapsedM}m`;
  const targetStr = targetH > 0 ? `${targetH}:${targetM.toString().padStart(2, '0')}` : `${targetM}m`;

  const pct = targetMins > 0 ? (elapsed / targetMins) * 100 : 0;
  const onTimeLabel = pct < 85 ? '🟢 on-time' : pct < 100 ? '🟡 wrapping' : '🔴 over';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex flex-col"
      style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid rgba(182,168,146,0.15)' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between px-3 py-1.5 text-xs">
        <span className="font-display text-base font-bold tracking-widest candle-flicker" style={{ color: 'var(--flame)' }}>
          THE TRAITORS
        </span>
        <span style={{ color: 'var(--muted)' }}>
          Act {scheduler.actNumber} · {elapsedStr} / ~{targetStr} <span style={{ color: pct < 85 ? 'var(--sage)' : pct < 100 ? 'var(--flame)' : 'var(--ember)' }}>{onTimeLabel}</span>
        </span>
        <HostToolbar />
      </div>

      {/* Middle: leaderboard + chooser */}
      <div className="flex items-center justify-between px-3 pb-1.5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {topPlayers.map((p, i) => (
            <span key={p.id} style={{ color: i === 0 ? 'var(--flame-hi)' : 'var(--ink)' }}>
              <span style={{ color: 'var(--muted)' }}>{i === 0 ? '🔥' : ''}</span>
              {p.name} <span style={{ color: 'var(--flame)' }}>{p.coins}</span>
            </span>
          ))}
        </div>
        {chooser && (
          <span style={{ color: 'var(--muted)' }}>
            Chooser ▶ <span style={{ color: 'var(--ink)' }}>{chooser.name}</span>
          </span>
        )}
      </div>

      {/* Bottom row: player chips */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 overflow-x-auto"
        style={{ borderTop: '1px solid rgba(182,168,146,0.08)' }}
      >
        {players.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 flex-shrink-0 transition-all ${
              p.status === 'ghost' || p.status === 'out' ? 'opacity-40' : 'opacity-100'
            }`}
            style={{
              backgroundColor: 'var(--bg-raise)',
              border: `1px solid ${
                p.id === scheduler.currentChooser
                  ? 'var(--flame)'
                  : 'rgba(182,168,146,0.15)'
              }`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  p.status === 'ghost' || p.status === 'out'
                    ? 'var(--muted)'
                    : p.status === 'active'
                    ? 'var(--sage)'
                    : 'var(--flame)',
              }}
            />
            <span style={{ color: p.status === 'ghost' ? 'var(--muted)' : 'var(--ink)' }}>
              {p.name}
            </span>
            {hostMode && (
              <span style={{ color: 'var(--muted)' }}>
                {p.suspicion > 0 && `${p.suspicion}%`}
              </span>
            )}
            {p.shields > 0 && (
              <span style={{ color: 'var(--sage)', fontSize: '10px' }}>🛡</span>
            )}
          </div>
        ))}
        <span className="flex-1" />
        <div className="flex gap-1 text-xs" style={{ color: 'var(--muted)' }}>
          <span>{conclave.aliveIds.length} alive</span>
          {conclave.ghostIds.length > 0 && (
            <span>· {conclave.ghostIds.length} ghost</span>
          )}
        </div>
      </div>
    </div>
  );
};
