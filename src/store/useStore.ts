import { create } from 'zustand';

export type Role = 'faithful' | 'traitor';
export type PlayerStatus = 'lobby' | 'active' | 'ghost' | 'finalist' | 'out';
export type Stage = 'lobby' | 'onboarding' | 'hub' | 'preGame' | 'game' | 'results' | 'roundTable' | 'intermission' | 'finale' | 'recap';

export interface Player {
  id: string;
  name: string;
  avatarSeed: string;
  role: Role;
  status: PlayerStatus;
  coins: number;
  shields: number;
  suspicion: number;
}

export interface GameResult {
  moduleId: string;
  summary: string;
  coinDeltas: Record<string, number>;
  shieldsAwarded: Record<string, number>;
  suspicionDeltas: Record<string, number>;
  tells: string[];
  timestamp: number;
}

export interface SessionState {
  stage: Stage;
  players: Player[];
  traitorIds: string[];
  config: {
    targetMinutes: number;
    chooserPolicy: 'rotation' | 'winner' | 'vote';
    hardElimination: boolean;
    mode: 'traitors' | 'party';
  };
  league: { coins: Record<string, number>; rank: string[] };
  conclave: {
    aliveIds: string[];
    ghostIds: string[];
    roundTablesHeld: number;
    finalCircle?: string[];
  };
  scheduler: {
    startedAt: number;
    challengesSinceRT: number;
    minutesSinceRT: number;
    lastTypes: string[];
    recentGameIds: string[];
    chooserQueue: string[];
    currentChooser: string | null;
    intermissionDone: boolean;
    doubleUsed: boolean;
    doubleActive: boolean;
    actNumber: number;
  };
  menu: { offered: string[]; rerollUsed: boolean } | null;
  activeGame: { moduleId: string; difficulty: string; instanceState: unknown } | null;
  lastResult: GameResult | null;
  history: GameResult[];
  hostMode: boolean;
}

interface StoreActions {
  setStage: (stage: Stage) => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  setConfig: (cfg: Partial<SessionState['config']>) => void;
  initRoles: () => void;
  setMenu: (offered: string[]) => void;
  rerollMenu: (offered: string[]) => void;
  setActiveGame: (moduleId: string, difficulty: string) => void;
  completeGame: (result: GameResult) => void;
  banishPlayer: (id: string) => void;
  advanceScheduler: () => Stage;
  triggerIntermission: () => void;
  triggerRoundTable: () => void;
  triggerFinale: () => void;
  triggerDouble: () => void;
  updateSuspicion: (id: string, delta: number) => void;
  spendShield: (id: string) => void;
  saveSession: () => void;
  loadSession: (data: string) => void;
  resetSession: () => void;
  toggleHostMode: () => void;
  setChooser: (id: string) => void;
  advanceChooserQueue: () => void;
  markIntermissionDone: () => void;
}

