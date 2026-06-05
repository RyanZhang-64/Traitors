import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface TwoTruthsLieProps {
  onComplete: (result: GameResult) => void;
}

export const TwoTruthsLie: React.FC<TwoTruthsLieProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [submitterIdx, setSubmitterIdx] = useState(0);
  const [phase, setPhase] = useState<'submit' | 'vote' | 'reveal'>('submit');
  const [statements, setStatements] = useState<string[]>(['', '', '']);
  const [lieIdx, setLieIdx] = useState<number | null>(null);
  const [voterIdx, setVoterIdx] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [allRounds, setAllRounds] = useState<{ submitter: string; stmts: string[]; lie: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const submitter = alivePlayers[submitterIdx];
  const votersForRound = alivePlayers.filter(p => p.id !== submitter.id);
  const currentVoter = votersForRound[voterIdx];

  const handleSubmit = () => {
    if (statements.some(s => !s.trim()) || lieIdx === null) return;
    const shuffled = [...statements.map((s, i) => ({ s, i }))].sort(() => Math.random() - 0.5);
    const newStatements = shuffled.map(x => x.s);
    const newLieIdx = shuffled.findIndex(x => x.i === lieIdx);
    setAllRounds([...allRounds, { submitter: submitter.id, stmts: newStatements, lie: newLieIdx }]);
    setStatements(newStatements);
    setLieIdx(newLieIdx);
    setPhase('vote');
    setVoterIdx(0);
  };

  const handleVote = (voteIdx: number) => {
    const newVotes = { ...votes, [currentVoter.id]: voteIdx };
    setVotes(newVotes);
    if (voterIdx + 1 >= votersForRound.length) {
      // Tally
      const newScores = { ...scores };
      Object.entries(newVotes).forEach(([voterId, idx]) => {
        if (idx === lieIdx) {
          newScores[voterId] = (newScores[voterId] || 0) + 2;
        } else {
          newScores[submitter.id] = (newScores[submitter.id] || 0) + 1;
        }
      });
      setScores(newScores);
      setPhase('reveal');
    } else {
      setVoterIdx(voterIdx + 1);
    }
  };

  const handleNextPlayer = () => {
    if (submitterIdx + 1 >= alivePlayers.length) {
      setGameOver(true);
    } else {
      setSubmitterIdx(submitterIdx + 1);
      setStatements(['', '', '']);
      setLieIdx(null);
      setVotes({});
      setPhase('submit');
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Two Truths Done!</h2>
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
            moduleId: 'two_truths_lie',
            summary: topPlayer ? `${topPlayer.name} was the master of deception!` : 'Nobody could tell truth from lie!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'submit') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Two Truths & a Lie</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {submitter?.name}, write 2 truths and 1 lie about yourself
          </p>
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  backgroundColor: lieIdx === i ? 'var(--ember)' : 'var(--bg-raise)',
                  color: lieIdx === i ? 'white' : 'var(--muted)',
                  border: `2px solid ${lieIdx === i ? 'var(--ember)' : 'rgba(182,168,146,0.2)'}`,
                }}
                onClick={() => setLieIdx(i)}
                title="Mark as the lie">
                {lieIdx === i ? '✗' : (i + 1)}
              </button>
              <input type="text" value={statements[i]}
                onChange={(e) => {
                  const newStmts = [...statements];
                  newStmts[i] = e.target.value;
                  setStatements(newStmts);
                }}
                placeholder={`Statement ${i + 1}...`}
                className="flex-1"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          Tap a number to mark it as the lie
        </p>
        <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmit}
          disabled={statements.some(s => !s.trim()) || lieIdx === null}>
          Submit (pass device back)
        </button>
      </div>
    );
  }

  if (phase === 'vote') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Which is the lie?</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {currentVoter?.name}, pick the lie from {submitter?.name}'s statements:
          </p>
        </div>
        <div className="space-y-3">
          {statements.map((stmt, i) => (
            <button key={i}
              className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)', color: 'var(--ink)' }}
              onClick={() => handleVote(i)}>
              <span className="font-bold mr-2" style={{ color: 'var(--flame)' }}>{i + 1}.</span>
              {stmt}
            </button>
          ))}
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          Voter {voterIdx + 1}/{votersForRound.length}
        </p>
      </div>
    );
  }

  // Reveal
  const guessedCorrect = Object.entries(votes).filter(([, v]) => v === lieIdx).map(([id]) => id);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <h2 className="font-display text-2xl font-bold text-center" style={{ color: 'var(--flame)' }}>The Lie Was...</h2>
      <div className="space-y-2">
        {statements.map((stmt, i) => (
          <div key={i} className="p-4 rounded-xl"
            style={{
              backgroundColor: i === lieIdx ? 'rgba(181,64,46,0.2)' : 'rgba(111,143,106,0.1)',
              border: `2px solid ${i === lieIdx ? 'var(--ember)' : 'var(--sage)'}`,
            }}>
            <div className="flex items-start gap-2">
              <span>{i === lieIdx ? '🗡️' : '✓'}</span>
              <span style={{ color: 'var(--ink)' }}>{stmt}</span>
            </div>
            {i === lieIdx && (
              <p className="text-xs mt-1 font-bold" style={{ color: 'var(--ember)' }}>
                THE LIE — spotted by: {guessedCorrect.map(id => alivePlayers.find(p => p.id === id)?.name).join(', ') || 'nobody'}
              </p>
            )}
          </div>
        ))}
      </div>
      <button className="w-full py-3 rounded-xl font-bold"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleNextPlayer}>
        {submitterIdx + 1 < alivePlayers.length ? `Next: ${alivePlayers[submitterIdx + 1]?.name} →` : 'See Final Scores'}
      </button>
    </div>
  );
};
