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
    // Traitors win if a Traitor reaches the Final Circle (≤3 alive in Conclave)
    if (state.conclave.aliveIds.length <= 3 && state.conclave.aliveIds.length > 0) return true;
    // Faithful win if ALL Traitors are banished (regardless of how many alive remain)
    if (state.traitorIds.length > 0 && state.traitorIds.every(id => state.conclave.ghostIds.includes(id))) return true;
    return false;
  }

  static shouldGoToIntermission(state: SessionState): boolean {
    if (state.scheduler.intermissionDone) return false;
    const elapsed = (Date.now() - state.scheduler.startedAt) / 60000;
    return elapsed >= state.config.targetMinutes * 0.5;
  }

  static shouldGoToRoundTable(state: SessionState): boolean {
    // Primary trigger: 3+ challenges AND 22+ minutes since last RT
    if (state.scheduler.challengesSinceRT >= 3 && state.scheduler.minutesSinceRT >= 22) return true;
    // Hard ceiling: force RT if 32+ minutes have passed regardless of challenge count
    if (state.scheduler.minutesSinceRT >= 32) return true;
    return false;
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
    // All non-eliminated players (active + ghost) participate in challenges
    const n = conclave.aliveIds.length + conclave.ghostIds.length;
    const elapsed = (Date.now() - scheduler.startedAt) / 60000;
    const isEarly = elapsed < state.config.targetMinutes * 0.33;
    const isLate = elapsed > state.config.targetMinutes * 0.66;

    let available = modules.filter((m) => {
      if (m.requiresMedia || m.requiresDevices) return false;
      if (n < m.minPlayers || n > m.maxPlayers) return false;
      if (scheduler.recentGameIds.includes(m.id)) return false;
      return true;
    });

    // Bias toward low-energy early, high-energy late — proper two-arg comparator
    if (isEarly) {
      available = [...available].sort((a, b) => {
        const va = a.energy === 'low' ? 0 : a.energy === 'medium' ? 1 : 2;
        const vb = b.energy === 'low' ? 0 : b.energy === 'medium' ? 1 : 2;
        return va - vb;
      });
    } else if (isLate) {
      available = [...available].sort((a, b) => {
        const va = a.energy === 'high' ? 0 : a.energy === 'medium' ? 1 : 2;
        const vb = b.energy === 'high' ? 0 : b.energy === 'medium' ? 1 : 2;
        return va - vb;
      });
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
