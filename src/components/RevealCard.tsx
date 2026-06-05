import React, { useState } from 'react';

interface RevealCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  revealed?: boolean;
  onReveal?: () => void;
  width?: string;
  height?: string;
}

export const RevealCard: React.FC<RevealCardProps> = ({
  front,
  back,
  revealed = false,
  onReveal,
  width = '200px',
  height = '280px',
}) => {
  const [flipped, setFlipped] = useState(revealed);

  const handleClick = () => {
    if (!flipped) {
      setFlipped(true);
      onReveal?.();
    }
  };

  return (
    <div
      className="perspective cursor-pointer"
      style={{ width, height }}
      onClick={handleClick}
    >
      <div
        className="preserve-3d relative w-full h-full"
        style={{
          transition: 'transform 0.6s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="backface-hidden absolute inset-0 rounded-xl border flex items-center justify-center"
          style={{
            borderColor: 'rgba(182,168,146,0.3)',
            backgroundColor: 'var(--bg-raise)',
          }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="backface-hidden absolute inset-0 rounded-xl flex items-center justify-center"
          style={{
            transform: 'rotateY(180deg)',
            backgroundColor: 'var(--bg-raise)',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
};

interface RoleCardProps {
  role: 'faithful' | 'traitor';
  onDone: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, onDone }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <RevealCard
      revealed={false}
      onReveal={() => setRevealed(true)}
      width="240px"
      height="340px"
      front={
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="w-16 h-16 rounded-full bg-[rgba(182,168,146,0.1)] flex items-center justify-center text-4xl">
            ?
          </div>
          <p className="font-display text-xl text-center" style={{ color: 'var(--muted)' }}>
            Tap to reveal your role
          </p>
        </div>
      }
      back={
        <div
          className={`flex flex-col items-center gap-6 p-6 w-full h-full rounded-xl border-2 ${
            role === 'traitor' ? 'glow-crimson' : 'glow-sage'
          }`}
          style={{
            borderColor: role === 'traitor' ? 'var(--ember)' : 'var(--sage)',
            backgroundColor: role === 'traitor' ? 'rgba(142,36,51,0.15)' : 'rgba(111,143,106,0.15)',
          }}
        >
          <div className="text-5xl">
            {role === 'traitor' ? '🗡️' : '🛡️'}
          </div>
          <div
            className="font-display text-3xl font-bold tracking-widest"
            style={{ color: role === 'traitor' ? 'var(--ember)' : 'var(--sage)' }}
          >
            {role === 'traitor' ? 'TRAITOR' : 'FAITHFUL'}
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
            {role === 'traitor'
              ? 'Deceive. Survive. Claim the prize.'
              : 'Seek the truth. Banish the traitors.'}
          </p>
          {revealed && (
            <button
              className="mt-4 px-6 py-2 rounded-lg font-bold text-sm"
              style={{
                backgroundColor: role === 'traitor' ? 'var(--ember)' : 'var(--sage)',
                color: 'white',
              }}
              onClick={onDone}
            >
              Got it — pass the screen back
            </button>
          )}
        </div>
      }
    />
  );
};
