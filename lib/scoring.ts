import { BallEvent } from '@/types/cricket';
import {
  BallPointsResult,
  calculateSimulatedRank,
  FantasyPlayer,
  PlayerPointBreakdown,
} from '@/types/fantasy';
import { AppLanguage } from '@/types/api';

export const DREAM11_T20_RULES = {
  RUN: 1,
  BOUNDARY_BONUS_4: 1,
  SIX_BONUS_6: 2,
  DUCK: -2,
  WICKET: 25,
  LBW_BOWLED_BONUS: 8,
  CATCH: 8,
  STUMPING: 12,
  RUN_OUT_DIRECT: 12,
  RUN_OUT_INDIRECT: 6,
  MAIDEN_OVER: 12,
  CAPTAIN_MULTIPLIER: 2.0,
  VICE_CAPTAIN_MULTIPLIER: 1.5,
} as const;

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeBallPoints(
  event: BallEvent,
  userPlayers: FantasyPlayer[],
  baselineRank: number = 15000,
): BallPointsResult {
  const playerMap = new Map<string, FantasyPlayer>();
  for (const p of userPlayers) {
    playerMap.set(p.id, p);
  }

  const breakdowns: PlayerPointBreakdown[] = [];

  const getMultiplier = (p: FantasyPlayer): number => {
    if (p.isCaptain) return DREAM11_T20_RULES.CAPTAIN_MULTIPLIER;
    if (p.isViceCaptain) return DREAM11_T20_RULES.VICE_CAPTAIN_MULTIPLIER;
    return 1.0;
  };

  if (playerMap.has(event.batsmanId)) {
    const batsman = playerMap.get(event.batsmanId)!;
    let basePts = 0;
    const reasons: string[] = [];

    if (!event.isWide && event.runs > 0) {
      const runPts = event.runs * DREAM11_T20_RULES.RUN;
      basePts += runPts;
      reasons.push(`${event.runs} run${event.runs > 1 ? 's' : ''} (+${runPts})`);

      if (event.isBoundaryFour) {
        basePts += DREAM11_T20_RULES.BOUNDARY_BONUS_4;
        reasons.push(`Boundary bonus (+${DREAM11_T20_RULES.BOUNDARY_BONUS_4})`);
      } else if (event.isSix) {
        basePts += DREAM11_T20_RULES.SIX_BONUS_6;
        reasons.push(`Six bonus (+${DREAM11_T20_RULES.SIX_BONUS_6})`);
      }
    }

    if (
      event.isWicket &&
      event.dismissedPlayerId === batsman.id &&
      event.dismissalRuns === 0 &&
      batsman.role !== 'BOWL'
    ) {
      basePts += DREAM11_T20_RULES.DUCK;
      reasons.push(`Duck penalty (${DREAM11_T20_RULES.DUCK})`);
    }

    if (reasons.length > 0) {
      const mult = getMultiplier(batsman);
      breakdowns.push({
        playerId: batsman.id,
        playerName: batsman.name,
        role: batsman.role,
        isCaptain: batsman.isCaptain,
        isViceCaptain: batsman.isViceCaptain,
        basePoints: basePts,
        multiplier: mult,
        netPoints: roundToOneDecimal(basePts * mult),
        reasons,
      });
    }
  }

  if (playerMap.has(event.bowlerId)) {
    const bowler = playerMap.get(event.bowlerId)!;
    let basePts = 0;
    const reasons: string[] = [];

    if (event.isWicket && event.wicketType !== 'run_out') {
      basePts += DREAM11_T20_RULES.WICKET;
      reasons.push(`Wicket (+${DREAM11_T20_RULES.WICKET})`);

      if (event.wicketType === 'lbw' || event.wicketType === 'bowled') {
        basePts += DREAM11_T20_RULES.LBW_BOWLED_BONUS;
        reasons.push(`${event.wicketType.toUpperCase()} bonus (+${DREAM11_T20_RULES.LBW_BOWLED_BONUS})`);
      }
    }

    if (event.isMaidenOverEnd) {
      basePts += DREAM11_T20_RULES.MAIDEN_OVER;
      reasons.push(`Maiden over bonus (+${DREAM11_T20_RULES.MAIDEN_OVER})`);
    }

    if (reasons.length > 0) {
      const mult = getMultiplier(bowler);
      breakdowns.push({
        playerId: bowler.id,
        playerName: bowler.name,
        role: bowler.role,
        isCaptain: bowler.isCaptain,
        isViceCaptain: bowler.isViceCaptain,
        basePoints: basePts,
        multiplier: mult,
        netPoints: roundToOneDecimal(basePts * mult),
        reasons,
      });
    }
  }

  if (
    event.isWicket &&
    event.fielderId &&
    playerMap.has(event.fielderId) &&
    event.wicketType !== 'run_out'
  ) {
    const fielder = playerMap.get(event.fielderId)!;
    let basePts = 0;
    const reasons: string[] = [];

    if (event.wicketType === 'caught' || event.wicketType === 'caught_behind') {
      basePts += DREAM11_T20_RULES.CATCH;
      reasons.push(`Catch (+${DREAM11_T20_RULES.CATCH})`);
    } else if (event.wicketType === 'stumped') {
      basePts += DREAM11_T20_RULES.STUMPING;
      reasons.push(`Stumping (+${DREAM11_T20_RULES.STUMPING})`);
    }

    if (reasons.length > 0) {
      const mult = getMultiplier(fielder);
      breakdowns.push({
        playerId: fielder.id,
        playerName: fielder.name,
        role: fielder.role,
        isCaptain: fielder.isCaptain,
        isViceCaptain: fielder.isViceCaptain,
        basePoints: basePts,
        multiplier: mult,
        netPoints: roundToOneDecimal(basePts * mult),
        reasons,
      });
    }
  }

  if (event.isWicket && event.wicketType === 'run_out' && event.runOutAssists) {
    for (const assist of event.runOutAssists) {
      if (playerMap.has(assist.playerId)) {
        const fielder = playerMap.get(assist.playerId)!;
        const pts = assist.isDirectHit
          ? DREAM11_T20_RULES.RUN_OUT_DIRECT
          : DREAM11_T20_RULES.RUN_OUT_INDIRECT;
        const mult = getMultiplier(fielder);
        const reason = assist.isDirectHit
          ? `Direct-hit run-out (+${pts})`
          : `Run-out assist (+${pts})`;

        breakdowns.push({
          playerId: fielder.id,
          playerName: fielder.name,
          role: fielder.role,
          isCaptain: fielder.isCaptain,
          isViceCaptain: fielder.isViceCaptain,
          basePoints: pts,
          multiplier: mult,
          netPoints: roundToOneDecimal(pts * mult),
          reasons: [reason],
        });
      }
    }
  }

  const rawSum = breakdowns.reduce((acc, curr) => acc + curr.netPoints, 0);
  const netTeamPointsDelta = roundToOneDecimal(rawSum);
  const newRank = calculateSimulatedRank(baselineRank, netTeamPointsDelta);
  const rankDifference = baselineRank - newRank;

  return {
    ballId: event.id,
    playerBreakdowns: breakdowns,
    netTeamPointsDelta,
    simulatedRankDelta: rankDifference,
    affectsUserTeam: breakdowns.length > 0,
  };
}

