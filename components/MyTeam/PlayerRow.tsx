'use client';

import React from 'react';
import { FantasyPlayer } from '@/types/fantasy';

interface PlayerRowProps {
  player: FantasyPlayer;
  isRecentlyScored?: boolean;
}

const PlayerRow = React.memo(function PlayerRow({
  player,
  isRecentlyScored,
}: PlayerRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 ${
        isRecentlyScored
          ? 'bg-[#182642] border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
          : 'bg-[#151F32]/85 border-[#243047] hover:bg-[#1a263d] hover:border-slate-600/60'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span
          className={`w-11 text-center py-1 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
            player.role === 'BAT'
              ? 'bg-sky-950/80 text-sky-400 border border-sky-800/80'
              : player.role === 'BOWL'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                : player.role === 'AR'
                  ? 'bg-purple-950/80 text-purple-400 border border-purple-800/80'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
          }`}
        >
          {player.role}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-1.5 leading-snug">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-100">
              {player.name}
            </span>

            {player.isCaptain && (
              <span className="inline-flex items-center text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shadow-sm shrink-0 leading-none">
                C (2x)
              </span>
            )}

            {player.isViceCaptain && (
              <span className="inline-flex items-center text-[10px] font-black px-1.5 py-0.5 rounded bg-[#38BDF8] text-slate-950 shadow-sm shrink-0 leading-none">
                VC (1.5x)
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            {player.team}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 pl-2">
        <span
          className={`text-sm sm:text-base font-black tracking-tight ${
            player.points > 0
              ? 'text-[#22C55E]'
              : player.points < 0
                ? 'text-[#FF1744]'
                : 'text-slate-400'
          }`}
        >
          {player.points}
          <span className="text-[10px] font-normal text-slate-400 ml-0.5">pts</span>
        </span>
      </div>
    </div>
  );
});

export default PlayerRow;
