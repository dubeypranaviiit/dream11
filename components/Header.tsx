'use client';

import { useAppSelector } from '@/store/hooks';
import { selectLiveMatchScore, selectMatchInfo } from '@/store/slices/matchSlice';
import { selectLanguage } from '@/store/slices/settingsSlice';
import LanguageToggle from './LanguageToggle';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenCatchUp: () => void;
}

export default function Header({ onOpenCatchUp }: HeaderProps) {
  const matchInfo = useAppSelector(selectMatchInfo);
  const liveScore = useAppSelector(selectLiveMatchScore);
  const language = useAppSelector(selectLanguage);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Simulated Demo Match
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">
              {matchInfo.tournament}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              type="button"
              onClick={onOpenCatchUp}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-semibold rounded-full shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
              aria-label="Catch me up with AI summary"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hinglish' ? 'Catch me up' : 'Catch me up'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              LIVE
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-white">
                <span>{matchInfo.teamHome.code}</span>
                <span className="text-xs text-slate-500 font-normal">vs</span>
                <span className="text-slate-300">{matchInfo.teamAway.code}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{matchInfo.toss}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {liveScore.runs}/{liveScore.wickets}
              </span>
              <span className="text-xs font-medium text-slate-400">
                ({liveScore.overs} ov)
              </span>
            </div>
            <p className="text-[10px] uppercase font-semibold text-rose-400 tracking-wider">
              1st Innings • IND Batting
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
