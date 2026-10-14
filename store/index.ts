import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import matchReducer, {
  advanceBallIndex,
  setBallIndex,
  setPlaying,
  resetMatch,
} from './slices/matchSlice';
import teamReducer, {
  applyBallPointsResult,
  setAllPlayers,
  setRankState,
  resetTeam,
} from './slices/teamSlice';
import aiReducer, {
  fetchExplanationForBall,
  setDirectExplanation,
  resetAI,
} from './slices/aiSlice';
import settingsReducer from './slices/settingsSlice';
import { computeBallPoints, generateDeterministicExplanation } from '@/lib/scoring';
import { INITIAL_USER_TEAM } from '@/data/mockMatch';
import { BASE_SIMULATED_RANK } from '@/types/fantasy';

export const store = configureStore({
  reducer: {
    match: matchReducer,
    team: teamReducer,
    ai: aiReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const playNextBall = createAsyncThunk<void, void, { state: RootState; dispatch: AppDispatch }>(
  'simulation/playNextBall',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { events, currentBallIndex } = state.match;

    if (currentBallIndex >= events.length - 1) {
      dispatch(setPlaying(false));
      return;
    }

    const nextIndex = currentBallIndex + 1;
    const nextEvent = events[nextIndex];

    dispatch(advanceBallIndex());

    const currentRank = state.team.currentRank;
    const breakdown = computeBallPoints(nextEvent, state.team.players, currentRank);

    dispatch(applyBallPointsResult({ breakdown }));

    const language = state.settings.language;
    const updatedState = getState();
    const newRank = updatedState.team.currentRank;

    if (breakdown.affectsUserTeam) {
      dispatch(
        fetchExplanationForBall({
          event: nextEvent,
          breakdown,
          language,
          previousRank: currentRank,
          newRank,
        }),
      );
    } else {
      const note = generateDeterministicExplanation(breakdown, language, 0);
      dispatch(
        setDirectExplanation({
          explanation: note,
          ballId: nextEvent.id,
          isFallback: true,
        }),
      );
    }
  },
);

export const jumpToBall = createAsyncThunk<
  void,
  number,
  { state: RootState; dispatch: AppDispatch }
>('simulation/jumpToBall', async (targetBallNumber, { getState, dispatch }) => {
  const state = getState();
  const { events } = state.match;
  const targetIndex = Math.min(targetBallNumber - 1, events.length - 1);

  if (targetIndex < 0) {
    dispatch(resetMatch());
    dispatch(resetTeam());
    dispatch(resetAI());
    return;
  }

  const simulatedPlayers = INITIAL_USER_TEAM.map((p) => ({
    ...p,
    points: 0,
    stats: { ...p.stats },
  }));
  let runningRank = BASE_SIMULATED_RANK;
  let lastPointsDelta = 0;
  let lastRankDelta = 0;
  let lastBreakdown = null;

  for (let i = 0; i <= targetIndex; i++) {
    const event = events[i];
    const breakdown = computeBallPoints(event, simulatedPlayers, runningRank);

    if (breakdown.affectsUserTeam) {
      for (const pBreakdown of breakdown.playerBreakdowns) {
        const player = simulatedPlayers.find((p) => p.id === pBreakdown.playerId);
        if (player) {
          player.points += pBreakdown.netPoints;
        }
      }
    }

    const prevRank = runningRank;
    const newRank = Math.max(1, runningRank - Math.round(breakdown.netTeamPointsDelta * 75));
    lastRankDelta = prevRank - newRank;
    runningRank = newRank;
    lastPointsDelta = breakdown.netTeamPointsDelta;
    lastBreakdown = breakdown;
  }

  dispatch(setBallIndex(targetIndex));
  dispatch(setAllPlayers(simulatedPlayers));
  dispatch(
    setRankState({
      rank: runningRank,
      lastPointsDelta,
      lastRankDelta,
      lastBreakdown,
    }),
  );

  const finalEvent = events[targetIndex];
  const language = state.settings.language;
  if (lastBreakdown && lastBreakdown.affectsUserTeam) {
    dispatch(
      fetchExplanationForBall({
        event: finalEvent,
        breakdown: lastBreakdown,
        language,
        previousRank: runningRank + lastRankDelta,
        newRank: runningRank,
      }),
    );
  } else if (lastBreakdown) {
    const note = generateDeterministicExplanation(lastBreakdown, language, 0);
    dispatch(
      setDirectExplanation({
        explanation: note,
        ballId: finalEvent.id,
        isFallback: true,
      }),
    );
  }
});
