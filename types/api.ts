import { BallEvent } from './cricket';
import { BallPointsResult, FantasyPlayer, PlayerPointBreakdown } from './fantasy';

export type AppLanguage = 'en' | 'hinglish';

export interface ExplainRequest {
  event: BallEvent;
  breakdown: BallPointsResult;
  language: AppLanguage;
  previousRank: number;
  newRank: number;
}

export interface ExplainResponse {
  explanation: string;
  netPoints: number;
  breakdowns: PlayerPointBreakdown[];
  isFallback?: boolean;
}

export interface CatchUpRequest {
  playedEvents: BallEvent[];
  userTeam: FantasyPlayer[];
  currentScore: { runs: number; wickets: number; overs: string };
  currentRank: number;
  totalPoints: number;
  language: AppLanguage;
}
