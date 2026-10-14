import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppLanguage } from '@/types/api';
import { RootState } from '../index';

export interface SettingsState {
  language: AppLanguage;
  playbackSpeedMs: number;
}

const initialState: SettingsState = {
  language: 'en',
  playbackSpeedMs: 2500,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.language = action.payload;
    },
    toggleLanguage: (state) => {
      state.language = state.language === 'en' ? 'hinglish' : 'en';
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeedMs = action.payload;
    },
  },
});

export const { setLanguage, toggleLanguage, setPlaybackSpeed } = settingsSlice.actions;

export const selectLanguage = (state: RootState) => state.settings.language;
export const selectPlaybackSpeed = (state: RootState) => state.settings.playbackSpeedMs;

export default settingsSlice.reducer;
