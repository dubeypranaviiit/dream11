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
      className="inline-flex items-center bg-slate-900 border border-slate-700/80 rounded-full p-0.5 text-xs font-semibold shadow-inner"
    >
      <button
        type="button"
        onClick={() => dispatch(setLanguage('en'))}
        className={`px-3 py-1 rounded-full transition-all duration-150 ${
          currentLanguage === 'en'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={currentLanguage === 'en'}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => dispatch(setLanguage('hinglish'))}
        className={`px-3 py-1 rounded-full transition-all duration-150 ${
          currentLanguage === 'hinglish'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={currentLanguage === 'hinglish'}
      >
        Hinglish
      </button>
    </div>
  );
}
