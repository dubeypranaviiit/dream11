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
      className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-200 ${
        isRecentlyScored
          ? 'bg-slate-800/90 border-amber-500/50 shadow-sm'
          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
            player.role === 'BAT'
              ? 'bg-blue-950 text-blue-400 border border-blue-800'
              : player.role === 'BOWL'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : player.role === 'AR'
                  ? 'bg-purple-950 text-purple-400 border border-purple-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}
        >
          {player.role}
        </span>

        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {player.name}
            </span>

            {player.isCaptain && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded shadow-sm">
                C (2x)
              </span>
            )}

            {player.isViceCaptain && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-cyan-400 text-slate-950 rounded shadow-sm">
                VC (1.5x)
              </span>
            )}
          </div>

          <span className="text-[10px] text-slate-400 font-medium">
            {player.team} {player.isViceCaptain && player.points === 0 ? '• Bowls 2nd Inns' : ''}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0 ml-2">
        <span
          className={`text-sm font-bold tracking-tight ${
            player.points > 0
              ? 'text-emerald-400'
              : player.points < 0
                ? 'text-rose-400'
                : 'text-slate-400'
          }`}
        >
          {player.points} <span className="text-[10px] font-normal text-slate-400">pts</span>
        </span>
      </div>
    </div>
  );
});

export default PlayerRow;
