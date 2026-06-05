import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { hotTakesPrompts } from '../data/hotTakesPrompts';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface HotTakesProps {
  onComplete: (result: GameResult) => void;
}

export const HotTakes: React.FC<HotTakesProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const prompts = [...hotTakesPrompts].sort(() => Math.random() - 0.5).slice(0, 5);
  const [promptIdx, setPromptIdx] = useState(0);
  const [voterIdx, setVoterIdx] = useState(0);
  const [votes, setVotes] = useState<Record<string, Record<string, string>>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'voting' | 'reveal'>('voting');
  const [gameOver, setGameOver] = useState(false);
  const [suspicionDeltas, setSuspicionDeltas] = useState<Record<string, number>>({});

  const currentPrompt = prompts[promptIdx];
  const currentVoter = alivePlayers[voterIdx];
  const roundVotes = votes[String(promptIdx)] || {};

  const handleVote = (targetId: string) => {
    const promptKey = String(promptIdx);
    const newVotes = {
      ...votes,
      [promptKey]: {
        ...roundVotes,
        [currentVoter.id]: targetId,
      },
    };
    setVotes(newVotes);

    if (voterIdx + 1 >= alivePlayers.length) {
      // Calculate scores for this round
      const tally: Record<string, number> = {};
      Object.values(newVotes[promptKey]).forEach((id: string) => {
        tally[id] = (tally[id] || 0) + 1;
      });
      const maxVotes = Math.max(...Object.values(tally));
      const winner = Object.entries(tally).find(([, v]) => v === maxVotes)?.[0];
      if (winner) {
        setScores(s => ({ ...s, [winner]: (s[winner] || 0) + 1 }));
        // Suspicion bump for unanimous or near-unanimous votes
        if (maxVotes >= alivePlayers.length * 0.7) {
          setSuspicionDeltas(sd => ({ ...sd, [winner]: (sd[winner] || 0) + 5 }));
        }
      }
      setPhase('reveal');
    } else {
      setVoterIdx(voterIdx + 1);
    }
  };

  const handleNext = () => {
    if (promptIdx + 1 >= prompts.length) {
      setGameOver(true);
    } else {
      setPromptIdx(promptIdx + 1);
      setVoterIdx(0);
      setPhase('voting');
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Hot Takes Done!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0} votes {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'hot_takes',
            summary: topPlayer ? `${topPlayer.name} was voted the most in Hot Takes!` : 'Split decisions all around!',
            coinDeltas, shieldsAwarded: {},
            suspicionDeltas,
            tells: [],
            timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'reveal') {
    const tally: Record<string, number> = {};
    Object.values(roundVotes).forEach(id => {
      tally[id] = (tally[id] || 0) + 1;
    });
    const sorted = alivePlayers
      .map(p => ({ ...p, count: tally[p.id] || 0 }))
      .sort((a, b) => b.count - a.count);

    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center rounded-xl p-4"
          style={{ backgroundColor: 'rgba(232,163,61,0.15)', border: '1px solid rgba(232,163,61,0.3)' }}>
          <p className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
            {currentPrompt}
          </p>
        </div>
        <div className="space-y-2">
          {sorted.map((p, rank) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: rank === 0 ? 'rgba(232,163,61,0.1)' : 'var(--bg-raise)',
                border: `1px solid ${rank === 0 ? 'rgba(232,163,61,0.4)' : 'rgba(182,168,146,0.15)'}`,
              }}>
              <span className="flex-1 font-medium" style={{ color: 'var(--ink)' }}>{p.name}</span>
              <div className="flex gap-1">
                {Array.from({ length: p.count }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--flame)' }} />
                ))}
              </div>
              <span className="font-bold text-sm" style={{ color: 'var(--flame)' }}>{p.count}</span>
            </div>
          ))}
        </div>
        <button className="w-full py-3 rounded-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleNext}>
          {promptIdx + 1 < prompts.length ? 'Next Prompt →' : 'See Final Scores'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Hot Takes</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Prompt {promptIdx + 1}/{prompts.length}
        </p>
      </div>

      <div className="rounded-2xl p-5 text-center"
        style={{ backgroundColor: 'rgba(232,163,61,0.15)', border: '2px solid rgba(232,163,61,0.4)' }}>
        <p className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>
          {currentPrompt}
        </p>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
        {currentVoter?.name}, tap a player:
      </p>

      <div className="grid grid-cols-2 gap-2">
        {alivePlayers.filter(p => p.id !== currentVoter?.id).map((p) => (
          <button key={p.id}
            className="py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.3)' }}
            onClick={() => handleVote(p.id)}>
            {p.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        Voter {voterIdx + 1}/{alivePlayers.length}
      </p>
    </div>
  );
};
