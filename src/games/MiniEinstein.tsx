import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { masterBank } from '../data/masterBank';
import { ScoreService } from '../services/ScoreService';
import type { GameResult } from '../store/useStore';

interface MiniEinsteinProps {
  onComplete: (result: GameResult) => void;
}

const COLORS = ['Red', 'Yellow', 'Blue', 'Green'];
const PETS = ['Bird', 'Cat', 'Fish', 'Dog'];
const DRINKS = ['Tea', 'Cola', 'Milk', 'Coffee'];
const ATTRS = { color: COLORS, pet: PETS, drink: DRINKS };

export const MiniEinstein: React.FC<MiniEinsteinProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const solution = masterBank.mini_einstein.solution;
  const clues = masterBank.mini_einstein.clues;

  type GridRow = { color: string; pet: string; drink: string };
  const emptyGrid = (): GridRow[] => [1, 2, 3, 4].map(() => ({ color: '', pet: '', drink: '' }));

  const [grid, setGrid] = useState<GridRow[]>(emptyGrid());
  const [submitted, setSubmitted] = useState(false);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  const currentPlayer = alivePlayers[playerIndex];

  const setCell = (house: number, attr: keyof GridRow, val: string) => {
    const newGrid = [...grid];
    newGrid[house] = { ...newGrid[house], [attr]: val };
    setGrid(newGrid);
  };

  const checkSolution = () => {
    let correct = 0;
    solution.forEach((row, i) => {
      if (
        grid[i].color === row.color &&
        grid[i].pet === row.pet &&
        grid[i].drink === row.drink
      ) correct++;
    });
    return correct;
  };

  const handleSubmit = () => {
    const correct = checkSolution();
    const newScores = { ...scores, [currentPlayer.id]: correct };
    if (playerIndex < alivePlayers.length - 1) {
      setGrid(emptyGrid());
      setScores(newScores);
      setPlayerIndex(playerIndex + 1);
    } else {
      setScores(newScores);
      setSubmitted(true);
    }
  };

  if (submitted) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);

    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Results</h2>
        <div className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
          <p>Solution: House 1=Red,Bird,Tea / House 2=Yellow,Cat,Cola / House 3=Blue,Fish,Milk / House 4=Green,Dog,Coffee</p>
        </div>
        <div className="w-full max-w-sm space-y-2">
          {alivePlayers.map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0}/4 rows correct {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'mini_einstein',
            summary: topPlayer ? `${topPlayer.name} cracked the grid!` : 'The puzzle beat everyone!',
            coinDeltas,
            shieldsAwarded: {},
            suspicionDeltas: {},
            tells: [],
            timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Mini-Einstein</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Player {playerIndex + 1}/{alivePlayers.length}: <span style={{ color: 'var(--ink)' }}>{currentPlayer?.name}</span>
        </p>
      </div>

      <div className="rounded-xl p-3 space-y-1"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--flame)' }}>Clues:</h3>
        {clues.map((c, i) => (
          <p key={i} className="text-xs" style={{ color: 'var(--muted)' }}>{i + 1}. {c}</p>
        ))}
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3].map((house) => (
          <div key={house} className="p-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--flame)' }}>House {house + 1}</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ATTRS) as (keyof typeof ATTRS)[]).map((attr) => (
                <select
                  key={attr}
                  value={grid[house][attr]}
                  onChange={(e) => setCell(house, attr, e.target.value)}
                  className="text-xs py-1 px-2 rounded"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)', border: '1px solid rgba(182,168,146,0.2)' }}
                >
                  <option value="">{attr}…</option>
                  {ATTRS[attr].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleSubmit}>
        Submit My Solution
      </button>
    </div>
  );
};
