import React, { useEffect, useState } from 'react';

interface CountdownRingProps {
  totalSeconds: number;
  onExpire?: () => void;
  size?: number;
  strokeWidth?: number;
  color?: string;
  paused?: boolean;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  totalSeconds,
  onExpire,
  size = 80,
  strokeWidth = 6,
  color = 'var(--flame)',
  paused = false,
}) => {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining, paused, onExpire]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  const isLow = remaining <= totalSeconds * 0.25;
  const displayColor = isLow ? 'var(--ember)' : color;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${secs}s`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(182,168,146,0.15)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={displayColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s ease' }}
        />
      </svg>
      <span
        className={`absolute text-xs font-bold font-mono ${isLow ? 'text-[var(--ember)]' : ''}`}
        style={{ color: isLow ? 'var(--ember)' : 'var(--ink)' }}
      >
        {display}
      </span>
    </div>
  );
};
