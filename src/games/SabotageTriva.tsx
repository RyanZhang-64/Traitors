import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { triviaQuestions } from '../data/triviaQuestions';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface SabotageTrivaProps {
  onComplete: (result: GameResult) => void;
}

export const SabotageTriva: React.FC<SabotageTrivaProps> = ({ onComplete }) => {
  const { players, conclave, traitorIds } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const questions = [...triviaQuestions].sort(() => Math.random() - 0.5).slice(0, 8);
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(12);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // Traitor can "poison" one question — wrong answer shown as highlighted
  const traitorPlayer = alivePlayers.find((p) => traitorIds.includes(p.id));
  const [poisonUsed, setPoisonUsed] = useState(false);
  const [poisonedOption, setPoisonedOption] = useState<number | null>(null);

  const currentQ = questions[qIndex];

  useEffect(() => {
    if (answered || gameOver) return;
    if (timeLeft <= 0) {
      nextQuestion();
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, gameOver]);

  useEffect(() => {
    setTimeLeft(12);
    setAnswered(false);
    setSelectedOption(null);
    setPoisonedOption(null);
  }, [qIndex]);

  const handleAnswer = (optionIndex: number, playerId: string) => {
    if (answered) return;
    setSelectedOption(optionIndex);
    setAnswered(true);
    const correct = optionIndex === currentQ.correct;
    if (correct) {
      setScores((s) => ({ ...s, [playerId]: (s[playerId] || 0) + 1 }));
    }
    setTimeout(nextQuestion, 1500);
  };

  const nextQuestion = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setGameOver(true);
    }
  };

  const handlePoison = (optIdx: number) => {
    if (poisonUsed) return;
    setPoisonedOption(optIdx);
    setPoisonUsed(true);
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Trivia Over!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0}/{questions.length} correct {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'sabotage_trivia',
            summary: topPlayer ? `${topPlayer.name} aced the quiz!` : 'No clear winner!',
            coinDeltas, shieldsAwarded: {},
            suspicionDeltas: poisonUsed && traitorPlayer ? { [traitorPlayer.id]: 15 } : {},
            tells: poisonUsed ? ['A Traitor poisoned a trivia question'] : [],
            timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
          Question {qIndex + 1}/{questions.length}
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            style={{
              backgroundColor: timeLeft <= 3 ? 'rgba(181,64,46,0.3)' : 'rgba(232,163,61,0.2)',
              color: timeLeft <= 3 ? 'var(--ember)' : 'var(--flame)',
              border: `2px solid ${timeLeft <= 3 ? 'var(--ember)' : 'var(--flame)'}`,
            }}>
            {timeLeft}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <p className="font-display text-lg" style={{ color: 'var(--ink)' }}>{currentQ.question}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{currentQ.category}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentQ.options.map((opt, i) => (
          <button key={i}
            className="p-3 rounded-xl text-left text-sm font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: answered
                ? i === currentQ.correct ? 'rgba(111,143,106,0.3)' : i === selectedOption ? 'rgba(181,64,46,0.3)' : 'var(--bg-raise)'
                : i === poisonedOption ? 'rgba(232,163,61,0.2)' : 'var(--bg-raise)',
              border: answered
                ? `2px solid ${i === currentQ.correct ? 'var(--sage)' : i === selectedOption ? 'var(--ember)' : 'rgba(182,168,146,0.15)'}`
                : i === poisonedOption ? '2px solid var(--flame)' : '1px solid rgba(182,168,146,0.2)',
              color: 'var(--ink)',
            }}
            disabled={answered}
            onClick={() => handleAnswer(i, alivePlayers[0]?.id || '')}>
            <span className="font-bold mr-2" style={{ color: 'var(--muted)' }}>
              {String.fromCharCode(65 + i)}.
            </span>
            {opt}
            {i === poisonedOption && <span className="ml-2 text-xs" style={{ color: 'var(--flame)' }}>⚠ Marked</span>}
          </button>
        ))}
      </div>

      {/* Traitor poison mechanic */}
      {traitorPlayer && !poisonUsed && !answered && (
        <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(142,36,51,0.1)', border: '1px solid rgba(142,36,51,0.2)' }}>
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--crimson)' }}>
            TRAITOR: Mark one answer as "suspicious" (once only)
          </p>
          <div className="flex gap-2">
            {currentQ.options.map((_, i) => (
              <button key={i} className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ backgroundColor: 'rgba(181,64,46,0.2)', color: 'var(--ember)', border: '1px solid var(--ember)' }}
                onClick={() => handlePoison(i)}>
                Mark {String.fromCharCode(65 + i)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {alivePlayers.map((p) => (
          <button key={p.id}
            className="px-3 py-1.5 rounded-full text-sm"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => handleAnswer(selectedOption ?? 0, p.id)}>
            {p.name}: {scores[p.id] || 0}
          </button>
        ))}
      </div>
    </div>
  );
};
