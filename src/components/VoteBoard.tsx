import React, { useState } from 'react';
import { Player } from '../store/useStore';

interface VoteBoardProps {
  players: Player[];
  onVoteComplete: (votes: Record<string, string>) => void;
  voterIds: string[];
  prompt?: string;
}

export const VoteBoard: React.FC<VoteBoardProps> = ({
  players,
  onVoteComplete,
  voterIds,
  prompt = 'Vote to banish:',
}) => {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);

  const activePlayers = players.filter((p) => p.status === 'active' || p.status === 'finalist');
  const voters = players.filter((p) => voterIds.includes(p.id));
  const currentVoter = voters[currentVoterIndex];

  const handleVote = (targetId: string) => {
    const newVotes = { ...votes, [currentVoter.id]: targetId };
    setVotes(newVotes);

    if (currentVoterIndex < voters.length - 1) {
      setCurrentVoterIndex(currentVoterIndex + 1);
    } else {
      onVoteComplete(newVotes);
    }
  };

  const tallyVotes = (votes: Record<string, string>): Record<string, number> => {
    const tally: Record<string, number> = {};
    Object.values(votes).forEach((targetId) => {
      tally[targetId] = (tally[targetId] || 0) + 1;
    });
    return tally;
  };

  if (!currentVoter) {
    const tally = tallyVotes(votes);
    return (
      <div className="space-y-4">
        <h3 className="font-display text-xl" style={{ color: 'var(--flame)' }}>
          The Votes Are Cast
        </h3>
        {activePlayers.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <span style={{ color: 'var(--ink)' }}>{p.name}</span>
            <div className="flex-1 h-2 bg-[rgba(182,168,146,0.15)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((tally[p.id] || 0) / voters.length) * 100}%`,
                  backgroundColor: 'var(--crimson)',
                }}
              />
            </div>
            <span className="font-bold" style={{ color: 'var(--flame)' }}>
              {tally[p.id] || 0}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Voter {currentVoterIndex + 1} of {voters.length}
        </p>
        <p className="font-display text-2xl" style={{ color: 'var(--ink)' }}>
          {currentVoter.name}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {activePlayers
          .filter((p) => p.id !== currentVoter.id)
          .map((p) => (
            <button
              key={p.id}
              className="p-3 rounded-lg border text-left transition-all hover:scale-105"
              style={{
                borderColor: 'rgba(182,168,146,0.3)',
                backgroundColor: 'var(--bg-raise)',
                color: 'var(--ink)',
              }}
              onClick={() => handleVote(p.id)}
            >
              {p.name}
            </button>
          ))}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        This vote is anonymous — face the screen away from others while voting
      </p>
    </div>
  );
};
