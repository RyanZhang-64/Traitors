import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { HUD } from './components/HUD';
import { Lobby } from './stages/Lobby';
import { Onboarding } from './stages/Onboarding';
import { Hub } from './stages/Hub';
import { RoundTable } from './stages/RoundTable';
import { Intermission } from './stages/Intermission';
import { Finale } from './stages/Finale';
import { Recap } from './stages/Recap';
import { GameRunner } from './stages/GameRunner';
import { Persistence } from './services/Persistence';

function App() {
  const { stage, loadSession } = useStore();

  // Attempt to restore session on mount
  useEffect(() => {
    try {
      const saved = Persistence.load();
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if we were mid-game
        if (parsed.stage && parsed.stage !== 'lobby') {
          loadSession(saved);
        }
      }
    } catch {
      // silent fail
    }
  }, []);

  const renderStage = () => {
    switch (stage) {
      case 'lobby':
        return <Lobby />;
      case 'onboarding':
        return <Onboarding />;
      case 'hub':
        return <Hub />;
      case 'game':
      case 'results':
        return <GameRunner />;
      case 'roundTable':
        return <RoundTable />;
      case 'intermission':
        return <Intermission />;
      case 'finale':
        return <Finale />;
      case 'recap':
        return <Recap />;
      default:
        return <Lobby />;
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <HUD />
      <main className="w-full">
        {renderStage()}
      </main>
    </div>
  );
}

export default App;
