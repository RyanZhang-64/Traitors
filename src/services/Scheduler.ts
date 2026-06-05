import type { SessionState, Stage } from '../store/useStore';

export interface GameModule {
  id: string;
  title: string;
  type: string;
  tagline: string;
  estMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  energy: 'high' | 'low' | 'medium';
  requiresMedia?: boolean;
  requiresDevices?: boolean;
}

export class Scheduler {
  static shouldGoToFinale(state: SessionState): boolean {
    return state.conclave.aliveIds.length <= 3 && state.conclave.aliveIds.length > 0;
  }

  static shouldGoToIntermission(state: SessionState): boolean {
    if (state.scheduler.intermissionDone) return false;
    const elapsed = (Date.now() - state.scheduler.startedAt) / 60000;
    return elapsed >= state.config.targetMinutes * 0.5;
  }

  static shouldGoToRoundTable(state: SessionState): boolean {
    return (
      state.scheduler.challengesSinceRT >= 3 &&
      state.scheduler.minutesSinceRT >= 22
    );
  }

  static getNextStage(state: SessionState): Stage {
    if (this.shouldGoToFinale(state)) return 'finale';
    if (this.shouldGoToIntermission(state)) return 'intermission';
    if (this.shouldGoToRoundTable(state)) return 'roundTable';
    return 'hub';
  }

  static curateMenu(
    modules: GameModule[],
    state: SessionState,
    count = 3
  ): GameModule[] {
    const { conclave, scheduler } = state;
    const n = conclave.aliveIds.length;
    const elapsed = (Date.now() - scheduler.startedAt) / 60000;
    const isEarly = elapsed < state.config.targetMinutes * 0.33;
    const isLate = elapsed > state.config.targetMinutes * 0.66;

    let available = modules.filter((m) => {
      if (m.requiresMedia || m.requiresDevices) return false;
      if (n < m.minPlayers || n > m.maxPlayers) return false;
      if (scheduler.recentGameIds.includes(m.id)) return false;
      return true;
    });

    // Bias difficulty
    if (isEarly) {
      available = available.sort((a) => (a.energy === 'low' ? -1 : 1));
    } else if (isLate) {
      available = available.sort((a) => (a.energy === 'high' ? -1 : 1));
    }

    // Avoid same type as last 2
    const lastTypes = scheduler.lastTypes.slice(-2);
    const differentType = available.filter((m) => !lastTypes.includes(m.type));
    if (differentType.length >= count) {
      available = differentType;
    }

    // Shuffle and pick
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
