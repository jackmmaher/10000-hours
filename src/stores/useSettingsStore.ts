/**
 * Settings Store - Manages user preferences
 *
 * Currently tracks:
 * - hideTimeDisplay: Premium feature to hide numbers during meditation
 */

import { create } from 'zustand'
import { getSettings, updateSettings } from '../lib/db'

interface SettingsState {
  // State
  hideTimeDisplay: boolean
  isLoading: boolean

  // Actions
  hydrate: () => Promise<void>
  setHideTimeDisplay: (value: boolean) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  hideTimeDisplay: false,
  isLoading: true,

  hydrate: async () => {
    const settings = await getSettings()
    set({
      hideTimeDisplay: settings.hideTimeDisplay,
      isLoading: false
    })
  },

  setHideTimeDisplay: async (value) => {
    await updateSettings({ hideTimeDisplay: value })
    set({ hideTimeDisplay: value })
  }
}))
