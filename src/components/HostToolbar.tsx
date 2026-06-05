import React from 'react';
import { useStore } from '../store/useStore';

export const HostToolbar: React.FC = () => {
  const { hostMode, toggleHostMode, scheduler, triggerDouble, setStage, stage } = useStore();

  return (
    <div className="flex items-center gap-2">
      <button
        title="Toggle host mode"
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
        style={{
          backgroundColor: hostMode ? 'var(--flame)' : 'rgba(182,168,146,0.2)',
          color: hostMode ? '#14110E' : 'var(--muted)',
        }}
        onClick={toggleHostMode}
      >
        H
      </button>

      {/* Double coins */}
      {!scheduler.doubleUsed && stage !== 'lobby' && stage !== 'onboarding' && (
        <button
          title="Activate double coins (once per night)"
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
          style={{ backgroundColor: 'rgba(232,163,61,0.2)', color: 'var(--flame)' }}
          onClick={triggerDouble}
        >
          x2
        </button>
      )}

      {/* Skip to round table */}
      {(stage === 'hub' || stage === 'results') && (
        <button
          title="Skip to Round Table"
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
          style={{ backgroundColor: 'rgba(142,36,51,0.2)', color: 'var(--crimson)' }}
          onClick={() => setStage('roundTable')}
        >
          RT
        </button>
      )}

      {/* Skip to finale */}
      {(stage === 'hub' || stage === 'results') && (
        <button
          title="Skip to Finale"
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
          style={{ backgroundColor: 'rgba(142,36,51,0.3)', color: 'var(--ember)' }}
          onClick={() => setStage('finale')}
        >
          FN
        </button>
      )}
    </div>
  );
};
