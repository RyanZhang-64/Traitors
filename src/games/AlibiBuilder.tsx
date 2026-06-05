import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { alibiScenarios } from '../data/alibiQuestions';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface AlibiBuilderProps {
  onComplete: (result: GameResult) => void;
}

export const AlibiBuilder: React.FC<AlibiBuilderProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [scenario] = useState(() => alibiScenarios[Math.floor(Math.random() * alibiScenarios.length)]);
  // Spec §3.3: odd player count → one trio (last 3 players), rest form pairs
  const [pairs] = useState<[string, string][]>(() => {
    const result: [string, string][] = [];
    const ids = alivePlayers.map(p => p.id);
    const isOdd = ids.length % 2 === 1;
    if (isOdd && ids.length >= 3) {
      // Last 3 form a shared-partner trio (middle person questioned twice)
      result.push([ids[ids.length - 3], ids[ids.length - 2]]);
      result.push([ids[ids.length - 2], ids[ids.length - 1]]);
    }
    for (let i = 0; i < ids.length - (isOdd ? 3 : 0); i += 2) {
      result.push([ids[i], ids[i + 1]]);
    }
    return result;
  });

  const [pairIdx, setPairIdx] = useState(0);
  const [phase, setPhase] = useState<'read' | 'plan' | 'crossexam' | 'vote' | 'reveal'>('read');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [currentAnswerer, setCurrentAnswerer] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [votePlayerIdx, setVotePlayerIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentPair = pairs[pairIdx] || [alivePlayers[0]?.id, alivePlayers[1]?.id];
  const partner1 = players.find(p => p.id === currentPair[0]);
  const partner2 = players.find(p => p.id === currentPair[1]);
  const currentVoter = alivePlayers[votePlayerIdx];

  const questionsUsed = scenario.questions.slice(0, 5);
  const currentQ = questionsUsed[questionIdx];
  const answererPlayer = currentAnswerer === 0 ? partner1 : partner2;

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;
    const key = `${questionIdx}_${currentAnswerer}`;
    setAnswers(a => ({ ...a, [key]: currentAnswer }));
    setCurrentAnswer('');

    if (currentAnswerer === 0) {
      setCurrentAnswerer(1);
    } else {
      setCurrentAnswerer(0);
      if (questionIdx + 1 >= questionsUsed.length) {
        setPhase('vote');
      } else {
        setQuestionIdx(questionIdx + 1);
      }
    }
  };

  const handleVote = (believable: boolean) => {
    const newVotes = { ...votes, [currentVoter.id]: believable };
    setVotes(newVotes);
    if (votePlayerIdx + 1 >= alivePlayers.length) {
      const believedCount = Object.values(newVotes).filter(Boolean).length;
      const pairScore = believedCount >= alivePlayers.length / 2 ? 3 : 0;
      const newScores = { ...scores };
      currentPair.forEach(id => {
        newScores[id] = (newScores[id] || 0) + pairScore;
      });
      setScores(newScores);
      setPhase('reveal');
    } else {
      setVotePlayerIdx(votePlayerIdx + 1);
    }
  };

  const handleNextPair = () => {
    if (pairIdx + 1 >= pairs.length) {
      setGameOver(true);
    } else {
      setPairIdx(pairIdx + 1);
      setPhase('read');
      setAnswers({});
      setQuestionIdx(0);
      setCurrentAnswerer(0);
      setVotes({});
      setVotePlayerIdx(0);
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Alibi Builder Done!</h2>
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
            moduleId: 'alibi_builder',
            summary: topPlayer ? `${topPlayer.name} built the most convincing alibi!` : 'Nobody believed anyone!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'read') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Alibi Builder</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Pair {pairIdx + 1}/{pairs.length}</p>
        </div>
        <div className="rounded-xl p-4"
          style={{ backgroundColor: 'rgba(142,36,51,0.1)', border: '1px solid rgba(142,36,51,0.3)' }}>
          <p className="font-bold text-sm mb-2" style={{ color: 'var(--crimson)' }}>THE CRIME:</p>
          <p className="font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>{scenario.crime}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            Time: {scenario.time} · Location: {scenario.location}
          </p>
        </div>
        <div className="rounded-xl p-4"
          style={{ backgroundColor: 'rgba(232,163,61,0.1)', border: '1px solid rgba(232,163,61,0.3)' }}>
          <p className="font-bold text-sm mb-2" style={{ color: 'var(--flame)' }}>ALIBIS PAIR:</p>
          <p className="font-bold text-lg" style={{ color: 'var(--ink)' }}>
            {partner1?.name} & {partner2?.name}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            You have 3 minutes to secretly build a shared alibi for this time and place!
          </p>
        </div>
        <button className="w-full py-4 rounded-xl font-display text-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => setPhase('plan')}>
          Start Planning (3 min) ▶
        </button>
      </div>
    );
  }

  if (phase === 'plan') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Plan Your Alibi</h2>
        <div className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
          <p className="font-bold" style={{ color: 'var(--ink)' }}>
            {partner1?.name} & {partner2?.name}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            Discuss your whereabouts during {scenario.time} at {scenario.location}.
            Make sure your stories match!
          </p>
        </div>
        <button className="w-full py-3 rounded-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => { setPhase('crossexam'); setCurrentAnswerer(0); setQuestionIdx(0); }}>
          Cross-Examination Begins ▶
        </button>
      </div>
    );
  }

  if (phase === 'crossexam') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--crimson)' }}>Cross-Examination</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Q{questionIdx + 1}/{questionsUsed.length} → {answererPlayer?.name}
          </p>
        </div>
        <div className="rounded-xl p-4 text-center"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
          <p className="font-display text-lg" style={{ color: 'var(--ink)' }}>{currentQ}</p>
        </div>
        <textarea value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder={`${answererPlayer?.name}'s answer...`}
          className="w-full p-3 rounded-xl resize-none"
          style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.3)', color: 'var(--ink)', height: '80px' }}
        />
        <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleAnswerSubmit} disabled={!currentAnswer.trim()}>
          Submit Answer
        </button>
      </div>
    );
  }

  if (phase === 'vote') {
    const sortedAnswers = Object.entries(answers).map(([key, val]) => {
      const [qIdx, aIdx] = key.split('_').map(Number);
      return { q: questionsUsed[qIdx], answer: val, player: aIdx === 0 ? partner1?.name : partner2?.name };
    });

    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Do You Believe Them?</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {currentVoter?.name}, was {partner1?.name} & {partner2?.name}'s alibi convincing?
          </p>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sortedAnswers.map((a, i) => (
            <div key={i} className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.1)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--flame)' }}>{a.player}: {a.q}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{a.answer}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-4 rounded-xl font-bold"
            style={{ backgroundColor: 'rgba(111,143,106,0.3)', color: 'var(--sage)', border: '2px solid var(--sage)' }}
            onClick={() => handleVote(true)}>
            ✓ Believable!
          </button>
          <button className="flex-1 py-4 rounded-xl font-bold"
            style={{ backgroundColor: 'rgba(181,64,46,0.3)', color: 'var(--ember)', border: '2px solid var(--ember)' }}
            onClick={() => handleVote(false)}>
            ✗ Suspicious!
          </button>
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          Voter {votePlayerIdx + 1}/{alivePlayers.length}
        </p>
      </div>
    );
  }

  // Reveal
  const believedCount = Object.values(votes).filter(Boolean).length;
  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full text-center">
      <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Verdict</h2>
      <div className="rounded-xl p-5"
        style={{
          backgroundColor: believedCount >= alivePlayers.length / 2 ? 'rgba(111,143,106,0.2)' : 'rgba(181,64,46,0.2)',
          border: `2px solid ${believedCount >= alivePlayers.length / 2 ? 'var(--sage)' : 'var(--ember)'}`,
        }}>
        <p className="font-display text-3xl font-bold"
          style={{ color: believedCount >= alivePlayers.length / 2 ? 'var(--sage)' : 'var(--ember)' }}>
          {believedCount >= alivePlayers.length / 2 ? 'BELIEVED' : 'SUSPICIOUS'}
        </p>
        <p className="mt-2" style={{ color: 'var(--ink)' }}>
          {believedCount}/{alivePlayers.length} found the alibi convincing
        </p>
      </div>
      <button className="w-full py-3 rounded-xl font-bold"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleNextPair}>
        {pairIdx + 1 < pairs.length ? 'Next Pair →' : 'See Results'}
      </button>
    </div>
  );
};
