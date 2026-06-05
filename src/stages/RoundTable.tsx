import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CountdownRing } from '../components/CountdownRing';
import { VoteBoard } from '../components/VoteBoard';
import { RevealCard } from '../components/RevealCard';

type RoundTableStep = 'intro' | 'discussion' | 'vote' | 'reveal' | 'banish';

export const RoundTable: React.FC = () => {
  const { players, conclave, banishPlayer, setStage, scheduler, advanceChooserQueue } = useStore();
  const [step, setStep] = useState<RoundTableStep>('intro');
  const [discussionTime, setDiscussionTime] = useState(240); // 4 min default
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [banishedId, setBanishedId] = useState<string | null>(null);
  const [revealedChips, setRevealedChips] = useState<string[]>([]);

  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const handleVoteComplete = (v: Record<string, string>) => {
    setVotes(v);
    setStep('reveal');
    // Reveal chip by chip
    const sorted = Object.entries(v)
      .reduce((acc: Record<string, number>, [, target]) => {
        acc[target] = (acc[target] || 0) + 1;
        return acc;
      }, {});

    const voterIds = alivePlayers.map((p) => p.id);
    let delay = 0;
    voterIds.forEach((id) => {
      setTimeout(() => {
        setRevealedChips((prev) => [...prev, id]);
      }, delay);
      delay += 800;
    });

    // Determine banished (most votes)
    const banished = Object.entries(sorted).sort((a, b) => b[1] - a[1])[0];
    if (banished) {
      setTimeout(() => {
        setBanishedId(banished[0]);
        setStep('banish');
      }, delay + 500);
    }
  };

  const handleBanish = () => {
    if (!banishedId) return;
    banishPlayer(banishedId);
    advanceChooserQueue();
    setStage('hub');
  };

  const handleNoVote = () => {
    // No consensus — continue without banishment
    advanceChooserQueue();
    setStage('hub');
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
        <div className="max-w-md text-center space-y-8">
          <div className="text-6xl">⚔️</div>
          <h1
            className="font-display text-5xl font-bold candle-flicker"
            style={{ color: 'var(--crimson)', textShadow: '0 0 30px rgba(142,36,51,0.6)' }}
          >
            Round Table
          </h1>
          <p style={{ color: 'var(--ink)' }}>
            The Faithful gather to root out the Traitors.
            Discuss, accuse, and vote to banish.
          </p>
          <div className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Set discussion time:</p>
            <div className="flex justify-center gap-2">
              {[180, 240, 300].map((s) => (
                <button
                  key={s}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: discussionTime === s ? 'var(--crimson)' : 'var(--bg-raise)',
                    color: discussionTime === s ? 'white' : 'var(--muted)',
                    border: `1px solid ${discussionTime === s ? 'var(--crimson)' : 'rgba(182,168,146,0.2)'}`,
                  }}
                  onClick={() => setDiscussionTime(s)}
                >
                  {s / 60} min
                </button>
              ))}
            </div>
          </div>
          <button
            className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--crimson)', color: 'white' }}
            onClick={() => setStep('discussion')}
          >
            Begin Discussion ▶
          </button>
        </div>
      </div>
    );
  }

  if (step === 'discussion') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
        <div className="max-w-xl w-full space-y-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--crimson)' }}>
              Discussion
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              Debate who might be a Traitor
            </p>
          </div>

          <div className="flex justify-center">
            <CountdownRing
              totalSeconds={discussionTime}
              onExpire={() => setStep('vote')}
              size={120}
              strokeWidth={8}
              color="var(--crimson)"
            />
          </div>

          {/* Player circle */}
          <div className="grid grid-cols-3 gap-3">
            {alivePlayers.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}
              >
                <div className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{p.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {p.coins} coins · {p.suspicion}% sus
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-full py-3 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--crimson)', color: 'white' }}
            onClick={() => setStep('vote')}
          >
            Begin Voting ▶
          </button>
        </div>
      </div>
    );
  }

  if (step === 'vote') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--crimson)' }}>
              Cast Your Vote
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              Each player votes anonymously
            </p>
          </div>
          <VoteBoard
            players={players}
            onVoteComplete={handleVoteComplete}
            voterIds={conclave.aliveIds}
            prompt="Vote to banish:"
          />
          <button
            className="w-full py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={handleNoVote}
          >
            No consensus — continue without banishment
          </button>
        </div>
      </div>
    );
  }

  if (step === 'reveal') {
    const tally = Object.values(votes).reduce((acc: Record<string, number>, target) => {
      acc[target] = (acc[target] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
        <div className="max-w-md w-full space-y-6">
          <h2 className="font-display text-3xl font-bold text-center" style={{ color: 'var(--crimson)' }}>
            The Votes Reveal...
          </h2>
          <div className="space-y-3">
            {alivePlayers
              .sort((a, b) => (tally[b.id] || 0) - (tally[a.id] || 0))
              .map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    revealedChips.includes(p.id) ? 'chip-reveal' : 'opacity-0'
                  }`}
                  style={{
                    backgroundColor: (tally[p.id] || 0) > 0 ? 'rgba(142,36,51,0.15)' : 'var(--bg-raise)',
                    border: `1px solid ${(tally[p.id] || 0) > 0 ? 'var(--crimson)' : 'rgba(182,168,146,0.15)'}`,
                    animationDelay: `${i * 200}ms`,
                  }}
                >
                  <span style={{ color: 'var(--ink)' }}>{p.name}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: tally[p.id] || 0 }).map((_, j) => (
                      <span key={j} className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--crimson)' }} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>Tallying votes...</p>
        </div>
      </div>
    );
  }

  // Banish step
  const banishedPlayer = players.find((p) => p.id === banishedId);
  if (!banishedPlayer) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
      <div className="max-w-md w-full text-center space-y-8">
        <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--crimson)' }}>
          Banished!
        </h2>
        <p className="text-xl" style={{ color: 'var(--ink)' }}>
          <span style={{ color: 'var(--flame)' }}>{banishedPlayer.name}</span> is cast out of the castle.
        </p>

        <div className="flex justify-center">
          <RevealCard
            front={
              <div className="flex flex-col items-center gap-3">
                <div className="text-5xl">🕯️</div>
                <p className="font-display text-xl" style={{ color: 'var(--muted)' }}>
                  Tap to reveal {banishedPlayer.name}'s role
                </p>
              </div>
            }
            back={
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-4 rounded-xl p-6"
                style={{
                  backgroundColor: banishedPlayer.role === 'traitor' ? 'rgba(142,36,51,0.3)' : 'rgba(111,143,106,0.2)',
                  border: `2px solid ${banishedPlayer.role === 'traitor' ? 'var(--ember)' : 'var(--sage)'}`,
                }}
              >
                <div className="text-5xl">{banishedPlayer.role === 'traitor' ? '🗡️' : '🛡️'}</div>
                <div
                  className="font-display text-3xl font-bold"
                  style={{ color: banishedPlayer.role === 'traitor' ? 'var(--ember)' : 'var(--sage)' }}
                >
                  {banishedPlayer.role === 'traitor' ? 'TRAITOR' : 'FAITHFUL'}
                </div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {banishedPlayer.role === 'traitor'
                    ? 'A Traitor has been unmasked!'
                    : 'The Faithful paid the price...'}
                </p>
              </div>
            }
            width="200px"
            height="260px"
          />
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--crimson)', color: 'white' }}
            onClick={handleBanish}
          >
            Confirm Banishment
          </button>
          <button
            className="flex-1 py-3 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={handleNoVote}
          >
            No banishment
          </button>
        </div>
      </div>
    </div>
  );
};
