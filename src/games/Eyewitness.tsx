import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface EyewitnessProps {
  onComplete: (result: GameResult) => void;
}

const SCENE = {
  title: "The Castle Corridor",
  details: [
    { id: 'time', fact: 'The clock on the wall shows 11:47', question: 'What time does the clock show?', answer: '11:47' },
    { id: 'portrait', fact: 'There are 3 portraits hanging on the left wall', question: 'How many portraits are on the left wall?', answer: '3' },
    { id: 'door', fact: 'The door at the end is painted crimson red', question: 'What color is the door at the end?', answer: 'red' },
    { id: 'candles', fact: 'There are 7 lit candles in the chandelier', question: 'How many candles are lit in the chandelier?', answer: '7' },
    { id: 'rug', fact: 'The rug has a pattern of crossed daggers', question: 'What pattern is on the rug?', answer: 'daggers' },
    { id: 'window', fact: 'The window is on the right side, showing a crescent moon', question: 'What phase is the moon outside?', answer: 'crescent' },
  ]
};

export const Eyewitness: React.FC<EyewitnessProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [studyTime, setStudyTime] = useState(30);
  const [qIdx, setQIdx] = useState(0);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);

  const questions = [...SCENE.details].sort(() => Math.random() - 0.5).slice(0, 4);

  useEffect(() => {
    if (phase !== 'study') return;
    if (studyTime <= 0) {
      setPhase('quiz');
      return;
    }
    const t = setTimeout(() => setStudyTime(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [studyTime, phase]);

  const currentQ = questions[qIdx];
  const currentPlayer = alivePlayers[playerIdx];

  const handleAnswer = (answer: string) => {
    const correct = answer.toLowerCase().includes(currentQ.answer.toLowerCase());
    const key = `${playerIdx}_${qIdx}`;
    const newAnswers = { ...answers, [key]: answer };
    setAnswers(newAnswers);
    if (correct) {
      setScores(s => ({ ...s, [currentPlayer.id]: (s[currentPlayer.id] || 0) + 1 }));
    }

    if (qIdx + 1 >= questions.length) {
      if (playerIdx + 1 >= alivePlayers.length) {
        setGameOver(true);
      } else {
        setPlayerIdx(playerIdx + 1);
        setQIdx(0);
      }
    } else {
      setQIdx(qIdx + 1);
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Eyewitness Report</h2>
        <div className="space-y-1 text-sm w-full max-w-sm">
          {questions.map(q => (
            <p key={q.id} className="text-xs" style={{ color: 'var(--muted)' }}>
              {q.question} → <span style={{ color: 'var(--sage)' }}>{q.answer}</span>
            </p>
          ))}
        </div>
        <div className="w-full max-w-sm space-y-2">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0}/{questions.length} {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'eyewitness',
            summary: topPlayer ? `${topPlayer.name} had the sharpest memory!` : 'Nobody paid attention!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'study') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Eyewitness</h2>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: 'rgba(232,163,61,0.2)', color: 'var(--flame)', border: '2px solid var(--flame)' }}>
            {studyTime}
          </div>
        </div>

        <div className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
          <h3 className="font-display text-xl font-bold mb-4 text-center" style={{ color: 'var(--flame)' }}>
            {SCENE.title}
          </h3>
          <div className="space-y-2 text-3xl text-center mb-4">
            🏰 🕯️ 🎨 🪞 🗝️ 🌙
          </div>
          <div className="space-y-2">
            {SCENE.details.map(detail => (
              <p key={detail.id} className="text-sm" style={{ color: 'var(--ink)' }}>
                • {detail.fact}
              </p>
            ))}
          </div>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(182,168,146,0.1)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(studyTime / 30) * 100}%`, backgroundColor: 'var(--flame)' }} />
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          Memorise everything! Questions start in {studyTime}s
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
          Q{qIdx + 1}/{questions.length}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {currentPlayer?.name} — from memory only!
        </p>
      </div>

      <div className="rounded-xl p-5 text-center"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <p className="font-display text-lg" style={{ color: 'var(--ink)' }}>{currentQ.question}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {currentQ.id === 'time' && ['11:47', '12:00', '10:30', '11:15'].map(opt => (
          <button key={opt} className="py-3 rounded-xl font-medium"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
        {currentQ.id === 'portrait' && ['2', '3', '4', '5'].map(opt => (
          <button key={opt} className="py-3 rounded-xl font-medium"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
        {currentQ.id === 'door' && ['red', 'black', 'green', 'blue'].map(opt => (
          <button key={opt} className="py-3 rounded-xl font-medium capitalize"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
        {currentQ.id === 'candles' && ['5', '6', '7', '8'].map(opt => (
          <button key={opt} className="py-3 rounded-xl font-medium"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
        {currentQ.id === 'rug' && ['daggers', 'roses', 'shields', 'crowns'].map(opt => (
          <button key={opt} className="py-3 rounded-xl font-medium capitalize"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
        {currentQ.id === 'window' && ['crescent', 'full', 'new', 'half'].map(opt => (
          <button key={opt} className="py-3 rounded-xl font-medium capitalize"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
