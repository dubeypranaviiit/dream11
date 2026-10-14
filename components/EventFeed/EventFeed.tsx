'use client';

import { useAppSelector } from '@/store/hooks';
import {
  selectPlayedEvents,
  selectCurrentBallIndex,
  selectEvents,
} from '@/store/slices/matchSlice';
import FeedItem from './FeedItem';
import { Radio } from 'lucide-react';

export default function EventFeed() {
  const playedEvents = useAppSelector(selectPlayedEvents);
  const currentBallIndex = useAppSelector(selectCurrentBallIndex);
  const totalEvents = useAppSelector(selectEvents);

  const reversedEvents = [...playedEvents].reverse();

  return (
    <section
      aria-label="Ball-by-ball commentary feed"
      className="bg-[#101727] border border-[#243047] rounded-2xl p-3.5 sm:p-5 shadow-lg flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-[#243047]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[#FF1744]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">Live Match Feed</h2>
            <p className="text-[11px] text-slate-400">Ball-by-ball T20 Action</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-300 bg-[#151F32] px-3 py-1 rounded-full border border-[#243047]">
          Ball {Math.max(0, currentBallIndex + 1)} of {totalEvents.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[500px] lg:max-h-[580px]">
        {playedEvents.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-[#151F32] border border-[#243047] flex items-center justify-center text-slate-500 mb-2.5">
              <Radio className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-300">No balls played yet.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Click &quot;Simulate Next Ball&quot; above to start the match action.
            </p>
          </div>
        ) : (
          reversedEvents.map((event, idx) => (
            <FeedItem
              key={event.id}
              event={event}
              isLatest={idx === 0}
            />
          ))
        )}
      </div>
    </section>
  );
}
