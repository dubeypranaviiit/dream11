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
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Live Match Feed</h2>
            <p className="text-[11px] text-slate-400">Ball-by-ball T20 Action</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/80">
          Ball {Math.max(0, currentBallIndex + 1)} of {totalEvents.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px] sm:max-h-[420px]">
        {playedEvents.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <p className="text-xs">No balls played yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Click &quot;Simulate Next Ball&quot; above to start the match.
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
