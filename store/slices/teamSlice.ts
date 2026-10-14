import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import {
  BASE_SIMULATED_RANK,
  calculateSimulatedRank,
  FantasyPlayer,
  BallPointsResult,
} from '@/types/fantasy';
import { INITIAL_USER_TEAM } from '@/data/mockMatch';
import { RootState } from '../index';

export interface TeamState {
  players: FantasyPlayer[];
  currentRank: number;
  lastPointsDelta: number;
  lastRankDelta: number;
  lastBreakdown: BallPointsResult | null;
}

const initialState: TeamState = {
  players: INITIAL_USER_TEAM,
  currentRank: BASE_SIMULATED_RANK,
  lastPointsDelta: 0,
  lastRankDelta: 0,
  lastBreakdown: null,
};

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    applyBallPointsResult: (
      state,
      action: PayloadAction<{ breakdown: BallPointsResult }>,
    ) => {
      const { breakdown } = action.payload;
      state.lastPointsDelta = breakdown.netTeamPointsDelta;
      state.lastBreakdown = breakdown;

      for (const pBreakdown of breakdown.playerBreakdowns) {
        const player = state.players.find((p) => p.id === pBreakdown.playerId);
        if (player) {
          player.points = Math.round((player.points + pBreakdown.netPoints) * 10) / 10;
        }
      }

      const prevRank = state.currentRank;
      const newRank = calculateSimulatedRank(prevRank, breakdown.netTeamPointsDelta);
      state.lastRankDelta = prevRank - newRank;
      state.currentRank = newRank;
    },
    setAllPlayers: (state, action: PayloadAction<FantasyPlayer[]>) => {
      state.players = action.payload;
    },
    setRankState: (
      state,
      action: PayloadAction<{
        rank: number;
        lastPointsDelta: number;
        lastRankDelta: number;
        lastBreakdown: BallPointsResult | null;
      }>,
    ) => {
      state.currentRank = action.payload.rank;
      state.lastPointsDelta = action.payload.lastPointsDelta;
      state.lastRankDelta = action.payload.lastRankDelta;
      state.lastBreakdown = action.payload.lastBreakdown;
    },
    resetTeam: (state) => {
      state.players = INITIAL_USER_TEAM.map((p) => ({
        ...p,
        points: 0,
        stats: { ...p.stats },
      }));
      state.currentRank = BASE_SIMULATED_RANK;
      state.lastPointsDelta = 0;
      state.lastRankDelta = 0;
      state.lastBreakdown = null;
    },
  },
});

export const { applyBallPointsResult, setAllPlayers, setRankState, resetTeam } = teamSlice.actions;

export const selectTeamPlayers = (state: RootState) => state.team.players;
export const selectCurrentRank = (state: RootState) => state.team.currentRank;
export const selectLastPointsDelta = (state: RootState) => state.team.lastPointsDelta;
export const selectLastRankDelta = (state: RootState) => state.team.lastRankDelta;
export const selectLastBreakdown = (state: RootState) => state.team.lastBreakdown;

export const selectTotalPoints = createSelector([selectTeamPlayers], (players): number => {
  const sum = players.reduce((total, player) => total + player.points, 0);
  return Math.round(sum * 10) / 10;
});

export const selectCaptain = createSelector([selectTeamPlayers], (players): FantasyPlayer | undefined => {
  return players.find((p) => p.isCaptain);
});

export const selectViceCaptain = createSelector([selectTeamPlayers], (players): FantasyPlayer | undefined => {
  return players.find((p) => p.isViceCaptain);
});

export const selectPendingPlayers = createSelector([selectTeamPlayers], (players): FantasyPlayer[] => {
  return players.filter((p) => p.points === 0);
});

export default teamSlice.reducer;
