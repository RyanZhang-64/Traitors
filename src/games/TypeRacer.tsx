import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface TypeRacerProps {
  onComplete: (result: GameResult) => void;
}

const PROMPTS = [
  "The traitor smiled across the candlelit table",
  "Castle walls hold many secrets in their stones",
  "Trust no one when the night grows dark and cold",
  "The faithful must find the wolf among the sheep",
  "Every lie leaves a shadow that moonlight reveals",
  "Whispers travel faster than the speed of truth",
];

export const TypeRacer: React.FC<TypeRacerProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [playerIdx, setPlayerIdx] = useState(0);
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [times, setTimes] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, number>>({});
  const [round, setRound] = useState<'setup' | 'typing' | 'done'>('setup');
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPlayer = alivePlayers[playerIdx];

  useEffect(() => {
    if (round !== 'typing') return;
    if (timeLeft <= 0) {
      handleFinish(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, round]);

  const handleStart = () => {
    setRound('typing');
    setStartTime(Date.now());
    setInput('');
    setTimeLeft(30);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (!startTime) setStartTime(Date.now());

    if (val === prompt) {
      handleFinish(true);
    }
  };

  const handleFinish = (completed: boolean) => {
    const elapsed = startTime ? (Date.now() - startTime) / 1000 : 30;
    const errorCount = input.split('').filter((c, i) => c !== prompt[i]).length;
    const wpm = completed ? Math.round((prompt.split(' ').length / elapsed) * 60) : 0;

    const newTimes = { ...times, [currentPlayer.id]: completed ? elapsed : 999 };
    const newErrors = { ...errors, [currentPlayer.id]: errorCount };

    setTimes(newTimes);
    setErrors(newErrors);
    setRound('done');
    setInput('');
  };

  const handleNext = () => {
    if (playerIdx + 1 >= alivePlayers.length) {
      setGameOver(true);
    } else {
      setPlayerIdx(playerIdx + 1);
      setRound('setup');
      setStartTime(null);
    }
  };

  if (gameOver) {
    const sorted = alivePlayers.map(p => ({
      id: p.id,
      time: times[p.id] || 999,
      errors: errors[p.id] || 0,
    })).sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time;
      return a.errors - b.errors;
    });

    const scoreMap: Record<string, number> = {};
    sorted.forEach((s, i) => {
      scoreMap[s.id] = Math.max(0, alivePlayers.length - i);
    });
    const coinDeltas = ScoreService.computeCoinDeltas(scoreMap, alivePlayers);
    const top = sorted[0];
    const topPlayer = players.find(p => p.id === top?.id);

    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Race Over!</h2>
        <div className="w-full max-w-sm space-y-2">
          {sorted.map((s, rank) => {
            const p = alivePlayers.find(p => p.id === s.id);
            return (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-raise)', border: `1px solid ${rank === 0 ? 'rgba(232,163,61,0.4)' : 'rgba(182,168,146,0.15)'}` }}>
                <span className="font-bold w-6" style={{ color: rank === 0 ? 'var(--flame)' : 'var(--muted)' }}>#{rank + 1}</span>
                <span className="flex-1" style={{ color: 'var(--ink)' }}>{p?.name}</span>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  {s.time < 999 ? `${s.time.toFixed(1)}s` : 'DNF'} · {s.errors} err
                </span>
                <span className="font-bold" style={{ color: 'var(--flame)' }}>{coinDeltas[s.id] ? `+${coinDeltas[s.id]}` : ''}</span>
              </div>
            );
          })}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'type_racer',
            summary: topPlayer ? `${topPlayer.name} typed the fastest!` : 'Nobody finished!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  const getCharColor = (i: number) => {
    if (i >= input.length) return 'var(--muted)';
    return input[i] === prompt[i] ? 'var(--sage)' : 'var(--ember)';
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Type Racer</h2>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          Player {playerIdx + 1}/{alivePlayers.length}: {currentPlayer?.name}
        </span>
      </div>

      {round === 'setup' && (
        <div className="space-y-4">
          <div className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
            <p className="text-sm font-bold mb-2" style={{ color: 'var(--muted)' }}>Type this phrase:</p>
            <p className="font-display text-lg" style={{ color: 'var(--ink)' }}>{prompt}</p>
          </div>
          <button className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={handleStart}>
            Start Typing! ▶
          </button>
        </div>
      )}

      {round === 'typing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{ backgroundColor: timeLeft <= 5 ? 'rgba(181,64,46,0.3)' : 'rgba(232,163,61,0.2)', color: timeLeft <= 5 ? 'var(--ember)' : 'var(--flame)', border: `2px solid ${timeLeft <= 5 ? 'var(--ember)' : 'var(--flame)'}` }}>
              {timeLeft}
            </div>
            <div className="w-full ml-3 h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(182,168,146,0.1)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(input.length / prompt.length) * 100}%`, backgroundColor: 'var(--flame)' }} />
            </div>
          </div>

          <div className="rounded-xl p-4 font-mono text-base leading-relaxed"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
            {prompt.split('').map((char, i) => (
              <span key={i} style={{ color: getCharColor(i) }}>
                {char}
              </span>
            ))}
          </div>

          <input ref={inputRef} type="text" value={input}
            onChange={handleTyping}
            className="w-full text-base"
            placeholder="Type here..."
            autoFocus
          />
        </div>
      )}

      {round === 'done' && (
        <div className="space-y-4 text-center">
          <p className="font-display text-2xl" style={{ color: times[currentPlayer.id] < 999 ? 'var(--sage)' : 'var(--ember)' }}>
            {times[currentPlayer.id] < 999
              ? `Finished in ${times[currentPlayer.id]?.toFixed(1)}s!`
              : 'Time ran out!'}
          </p>
          <button className="w-full py-3 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={handleNext}>
            {playerIdx + 1 < alivePlayers.length ? `Next: ${alivePlayers[playerIdx + 1]?.name} →` : 'See Results'}
          </button>
        </div>
      )}
    </div>
  );
};
