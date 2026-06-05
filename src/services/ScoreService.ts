import { Player } from '../store/useStore';

export interface ScoreEntry {
  playerId: string;
  score: number;
  rank: number;
}

export class ScoreService {
  static COINS_1ST = 5;
  static COINS_2ND = 3;
  static COINS_3RD = 2;
  static COINS_CORRECT = 1;
  static UNDERDOG_BONUS = 1;

  static rankPlayers(scores: Record<string, number>): ScoreEntry[] {
    const entries = Object.entries(scores)
      .map(([playerId, score]) => ({ playerId, score, rank: 0 }))
      .sort((a, b) => b.score - a.score);

    entries.forEach((e, i) => { e.rank = i + 1; });
    return entries;
  }

  static computeCoinDeltas(
    scores: Record<string, number>,
    players: Player[]
  ): Record<string, number> {
    const ranked = this.rankPlayers(scores);
    const deltas: Record<string, number> = {};
    const n = players.length;
    const underdogThreshold = Math.floor(n * 2 / 3);

    ranked.forEach((entry) => {
      let coins = 0;
      if (entry.rank === 1) coins = this.COINS_1ST;
      else if (entry.rank === 2) coins = this.COINS_2ND;
      else if (entry.rank === 3) coins = this.COINS_3RD;
      else if (entry.score > 0) coins = this.COINS_CORRECT;

      // Underdog bonus
      if (entry.rank > underdogThreshold && entry.rank <= 3) {
        coins += this.UNDERDOG_BONUS;
      }

      deltas[entry.playerId] = coins;
    });

    return deltas;
  }

  static getSortedLeaderboard(players: Player[]): Player[] {
    return [...players].sort((a, b) => b.coins - a.coins);
  }
}
