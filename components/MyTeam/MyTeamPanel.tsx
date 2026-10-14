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
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">My Team</h2>
            <p className="text-[11px] text-slate-400">11 Players Active</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Total Points
            </span>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-lg font-black text-white">{totalPoints}</span>
              {lastPointsDelta !== 0 && (
                <span
                  className={`text-[10px] font-bold px-1 py-0.2 rounded ${
                    lastPointsDelta > 0
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {lastPointsDelta > 0 ? `+${lastPointsDelta}` : lastPointsDelta}
                </span>
              )}
            </div>
          </div>

          <div className="text-right pl-3 border-l border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              Simulated Rank
            </span>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-lg font-black text-amber-300">
                #{currentRank.toLocaleString()}
              </span>
              {lastRankDelta !== 0 && (
                <span
                  className={`inline-flex items-center text-[10px] font-bold px-1 py-0.2 rounded ${
                    lastRankDelta > 0
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
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
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse team list' : 'Expand team list'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
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
