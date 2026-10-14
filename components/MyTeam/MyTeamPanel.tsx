'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectTeamPlayers,
  selectTotalPoints,
  selectCurrentRank,
  selectLastPointsDelta,
  selectLastRankDelta,
  selectLastBreakdown,
} from '@/store/slices/teamSlice';
import PlayerRow from './PlayerRow';
import { Users, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

export default function MyTeamPanel() {
  const players = useAppSelector(selectTeamPlayers);
  const totalPoints = useAppSelector(selectTotalPoints);
  const currentRank = useAppSelector(selectCurrentRank);
  const lastPointsDelta = useAppSelector(selectLastPointsDelta);
  const lastRankDelta = useAppSelector(selectLastRankDelta);
  const lastBreakdown = useAppSelector(selectLastBreakdown);

  const [isExpanded, setIsExpanded] = useState(true);

  const recentPlayerIds = new Set(
    lastBreakdown?.playerBreakdowns.map((p) => p.playerId) || [],
  );

  return (
    <section
      aria-label="My Fantasy Team"
      className="bg-[#101727] border border-[#243047] rounded-2xl p-3.5 sm:p-5 shadow-lg flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-[#243047]/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[#FF1744]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">My Team</h2>
              <p className="text-[11px] text-slate-400">11 Players Active</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-1.5 rounded-lg bg-[#151F32] border border-[#243047] text-slate-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse team list' : 'Expand team list'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Total Points
            </span>
            <div className="flex items-center gap-1.5 sm:justify-end">
              <span className="text-base sm:text-lg font-black text-white">{totalPoints}</span>
              {lastPointsDelta !== 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    lastPointsDelta > 0
                      ? 'bg-emerald-950/80 text-[#22C55E] border border-emerald-800/80'
                      : 'bg-rose-950/80 text-[#FF1744] border border-rose-800/80'
                  }`}
                >
                  {lastPointsDelta > 0 ? `+${lastPointsDelta}` : lastPointsDelta}
                </span>
              )}
            </div>
          </div>

          <div className="text-right pl-3 border-l border-[#243047]">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              Simulated Rank
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-base sm:text-lg font-black text-amber-300">
                #{currentRank.toLocaleString()}
              </span>
              {lastRankDelta !== 0 && (
                <span
                  className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    lastRankDelta > 0
                      ? 'bg-emerald-950/80 text-[#22C55E] border border-emerald-800/80'
                      : 'bg-rose-950/80 text-[#FF1744] border border-rose-800/80'
                  }`}
                  title={
                    lastRankDelta > 0
                      ? `Improved by ${lastRankDelta.toLocaleString()} spots`
                      : `Dropped by ${Math.abs(lastRankDelta).toLocaleString()} spots`
                  }
                >
                  {lastRankDelta > 0 ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
                  )}
                  {Math.abs(lastRankDelta).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:inline-flex p-1.5 rounded-lg bg-[#151F32] border border-[#243047] text-slate-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse team list' : 'Expand team list'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 max-h-[500px] lg:max-h-[580px] overflow-y-auto pr-1">
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              isRecentlyScored={recentPlayerIds.has(player.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
