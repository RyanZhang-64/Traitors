import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface BalderdashProps {
  onComplete: (result: GameResult) => void;
}

export const Balderdash: React.FC<BalderdashProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [words] = useState(() =>
    [...masterBank.balderdash.words].sort(() => Math.random() - 0.5).slice(0, 3)
  );
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<'submit' | 'vote' | 'reveal'>('submit');
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [currentDef, setCurrentDef] = useState('');
  const [defPlayerIdx, setDefPlayerIdx] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [votePlayerIdx, setVotePlayerIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);
  const [allOptions, setAllOptions] = useState<{ id: string; def: string; authorId?: string }[]>([]);

  const current = words[wordIdx];

  const handleSubmitDef = () => {
    if (!currentDef.trim()) return;
    const newDefs = { ...definitions, [alivePlayers[defPlayerIdx].id]: currentDef.trim() };
    setDefinitions(newDefs);
    setCurrentDef('');
    if (defPlayerIdx < alivePlayers.length - 1) {
      setDefPlayerIdx(defPlayerIdx + 1);
    } else {
      // Build options: all fake defs + real one
      const opts: { id: string; def: string; authorId?: string }[] = [];
      Object.entries(newDefs).forEach(([pid, def]) => {
        opts.push({ id: `fake_${pid}`, def, authorId: pid });
      });
      opts.push({ id: 'real', def: current.definition });
      const shuffled = [...opts].sort(() => Math.random() - 0.5);
      setAllOptions(shuffled);
      setPhase('vote');
      setVotePlayerIdx(0);
    }
  };

  const handleVote = (optId: string) => {
    const voter = alivePlayers[votePlayerIdx];
    const newVotes = { ...votes, [voter.id]: optId };
    setVotes(newVotes);
    if (votePlayerIdx < alivePlayers.length - 1) {
      setVotePlayerIdx(votePlayerIdx + 1);
    } else {
      // Score: +1 for guessing real, +1 for each vote on your fake def
      const newScores = { ...scores };
      Object.entries(newVotes).forEach(([voterId, optId]) => {
        if (optId === 'real') {
          newScores[voterId] = (newScores[voterId] || 0) + 2;
        } else {
          const opt = allOptions.find((o) => o.id === optId);
          if (opt?.authorId && opt.authorId !== voterId) {
            newScores[opt.authorId] = (newScores[opt.authorId] || 0) + 1;
          }
        }
      });
      setScores(newScores);
      setPhase('reveal');
    }
  };

  const handleNextWord = () => {
    if (wordIdx + 1 >= words.length) {
      setGameOver(true);
    } else {
      setWordIdx(wordIdx + 1);
      setPhase('submit');
      setDefinitions({});
      setVotes({});
      setDefPlayerIdx(0);
      setVotePlayerIdx(0);
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Balderdash Over!</h2>
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
            moduleId: 'balderdash',
            summary: topPlayer ? `${topPlayer.name} was the greatest bluffer!` : 'Nobody fooled anyone!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'submit') {
    const subPlayer = alivePlayers[defPlayerIdx];
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Balderdash</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Word {wordIdx + 1}/{words.length}</p>
        </div>
        <div className="text-center rounded-xl p-6"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
          <p className="font-display text-4xl font-bold" style={{ color: 'var(--flame)' }}>{current.word}</p>
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
          {subPlayer.name}, write a fake definition (pass the device!):
        </p>
        <textarea
          value={currentDef}
          onChange={(e) => setCurrentDef(e.target.value)}
          placeholder="Write a convincing fake definition..."
          className="w-full p-3 rounded-xl resize-none"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.3)', color: 'var(--ink)', height: '80px' }}
        />
        <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmitDef} disabled={!currentDef.trim()}>
          Submit Definition
        </button>
        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          {defPlayerIdx + 1}/{alivePlayers.length} players have submitted
        </p>
      </div>
    );
  }

  if (phase === 'vote') {
    const voter = alivePlayers[votePlayerIdx];
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>{current.word}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {voter.name}, vote for the REAL definition:
          </p>
        </div>
        <div className="space-y-3">
          {allOptions
            .filter((o) => o.authorId !== voter.id)
            .map((opt, i) => (
              <button key={opt.id}
                className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)', color: 'var(--ink)' }}
                onClick={() => handleVote(opt.id)}>
                <span className="font-bold mr-2" style={{ color: 'var(--flame)' }}>{i + 1}.</span>
                {opt.def}
              </button>
            ))}
        </div>
      </div>
    );
  }

  // Reveal
  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Reveal: {current.word}</h2>
      </div>
      <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(111,143,106,0.15)', border: '1px solid var(--sage)' }}>
        <p className="font-bold text-sm mb-1" style={{ color: 'var(--sage)' }}>REAL DEFINITION:</p>
        <p style={{ color: 'var(--ink)' }}>{current.definition}</p>
      </div>
      <div className="space-y-2">
        {allOptions.filter(o => o.id !== 'real').map((opt) => {
          const author = alivePlayers.find(p => p.id === opt.authorId);
          const voteCount = Object.values(votes).filter(v => v === opt.id).length;
          return (
            <div key={opt.id} className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <p className="text-sm" style={{ color: 'var(--ink)' }}>{opt.def}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                By {author?.name} — {voteCount} vote{voteCount !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>
      <button className="w-full py-3 rounded-xl font-bold"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleNextWord}>
        {wordIdx + 1 < words.length ? 'Next Word →' : 'See Final Scores'}
      </button>
    </div>
  );
};
