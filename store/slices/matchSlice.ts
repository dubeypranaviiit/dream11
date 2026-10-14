import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { BallEvent, InningScore } from '@/types/cricket';
import { MOCK_BALL_EVENTS, MOCK_MATCH_METADATA, MatchMetadata } from '@/data/mockMatch';
import { RootState } from '../index';

export interface MatchState {
  events: BallEvent[];
  currentBallIndex: number;
  isPlaying: boolean;
  matchInfo: MatchMetadata;
}

const initialState: MatchState = {
  events: MOCK_BALL_EVENTS,
  currentBallIndex: -1,
  isPlaying: false,
  matchInfo: MOCK_MATCH_METADATA,
};

export const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    advanceBallIndex: (state) => {
      if (state.currentBallIndex < state.events.length - 1) {
        state.currentBallIndex += 1;
      } else {
        state.isPlaying = false;
      }
    },
    setBallIndex: (state, action: PayloadAction<number>) => {
      const idx = Math.max(-1, Math.min(action.payload, state.events.length - 1));
      state.currentBallIndex = idx;
      if (idx >= state.events.length - 1) {
        state.isPlaying = false;
      }
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      if (state.currentBallIndex >= state.events.length - 1 && action.payload) {
        state.isPlaying = false;
      } else {
        state.isPlaying = action.payload;
      }
    },
    togglePlaying: (state) => {
      if (state.currentBallIndex >= state.events.length - 1) {
        state.isPlaying = false;
      } else {
        state.isPlaying = !state.isPlaying;
      }
    },
    resetMatch: (state) => {
      state.currentBallIndex = -1;
      state.isPlaying = false;
    },
  },
});

export const { advanceBallIndex, setBallIndex, setPlaying, togglePlaying, resetMatch } =
  matchSlice.actions;

export const selectEvents = (state: RootState) => state.match.events;
export const selectCurrentBallIndex = (state: RootState) => state.match.currentBallIndex;
export const selectIsPlaying = (state: RootState) => state.match.isPlaying;
export const selectMatchInfo = (state: RootState) => state.match.matchInfo;

export const selectCurrentEvent = createSelector(
  [selectEvents, selectCurrentBallIndex],
  (events, index): BallEvent | null => {
    if (index < 0 || index >= events.length) return null;
    return events[index];
  },
);

export const selectPlayedEvents = createSelector(
  [selectEvents, selectCurrentBallIndex],
  (events, index): BallEvent[] => {
    if (index < 0) return [];
    return events.slice(0, index + 1);
  },
);

export const selectIsMatchEnded = createSelector(
  [selectEvents, selectCurrentBallIndex],
  (events, index) => index >= events.length - 1,
);

export const selectLiveMatchScore = createSelector(
  [selectCurrentEvent],
  (currentEvent): InningScore => {
    if (!currentEvent) {
      return { runs: 0, wickets: 0, overs: '0.0' };
    }
    return currentEvent.inningsScore;
  },
);

export default matchSlice.reducer;