const defaultState: SessionState = {
  stage: 'lobby',
  players: [],
  traitorIds: [],
  config: {
    targetMinutes: 150,
    chooserPolicy: 'rotation',
    hardElimination: false,
    mode: 'traitors',
  },
  league: { coins: {}, rank: [] },
  conclave: { aliveIds: [], ghostIds: [], roundTablesHeld: 0 },
  scheduler: {
    startedAt: 0,
    challengesSinceRT: 0,
    minutesSinceRT: 0,
    lastTypes: [],
    recentGameIds: [],
    chooserQueue: [],
    currentChooser: null,
    intermissionDone: false,
    doubleUsed: false,
    doubleActive: false,
    actNumber: 1,
  },
  menu: null,
  activeGame: null,
  lastResult: null,
  history: [],
  hostMode: true,
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateAvatarSeed(): string {
  return Math.random().toString(36).slice(2, 8);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useStore = create<SessionState & StoreActions>((set, get) => ({
  ...defaultState,

  setStage: (stage) => {
    set({ stage });
    get().saveSession();
  },

  addPlayer: (name) => {
    const { players } = get();
    if (players.length >= 10) return;
    const player: Player = {
      id: generateId(),
      name: name.trim(),
      avatarSeed: generateAvatarSeed(),
      role: 'faithful',
      status: 'lobby',
      coins: 0,
      shields: 0,
      suspicion: 0,
    };
    set({ players: [...players, player] });
  },

  removePlayer: (id) => {
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },

  setConfig: (cfg) => {
    set((s) => ({ config: { ...s.config, ...cfg } }));
  },

  initRoles: () => {
    const { players, config } = get();
    const n = players.length;
    const numTraitors = config.mode === 'party' ? 0 : n <= 8 ? 2 : 3;

    const shuffled = shuffleArray(players.map((p) => p.id));
    const traitorIds = shuffled.slice(0, numTraitors);

    const updatedPlayers = players.map((p) => ({
      ...p,
      role: traitorIds.includes(p.id) ? ('traitor' as Role) : ('faithful' as Role),
      status: 'active' as PlayerStatus,
    }));

    const chooserQueue = shuffleArray(players.map((p) => p.id));
    const aliveIds = players.map((p) => p.id);
    const coins: Record<string, number> = {};
    aliveIds.forEach((id) => (coins[id] = 0));

    set({
      players: updatedPlayers,
      traitorIds,
      conclave: { aliveIds, ghostIds: [], roundTablesHeld: 0 },
      league: { coins, rank: [] },
      scheduler: {
        ...get().scheduler,
        startedAt: Date.now(),
        chooserQueue,
        currentChooser: chooserQueue[0] || null,
      },
    });
  },

  setMenu: (offered) => {
    set({ menu: { offered, rerollUsed: false } });
  },

  rerollMenu: (offered) => {
    set({ menu: { offered, rerollUsed: true } });
  },

  setActiveGame: (moduleId, difficulty) => {
    set({ activeGame: { moduleId, difficulty, instanceState: {} }, stage: 'game' });
  },

  completeGame: (result) => {
    const s = get();
    // Apply coin deltas
    const updatedPlayers = s.players.map((p) => {
      const delta = result.coinDeltas[p.id] || 0;
      const shieldDelta = result.shieldsAwarded[p.id] || 0;
      const suspDelta = result.suspicionDeltas[p.id] || 0;
      const multiplier = s.scheduler.doubleActive ? 2 : 1;
      return {
        ...p,
        coins: p.coins + delta * multiplier,
        shields: p.shields + shieldDelta,
        suspicion: Math.max(0, Math.min(100, p.suspicion + suspDelta)),
      };
    });

    const newCoins = { ...s.league.coins };
    updatedPlayers.forEach((p) => { newCoins[p.id] = p.coins; });

    // Update scheduler — record this game's type so variety rule can enforce no-3-in-a-row
    const newRecentIds = [result.moduleId, ...s.scheduler.recentGameIds].slice(0, 4);
    const currentModule = import.meta.env ? null : null; // type looked up below
    const gameType = (s.activeGame?.moduleId)
      ? ((['knights_knaves','mini_einstein','whodunnit','code_breaker'].includes(s.activeGame.moduleId) ? 'deduction'
        : ['lateral_mystery','sabotage_trivia','category_roulette','timeline','zoomed_in','name_that_tune'].includes(s.activeGame.moduleId) ? 'trivia'
        : ['anagram_race','balderdash','codenames_lite','taboo','word_chain'].includes(s.activeGame.moduleId) ? 'word'
        : ['estimation_challenge','higher_lower','price_is_right'].includes(s.activeGame.moduleId) ? 'estimation'
        : ['gartic_phone','quick_draw'].includes(s.activeGame.moduleId) ? 'creative'
        : ['emoji_story','spot_the_change','echo','eyewitness'].includes(s.activeGame.moduleId) ? 'memory'
        : ['reaction_duel','type_racer','simon_says'].includes(s.activeGame.moduleId) ? 'reflex'
        : 'social'))
      : '';
    void currentModule; // suppress unused warning
    const newLastTypes = gameType
      ? [...s.scheduler.lastTypes, gameType].slice(-3)
      : s.scheduler.lastTypes.slice(-3);

    set({
      players: updatedPlayers,
      league: { ...s.league, coins: newCoins },
      lastResult: result,
      history: [...s.history, result],
      activeGame: null,
      scheduler: {
        ...s.scheduler,
        challengesSinceRT: s.scheduler.challengesSinceRT + 1,
        minutesSinceRT: s.scheduler.minutesSinceRT + 8,
        recentGameIds: newRecentIds,
        lastTypes: newLastTypes,
        doubleActive: false,
      },
      stage: 'results',
    });

    get().saveSession();
  },

  banishPlayer: (id) => {
    const s = get();
    const updatedPlayers = s.players.map((p) =>
      p.id === id ? { ...p, status: 'ghost' as PlayerStatus } : p
    );
    const newAliveIds = s.conclave.aliveIds.filter((i) => i !== id);
    const newGhostIds = [...s.conclave.ghostIds, id];

    set({
      players: updatedPlayers,
      conclave: {
        ...s.conclave,
        aliveIds: newAliveIds,
        ghostIds: newGhostIds,
        roundTablesHeld: s.conclave.roundTablesHeld + 1,
      },
      scheduler: {
        ...s.scheduler,
        challengesSinceRT: 0,
        minutesSinceRT: 0,
      },
    });
  },

  advanceScheduler: () => {
    const s = get();
    const elapsed = (Date.now() - s.scheduler.startedAt) / 60000;
    const aliveCount = s.conclave.aliveIds.length;

    // Faithful win: all traitors have been banished
    if (s.traitorIds.length > 0 && s.traitorIds.every(id => s.conclave.ghostIds.includes(id))) {
      return 'finale';
    }

    // Traitors win condition: a traitor reaches the Final Circle (≤3 alive)
    if (aliveCount <= 3 && aliveCount > 0) {
      return 'finale';
    }

    // Check intermission
    if (!s.scheduler.intermissionDone && elapsed >= s.config.targetMinutes * 0.5) {
      return 'intermission';
    }

    // Check round table — primary trigger OR hard 32-min ceiling
    if ((s.scheduler.challengesSinceRT >= 3 && s.scheduler.minutesSinceRT >= 22)
        || s.scheduler.minutesSinceRT >= 32) {
      return 'roundTable';
    }

    return 'hub';
  },

  triggerIntermission: () => {
    set({ stage: 'intermission' });
  },

  triggerRoundTable: () => {
    set({ stage: 'roundTable' });
  },

  triggerFinale: () => {
    set({
      stage: 'finale',
      conclave: {
        ...get().conclave,
        finalCircle: get().conclave.aliveIds,
      },
    });
  },

  triggerDouble: () => {
    set((s) => ({
      scheduler: { ...s.scheduler, doubleActive: true, doubleUsed: true },
    }));
  },

  updateSuspicion: (id, delta) => {
    set((s) => ({
      players: s.players.map((p) =>
        p.id === id
          ? { ...p, suspicion: Math.max(0, Math.min(100, p.suspicion + delta)) }
          : p
      ),
    }));
  },

  spendShield: (id) => {
    set((s) => ({
      players: s.players.map((p) =>
        p.id === id && p.shields > 0 ? { ...p, shields: p.shields - 1 } : p
      ),
    }));
  },

  saveSession: () => {
    try {
      const { saveSession: _, loadSession: __, resetSession: ___, ...state } = get();
      localStorage.setItem('traitors_session', JSON.stringify(state));
    } catch {
      // silent fail
    }
  },

  loadSession: (data: string) => {
    try {
      const parsed = JSON.parse(data) as Partial<SessionState>;
      set((s) => ({ ...s, ...parsed }));
    } catch {
      // silent fail
    }
  },

  resetSession: () => {
    set({ ...defaultState });
    try {
      localStorage.removeItem('traitors_session');
    } catch {
      // silent fail
    }
  },

  toggleHostMode: () => {
    set((s) => ({ hostMode: !s.hostMode }));
  },

  setChooser: (id) => {
    set((s) => ({ scheduler: { ...s.scheduler, currentChooser: id } }));
  },

  advanceChooserQueue: () => {
    const { scheduler, players } = get();
    // Spec §4.2: rotate over ALL players including Ghosts; only exclude 'out'
    const eligible = players
      .filter((p) => p.status === 'active' || p.status === 'ghost' || p.status === 'finalist')
      .map((p) => p.id);
    if (eligible.length === 0) return;
    const queue = scheduler.chooserQueue.filter((id) => eligible.includes(id));
    if (queue.length === 0) {
      const newQueue = shuffleArray(eligible);
      set((s) => ({
        scheduler: {
          ...s.scheduler,
          chooserQueue: newQueue.slice(1),
          currentChooser: newQueue[0],
        },
      }));
    } else {
      set((s) => ({
        scheduler: {
          ...s.scheduler,
          chooserQueue: queue.slice(1),
          currentChooser: queue[0],
        },
      }));
    }
  },

  markIntermissionDone: () => {
    set((s) => ({
      scheduler: { ...s.scheduler, intermissionDone: true },
    }));
  },
}));
