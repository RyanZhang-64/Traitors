import React from 'react';
import type { GameResult } from '../store/useStore';

interface NameThatTuneProps {
  onComplete: (result: GameResult) => void;
}

export const NameThatTune: React.FC<NameThatTuneProps> = ({ onComplete }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 min-h-64">
      <div className="text-5xl">🎵</div>
      <h2 className="font-display text-3xl font-bold text-center" style={{ color: 'var(--flame)' }}>Name That Tune</h2>
      <div className="rounded-xl p-5 text-center max-w-sm"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <p className="text-base" style={{ color: 'var(--ink)' }}>
          This game requires audio files that are not included in this build.
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
          To play: host plays song clips through a speaker and players race to name the song and artist.
        </p>
      </div>
      <button className="px-8 py-3 rounded-xl font-bold"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={() => onComplete({
          moduleId: 'name_that_tune',
          summary: 'Name That Tune played (no audio mode)',
          coinDeltas: {},
          shieldsAwarded: {},
          suspicionDeltas: {},
          tells: [],
          timestamp: Date.now(),
        })}>
        Skip ▶
      </button>
    </div>
  );
};
