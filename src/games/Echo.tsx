import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface EchoProps {
  onComplete: (result: GameResult) => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_STYLES: Record<string, { bg: string; active: string; border: string }> = {
  red: { bg: 'rgba(181,64,46,0.2)', active: 'rgba(181,64,46,0.8)', border: 'var(--ember)' },
  blue: { bg: 'rgba(74,139,181,0.2)', active: 'rgba(74,139,181,0.8)', border: '#4A8BB5' },
  green: { bg: 'rgba(111,143,106,0.2)', active: 'rgba(111,143,106,0.8)', border: 'var(--sage)' },
  yellow: { bg: 'rgba(232,163,61,0.2)', active: 'rgba(232,163,61,0.8)', border: 'var(--flame)' },
};
const COLOR_EMOJIS: Record<string, string> = { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' };

export const Echo: React.FC<EchoProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [phase, setPhase] = useState<'watch' | 'repeat' | 'between'>('between');
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(0);
  const [playingSequenceIdx, setPlayingSequenceIdx] = useState(-1);

  const activePlayers = alivePlayers.filter(p => !eliminated.includes(p.id));
  const currentPlayer = activePlayers[playerIdx % Math.max(1, activePlayers.length)];
  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => { pendingTimers.current.forEach(clearTimeout); }, []);

  const startNewRound = () => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newSeq = [...sequence, newColor];
    setSequence(newSeq);
    setPlayerSequence([]);
    setPhase('watch');
    setRound(r => r + 1);
    playSequence(newSeq);
  };

  const playSequence = (seq: string[]) => {
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
    let delay = 600;
    seq.forEach((color, i) => {
      pendingTimers.current.push(setTimeout(() => {
        setActiveColor(color);
        setPlayingSequenceIdx(i);
      }, delay));
      pendingTimers.current.push(setTimeout(() => {
        setActiveColor(null);
        setPlayingSequenceIdx(-1);
      }, delay + 500));
      delay += 800;
    });
    pendingTimers.current.push(setTimeout(() => {
      setPhase('repeat');
      setActiveColor(null);
    }, delay));
  };

  const handleColorPress = (color: string) => {
    if (phase !== 'repeat') return;
    const newSeq = [...playerSequence, color];
    setPlayerSequence(newSeq);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 300);

    if (newSeq[newSeq.length - 1] !== sequence[newSeq.length - 1]) {
      // Wrong!
      handleWrong();
      return;
    }

    if (newSeq.length === sequence.length) {
      // Correct!
      setScores(s => ({ ...s, [currentPlayer.id]: (s[currentPlayer.id] || 0) + 1 }));
      setPhase('between');
      if (activePlayers.length - eliminated.length > 1) {
        setPlayerIdx(p => (p + 1) % activePlayers.length);
        setTimeout(startNewRound, 1000);
      } else {
        setGameOver(true);
      }
    }
  };

  const handleWrong = () => {
    const newElim = [...eliminated, currentPlayer.id];
    setEliminated(newElim);
    const remaining = activePlayers.filter(p => !newElim.includes(p.id));
    if (remaining.length <= 1) {
      setGameOver(true);
      return;
    }
    setPlayerSequence([]);
    setPhase('between');
    setPlayerIdx(p => (p + 1) % remaining.length);
    setTimeout(startNewRound, 1500);
  };

  if (gameOver) {
    const winner = activePlayers.filter(p => !eliminated.includes(p.id))[0];
    const finalScores = { ...scores };
    if (winner) finalScores[winner.id] = (finalScores[winner.id] || 0) + 3;
    const coinDeltas = ScoreService.computeCoinDeltas(finalScores, alivePlayers);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Echo Ends!</h2>
        {winner && <p className="text-xl" style={{ color: 'var(--ink)' }}>{winner.name} survives!</p>}
        <div className="w-full max-w-sm space-y-2">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: eliminated.includes(p.id) ? 'var(--muted)' : 'var(--ink)' }}>
                {p.name} {eliminated.includes(p.id) ? '(out)' : ''}
              </span>
              <span style={{ color: 'var(--flame)' }}>
                {finalScores[p.id] || 0} {coinDeltas[p.id] ? `+${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'echo',
            summary: winner ? `${winner.name} memorised the longest sequence!` : 'Everyone failed Echo!',
            coinDeltas: ScoreService.computeCoinDeltas(finalScores, alivePlayers),
            shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Echo</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {phase === 'watch' ? 'Watch the sequence!' : phase === 'repeat' ? `${currentPlayer?.name} — repeat!` : 'Get ready...'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Round {round} · Sequence: {sequence.map(c => COLOR_EMOJIS[c]).join('')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto w-full">
        {COLORS.map(color => (
          <button key={color}
            className="aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all"
            style={{
              backgroundColor: activeColor === color ? COLOR_STYLES[color].active : COLOR_STYLES[color].bg,
              border: `3px solid ${activeColor === color ? COLOR_STYLES[color].border : 'rgba(182,168,146,0.2)'}`,
              transform: activeColor === color ? 'scale(1.1)' : 'scale(1)',
              boxShadow: activeColor === color ? `0 0 20px ${COLOR_STYLES[color].border}` : 'none',
              cursor: phase === 'repeat' ? 'pointer' : 'default',
            }}
            onClick={() => handleColorPress(color)}
            disabled={phase !== 'repeat'}>
            {COLOR_EMOJIS[color]}
          </button>
        ))}
      </div>

      {phase === 'between' && sequence.length === 0 && (
        <button className="w-full py-4 rounded-xl font-display text-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={startNewRound}>
          Start Echo! ▶
        </button>
      )}

      {phase === 'repeat' && (
        <div>
          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            Progress: {playerSequence.map(c => COLOR_EMOJIS[c]).join('')}
            {Array(sequence.length - playerSequence.length).fill('⚫').join('')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {alivePlayers.map((p) => (
          <span key={p.id} className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: eliminated.includes(p.id) ? 'rgba(182,168,146,0.05)' : p.id === currentPlayer?.id ? 'rgba(232,163,61,0.2)' : 'var(--bg-raise)',
              color: eliminated.includes(p.id) ? 'var(--muted)' : p.id === currentPlayer?.id ? 'var(--flame)' : 'var(--muted)',
              textDecoration: eliminated.includes(p.id) ? 'line-through' : 'none',
            }}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
};
