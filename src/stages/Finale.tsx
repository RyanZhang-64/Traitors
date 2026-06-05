import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { VoteBoard } from '../components/VoteBoard';

type FinaleStep = 'intro' | 'discussion' | 'vote' | 'reveal';

export const Finale: React.FC = () => {
  const { players, conclave, traitorIds, banishPlayer, setStage } = useStore();
  const [step, setStep] = useState<FinaleStep>('intro');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [embers, setEmbers] = useState<{ id: number; x: number; delay: number }[]>([]);

  const finalCircle = conclave.finalCircle || conclave.aliveIds;
  const finalistsPlayers = players.filter((p) => finalCircle.includes(p.id));
  const traitorFinalists = finalistsPlayers.filter((p) => traitorIds.includes(p.id));
  const faithfulFinalists = finalistsPlayers.filter((p) => !traitorIds.includes(p.id));

  const handleVoteComplete = (v: Record<string, string>) => {
    setVotes(v);
    setStep('reveal');
  };

  // Determine winner
  const tallyVotes = () => {
    const tally: Record<string, number> = {};
    Object.values(votes).forEach((id) => {
      tally[id] = (tally[id] || 0) + 1;
    });
    return tally;
  };

  const tally = tallyVotes();
  const banished = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  const banishedPlayer = banished ? players.find((p) => p.id === banished[0]) : null;

  const traitorSurvived = traitorIds.some((id) => {
    if (!finalCircle.includes(id)) return false;
    if (banishedPlayer?.id === id) return false;
    return true;
  });

  useEffect(() => {
    if (step === 'reveal') {
      const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setEmbers(particles);
    }
  }, [step]);

  // Faithful-win by elimination: all traitors already banished before finale
  if (traitorFinalists.length === 0 && step !== 'reveal') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
        <div className="max-w-md text-center space-y-8">
          <div className="text-6xl">🛡️</div>
          <h1
            className="font-display text-5xl font-bold candle-flicker"
            style={{ color: 'var(--sage)', textShadow: '0 0 40px rgba(111,143,106,0.6)' }}
          >
            The Faithful Triumph!
          </h1>
          <p style={{ color: 'var(--ink)' }}>
            Every Traitor has been unmasked and banished. The Faithful claim victory!
          </p>
          <button
            className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={() => setStage('recap')}
          >
            View Recap →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
        <div className="max-w-md text-center space-y-8">
          <div className="text-6xl">👑</div>
          <h1
            className="font-display text-5xl font-bold candle-flicker"
            style={{ color: 'var(--flame)', textShadow: '0 0 40px rgba(232,163,61,0.7)' }}
          >
            The Final Circle
          </h1>
          <p style={{ color: 'var(--ink)' }}>
            Only {finalistsPlayers.length} remain. This is the final reckoning.
            One last vote decides the fate of the night.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {finalistsPlayers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl text-center"
                style={{
                  backgroundColor: 'var(--bg-raise)',
                  border: '1px solid rgba(232,163,61,0.3)',
                  boxShadow: '0 0 15px rgba(232,163,61,0.15)',
                }}
              >
                <div className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                  {p.name}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--flame)' }}>
                  {p.coins} coins
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={() => setStep('discussion')}
          >
            Begin Final Deliberation ▶
          </button>
        </div>
      </div>
    );
  }

  if (step === 'discussion') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--crimson)' }}>
              Final Deliberation
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              Make your case. This is your last chance.
            </p>
          </div>
          <div className="space-y-3">
            {finalistsPlayers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}
              >
                <div className="font-bold text-lg" style={{ color: 'var(--ink)' }}>{p.name}</div>
                <div className="text-sm mt-1 flex gap-4" style={{ color: 'var(--muted)' }}>
                  <span>{p.coins} coins</span>
                  <span>{p.suspicion}% suspicion</span>
                  <span>{p.shields} shields</span>
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--crimson)', color: 'white' }}
            onClick={() => setStep('vote')}
          >
            Cast Final Votes ▶
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
              Final Vote
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              Choose who to banish from the final circle
            </p>
          </div>
          <VoteBoard
            players={players}
            onVoteComplete={handleVoteComplete}
            voterIds={finalCircle}
            prompt="Vote to banish:"
          />
        </div>
      </div>
    );
  }

  // Reveal
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 stage-enter relative overflow-hidden">
      {/* Ember particles */}
      {embers.map((e) => (
        <div
          key={e.id}
          className="absolute ember-particle w-2 h-2 rounded-full"
          style={{
            left: `${e.x}%`,
            top: '-20px',
            backgroundColor: 'var(--flame)',
            animationDelay: `${e.delay}s`,
            boxShadow: '0 0 6px var(--flame)',
          }}
        />
      ))}

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <h1
          className="font-display text-5xl font-bold candle-flicker"
          style={{ color: 'var(--flame)', textShadow: '0 0 40px rgba(232,163,61,0.7)' }}
        >
          {traitorSurvived ? 'The Traitors Win!' : 'The Faithful Triumph!'}
        </h1>

        {traitorSurvived ? (
          <div className="space-y-3">
            <p style={{ color: 'var(--ink)' }}>
              The Traitors deceived everyone and claimed the prize!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {traitorFinalists.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-2 rounded-full font-bold glow-crimson"
                  style={{ backgroundColor: 'rgba(181,64,46,0.3)', color: 'var(--ember)', border: '1px solid var(--ember)' }}
                >
                  🗡️ {p.name}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p style={{ color: 'var(--ink)' }}>
              The Faithful prevailed and exposed the Traitors!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {faithfulFinalists.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-2 rounded-full font-bold glow-sage"
                  style={{ backgroundColor: 'rgba(111,143,106,0.3)', color: 'var(--sage)', border: '1px solid var(--sage)' }}
                >
                  🛡️ {p.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role reveals */}
        <div className="space-y-3">
          <h3 className="font-display text-xl" style={{ color: 'var(--muted)' }}>Roles Revealed</h3>
          <div className="grid grid-cols-2 gap-3">
            {finalistsPlayers.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl text-center"
                style={{
                  backgroundColor: traitorIds.includes(p.id) ? 'rgba(142,36,51,0.2)' : 'rgba(111,143,106,0.15)',
                  border: `1px solid ${traitorIds.includes(p.id) ? 'var(--ember)' : 'var(--sage)'}`,
                }}
              >
                <div className="text-2xl">{traitorIds.includes(p.id) ? '🗡️' : '🛡️'}</div>
                <div className="font-bold mt-1" style={{ color: 'var(--ink)' }}>{p.name}</div>
                <div
                  className="text-xs font-bold"
                  style={{ color: traitorIds.includes(p.id) ? 'var(--ember)' : 'var(--sage)' }}
                >
                  {traitorIds.includes(p.id) ? 'TRAITOR' : 'FAITHFUL'}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--flame)' }}>
                  {p.coins} coins
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="w-full py-4 rounded-xl font-display text-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => {
            if (banishedPlayer) banishPlayer(banishedPlayer.id);
            setStage('recap');
          }}
        >
          View Recap →
        </button>
      </div>
    </div>
  );
};
