import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface SimonSaysProps {
  onComplete: (result: GameResult) => void;
}

const COMMANDS = [
  'Stand up', 'Sit down', 'Clap your hands', 'Touch your nose',
  'Wave hello', 'Jump once', 'Spin around', 'Stomp your feet',
  'Raise your right hand', 'Touch your ears', 'Pat your head',
  'Shake hands with your neighbour', 'Point to the ceiling',
];

export const SimonSays: React.FC<SimonSaysProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [round, setRound] = useState(0);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isSimon, setIsSimon] = useState(false);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'command' | 'result'>('intro');
  const [commandIdx, setCommandIdx] = useState(0);

  const activePlayers = alivePlayers.filter(p => !eliminated.includes(p.id));
  const MAX_ROUNDS = 12;

  const generateCommand = () => {
    const isSimonCmd = Math.random() > 0.35;
    const cmd = COMMANDS[commandIdx % COMMANDS.length];
    const prefix = isSimonCmd ? 'Simon says: ' : '';
    setCurrentCommand(prefix + cmd);
    setIsSimon(isSimonCmd);
    setCommandIdx(c => c + 1);
    setPhase('command');
  };

  const handleEliminate = (playerId: string) => {
    const newElim = [...eliminated, playerId];
    setEliminated(newElim);
    if (activePlayers.filter(p => p.id !== playerId).length <= 1) {
      setGameOver(true);
    } else {
      setPhase('result');
    }
  };

  const handleCorrect = () => {
    // All remaining players scored correctly
    activePlayers.forEach(p => {
      setScores(s => ({ ...s, [p.id]: (s[p.id] || 0) + 1 }));
    });
    const newRound = round + 1;
    setRound(newRound);
    if (newRound >= MAX_ROUNDS || activePlayers.length <= 1) {
      setGameOver(true);
    } else {
      setPhase('result');
    }
  };

  if (gameOver) {
    const winner = activePlayers[0];
    const finalScores = { ...scores };
    if (winner) finalScores[winner.id] = (finalScores[winner.id] || 0) + 3;
    const coinDeltas = ScoreService.computeCoinDeltas(finalScores, alivePlayers);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Simon Says... Done!</h2>
        {winner && <p className="text-xl" style={{ color: 'var(--ink)' }}>{winner.name} is the last one standing!</p>}
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
            moduleId: 'simon_says',
            summary: winner ? `${winner.name} obeyed Simon best!` : 'Simon beat everyone!',
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
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Simon Says</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Round {round + 1}/{MAX_ROUNDS} · {activePlayers.length} active
        </p>
      </div>

      {phase === 'intro' && (
        <div className="space-y-4 text-center">
          <p style={{ color: 'var(--ink)' }}>
            Host reads commands aloud. Players must only follow commands that start with <span style={{ color: 'var(--flame)' }}>"Simon says"</span>!
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>If someone follows a command without "Simon says" — tap their name to eliminate them!</p>
          <button className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={generateCommand}>
            Start! ▶
          </button>
        </div>
      )}

      {phase === 'command' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: isSimon ? 'rgba(111,143,106,0.2)' : 'rgba(181,64,46,0.1)',
              border: `2px solid ${isSimon ? 'var(--sage)' : 'rgba(181,64,46,0.4)'}`,
            }}>
            <p className="font-display text-2xl font-bold" style={{ color: isSimon ? 'var(--sage)' : 'var(--ember)' }}>
              {currentCommand}
            </p>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            {isSimon ? '✓ Players SHOULD do this' : '✗ Players should NOT do this!'}
          </p>

          <div className="space-y-2">
            <p className="text-sm font-bold text-center" style={{ color: 'var(--ink)' }}>
              Tap to eliminate a player who did the wrong thing:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {activePlayers.map((p) => (
                <button key={p.id}
                  className="py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: 'rgba(181,64,46,0.2)', color: 'var(--ember)', border: '1px solid rgba(181,64,46,0.4)' }}
                  onClick={() => handleEliminate(p.id)}>
                  ✗ {p.name} out
                </button>
              ))}
            </div>
          </div>

          <button className="w-full py-3 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
            onClick={handleCorrect}>
            Everyone did it right ✓
          </button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4 text-center">
          <p className="text-xl" style={{ color: 'var(--ink)' }}>
            {activePlayers.length} players remain
          </p>
          <button className="w-full py-4 rounded-xl font-display text-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={generateCommand}>
            Next Command ▶
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {alivePlayers.map((p) => (
          <span key={p.id} className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: eliminated.includes(p.id) ? 'rgba(182,168,146,0.05)' : 'var(--bg-raise)',
              color: eliminated.includes(p.id) ? 'var(--muted)' : 'var(--ink)',
              textDecoration: eliminated.includes(p.id) ? 'line-through' : 'none',
              border: '1px solid rgba(182,168,146,0.1)',
            }}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
};
