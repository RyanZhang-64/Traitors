import { Player, Role } from '../store/useStore';

export class RoleService {
  static assignRoles(players: Player[], numTraitors: number): { playerId: string; role: Role }[] {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    return shuffled.map((p, i) => ({
      playerId: p.id,
      role: i < numTraitors ? 'traitor' : 'faithful',
    }));
  }

  static getTraitorCount(playerCount: number): number {
    if (playerCount <= 7) return 2;
    return 3;
  }

  static isTraitor(player: Player): boolean {
    return player.role === 'traitor';
  }

  static getRoleLabel(role: Role): string {
    return role === 'traitor' ? 'TRAITOR' : 'FAITHFUL';
  }

  static getRoleColor(role: Role): string {
    return role === 'traitor' ? 'var(--ember)' : 'var(--sage)';
  }

  static getRoleDescription(role: Role): string {
    if (role === 'traitor') {
      return 'You are a TRAITOR. Deceive the Faithful. Survive the Round Table. Claim the prize.';
    }
    return 'You are FAITHFUL. Seek out the Traitors. Banish them. Claim victory.';
  }
}
