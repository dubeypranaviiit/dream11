export type PlayerRole = 'BAT' | 'BOWL' | 'AR' | 'WK';

export type TeamCode = 'IND' | 'PAK';

export type WicketType =
  | 'bowled'
  | 'lbw'
  | 'caught'
  | 'caught_behind'
  | 'stumped'
  | 'run_out';

export interface InningScore {
  runs: number;
  wickets: number;
  overs: string;
}

export interface RunOutAssist {
  playerId: string;
  playerName: string;
  isDirectHit: boolean;
}

export interface BallEvent {
  id: string;
  ballNumber: number;
  overNumber: number;
  ballInOver: number;
  displayOver: string;
  batsmanId: string;
  batsmanName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  bowlerId: string;
  bowlerName: string;
  runs: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isBoundaryFour?: boolean;
  isSix?: boolean;
  isWicket?: boolean;
  wicketType?: WicketType;
  dismissedPlayerId?: string;
  dismissedPlayerName?: string;
  dismissalRuns?: number;
  fielderId?: string;
  fielderName?: string;
  runOutAssists?: RunOutAssist[];
  isMaidenOverEnd?: boolean;
  description: string;
  inningsScore: InningScore;
}
