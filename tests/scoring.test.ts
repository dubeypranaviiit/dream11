import { describe, it, expect } from 'vitest';
import { computeBallPoints, DREAM11_T20_RULES } from '@/lib/scoring';
import { BallEvent } from '@/types/cricket';
import { FantasyPlayer } from '@/types/fantasy';

function createPlayer(overrides: Partial<FantasyPlayer> & { id: string; name: string }): FantasyPlayer {
  return {
    team: 'IND',
    role: 'BAT',
    isCaptain: false,
    isViceCaptain: false,
    points: 0,
    stats: {
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      maidens: 0,
      catches: 0,
      stumpings: 0,
      runOuts: 0,
      hasBatted: false,
      hasBowled: false,
    },
    ...overrides,
  };
}

describe('Dream11 T20 Scoring Engine', () => {
  it('has correct official Dream11 T20 constants', () => {
    expect(DREAM11_T20_RULES.RUN).toBe(1);
    expect(DREAM11_T20_RULES.BOUNDARY_BONUS_4).toBe(1);
    expect(DREAM11_T20_RULES.SIX_BONUS_6).toBe(2);
    expect(DREAM11_T20_RULES.DUCK).toBe(-2);
    expect(DREAM11_T20_RULES.WICKET).toBe(25);
    expect(DREAM11_T20_RULES.LBW_BOWLED_BONUS).toBe(8);
    expect(DREAM11_T20_RULES.CATCH).toBe(8);
    expect(DREAM11_T20_RULES.STUMPING).toBe(12);
    expect(DREAM11_T20_RULES.RUN_OUT_DIRECT).toBe(12);
    expect(DREAM11_T20_RULES.RUN_OUT_INDIRECT).toBe(6);
    expect(DREAM11_T20_RULES.MAIDEN_OVER).toBe(12);
    expect(DREAM11_T20_RULES.CAPTAIN_MULTIPLIER).toBe(2.0);
    expect(DREAM11_T20_RULES.VICE_CAPTAIN_MULTIPLIER).toBe(1.5);
  });

  it('calculates Six bonus correctly (6 runs + 2 bonus = 8 points)', () => {
    const batsman = createPlayer({ id: 'sky', name: 'Suryakumar Yadav', role: 'BAT' });

    const event: BallEvent = {
      id: 'ball-7',
      ballNumber: 7,
      overNumber: 1,
      ballInOver: 1,
      displayOver: '1.1',
      batsmanId: 'sky',
      batsmanName: 'Suryakumar Yadav',
      nonStrikerId: 'pant',
      nonStrikerName: 'Rishabh Pant',
      bowlerId: 'naseem',
      bowlerName: 'Naseem Shah',
      runs: 6,
      isSix: true,
      description: 'Naseem to Suryakumar: SIX! Picked up over deep midwicket.',
      inningsScore: { runs: 11, wickets: 2, overs: '1.1' },
    };

    const result = computeBallPoints(event, [batsman]);

    expect(result.affectsUserTeam).toBe(true);
    expect(result.playerBreakdowns).toHaveLength(1);
    expect(result.playerBreakdowns[0].basePoints).toBe(8);
    expect(result.playerBreakdowns[0].netPoints).toBe(8);
    expect(result.netTeamPointsDelta).toBe(8);
  });

  it('calculates Duck penalty with Captain 2x multiplier (-2 x 2 = -4 points)', () => {
    const kohli = createPlayer({
      id: 'kohli',
      name: 'Virat Kohli',
      role: 'BAT',
      isCaptain: true,
    });

    const event: BallEvent = {
      id: 'ball-5',
      ballNumber: 5,
      overNumber: 0,
      ballInOver: 5,
      displayOver: '0.5',
      batsmanId: 'kohli',
      batsmanName: 'Virat Kohli',
      nonStrikerId: 'sky',
      nonStrikerName: 'Suryakumar Yadav',
      bowlerId: 'shaheen',
      bowlerName: 'Shaheen Afridi',
      runs: 0,
      isWicket: true,
      wicketType: 'caught_behind',
      dismissedPlayerId: 'kohli',
      dismissedPlayerName: 'Virat Kohli',
      dismissalRuns: 0,
      fielderId: 'rizwan',
      fielderName: 'Mohammad Rizwan',
      description: 'Shaheen to Kohli: OUT! Caught behind for a duck.',
      inningsScore: { runs: 4, wickets: 2, overs: '0.5' },
    };

    const result = computeBallPoints(event, [kohli]);

    expect(result.playerBreakdowns).toHaveLength(1);
    const breakdown = result.playerBreakdowns[0];
    expect(breakdown.basePoints).toBe(-2);
    expect(breakdown.multiplier).toBe(2.0);
    expect(breakdown.netPoints).toBe(-4);
    expect(result.netTeamPointsDelta).toBe(-4);
  });

  it('calculates Vice-Captain 1.5x multiplier preserving decimal (25 x 1.5 = 37.5 points)', () => {
    const bowlerVC = createPlayer({
      id: 'shaheen',
      name: 'Shaheen Afridi',
      team: 'PAK',
      role: 'BOWL',
      isViceCaptain: true,
    });

    const event: BallEvent = {
      id: 'ball-3',
      ballNumber: 3,
      overNumber: 0,
      ballInOver: 3,
      displayOver: '0.3',
      batsmanId: 'other_bat',
      batsmanName: 'Opponent Batsman',
      nonStrikerId: 'other_bat_2',
      nonStrikerName: 'Other Batsman',
      bowlerId: 'shaheen',
      bowlerName: 'Shaheen Afridi',
      runs: 0,
      isWicket: true,
      wicketType: 'caught',
      dismissedPlayerId: 'other_bat',
      dismissedPlayerName: 'Opponent Batsman',
      dismissalRuns: 4,
      fielderId: 'other_fielder',
      fielderName: 'Other Fielder',
      description: 'Shaheen to Batsman: OUT! Caught at mid-on.',
      inningsScore: { runs: 4, wickets: 1, overs: '0.3' },
    };

    const result = computeBallPoints(event, [bowlerVC]);

    expect(result.playerBreakdowns).toHaveLength(1);
    const breakdown = result.playerBreakdowns[0];
    expect(breakdown.basePoints).toBe(25);
    expect(breakdown.multiplier).toBe(1.5);
    expect(breakdown.netPoints).toBe(37.5);
    expect(result.netTeamPointsDelta).toBe(37.5);
  });

  it('calculates NET point change across ALL user players (Kohli duck + Shaheen wicket + Rizwan catch = +29 net)', () => {
    const kohli = createPlayer({
      id: 'kohli',
      name: 'Virat Kohli',
      role: 'BAT',
      isCaptain: true,
    });
    const shaheen = createPlayer({
      id: 'shaheen',
      name: 'Shaheen Afridi',
      team: 'PAK',
      role: 'BOWL',
    });
    const rizwan = createPlayer({
      id: 'rizwan',
      name: 'Mohammad Rizwan',
      team: 'PAK',
      role: 'WK',
    });

    const userTeam = [kohli, shaheen, rizwan];

    const event: BallEvent = {
      id: 'ball-5',
      ballNumber: 5,
      overNumber: 0,
      ballInOver: 5,
      displayOver: '0.5',
      batsmanId: 'kohli',
      batsmanName: 'Virat Kohli',
      nonStrikerId: 'sky',
      nonStrikerName: 'Suryakumar Yadav',
      bowlerId: 'shaheen',
      bowlerName: 'Shaheen Afridi',
      runs: 0,
      isWicket: true,
      wicketType: 'caught_behind',
      dismissedPlayerId: 'kohli',
      dismissedPlayerName: 'Virat Kohli',
      dismissalRuns: 0,
      fielderId: 'rizwan',
      fielderName: 'Mohammad Rizwan',
      description: 'Shaheen to Kohli: OUT! Caught behind! Kohli out for 0 (duck).',
      inningsScore: { runs: 4, wickets: 2, overs: '0.5' },
    };

    const result = computeBallPoints(event, userTeam, 15000);

    expect(result.affectsUserTeam).toBe(true);
    expect(result.playerBreakdowns).toHaveLength(3);

    const kohliBreakdown = result.playerBreakdowns.find((p) => p.playerId === 'kohli')!;
    expect(kohliBreakdown.basePoints).toBe(-2);
    expect(kohliBreakdown.multiplier).toBe(2.0);
    expect(kohliBreakdown.netPoints).toBe(-4);

    const shaheenBreakdown = result.playerBreakdowns.find((p) => p.playerId === 'shaheen')!;
    expect(shaheenBreakdown.basePoints).toBe(25);
    expect(shaheenBreakdown.multiplier).toBe(1.0);
    expect(shaheenBreakdown.netPoints).toBe(25);

    const rizwanBreakdown = result.playerBreakdowns.find((p) => p.playerId === 'rizwan')!;
    expect(rizwanBreakdown.basePoints).toBe(8);
    expect(rizwanBreakdown.multiplier).toBe(1.0);
    expect(rizwanBreakdown.netPoints).toBe(8);

    expect(result.netTeamPointsDelta).toBe(29);
    expect(result.simulatedRankDelta).toBeGreaterThan(0);
  });

  it('returns affectsUserTeam = false when no user player is involved', () => {
    const kohli = createPlayer({ id: 'kohli', name: 'Virat Kohli' });

    const event: BallEvent = {
      id: 'ball-1',
      ballNumber: 1,
      overNumber: 0,
      ballInOver: 1,
      displayOver: '0.1',
      batsmanId: 'someone_else',
      batsmanName: 'Someone Else',
      nonStrikerId: 'someone_else_2',
      nonStrikerName: 'Someone Else 2',
      bowlerId: 'bowler_unknown',
      bowlerName: 'Unknown Bowler',
      runs: 0,
      description: 'Dot ball.',
      inningsScore: { runs: 0, wickets: 0, overs: '0.1' },
    };

    const result = computeBallPoints(event, [kohli]);
    expect(result.affectsUserTeam).toBe(false);
    expect(result.playerBreakdowns).toHaveLength(0);
    expect(result.netTeamPointsDelta).toBe(0);
  });
});
