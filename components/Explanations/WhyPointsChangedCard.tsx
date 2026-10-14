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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md text-center py-6">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
          <Activity className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          {language === 'hinglish' ? 'Match Shuru Nahi Hua' : 'Simulation Not Started'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {language === 'hinglish'
            ? 'Ball-by-ball simulated action dekhne ke liye "Simulate next ball" click karein ya "Join late at ball 15" dabayein.'
            : 'Click "Simulate next ball" or use "Join late at ball 15" to experience live fantasy point explanations.'}
        </p>
      </div>
    );
  }

  const isPositive = lastPointsDelta > 0;
  const isNegative = lastPointsDelta < 0;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-md transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {language === 'hinglish' ? 'Mere Points Kyun Badle?' : 'Why Did My Points Change?'}
            </h3>
            <span className="text-[10px] text-slate-400">
              Ball {currentEvent.displayOver} • {currentEvent.bowlerName.split(' ').pop()} to{' '}
              {currentEvent.batsmanName.split(' ').pop()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-black tracking-tight flex items-center gap-1 border ${
              isPositive
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : isNegative
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span>
              {isPositive ? `+${lastPointsDelta}` : lastPointsDelta} pts
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-3">
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
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-md border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {currentExplanation || 'Deterministic scoring applied for this ball.'}
            </p>

            {lastBreakdown && lastBreakdown.playerBreakdowns.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80">
                {lastBreakdown.playerBreakdowns.map((p) => (
                  <span
                    key={p.playerId}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-300 font-medium"
                  >
                    <span>{p.playerName}</span>
                    {p.isCaptain && (
                      <span className="text-[9px] font-bold text-amber-400">C</span>
                    )}
                    {p.isViceCaptain && (
                      <span className="text-[9px] font-bold text-cyan-400">VC</span>
                    )}
                    <span
                      className={`font-bold ${
                        p.netPoints > 0
                          ? 'text-emerald-400'
                          : p.netPoints < 0
                            ? 'text-rose-400'
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

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
        <span>Deterministic Dream11 rules engine</span>
        {isFallback && explainStatus === 'succeeded' && (
          <span className="text-slate-400">Instant rule breakdown</span>
        )}
      </div>
    </div>
  );
}
