'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentExplanation,
  selectExplainStatus,
  selectExplainError,
  selectIsFallbackExplanation,
  fetchExplanationForBall,
} from '@/store/slices/aiSlice';
import {
  selectLastPointsDelta,
  selectLastRankDelta,
  selectLastBreakdown,
  selectCurrentRank,
} from '@/store/slices/teamSlice';
import { selectCurrentEvent } from '@/store/slices/matchSlice';
import { selectLanguage } from '@/store/slices/settingsSlice';
import ExplanationSkeleton from './ExplanationSkeleton';
import { Sparkles, AlertCircle, RefreshCw, Activity } from 'lucide-react';

export default function WhyPointsChangedCard() {
  const dispatch = useAppDispatch();
  const currentEvent = useAppSelector(selectCurrentEvent);
  const currentExplanation = useAppSelector(selectCurrentExplanation);
  const explainStatus = useAppSelector(selectExplainStatus);
  const explainError = useAppSelector(selectExplainError);
  const isFallback = useAppSelector(selectIsFallbackExplanation);

  const lastPointsDelta = useAppSelector(selectLastPointsDelta);
  const lastRankDelta = useAppSelector(selectLastRankDelta);
  const lastBreakdown = useAppSelector(selectLastBreakdown);
  const currentRank = useAppSelector(selectCurrentRank);
  const language = useAppSelector(selectLanguage);

  const handleRetry = () => {
    if (!currentEvent || !lastBreakdown) return;
    dispatch(
      fetchExplanationForBall({
        event: currentEvent,
        breakdown: lastBreakdown,
        language,
        previousRank: currentRank + lastRankDelta,
        newRank: currentRank,
      }),
    );
  };

  if (!currentEvent) {
    return (
      <div className="bg-[#151F32] border border-[#243047] rounded-2xl p-6 sm:p-8 shadow-lg text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#101727] border border-[#243047] flex items-center justify-center text-slate-400 mb-3">
          <Activity className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
          {language === 'hinglish' ? 'Match Shuru Nahi Hua' : 'Simulation Not Started'}
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-400 max-w-md mx-auto leading-relaxed">
          {language === 'hinglish'
            ? 'Ball-by-ball simulated action dekhne ke liye "Simulate next ball" click karein ya "Join late" dabayein.'
            : 'Click "Simulate next ball" or use "Join Late" to experience real-time fantasy point explanations.'}
        </p>
      </div>
    );
  }

  const isPositive = lastPointsDelta > 0;
  const isNegative = lastPointsDelta < 0;

  return (
    <div className="bg-[#151F32] border border-[#243047] rounded-2xl p-4 sm:p-5 shadow-lg transition-all">
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[#FF1744]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              {language === 'hinglish' ? 'Mere Points Kyun Badle?' : 'Why Did My Points Change?'}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Ball {currentEvent.displayOver} • {currentEvent.bowlerName.split(' ').pop()} to{' '}
              {currentEvent.batsmanName.split(' ').pop()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black tracking-tight flex items-center gap-1 border shadow-sm ${
              isPositive
                ? 'bg-emerald-950/80 text-[#22C55E] border-emerald-500/40'
                : isNegative
                  ? 'bg-rose-950/80 text-[#FF1744] border-rose-500/40'
                  : 'bg-[#101727] text-slate-400 border-[#243047]'
            }`}
          >
            <span>
              {isPositive ? `+${lastPointsDelta}` : lastPointsDelta} pts
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0B101D] border border-[#243047] rounded-xl p-3.5 sm:p-4">
        {explainStatus === 'loading' ? (
          <ExplanationSkeleton />
        ) : explainStatus === 'failed' ? (
          <div className="flex items-start justify-between gap-3 text-xs text-rose-300 py-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{explainError || 'Could not fetch explanation.'}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#151F32] hover:bg-[#1c2942] text-slate-200 text-[11px] font-semibold rounded-md border border-[#243047] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
              {currentExplanation || 'Deterministic scoring applied for this ball.'}
            </p>

            {lastBreakdown && lastBreakdown.playerBreakdowns.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-[#243047]/80">
                {lastBreakdown.playerBreakdowns.map((p) => (
                  <span
                    key={p.playerId}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#151F32] border border-[#243047] text-slate-200 font-medium"
                  >
                    <span>{p.playerName}</span>
                    {p.isCaptain && (
                      <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-400 text-slate-950">C</span>
                    )}
                    {p.isViceCaptain && (
                      <span className="text-[9px] font-black px-1 py-0.2 rounded bg-[#38BDF8] text-slate-950">VC</span>
                    )}
                    <span
                      className={`font-black ${
                        p.netPoints > 0
                          ? 'text-[#22C55E]'
                          : p.netPoints < 0
                            ? 'text-[#FF1744]'
                            : 'text-slate-400'
                      }`}
                    >
                      {p.netPoints > 0 ? `+${p.netPoints}` : p.netPoints}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 px-1 font-medium">
        <span>Deterministic Dream11 rules engine</span>
        {isFallback && explainStatus === 'succeeded' && (
          <span className="text-slate-400">Instant rule breakdown</span>
        )}
      </div>
    </div>
  );
}
