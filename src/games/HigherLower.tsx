import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface HigherLowerProps {
  onComplete: (result: GameResult) => void;
}

export const HigherLower: React.FC<HigherLowerProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const chain = masterBank.higher_lower.chain;
  const metric = masterBank.higher_lower.metric;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [revealed, setRevealed] = useState(false);

  const currentItem = chain[currentIdx];
  const nextItem = chain[currentIdx + 1];
  const currentPlayer = alivePlayers[playerIdx % alivePlayers.length];

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (!nextItem) return;
    const correct =
      (guess === 'higher' && nextItem.value > currentItem.value) ||
      (guess === 'lower' && nextItem.value < currentItem.value);

    setRevealed(true);

    if (correct) {
      setFeedback(`✓ Correct! ${nextItem.display}`);
      setScores((s) => ({ ...s, [currentPlayer.id]: (s[currentPlayer.id] || 0) + 1 }));
      setStreak(streak + 1);
    } else {
      setFeedback(`✗ Wrong! It was ${nextItem.display}`);
      setStreak(0);
    }

    setTimeout(() => {
      setRevealed(false);
      setFeedback('');
      if (currentIdx + 1 >= chain.length - 1) {
        setGameOver(true);
      } else {
        setCurrentIdx(currentIdx + 1);
        setPlayerIdx(playerIdx + 1);
      }
    }, 2000);
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Chain Complete!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0} correct {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'higher_lower',
            summary: topPlayer ? `${topPlayer.name} called it right!` : 'No clear winner!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Higher or Lower?</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Metric: {metric}</p>
      </div>

      {/* Current item */}
      <div className="rounded-xl p-6 text-center"
        style={{ backgroundColor: 'var(--bg-raise)', border: '2px solid rgba(232,163,61,0.4)' }}>
        <p className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{currentItem.item}</p>
        <p className="text-3xl font-bold mt-2" style={{ color: 'var(--flame)' }}>{currentItem.display}</p>
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>{metric}</p>
      </div>

      {/* Next item */}
      <div className="rounded-xl p-6 text-center relative"
        style={{
          backgroundColor: 'var(--bg-raise)',
          border: `2px solid ${revealed ? 'rgba(111,143,106,0.6)' : 'rgba(182,168,146,0.2)'}`,
        }}>
        <p className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{nextItem?.item}</p>
        {revealed ? (
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--sage)' }}>{nextItem?.display}</p>
        ) : (
          <p className="text-2xl mt-2" style={{ color: 'var(--muted)' }}>???</p>
        )}
      </div>

      {feedback && (
        <p className="text-center font-bold text-lg"
          style={{ color: feedback.startsWith('✓') ? 'var(--sage)' : 'var(--ember)' }}>
          {feedback}
        </p>
      )}

      {!revealed && (
        <>
          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            {currentPlayer?.name} — is {nextItem?.item} HIGHER or LOWER in {metric}?
          </p>
          <div className="flex gap-4">
            <button
              className="flex-1 py-5 rounded-xl font-display text-2xl font-bold transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(181,64,46,0.3)', color: 'var(--ember)', border: '2px solid var(--ember)' }}
              onClick={() => handleGuess('lower')}>
              ▼ LOWER
            </button>
            <button
              className="flex-1 py-5 rounded-xl font-display text-2xl font-bold transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(111,143,106,0.3)', color: 'var(--sage)', border: '2px solid var(--sage)' }}
              onClick={() => handleGuess('higher')}>
              ▲ HIGHER
            </button>
          </div>
          {streak > 1 && (
            <p className="text-center text-sm" style={{ color: 'var(--flame)' }}>
              🔥 {streak} streak!
            </p>
          )}
        </>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        {currentIdx + 1}/{chain.length - 1} rounds
      </p>
    </div>
  );
};
