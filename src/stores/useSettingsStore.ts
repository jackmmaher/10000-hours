/**
 * Settings Store - Manages user preferences
 *
 * Currently tracks:
 * - hideTimeDisplay: Premium feature to hide numbers during meditation
 * - themeMode: Dynamic theming preference (auto/light/warm/dark)
 */

import { create } from 'zustand'
import { getSettings, updateSettings, ThemeMode } from '../lib/db'

interface SettingsState {
  // State
  hideTimeDisplay: boolean
  themeMode: ThemeMode
  isLoading: boolean

  // Actions
  hydrate: () => Promise<void>
  setHideTimeDisplay: (value: boolean) => Promise<void>
  setThemeMode: (value: ThemeMode) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  hideTimeDisplay: false,
  themeMode: 'auto',
  isLoading: true,

  hydrate: async () => {
    const settings = await getSettings()
    set({
      hideTimeDisplay: settings.hideTimeDisplay,
      themeMode: settings.themeMode,
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
  }
}))
