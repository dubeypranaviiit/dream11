'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';
import SimulationControls from './EventFeed/SimulationControls';
import WhyPointsChangedCard from './Explanations/WhyPointsChangedCard';
import EventFeed from './EventFeed/EventFeed';
import MyTeamPanel from './MyTeam/MyTeamPanel';

const CatchUpModal = dynamic(() => import('./CatchUpModal/CatchUpModal'), {
  ssr: false,
});

export default function MatchDashboard() {
  const [isCatchUpOpen, setIsCatchUpOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenCatchUp={() => setIsCatchUpOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 space-y-3.5">
        <SimulationControls />
        <WhyPointsChangedCard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
          <EventFeed />
          <MyTeamPanel />
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Match Pulse • Dream11 AI Live Assistant Prototype</span>
          <span className="text-[11px] text-slate-400">
            Official T20 Dream11 Scoring Engine & Gemini API
          </span>
        </div>
      </footer>

      {isCatchUpOpen && (
        <CatchUpModal isOpen={isCatchUpOpen} onClose={() => setIsCatchUpOpen(false)} />
      )}
    </div>
  );
}
