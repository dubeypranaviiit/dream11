'use client';

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectIsPlaying,
  selectIsMatchEnded,
  selectCurrentBallIndex,
  setPlaying,
  resetMatch,
} from '@/store/slices/matchSlice';
import { resetAI } from '@/store/slices/aiSlice';
import { selectPlaybackSpeed } from '@/store/slices/settingsSlice';
import { resetTeam } from '@/store/slices/teamSlice';
import { playNextBall, jumpToBall } from '@/store';
import { Play, Pause, FastForward, RotateCcw, SkipForward } from 'lucide-react';

export default function SimulationControls() {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(selectIsPlaying);
  const isMatchEnded = useAppSelector(selectIsMatchEnded);
  const currentBallIndex = useAppSelector(selectCurrentBallIndex);
  const playbackSpeed = useAppSelector(selectPlaybackSpeed);

  useEffect(() => {
    if (!isPlaying || isMatchEnded) return;

    const timer = setInterval(() => {
      dispatch(playNextBall());
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, isMatchEnded, playbackSpeed, dispatch]);

  const handleNextBall = useCallback(() => {
    if (isMatchEnded) return;
    dispatch(playNextBall());
  }, [isMatchEnded, dispatch]);

  const handleTogglePlay = useCallback(() => {
    if (isMatchEnded) return;
    dispatch(setPlaying(!isPlaying));
  }, [isMatchEnded, isPlaying, dispatch]);

  const handleJoinLate = useCallback(() => {
    dispatch(setPlaying(false));
    dispatch(jumpToBall(15));
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(setPlaying(false));
    dispatch(resetMatch());
    dispatch(resetTeam());
    dispatch(resetAI());
  }, [dispatch]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleNextBall}
          disabled={isPlaying || isMatchEnded}
          className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
          aria-label="Simulate next ball"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>{isMatchEnded ? 'Match Finished' : 'Simulate Next Ball'}</span>
        </button>

        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={isMatchEnded}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${
            isPlaying
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-slate-800 hover:bg-slate-755 border-slate-700 text-slate-200'
          }`}
          aria-label={isPlaying ? 'Pause simulation' : 'Auto-play simulation'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
        </button>

        <button
          type="button"
          onClick={handleJoinLate}
          disabled={currentBallIndex >= 14}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-850 hover:bg-slate-800 disabled:opacity-30 border border-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
          title="Simulate first 15 balls instantly to demo the Catch me up feature"
        >
          <SkipForward className="w-3.5 h-3.5 text-amber-400" />
          <span>Join Late (Ball 15)</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={currentBallIndex < 0}
          className="inline-flex items-center justify-center p-2 bg-slate-850 hover:bg-slate-800 disabled:opacity-30 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
          title="Reset match simulation"
          aria-label="Reset match simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
