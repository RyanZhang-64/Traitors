import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { garticPrompts } from '../data/wordlist';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface GarticPhoneProps {
  onComplete: (result: GameResult) => void;
}

export const GarticPhone: React.FC<GarticPhoneProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [phase, setPhase] = useState<'write' | 'draw' | 'guess' | 'reveal'>('write');
  const [chain, setChain] = useState<{ type: 'text' | 'drawing'; content: string; author: string }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [playerIdx, setPlayerIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [drawingData, setDrawingData] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingActive, setDrawingActive] = useState(false);

  const prompt = garticPrompts[Math.floor(Math.random() * garticPrompts.length)];
  const currentPlayer = alivePlayers[playerIdx % alivePlayers.length];

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * (canvas.width / rect.width), y: (t.clientY - rect.top) * (canvas.height / rect.height) };
    }
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setDrawingActive(true);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const continueDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingActive) return;
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

  const stopDraw = () => {
    setDrawingActive(false);
    const canvas = canvasRef.current;
    if (canvas) setDrawingData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingData('');
  };

  const handleSubmitText = () => {
    if (!currentInput.trim()) return;
    const newChain = [...chain, { type: 'text' as const, content: currentInput, author: currentPlayer.name }];
    setChain(newChain);
    setCurrentInput('');

    if (playerIdx + 1 >= alivePlayers.length) {
      setGameOver(true);
    } else {
      setPlayerIdx(playerIdx + 1);
      setPhase(chain.length % 2 === 0 ? 'draw' : 'write');
    }
  };

  const handleSubmitDrawing = () => {
    const canvas = canvasRef.current;
    const data = canvas?.toDataURL() || drawingData;
    const newChain = [...chain, { type: 'drawing' as const, content: data, author: currentPlayer.name }];
    setChain(newChain);
    clearCanvas();

    if (playerIdx + 1 >= alivePlayers.length) {
      setGameOver(true);
    } else {
      setPlayerIdx(playerIdx + 1);
      setPhase('write');
    }
  };

  if (gameOver) {
    const scores: Record<string, number> = {};
    alivePlayers.forEach((p, i) => { scores[p.id] = Math.max(0, alivePlayers.length - i); });
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Gartic Phone Complete!</h2>
        <div className="w-full space-y-3 max-h-64 overflow-y-auto">
          {chain.map((item, i) => (
            <div key={i} className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--flame)' }}>{item.author}:</p>
              {item.type === 'text' ? (
                <p className="text-sm" style={{ color: 'var(--ink)' }}>{item.content}</p>
              ) : (
                <img src={item.content} alt="drawing" className="w-full rounded-lg max-h-32 object-contain"
                  style={{ backgroundColor: '#1F1A15' }} />
              )}
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'gartic_phone',
            summary: 'The drawing chain is complete!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'write') {
    const lastItem = chain[chain.length - 1];
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Gartic Phone</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{currentPlayer?.name}: describe what you see</p>
        </div>
        {chain.length === 0 ? (
          <div className="rounded-xl p-4"
            style={{ backgroundColor: 'rgba(142,36,51,0.1)', border: '1px solid rgba(142,36,51,0.3)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--crimson)' }}>STARTING PHRASE (secret!):</p>
            <p className="font-display text-xl" style={{ color: 'var(--ink)' }}>{prompt}</p>
          </div>
        ) : lastItem?.type === 'drawing' ? (
          <div className="rounded-xl overflow-hidden">
            <img src={lastItem.content} alt="drawing" className="w-full max-h-40 object-contain"
              style={{ backgroundColor: '#1F1A15', border: '1px solid rgba(182,168,146,0.2)' }} />
          </div>
        ) : null}
        <textarea value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Describe what you see..."
          className="w-full p-3 rounded-xl resize-none"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.3)', color: 'var(--ink)', height: '80px' }}
        />
        <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmitText} disabled={!currentInput.trim()}>
          Pass to next player →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Gartic Phone</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{currentPlayer?.name}: draw what you read</p>
      </div>
      {chain.length > 0 && chain[chain.length - 1]?.type === 'text' && (
        <div className="rounded-xl p-3"
          style={{ backgroundColor: 'rgba(232,163,61,0.1)', border: '1px solid rgba(232,163,61,0.3)' }}>
          <p className="text-sm" style={{ color: 'var(--ink)' }}>"{chain[chain.length - 1].content}"</p>
        </div>
      )}
      <canvas ref={canvasRef} width={400} height={200}
        className="rounded-xl w-full touch-none"
        style={{ backgroundColor: '#1F1A15', border: '2px solid rgba(232,163,61,0.3)', cursor: 'crosshair' }}
        onMouseDown={startDraw} onMouseMove={continueDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={continueDraw} onTouchEnd={stopDraw}
      />
      <div className="flex gap-2">
        <button className="flex-1 py-2 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
          onClick={clearCanvas}>Clear</button>
        <button className="flex-1 py-3 rounded-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmitDrawing}>
          Pass to next player →
        </button>
      </div>
    </div>
  );
};
