import React from 'react';
import type { GameResult } from '../store/useStore';

interface ZoomedInProps {
  onComplete: (result: GameResult) => void;
}

export const ZoomedIn: React.FC<ZoomedInProps> = ({ onComplete }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 min-h-64">
      <div className="text-5xl">🔍</div>
      <h2 className="font-display text-3xl font-bold text-center" style={{ color: 'var(--flame)' }}>Zoomed-In</h2>
      <div className="rounded-xl p-5 text-center max-w-sm"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <p className="text-base" style={{ color: 'var(--ink)' }}>
          This game requires image media files that are not included in this build.
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
          To play: host displays zoomed-in images on a separate screen and players call out what they see.
        </p>
      </div>
      <button className="px-8 py-3 rounded-xl font-bold"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={() => onComplete({
          moduleId: 'zoomed_in',
          summary: 'Zoomed-In played (no media mode)',
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
