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
        <span className="w-7 h-7 rounded-full bg-[#FF1744] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
          W
        </span>
      );
    }
    if (event.isSix) {
      return (
        <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
          6
        </span>
      );
    }
    if (event.isBoundaryFour) {
      return (
        <span className="w-7 h-7 rounded-full bg-[#38BDF8] text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
          4
        </span>
      );
    }
    if (event.isWide) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
          Wd
        </span>
      );
    }
    if (event.runs === 0) {
      return (
        <span className="w-7 h-7 rounded-full bg-[#101727] border border-[#243047] text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
          •
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-[#101727] border border-[#243047] text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
        {event.runs}
      </span>
    );
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
        isLatest
          ? 'bg-[#182642] border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.12)] ring-1 ring-[#38BDF8]/40'
          : 'bg-[#151F32]/80 border-[#243047] hover:bg-[#151F32] hover:border-slate-600/60'
      }`}
    >
      <div className="pt-0.5">{getBadge()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200">
              Over {event.displayOver}
            </span>
            {isLatest && (
              <span className="text-[9px] uppercase font-black text-[#38BDF8] bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-800/80">
                LATEST
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono bg-[#080B14] px-1.5 py-0.5 rounded border border-[#243047]/60">
            {event.inningsScore.runs}/{event.inningsScore.wickets}
          </span>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
          {event.description}
        </p>
      </div>
    </div>
  );
});

export default FeedItem;
