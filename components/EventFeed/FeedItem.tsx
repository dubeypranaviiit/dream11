'use client';

import React from 'react';
import { BallEvent } from '@/types/cricket';

interface FeedItemProps {
  event: BallEvent;
  isLatest: boolean;
}

const FeedItem = React.memo(function FeedItem({ event, isLatest }: FeedItemProps) {
  const getBadge = () => {
    if (event.isWicket) {
      return (
        <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
          W
        </span>
      );
    }
    if (event.isSix) {
      return (
        <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
          6
        </span>
      );
    }
    if (event.isBoundaryFour) {
      return (
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
          4
        </span>
      );
    }
    if (event.isWide) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
          Wd
        </span>
      );
    }
    if (event.runs === 0) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
          •
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
        {event.runs}
      </span>
    );
  };

  return (
    <div
      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 ${
        isLatest
          ? 'bg-slate-800/90 border-slate-700 shadow-sm ring-1 ring-rose-500/30'
          : 'bg-slate-900/50 border-slate-800/60 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="pt-0.5">{getBadge()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-xs font-bold text-slate-300">
            Over {event.displayOver}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {event.inningsScore.runs}/{event.inningsScore.wickets}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-snug line-clamp-2">
          {event.description}
        </p>
      </div>
    </div>
  );
});

export default FeedItem;
