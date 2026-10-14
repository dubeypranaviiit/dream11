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
    <div className="bg-[#101727] border border-[#243047] rounded-2xl p-2.5 sm:p-3.5 shadow-lg">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleNextBall}
          disabled={isPlaying || isMatchEnded}
          className="flex-1 h-11 sm:h-10 inline-flex items-center justify-center gap-2 px-4 bg-[#FF1744] hover:bg-[#e0143c] disabled:bg-[#151F32] disabled:text-slate-500 disabled:border disabled:border-[#243047] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#FF1744]/50 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Simulate next ball"
        >
          <FastForward className="w-4 h-4" />
          <span>{isMatchEnded ? 'Match Finished' : 'Simulate Next Ball'}</span>
        </button>

        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={isMatchEnded}
            className={`h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-bold rounded-xl border transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-[#151F32] hover:bg-[#1c2942] border-[#243047] text-slate-200 hover:text-white'
            }`}
            aria-label={isPlaying ? 'Pause simulation' : 'Auto-play simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            type="button"
            onClick={handleJoinLate}
            disabled={currentBallIndex >= 14}
            className="h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 px-3.5 bg-[#151F32] hover:bg-[#1c2942] disabled:opacity-30 border border-[#243047] text-slate-200 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Simulate first 15 balls instantly to demo the Catch me up feature"
          >
            <SkipForward className="w-4 h-4 text-amber-400" />
            <span className="truncate">Join Late</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={currentBallIndex < 0}
            className="h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 px-3 bg-[#151F32] hover:bg-[#1c2942] disabled:opacity-30 border border-[#243047] text-slate-400 hover:text-slate-100 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Reset match simulation"
            aria-label="Reset match simulation"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sm:hidden text-xs font-medium">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
