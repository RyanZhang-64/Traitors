import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { codenamesWords } from '../data/wordlist';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface CodenamesLiteProps {
  onComplete: (result: GameResult) => void;
}

type CardTeam = 'red' | 'blue' | 'neutral' | 'assassin';

interface WordCard {
  word: string;
  team: CardTeam;
  revealed: boolean;
}

export const CodenamesLite: React.FC<CodenamesLiteProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const [phase, setPhase] = useState<'setup' | 'play'>('setup');
  const [cards, setCards] = useState<WordCard[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'red' | 'blue'>('red');
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'red' | 'blue' | null>(null);
  const [clue, setClue] = useState('');
  const [clueCount, setClueCount] = useState(1);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [phase2, setPhase2] = useState<'give_clue' | 'guess'>('give_clue');

  const RED_TOTAL = 9;
  const BLUE_TOTAL = 8;

  useEffect(() => {
    if (phase === 'setup') {
      const shuffled = [...codenamesWords].sort(() => Math.random() - 0.5).slice(0, 25);
      const teams: CardTeam[] = [
        ...Array(RED_TOTAL).fill('red'),
        ...Array(BLUE_TOTAL).fill('blue'),
        ...Array(7).fill('neutral'),
        'assassin',
      ];
      const shuffledTeams = teams.sort(() => Math.random() - 0.5) as CardTeam[];
      const wordCards: WordCard[] = shuffled.map((word, i) => ({
        word, team: shuffledTeams[i], revealed: false,
      }));
      setCards(wordCards);
      setPhase('play');
    }
  }, []);

  const handleReveal = (idx: number) => {
    if (phase2 !== 'guess' || guessesLeft <= 0) return;
    const card = cards[idx];
    if (card.revealed) return;

    const newCards = [...cards];
    newCards[idx] = { ...card, revealed: true };
    setCards(newCards);

    if (card.team === 'assassin') {
      setWinner(currentTeam === 'red' ? 'blue' : 'red');
      setGameOver(true);
      return;
    }

    if (card.team === currentTeam) {
      const count = newCards.filter(c => c.team === currentTeam && c.revealed).length;
      const total = currentTeam === 'red' ? RED_TOTAL : BLUE_TOTAL;
      setScores(s => ({ ...s, [currentTeam]: count }));
      if (count >= total) {
        setWinner(currentTeam);
        setGameOver(true);
        return;
      }
      setGuessesLeft(g => g - 1);
      if (guessesLeft - 1 <= 0) {
        setCurrentTeam(t => t === 'red' ? 'blue' : 'red');
        setPhase2('give_clue');
      }
    } else {
      setCurrentTeam(t => t === 'red' ? 'blue' : 'red');
      setPhase2('give_clue');
      setGuessesLeft(0);
    }
  };

  const handleGiveClue = () => {
    if (!clue.trim()) return;
    setGuessesLeft(clueCount + 1);
    setPhase2('guess');
    setClue('');
  };

  const teamColor = (team: 'red' | 'blue') => team === 'red' ? 'var(--ember)' : '#4A8BB5';
  const teamBg = (team: 'red' | 'blue') => team === 'red' ? 'rgba(181,64,46,0.2)' : 'rgba(74,139,181,0.2)';

  if (gameOver) {
    const winTeam = winner || 'red';
    const redPlayers = alivePlayers.filter((_, i) => i % 2 === 0);
    const bluePlayers = alivePlayers.filter((_, i) => i % 2 === 1);
    const winnersIds = winTeam === 'red' ? redPlayers.map(p => p.id) : bluePlayers.map(p => p.id);
    const scoreMap: Record<string, number> = {};
    alivePlayers.forEach(p => {
      scoreMap[p.id] = winnersIds.includes(p.id) ? 3 : 1;
    });
    const coinDeltas = ScoreService.computeCoinDeltas(scoreMap, alivePlayers);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: teamColor(winTeam) }}>
          {winTeam === 'red' ? 'Red' : 'Blue'} Team Wins!
        </h2>
        <p style={{ color: 'var(--muted)' }}>Final: Red {scores.red}/{RED_TOTAL} · Blue {scores.blue}/{BLUE_TOTAL}</p>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'codenames_lite',
            summary: `${winTeam === 'red' ? 'Red' : 'Blue'} team won Codenames!`,
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase !== 'play') return <div style={{ color: 'var(--ink)' }} className="p-4">Setting up...</div>;

  return (
    <div className="flex flex-col gap-3 p-3 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Codenames-Lite</h2>
        <div className="flex gap-3">
          <span className="text-sm font-bold" style={{ color: teamColor('red') }}>Red: {scores.red}/{RED_TOTAL}</span>
          <span className="text-sm font-bold" style={{ color: teamColor('blue') }}>Blue: {scores.blue}/{BLUE_TOTAL}</span>
        </div>
      </div>

      <div
        className="rounded-xl p-3 text-center"
        style={{ backgroundColor: teamBg(currentTeam), border: `1px solid ${teamColor(currentTeam)}` }}>
        <p className="font-bold" style={{ color: teamColor(currentTeam) }}>
          {currentTeam.toUpperCase()} Team's Turn
          {phase2 === 'guess' && ` — ${guessesLeft} guess${guessesLeft !== 1 ? 'es' : ''} left`}
        </p>
      </div>

      {phase2 === 'give_clue' ? (
        <div className="flex gap-2">
          <input type="text" value={clue}
            onChange={(e) => setClue(e.target.value)}
            placeholder="One-word clue..."
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleGiveClue()}
          />
          <select value={clueCount} onChange={(e) => setClueCount(Number(e.target.value))}
            className="text-sm px-2"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.3)', borderRadius: '6px' }}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button className="px-4 py-2 rounded-lg font-bold text-sm"
            style={{ backgroundColor: teamColor(currentTeam), color: 'white' }}
            onClick={handleGiveClue} disabled={!clue.trim()}>
            Give Clue
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm" style={{ color: 'var(--ink)' }}>Guessing cards...</p>
          <button className="text-xs px-3 py-1 rounded-lg"
            style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
            onClick={() => { setCurrentTeam(t => t === 'red' ? 'blue' : 'red'); setPhase2('give_clue'); setGuessesLeft(0); }}>
            End turn
          </button>
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5">
        {cards.map((card, i) => (
          <button key={i}
            className="aspect-[3/2] flex items-center justify-center text-xs font-bold rounded-lg transition-all hover:scale-105 p-1 text-center leading-tight"
            style={{
              backgroundColor: card.revealed
                ? card.team === 'red' ? 'rgba(181,64,46,0.6)'
                  : card.team === 'blue' ? 'rgba(74,139,181,0.6)'
                  : card.team === 'assassin' ? '#1a1a1a'
                  : 'rgba(182,168,146,0.2)'
                : 'var(--bg-raise)',
              color: card.revealed ? 'white' : 'var(--ink)',
              border: `1px solid ${card.revealed
                ? card.team === 'red' ? 'var(--ember)'
                  : card.team === 'blue' ? '#4A8BB5'
                  : card.team === 'assassin' ? '#333'
                  : 'rgba(182,168,146,0.15)'
                : 'rgba(182,168,146,0.2)'}`,
              opacity: card.revealed ? 0.7 : 1,
              cursor: phase2 === 'guess' && !card.revealed ? 'pointer' : 'default',
            }}
            onClick={() => handleReveal(i)}
            disabled={card.revealed || phase2 === 'give_clue'}>
            {card.word}
          </button>
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        Spymaster: show key card to spymaster only. Tap cards when team guesses.
      </p>
    </div>
  );
};
