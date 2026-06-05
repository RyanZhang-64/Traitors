import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { drawCards } from '../data/drawCards';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface QuickDrawProps {
  onComplete: (result: GameResult) => void;
}

export const QuickDraw: React.FC<QuickDrawProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawerIdx, setDrawerIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundsDone, setRoundsDone] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'drawing'>('setup');
  const [cardQueue] = useState([...drawCards].sort(() => Math.random() - 0.5));

  const MAX_ROUNDS = alivePlayers.length * 2;
  const drawer = alivePlayers[drawerIdx % alivePlayers.length];
  const currentCard = cardQueue[cardIdx % cardQueue.length];

  useEffect(() => {
    if (!timerActive || phase !== 'drawing') return;
    if (timeLeft <= 0) {
      endRound();
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, phase]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setDrawing(true);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const continueDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#F3E9D6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const endRound = () => {
    setTimerActive(false);
    setPhase('setup');
  };

  const handleCorrectGuesser = (id: string) => {
    setScores(s => ({ ...s, [id]: (s[s.length || id] || 0) + 1, [drawer.id]: (s[drawer.id] || 0) + 1 }));
    const newRound = roundsDone + 1;
    setRoundsDone(newRound);
    if (newRound >= MAX_ROUNDS) {
      setGameOver(true);
    } else {
      setDrawerIdx(drawerIdx + 1);
      setCardIdx(cardIdx + 1);
      clearCanvas();
      setPhase('setup');
      setTimeLeft(60);
    }
  };

  const handleSkip = () => {
    const newRound = roundsDone + 1;
    setRoundsDone(newRound);
    if (newRound >= MAX_ROUNDS) {
      setGameOver(true);
    } else {
      setDrawerIdx(drawerIdx + 1);
      setCardIdx(cardIdx + 1);
      clearCanvas();
      setPhase('setup');
      setTimeLeft(60);
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Drawing Done!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0} pts {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'quick_draw',
            summary: topPlayer ? `${topPlayer.name} drew and guessed best!` : 'No Picassos here!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Quick Draw</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Round {roundsDone + 1}/{MAX_ROUNDS}</p>
        </div>

        <div className="text-center rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Drawer:</p>
          <p className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>{drawer?.name}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            Pass to {drawer?.name} — others turn away!
          </p>
        </div>

        <div className="rounded-xl p-5 text-center"
          style={{ backgroundColor: 'rgba(142,36,51,0.15)', border: '2px solid rgba(142,36,51,0.4)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--crimson)' }}>DRAW THIS (secret!):</p>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ember)' }}>{currentCard}</p>
        </div>

        <button className="w-full py-4 rounded-xl font-display text-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => { setPhase('drawing'); setTimerActive(true); }}>
          Start Drawing! ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{drawer?.name} is drawing...</p>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
          style={{
            backgroundColor: timeLeft <= 10 ? 'rgba(181,64,46,0.3)' : 'rgba(232,163,61,0.2)',
            color: timeLeft <= 10 ? 'var(--ember)' : 'var(--flame)',
            border: `2px solid ${timeLeft <= 10 ? 'var(--ember)' : 'var(--flame)'}`,
          }}>
          {timeLeft}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={260}
        className="rounded-xl w-full touch-none"
        style={{ backgroundColor: '#1F1A15', border: '2px solid rgba(232,163,61,0.3)', cursor: 'crosshair' }}
        onMouseDown={startDraw}
        onMouseMove={continueDraw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={continueDraw}
        onTouchEnd={stopDraw}
      />

      <button className="w-full py-1.5 text-sm rounded-lg"
        style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
        onClick={clearCanvas}>
        Clear canvas
      </button>

      <p className="text-sm text-center font-bold" style={{ color: 'var(--ink)' }}>Who guessed it?</p>
      <div className="grid grid-cols-2 gap-2">
        {alivePlayers.filter(p => p.id !== drawer?.id).map((p) => (
          <button key={p.id}
            className="py-2.5 rounded-xl font-bold transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(111,143,106,0.3)', color: 'var(--sage)', border: '1px solid var(--sage)' }}
            onClick={() => handleCorrectGuesser(p.id)}>
            ✓ {p.name}
          </button>
        ))}
      </div>
      <button className="w-full py-2 text-sm rounded-lg"
        style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
        onClick={handleSkip}>
        Nobody guessed — next round
      </button>
    </div>
  );
};
