'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCatchUpSummary,
  selectCatchUpStatus,
  selectCatchUpError,
  fetchCatchUpStream,
  resetCatchUp,
} from '@/store/slices/aiSlice';
import { selectPlayedEvents, selectLiveMatchScore } from '@/store/slices/matchSlice';
import {
  selectTeamPlayers,
  selectCurrentRank,
  selectTotalPoints,
} from '@/store/slices/teamSlice';
import { selectLanguage } from '@/store/slices/settingsSlice';
import { Sparkles, X, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';

interface CatchUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CatchUpModal({ isOpen, onClose }: CatchUpModalProps) {
  const dispatch = useAppDispatch();
  const summary = useAppSelector(selectCatchUpSummary);
  const status = useAppSelector(selectCatchUpStatus);
  const error = useAppSelector(selectCatchUpError);

  const playedEvents = useAppSelector(selectPlayedEvents);
  const currentScore = useAppSelector(selectLiveMatchScore);
  const userTeam = useAppSelector(selectTeamPlayers);
  const currentRank = useAppSelector(selectCurrentRank);
  const totalPoints = useAppSelector(selectTotalPoints);
  const language = useAppSelector(selectLanguage);

  const [copied, setCopied] = useState(false);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && status === 'idle') {
      dispatch(
        fetchCatchUpStream({
          playedEvents,
          userTeam,
          currentScore,
          currentRank,
          totalPoints,
          language,
        }),
      );
    }
  }, [
    isOpen,
    status,
    playedEvents,
    userTeam,
    currentScore,
    currentRank,
    totalPoints,
    language,
    dispatch,
  ]);

  useEffect(() => {
    if (status === 'streaming') {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [summary, status]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    dispatch(resetCatchUp());
    dispatch(
      fetchCatchUpStream({
        playedEvents,
        userTeam,
        currentScore,
        currentRank,
        totalPoints,
        language,
      }),
    );
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catch-up-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="catch-up-title" className="text-sm font-bold text-white tracking-wide">
                {language === 'hinglish' ? '30-Second Match Catch-Up' : '30-Second Match Catch-Up'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {playedEvents.length} balls played • Live AI analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {summary && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy summary text"
                aria-label="Copy summary text"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={status === 'streaming'}
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors"
              title="Regenerate catch-up"
              aria-label="Regenerate catch-up"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'streaming' ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {status === 'failed' ? (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Failed to generate summary</p>
                <p className="text-slate-400 mb-3">{error || 'Network error occurred.'}</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : !summary && status === 'streaming' ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-5/6" />
              <div className="h-4 bg-slate-800 rounded w-2/3" />
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line font-normal">
              {summary}
              {status === 'streaming' && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-rose-500 animate-pulse align-middle" />
              )}
              <div ref={streamEndRef} />
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>Your Fantasy Status: </span>
            <span className="font-bold text-white">{totalPoints} pts</span>
            <span className="mx-1">•</span>
            <span className="font-bold text-amber-400">#{currentRank.toLocaleString()} Rank</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
