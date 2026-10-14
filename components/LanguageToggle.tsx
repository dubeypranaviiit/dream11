'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLanguage, setLanguage } from '@/store/slices/settingsSlice';

export default function LanguageToggle() {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(selectLanguage);

  return (
    <div
      role="group"
      aria-label="Language selector"
      className="inline-flex items-center bg-[#101727] border border-[#243047] rounded-full p-0.5 text-xs font-bold shadow-inner"
    >
      <button
        type="button"
        onClick={() => dispatch(setLanguage('en'))}
        className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-150 cursor-pointer ${
          currentLanguage === 'en'
            ? 'bg-[#FF1744] text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={currentLanguage === 'en'}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => dispatch(setLanguage('hinglish'))}
        className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-150 cursor-pointer ${
          currentLanguage === 'hinglish'
            ? 'bg-[#FF1744] text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={currentLanguage === 'hinglish'}
      >
        Hinglish
      </button>
    </div>
  );
}
