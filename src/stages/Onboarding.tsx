import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { RoleCard } from '../components/RevealCard';

type OnboardingStep = 'pass' | 'reveal' | 'passBack';

export const Onboarding: React.FC = () => {
  const { players, initRoles, setStage } = useStore();
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro
  const [step, setStep] = useState<OnboardingStep>('pass');
  const [rolesReady, setRolesReady] = useState(false);

  const currentPlayer = currentIndex >= 0 ? players[currentIndex] : null;

  const handleStart = () => {
    initRoles();
    setRolesReady(true);
    setCurrentIndex(0);
    setStep('pass');
  };

  const handlePassedToPlayer = () => {
    setStep('reveal');
  };

  const handleRoleSeen = () => {
    setStep('passBack');
  };

  const handlePassedBack = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStep('pass');
    } else {
      // All done — go to hub
      setStage('hub');
    }
  };

  // Intro screen
  if (currentIndex === -1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 stage-enter">
        <div className="max-w-sm text-center space-y-8">
          <h1
            className="font-display text-5xl font-bold candle-flicker"
            style={{ color: 'var(--flame)', textShadow: '0 0 30px rgba(232,163,61,0.5)' }}
          >
            Role Assignment
          </h1>
          <p style={{ color: 'var(--ink)' }}>
            Each player will receive their secret role.
            Pass the device to each player in turn — alone, in secret.
          </p>
          <div
            className="p-4 rounded-xl text-sm space-y-2"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)', color: 'var(--muted)' }}
          >
            <p><span style={{ color: 'var(--sage)' }}>Faithful</span> — find and banish the Traitors</p>
            <p><span style={{ color: 'var(--ember)' }}>Traitor</span> — deceive the Faithful, survive the vote</p>
            <p style={{ color: 'var(--flame)' }}>Your role is strictly private — tell no one!</p>
          </div>
          <button
            className="w-full py-4 rounded-xl font-display text-xl font-bold tracking-widest"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={handleStart}
          >
            Assign Roles ▶
          </button>
        </div>
      </div>
    );
  }

  if (!currentPlayer || !rolesReady) return null;

  // Pass screen
  if (step === 'pass') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 stage-enter"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="max-w-sm text-center space-y-8">
          <p className="text-base" style={{ color: 'var(--muted)' }}>
            Player {currentIndex + 1} of {players.length}
          </p>
          <h2
            className="font-display text-4xl font-bold"
            style={{ color: 'var(--ink)' }}
          >
            Pass to
          </h2>
          <h3
            className="font-display text-5xl font-bold candle-flicker"
            style={{ color: 'var(--flame)' }}
          >
            {currentPlayer.name}
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Make sure only {currentPlayer.name} can see the screen, then tap below.
          </p>
          <button
            className="w-full py-4 rounded-xl font-bold text-lg"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.3)' }}
            onClick={handlePassedToPlayer}
          >
            Only I can see the screen ▶
          </button>
        </div>
      </div>
    );
  }

  // Reveal screen
  if (step === 'reveal') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 stage-enter"
        style={{ backgroundColor: '#0A0806' }}
      >
        <div className="max-w-sm text-center space-y-8">
          <p className="font-display text-xl" style={{ color: 'var(--muted)' }}>
            {currentPlayer.name}, your role is…
          </p>
          <div className="flex justify-center">
            <RoleCard role={currentPlayer.role} onDone={handleRoleSeen} />
          </div>
        </div>
      </div>
    );
  }

  // Pass back screen
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 stage-enter"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-sm text-center space-y-8">
        <div className="text-6xl">🔒</div>
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>
          Role memorised?
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          Pass the device back to the host, face down.
          Tell no one your role!
        </p>
        <button
          className="w-full py-4 rounded-xl font-bold text-lg"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handlePassedBack}
        >
          {currentIndex < players.length - 1
            ? `Next player: ${players[currentIndex + 1].name} →`
            : 'Begin the Night →'}
        </button>
      </div>
    </div>
  );
};
