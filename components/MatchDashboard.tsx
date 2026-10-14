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

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-5">
        <SimulationControls />
        <WhyPointsChangedCard />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          <div className="lg:col-span-5">
            <EventFeed />
          </div>
          <div className="lg:col-span-7">
            <MyTeamPanel />
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-[#243047] bg-[#080B14] py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="font-medium text-slate-400">Match Pulse • Dream11 AI Live Assistant Prototype</span>
          <span className="text-[11px] text-slate-500">
            Official T20 Dream11 Scoring Engine & Gemini Flash AI
          </span>
        </div>
      </footer>

      {isCatchUpOpen && (
        <CatchUpModal isOpen={isCatchUpOpen} onClose={() => setIsCatchUpOpen(false)} />
      )}
    </div>
  );
}
