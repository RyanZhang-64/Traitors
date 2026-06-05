import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { wordChainStarters } from '../data/wordlist';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface WordChainProps {
  onComplete: (result: GameResult) => void;
}

export const WordChain: React.FC<WordChainProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [chain, setChain] = useState<string[]>([
    wordChainStarters[Math.floor(Math.random() * wordChainStarters.length)]
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const activePlayers = alivePlayers.filter(p => !eliminated.includes(p.id));
  const currentPlayer = activePlayers[currentPlayerIdx % activePlayers.length];

  useEffect(() => {
    if (gameOver || activePlayers.length <= 1) {
      if (!gameOver && activePlayers.length <= 1) setGameOver(true);
      return;
    }
    if (timeLeft <= 0) {
      handleEliminate(currentPlayer?.id);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver, activePlayers.length]);

  const lastWord = chain[chain.length - 1];
  const requiredStart = lastWord.slice(-1).toUpperCase();

  const handleEliminate = (playerId?: string) => {
    if (!playerId) return;
    const newElim = [...eliminated, playerId];
    setEliminated(newElim);
    setError(`${alivePlayers.find(p => p.id === playerId)?.name} is eliminated!`);
    const remaining = activePlayers.filter(p => p.id !== playerId);
    if (remaining.length <= 1) {
      setGameOver(true);
      return;
    }
    setCurrentInput('');
    setTimeLeft(10);
    setCurrentPlayerIdx(p => p % (remaining.length));
    setTimeout(() => setError(''), 2000);
  };

  const handleSubmit = () => {
    const word = currentInput.trim().toUpperCase();
    if (!word) return;
    if (!word.startsWith(requiredStart)) {
      setError(`Must start with "${requiredStart}"!`);
      return;
    }
    if (chain.includes(word)) {
      setError('Word already used!');
      return;
    }
    if (word.length < 2) {
      setError('Too short!');
      return;
    }
    setChain(c => [...c, word]);
    setScores(s => ({ ...s, [currentPlayer.id]: (s[currentPlayer.id] || 0) + 1 }));
    setCurrentInput('');
    setTimeLeft(Math.max(5, 10 - Math.floor(chain.length / 5)));
    setCurrentPlayerIdx(p => (p + 1) % activePlayers.length);
    setError('');
  };

  if (gameOver) {
    const winner = activePlayers[0] || alivePlayers[0];
    const finalScores = { ...scores };
    if (winner) finalScores[winner.id] = (finalScores[winner.id] || 0) + 3;
    const coinDeltas = ScoreService.computeCoinDeltas(finalScores, alivePlayers);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Chain Broken!</h2>
        {winner && <p className="text-xl" style={{ color: 'var(--ink)' }}>{winner.name} wins!</p>}
        <div className="text-sm" style={{ color: 'var(--muted)' }}>
          Chain length: {chain.length} words
        </div>
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
            moduleId: 'word_chain',
            summary: winner ? `${winner.name} won the word chain!` : 'Chain collapsed!',
            coinDeltas: ScoreService.computeCoinDeltas(finalScores, alivePlayers),
            shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Word Chain</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Last letter starts the next word</p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
          style={{
            backgroundColor: timeLeft <= 3 ? 'rgba(181,64,46,0.3)' : 'rgba(232,163,61,0.2)',
            color: timeLeft <= 3 ? 'var(--ember)' : 'var(--flame)',
            border: `2px solid ${timeLeft <= 3 ? 'var(--ember)' : 'var(--flame)'}`,
          }}>
          {timeLeft}
        </div>
      </div>

      <div className="rounded-xl p-4 min-h-[80px] flex flex-wrap gap-2 items-end"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        {chain.slice(-6).map((w, i) => (
          <span key={i} className="px-2 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: i === chain.slice(-6).length - 1 ? 'rgba(232,163,61,0.2)' : 'rgba(182,168,146,0.1)',
              color: i === chain.slice(-6).length - 1 ? 'var(--flame)' : 'var(--muted)',
              border: `1px solid ${i === chain.slice(-6).length - 1 ? 'rgba(232,163,61,0.4)' : 'rgba(182,168,146,0.1)'}`,
            }}>
            {w}
          </span>
        ))}
      </div>

      <div className="text-center rounded-xl p-3"
        style={{ backgroundColor: 'rgba(232,163,61,0.1)', border: '1px solid rgba(232,163,61,0.3)' }}>
        <p className="font-bold" style={{ color: 'var(--flame)' }}>
          {currentPlayer?.name}, start with: <span className="text-3xl">{requiredStart}</span>
        </p>
      </div>

      {error && <p className="text-center text-sm font-bold" style={{ color: 'var(--ember)' }}>{error}</p>}

      <div className="flex gap-2">
        <input type="text" value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={`${requiredStart}...`}
          className="flex-1 text-lg uppercase font-bold text-center"
          autoFocus
        />
        <button className="px-5 py-2 rounded-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmit}>
          →
        </button>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Active: {activePlayers.map(p => p.name).join(', ')}
        </p>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>· Chain: {chain.length}</span>
      </div>

      <button className="w-full py-2 text-sm rounded-lg"
        style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.15)' }}
        onClick={() => setGameOver(true)}>
        End Game
      </button>
    </div>
  );
};
