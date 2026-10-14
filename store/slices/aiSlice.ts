import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExplainRequest, ExplainResponse, CatchUpRequest, AppLanguage } from '@/types/api';
import { BallEvent } from '@/types/cricket';
import { BallPointsResult, FantasyPlayer } from '@/types/fantasy';
import { RootState } from '../index';

export interface AIState {
  explanationCache: Record<string, string>;
  currentExplanation: string | null;
  isFallbackExplanation: boolean;
  explainStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  explainError: string | null;
  lastBallId: string | null;
  catchUpSummary: string;
  catchUpStatus: 'idle' | 'loading' | 'streaming' | 'succeeded' | 'failed';
  catchUpError: string | null;
}

const initialState: AIState = {
  explanationCache: {},
  currentExplanation: null,
  isFallbackExplanation: false,
  explainStatus: 'idle',
  explainError: null,
  lastBallId: null,
  catchUpSummary: '',
  catchUpStatus: 'idle',
  catchUpError: null,
};

let explainAbortController: AbortController | null = null;
let catchUpAbortController: AbortController | null = null;

export const fetchExplanationForBall = createAsyncThunk<
  { explanation: string; cacheKey: string; ballId: string; isFallback: boolean },
  {
    event: BallEvent;
    breakdown: BallPointsResult;
    language: AppLanguage;
    previousRank: number;
    newRank: number;
  },
  { state: RootState; rejectValue: string }
>(
  'ai/fetchExplanationForBall',
  async (params, { getState, rejectWithValue }) => {
    const { event, breakdown, language, previousRank, newRank } = params;
    const cacheKey = `${event.id}_${language}`;
    const state = getState();

    if (state.ai.explanationCache[cacheKey]) {
      return {
        explanation: state.ai.explanationCache[cacheKey],
        cacheKey,
        ballId: event.id,
        isFallback: false,
      };
    }

    if (explainAbortController) {
      explainAbortController.abort();
    }
    explainAbortController = new AbortController();

    try {
      const payload: ExplainRequest = {
        event,
        breakdown,
        language,
        previousRank,
        newRank,
      };

      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: explainAbortController.signal,
      });

      if (!res.ok) {
        return rejectWithValue(`API returned status ${res.status}`);
      }

      const data = (await res.json()) as ExplainResponse;
      return {
        explanation: data.explanation,
        cacheKey,
        ballId: event.id,
        isFallback: !!data.isFallback,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return rejectWithValue('aborted');
      }
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown AI error');
    }
  },
);

export const fetchCatchUpStream = createAsyncThunk<
  void,
  {
    playedEvents: BallEvent[];
    userTeam: FantasyPlayer[];
    currentScore: { runs: number; wickets: number; overs: string };
    currentRank: number;
    totalPoints: number;
    language: AppLanguage;
  },
  { rejectValue: string }
>(
  'ai/fetchCatchUpStream',
  async (params, { dispatch, rejectWithValue }) => {
    if (catchUpAbortController) {
      catchUpAbortController.abort();
    }
    catchUpAbortController = new AbortController();

    dispatch(aiSlice.actions.startCatchUpStream());

    try {
      const payload: CatchUpRequest = params;

      const res = await fetch('/api/catch-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: catchUpAbortController.signal,
      });

      if (!res.ok || !res.body) {
        dispatch(aiSlice.actions.catchUpFailed(`HTTP Error ${res.status}`));
        return rejectWithValue(`HTTP Error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        dispatch(aiSlice.actions.appendCatchUpChunk(chunk));
      }

      dispatch(aiSlice.actions.catchUpCompleted());
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Catch-up stream failed';
      dispatch(aiSlice.actions.catchUpFailed(message));
      return rejectWithValue(message);
    }
  },
);

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setDirectExplanation: (
      state,
      action: PayloadAction<{ explanation: string; ballId: string; isFallback: boolean }>,
    ) => {
      state.currentExplanation = action.payload.explanation;
      state.lastBallId = action.payload.ballId;
      state.isFallbackExplanation = action.payload.isFallback;
      state.explainStatus = 'succeeded';
      state.explainError = null;
    },
    startCatchUpStream: (state) => {
      state.catchUpStatus = 'streaming';
      state.catchUpSummary = '';
      state.catchUpError = null;
    },
    appendCatchUpChunk: (state, action: PayloadAction<string>) => {
      state.catchUpSummary += action.payload;
    },
    catchUpCompleted: (state) => {
      state.catchUpStatus = 'succeeded';
    },
    catchUpFailed: (state, action: PayloadAction<string>) => {
      state.catchUpStatus = 'failed';
      state.catchUpError = action.payload;
    },
    resetCatchUp: (state) => {
      state.catchUpSummary = '';
      state.catchUpStatus = 'idle';
      state.catchUpError = null;
    },
    resetAI: (state) => {
      state.currentExplanation = null;
      state.isFallbackExplanation = false;
      state.explainStatus = 'idle';
      state.explainError = null;
      state.lastBallId = null;
      state.catchUpSummary = '';
      state.catchUpStatus = 'idle';
      state.catchUpError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExplanationForBall.pending, (state, action) => {
        state.explainStatus = 'loading';
        state.explainError = null;
        state.lastBallId = action.meta.arg.event.id;
      })
      .addCase(fetchExplanationForBall.fulfilled, (state, action) => {
        state.explainStatus = 'succeeded';
        state.currentExplanation = action.payload.explanation;
        state.isFallbackExplanation = action.payload.isFallback;
        state.explanationCache[action.payload.cacheKey] = action.payload.explanation;
      })
      .addCase(fetchExplanationForBall.rejected, (state, action) => {
        if (action.payload === 'aborted') {
          return;
        }
        state.explainStatus = 'failed';
        state.explainError = action.payload || 'Failed to generate explanation';
      });
  },
});

export const {
  setDirectExplanation,
  startCatchUpStream,
  appendCatchUpChunk,
  catchUpCompleted,
  catchUpFailed,
  resetCatchUp,
  resetAI,
} = aiSlice.actions;

export const selectCurrentExplanation = (state: RootState) => state.ai.currentExplanation;
export const selectIsFallbackExplanation = (state: RootState) => state.ai.isFallbackExplanation;
export const selectExplainStatus = (state: RootState) => state.ai.explainStatus;
export const selectExplainError = (state: RootState) => state.ai.explainError;
export const selectCatchUpSummary = (state: RootState) => state.ai.catchUpSummary;
export const selectCatchUpStatus = (state: RootState) => state.ai.catchUpStatus;
export const selectCatchUpError = (state: RootState) => state.ai.catchUpError;

export default aiSlice.reducer;
