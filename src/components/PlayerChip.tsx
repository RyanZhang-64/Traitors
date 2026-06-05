import React from 'react';
import type { Player } from '../store/useStore';

interface PlayerChipProps {
  player: Player;
  showSuspicion?: boolean;
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
}

function getAvatarColor(seed: string): string {
  const colors = ['#8E2433', '#6F8F6A', '#E8A33D', '#5B7FA6', '#8B6DB0', '#C45C2B', '#4A8B8B'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export const PlayerChip: React.FC<PlayerChipProps> = ({
  player,
  showSuspicion = false,
  showRole = false,
  size = 'md',
  onClick,
  selected = false,
}) => {
  const isGhost = player.status === 'ghost' || player.status === 'out';
  const avatarColor = getAvatarColor(player.avatarSeed);

  const sizeClasses = {
    sm: 'text-xs p-1',
    md: 'text-sm p-2',
    lg: 'text-base p-3',
  };

  const avatarSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg border transition-all cursor-pointer
        ${sizeClasses[size]}
        ${isGhost ? 'opacity-40 grayscale' : 'opacity-100'}
        ${selected
          ? 'border-[var(--flame)] bg-[var(--bg-raise)] shadow-[0_0_12px_rgba(232,163,61,0.4)]'
          : 'border-[rgba(182,168,146,0.2)] bg-[var(--bg-raise)] hover:border-[rgba(182,168,146,0.4)]'
        }
        ${player.status === 'active' ? 'pulse-glow' : ''}
      `}
      onClick={onClick}
    >
      <div
        className={`${avatarSizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
        style={{ backgroundColor: avatarColor }}
      >
        {getInitials(player.name)}
      </div>

      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate" style={{ color: 'var(--ink)' }}>
          {player.name}
        </span>
        {showRole && (
          <span
            className="text-xs font-bold"
            style={{ color: player.role === 'traitor' ? 'var(--ember)' : 'var(--sage)' }}
          >
            {player.role === 'traitor' ? 'TRAITOR' : 'FAITHFUL'}
          </span>
        )}
        {isGhost && (
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Ghost</span>
        )}
      </div>

      {showSuspicion && !isGhost && (
        <div className="flex flex-col items-end gap-1">
          <div className="w-12 h-1.5 rounded-full bg-[rgba(182,168,146,0.2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${player.suspicion}%`,
                backgroundColor: player.suspicion > 60 ? 'var(--ember)' : player.suspicion > 30 ? 'var(--flame)' : 'var(--sage)',
              }}
            />
          </div>
        </div>
      )}

      {player.coins > 0 && (
        <span className="text-xs font-bold ml-1" style={{ color: 'var(--flame)' }}>
          {player.coins}
        </span>
      )}

      {player.shields > 0 && (
        <span className="text-xs ml-1" style={{ color: 'var(--sage)' }}>
          {'🛡'.repeat(player.shields)}
        </span>
      )}
    </div>
  );
};
