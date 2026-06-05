import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface AnagramRaceProps {
  onComplete: (result: GameResult) => void;
}

export const AnagramRace: React.FC<AnagramRaceProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const allAnagrams = masterBank.anagram_race;
  const rounds = [...allAnagrams].sort(() => Math.random() - 0.5).slice(0, 8);

  const [roundIdx, setRoundIdx] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundActive, setRoundActive] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [buzzedIn, setBuzzedIn] = useState<string | null>(null);

  useEffect(() => {
    if (!roundActive || buzzedIn) return;
    if (timeLeft <= 0) {
      setFeedback(`Time! The word was: ${rounds[roundIdx].answer}`);
      setRoundActive(false);
      setTimeout(nextRound, 2000);
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, roundActive, buzzedIn]);

  const handleBuzzIn = (playerId: string) => {
    setBuzzedIn(playerId);
  };

  const handleSubmitAnswer = () => {
    const correct = input.trim().toUpperCase() === rounds[roundIdx].answer;
    if (correct) {
      setScores((s) => ({ ...s, [buzzedIn!]: (s[buzzedIn!] || 0) + 1 }));
      setFeedback(`✓ Correct! +1 for ${alivePlayers.find(p => p.id === buzzedIn)?.name}`);
    } else {
      setFeedback(`✗ Wrong! The answer was: ${rounds[roundIdx].answer}`);
    }
    setRoundActive(false);
    setInput('');
    setBuzzedIn(null);
    setTimeout(nextRound, 2000);
  };

  const nextRound = () => {
    if (roundIdx + 1 >= rounds.length) {
      setGameOver(true);
    } else {
      setRoundIdx((r) => r + 1);
      setTimeLeft(20);
      setRoundActive(true);
      setFeedback('');
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Race Over!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0}/{rounds.length} {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'anagram_race',
            summary: topPlayer ? `${topPlayer.name} won the anagram race!` : 'No one unscrambled fastest!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  const current = rounds[roundIdx];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
          Anagram {roundIdx + 1}/{rounds.length}
        </h2>
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
          style={{
            backgroundColor: timeLeft <= 5 ? 'rgba(181,64,46,0.3)' : 'rgba(232,163,61,0.2)',
            color: timeLeft <= 5 ? 'var(--ember)' : 'var(--flame)',
            border: `2px solid ${timeLeft <= 5 ? 'var(--ember)' : 'var(--flame)'}`,
          }}>
          {timeLeft}
        </div>
      </div>

      <div className="text-center py-8 rounded-xl"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Unscramble this word:</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {current.scramble.split('').map((c, i) => (
            <div key={i} className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--flame)', border: '2px solid rgba(232,163,61,0.4)' }}>
              {c}
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>{current.difficulty} difficulty</p>
      </div>

      {feedback && (
        <p className="text-center font-bold" style={{ color: feedback.startsWith('✓') ? 'var(--sage)' : 'var(--ember)' }}>
          {feedback}
        </p>
      )}

      {!buzzedIn && roundActive && (
        <div>
          <p className="text-sm text-center mb-2" style={{ color: 'var(--muted)' }}>Buzz in to answer:</p>
          <div className="grid grid-cols-2 gap-2">
            {alivePlayers.map((p) => (
              <button key={p.id}
                className="py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.3)' }}
                onClick={() => handleBuzzIn(p.id)}>
                🔔 {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {buzzedIn && (
        <div className="space-y-3">
          <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
            {alivePlayers.find(p => p.id === buzzedIn)?.name} — type your answer:
          </p>
          <div className="flex gap-2">
            <input type="text" value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              placeholder="Type answer..."
              className="flex-1 text-center font-bold text-lg uppercase"
              autoFocus
            />
            <button className="px-4 py-2 rounded-lg font-bold"
              style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
              onClick={handleSubmitAnswer}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
