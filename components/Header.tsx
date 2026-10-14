'use client';

import { useAppSelector } from '@/store/hooks';
import { selectLiveMatchScore, selectMatchInfo } from '@/store/slices/matchSlice';
import LanguageToggle from './LanguageToggle';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenCatchUp: () => void;
}

export default function Header({ onOpenCatchUp }: HeaderProps) {
  const matchInfo = useAppSelector(selectMatchInfo);
  const liveScore = useAppSelector(selectLiveMatchScore);

  return (
    <header className="sticky top-0 z-30 bg-[#080B14]/90 backdrop-blur-md border-b border-[#243047] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 mb-2.5 sm:mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#101727] text-slate-300 border border-[#243047]">
              Simulated Demo Match
            </span>
            <span className="hidden md:inline text-xs font-medium text-slate-400">
              {matchInfo.tournament}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageToggle />
            <button
              type="button"
              onClick={onOpenCatchUp}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 bg-gradient-to-r from-amber-500 to-[#FF1744] hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold rounded-full shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF1744]/40 cursor-pointer"
              aria-label="Catch me up with AI summary"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Catch me up</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#101727] border border-[#243047] rounded-xl sm:rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3 shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="flex items-center gap-1.5 bg-[#FF1744]/15 text-[#FF1744] text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-full border border-[#FF1744]/30 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF1744] animate-pulse-glow" />
              LIVE
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-sm sm:text-base tracking-wide text-white">
                <span>{matchInfo.teamHome.code}</span>
                <span className="text-xs text-slate-500 font-normal">vs</span>
                <span className="text-slate-300">{matchInfo.teamAway.code}</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">{matchInfo.toss}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1 sm:gap-1.5 justify-end">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {liveScore.runs}/{liveScore.wickets}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                ({liveScore.overs} ov)
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] uppercase font-bold text-[#FF1744] tracking-wider mt-0.5">
              1st Innings • IND Batting
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