export function generateDeterministicExplanation(
  breakdown: BallPointsResult,
  language: AppLanguage,
  rankDelta: number,
): string {
  if (breakdown.playerBreakdowns.length === 0) {
    return language === 'hinglish'
      ? 'Is ball se aapke kisi bhi player ke points par asar nahi pada.'
      : 'This ball had zero impact on your fantasy team.';
  }

  const rankTextEn =
    rankDelta > 0
      ? `Simulated rank improved by ${Math.abs(rankDelta).toLocaleString()} spots.`
      : rankDelta < 0
        ? `Simulated rank dropped by ${Math.abs(rankDelta).toLocaleString()} spots.`
        : 'Simulated rank unchanged.';

  const rankTextHinglish =
    rankDelta > 0
      ? `Simulated rank ${Math.abs(rankDelta).toLocaleString()} spots behtar ho gayi.`
      : rankDelta < 0
        ? `Simulated rank ${Math.abs(rankDelta).toLocaleString()} spots gir gayi.`
        : 'Simulated rank barabar rahi.';

  if (language === 'hinglish') {
    const playerSummaries = breakdown.playerBreakdowns.map((p) => {
      const tag = p.isCaptain ? ' (Captain 2x)' : p.isViceCaptain ? ' (Vice-Captain 1.5x)' : '';
      const multStr = p.multiplier !== 1 ? ` (${p.basePoints} × ${p.multiplier})` : '';
      return `${p.playerName}${tag}: ${p.reasons.join(', ')} = ${p.netPoints > 0 ? '+' : ''}${p.netPoints} pts${multStr}`;
    });

    const netSign = breakdown.netTeamPointsDelta >= 0 ? '+' : '';
    return `${playerSummaries.join(' | ')}. Net change: ${netSign}${breakdown.netTeamPointsDelta} pts. ${rankTextHinglish}`;
  }

  const playerSummaries = breakdown.playerBreakdowns.map((p) => {
    const tag = p.isCaptain ? ' (Captain 2x)' : p.isViceCaptain ? ' (Vice-Captain 1.5x)' : '';
    const multStr = p.multiplier !== 1 ? ` (${p.basePoints} × ${p.multiplier})` : '';
    return `${p.playerName}${tag}: ${p.reasons.join(', ')} = ${p.netPoints > 0 ? '+' : ''}${p.netPoints} pts${multStr}`;
  });

  const netSign = breakdown.netTeamPointsDelta >= 0 ? '+' : '';
  return `${playerSummaries.join(' | ')}. Net change: ${netSign}${breakdown.netTeamPointsDelta} pts. ${rankTextEn}`;
}
