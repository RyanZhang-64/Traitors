import React from 'react';
import { useStore } from '../store/useStore';
import type { GameResult } from '../store/useStore';
import { ResultsSplash } from '../components/ResultsSplash';
import { Scheduler } from '../services/Scheduler';

// Import all game components
import { KnightsKnaves } from '../games/KnightsKnaves';
import { MiniEinstein } from '../games/MiniEinstein';
import { Whodunnit } from '../games/Whodunnit';
import { CodeBreaker } from '../games/CodeBreaker';
import { LateralMystery } from '../games/LateralMystery';
import { SabotageTriva } from '../games/SabotageTriva';
import { CategoryRoulette } from '../games/CategoryRoulette';
import { Timeline } from '../games/Timeline';
import { ZoomedIn } from '../games/ZoomedIn';
import { NameThatTune } from '../games/NameThatTune';
import { AnagramRace } from '../games/AnagramRace';
import { Balderdash } from '../games/Balderdash';
import { CodenamesLite } from '../games/CodenamesLite';
import { Taboo } from '../games/Taboo';
import { WordChain } from '../games/WordChain';
import { EstimationChallenge } from '../games/EstimationChallenge';
import { HigherLower } from '../games/HigherLower';
import { PriceIsRight } from '../games/PriceIsRight';
import { GarticPhone } from '../games/GarticPhone';
import { QuickDraw } from '../games/QuickDraw';
import { EmojiStory } from '../games/EmojiStory';
import { SpotTheChange } from '../games/SpotTheChange';
import { Echo } from '../games/Echo';
import { Eyewitness } from '../games/Eyewitness';
import { ReactionDuel } from '../games/ReactionDuel';
import { TypeRacer } from '../games/TypeRacer';
import { SimonSays } from '../games/SimonSays';
import { TwoTruthsLie } from '../games/TwoTruthsLie';
import { HotTakes } from '../games/HotTakes';
import { AlibiBuilder } from '../games/AlibiBuilder';

const GAME_MAP: Record<string, React.ComponentType<{ onComplete: (result: GameResult) => void }>> = {
  knights_knaves: KnightsKnaves,
  mini_einstein: MiniEinstein,
  whodunnit: Whodunnit,
  code_breaker: CodeBreaker,
  lateral_mystery: LateralMystery,
  sabotage_trivia: SabotageTriva,
  category_roulette: CategoryRoulette,
  timeline: Timeline,
  zoomed_in: ZoomedIn,
  name_that_tune: NameThatTune,
  anagram_race: AnagramRace,
  balderdash: Balderdash,
  codenames_lite: CodenamesLite,
  taboo: Taboo,
  word_chain: WordChain,
  estimation_challenge: EstimationChallenge,
  higher_lower: HigherLower,
  price_is_right: PriceIsRight,
  gartic_phone: GarticPhone,
  quick_draw: QuickDraw,
  emoji_story: EmojiStory,
  spot_the_change: SpotTheChange,
  echo: Echo,
  eyewitness: Eyewitness,
  reaction_duel: ReactionDuel,
  type_racer: TypeRacer,
  simon_says: SimonSays,
  two_truths_lie: TwoTruthsLie,
  hot_takes: HotTakes,
  alibi_builder: AlibiBuilder,
};

export const GameRunner: React.FC = () => {
  const store = useStore();
  const { activeGame, lastResult, players, stage, completeGame, setStage, setMenu, advanceChooserQueue, scheduler, config } = store;

  const handleComplete = (result: GameResult) => {
    completeGame(result);
  };

  const handleContinueFromResults = () => {
    // Advance scheduler
    const nextStage = Scheduler.getNextStage(useStore.getState());

    // Reset menu
    setMenu([]);
    advanceChooserQueue();

    setStage(nextStage);
  };

  if (stage === 'results' && lastResult) {
    return (
      <ResultsSplash
        result={lastResult}
        players={players}
        onContinue={handleContinueFromResults}
      />
    );
  }

  if (stage === 'game' && activeGame) {
    const GameComponent = GAME_MAP[activeGame.moduleId];
    if (!GameComponent) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <p style={{ color: 'var(--ember)' }}>Unknown game: {activeGame.moduleId}</p>
          <button
            className="px-6 py-2 rounded-xl font-bold"
            style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
            onClick={() => setStage('hub')}
          >
            Back to Hub
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen overflow-y-auto pt-20 pb-6 stage-enter">
        <GameComponent onComplete={handleComplete} />
      </div>
    );
  }

  return null;
};
