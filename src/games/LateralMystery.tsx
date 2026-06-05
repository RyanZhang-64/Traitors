import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { lateralPuzzles } from '../data/lateralPuzzles';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface LateralMysteryProps {
  onComplete: (result: GameResult) => void;
}

type AnswerType = 'yes' | 'no' | 'irrelevant';

interface QA {
  question: string;
  answer: AnswerType;
}

export const LateralMystery: React.FC<LateralMysteryProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const puzzle = lateralPuzzles[Math.floor(Math.random() * lateralPuzzles.length)];
  const [qaList, setQaList] = useState<QA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [solved, setSolved] = useState(false);
  const [solverIds, setSolverIds] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  const handleAnswer = (answer: AnswerType) => {
    if (!currentQuestion.trim()) return;
    setQaList([...qaList, { question: currentQuestion.trim(), answer }]);
    setCurrentQuestion('');
  };

  const handlePlayerSolved = (id: string) => {
    if (!solverIds.includes(id)) {
      setSolverIds([...solverIds, id]);
    }
  };

  const handleFinish = () => {
    const scores: Record<string, number> = {};
    solverIds.forEach((id, i) => {
      scores[id] = Math.max(1, 4 - i);
    });
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = solverIds[0];
    const topPlayer = players.find((p) => p.id === top);
    onComplete({
      moduleId: 'lateral_mystery',
      summary: topPlayer ? `${topPlayer.name} solved the mystery first!` : 'The mystery remains unsolved!',
      coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
    });
  };

  const answerColor: Record<AnswerType, string> = {
    yes: 'var(--sage)',
    no: 'var(--ember)',
    irrelevant: 'var(--muted)',
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Lateral Mystery</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Host reads the scenario. Players ask yes/no questions to solve it.
        </p>
      </div>

      {/* Scenario (host-only) */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(142,36,51,0.1)', border: '1px solid rgba(142,36,51,0.3)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: 'var(--crimson)' }}>HOST ONLY — read aloud:</p>
        <p className="italic text-sm" style={{ color: 'var(--ink)' }}>&ldquo;{puzzle.scenario}&rdquo;</p>
      </div>

      {/* Q&A log */}
      {qaList.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {qaList.map((qa, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--muted)' }}>Q: {qa.question}</span>
              <span className="font-bold" style={{ color: answerColor[qa.answer] }}>
                {qa.answer.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Ask a question */}
      <div className="flex gap-2">
        <input type="text" value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          placeholder="Type player's question..."
          className="flex-1 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAnswer('yes')}
        />
      </div>

      <div className="flex gap-2">
        {(['yes', 'no', 'irrelevant'] as AnswerType[]).map((a) => (
          <button key={a}
            className="flex-1 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
            style={{ backgroundColor: answerColor[a] + '33', color: answerColor[a], border: `1px solid ${answerColor[a]}` }}
            onClick={() => handleAnswer(a)}
            disabled={!currentQuestion.trim()}>
            {a.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Who solved it */}
      <div className="space-y-2">
        <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Who solved it? (tap to add)</p>
        <div className="flex flex-wrap gap-2">
          {alivePlayers.map((p) => (
            <button key={p.id}
              className="px-3 py-1.5 rounded-full text-sm transition-all"
              style={{
                backgroundColor: solverIds.includes(p.id) ? 'var(--sage)' : 'var(--bg-raise)',
                color: solverIds.includes(p.id) ? 'white' : 'var(--muted)',
                border: `1px solid ${solverIds.includes(p.id) ? 'var(--sage)' : 'rgba(182,168,146,0.2)'}`,
              }}
              onClick={() => handlePlayerSolved(p.id)}>
              {p.name} {solverIds.indexOf(p.id) >= 0 ? `(#${solverIds.indexOf(p.id) + 1})` : ''}
            </button>
          ))}
        </div>
      </div>

      {!showSolution ? (
        <button className="w-full py-2 text-sm rounded-lg"
          style={{ backgroundColor: 'var(--bg-raise)', color: 'var(--muted)', border: '1px solid rgba(182,168,146,0.2)' }}
          onClick={() => setShowSolution(true)}>
          Reveal Solution (host)
        </button>
      ) : (
        <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(111,143,106,0.1)', border: '1px solid var(--sage)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--sage)' }}>SOLUTION:</p>
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{puzzle.solution}</p>
        </div>
      )}

      <button className="w-full py-3 rounded-xl font-bold"
        style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
        onClick={handleFinish}>
        End Game & Score
      </button>
    </div>
  );
};
