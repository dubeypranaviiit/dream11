import { PlayerRole, TeamCode } from './cricket';

export interface FantasyPlayerStats {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  wickets: number;
  oversBowled: number;
  maidens: number;
  catches: number;
  stumpings: number;
  runOuts: number;
  hasBatted: boolean;
  hasBowled: boolean;
}

export interface FantasyPlayer {
  id: string;
  name: string;
  team: TeamCode;
  role: PlayerRole;
  isCaptain: boolean;
  isViceCaptain: boolean;
  points: number;
  stats: FantasyPlayerStats;
}

export interface PlayerPointBreakdown {
  playerId: string;
  playerName: string;
  role: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  basePoints: number;
  multiplier: number;
  netPoints: number;
  reasons: string[];
}

export interface BallPointsResult {
  ballId: string;
  playerBreakdowns: PlayerPointBreakdown[];
  netTeamPointsDelta: number;
  simulatedRankDelta: number;
  affectsUserTeam: boolean;
}

export const BASE_SIMULATED_RANK = 15000;
export const RANK_SENSITIVITY_PER_POINT = 75;

export function calculateSimulatedRank(baselineRank: number, netPointsDelta: number): number {
  const rankDelta = Math.round(netPointsDelta * RANK_SENSITIVITY_PER_POINT);
  const newRank = baselineRank - rankDelta;
  return Math.max(1, newRank);
}
