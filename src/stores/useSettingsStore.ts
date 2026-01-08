/**
 * Settings Store - Manages user preferences
 *
 * Currently tracks:
 * - hideTimeDisplay: Premium feature to hide numbers during meditation
 * - themeMode: Auto (syncs to real time) or Manual (user-selected)
 * - visualEffects: Calm (minimal) or Expressive (aurora, shooting stars, etc.)
 * - manualSeason/manualTime: User's chosen theme when in manual mode
 */

import { create } from 'zustand'
import { getSettings, updateSettings, ThemeMode, VisualEffects, SeasonOverride, TimeOverride } from '../lib/db'

interface SettingsState {
  // State
  hideTimeDisplay: boolean
  themeMode: ThemeMode
  visualEffects: VisualEffects
  manualSeason: SeasonOverride
  manualTime: TimeOverride
  isLoading: boolean

  // Actions
  hydrate: () => Promise<void>
  setHideTimeDisplay: (value: boolean) => Promise<void>
  setThemeMode: (value: ThemeMode) => Promise<void>
  setVisualEffects: (value: VisualEffects) => Promise<void>
  setManualTheme: (season: SeasonOverride, time: TimeOverride) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  hideTimeDisplay: false,
  themeMode: 'auto',
  visualEffects: 'calm',
  manualSeason: 'winter',
  manualTime: 'evening',
  isLoading: true,

  hydrate: async () => {
    const settings = await getSettings()
    set({
      hideTimeDisplay: settings.hideTimeDisplay,
      themeMode: settings.themeMode,
      visualEffects: settings.visualEffects,
      manualSeason: settings.manualSeason ?? 'winter',
      manualTime: settings.manualTime ?? 'evening',
      isLoading: false
    })
  },

  setHideTimeDisplay: async (value) => {
    await updateSettings({ hideTimeDisplay: value })
    set({ hideTimeDisplay: value })
  },

  setThemeMode: async (value) => {
    await updateSettings({ themeMode: value })
    set({ themeMode: value })
  },

  setVisualEffects: async (value) => {
    await updateSettings({ visualEffects: value })
    set({ visualEffects: value })
  },

  setManualTheme: async (season, time) => {
    await updateSettings({ manualSeason: season, manualTime: time, themeMode: 'manual' })
    set({ manualSeason: season, manualTime: time, themeMode: 'manual' })
  }
}))
