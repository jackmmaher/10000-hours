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
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '../lib/notifications'

interface SettingsState {
  // State
  hideTimeDisplay: boolean
  themeMode: ThemeMode
  visualEffects: VisualEffects
  audioFeedbackEnabled: boolean
  notificationPreferences: NotificationPreferences
  manualSeason: SeasonOverride
  manualTime: TimeOverride
  isLoading: boolean

  // Actions
  hydrate: () => Promise<void>
  setHideTimeDisplay: (value: boolean) => Promise<void>
  setThemeMode: (value: ThemeMode) => Promise<void>
  setVisualEffects: (value: VisualEffects) => Promise<void>
  setAudioFeedbackEnabled: (value: boolean) => Promise<void>
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
  setManualTheme: (season: SeasonOverride, time: TimeOverride) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  hideTimeDisplay: false,
  themeMode: 'auto',
  visualEffects: 'calm',
  audioFeedbackEnabled: false,
  notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
  manualSeason: 'winter',
  manualTime: 'evening',
  isLoading: true,

  hydrate: async () => {
    const settings = await getSettings()
    set({
      hideTimeDisplay: settings.hideTimeDisplay,
      themeMode: settings.themeMode,
      visualEffects: settings.visualEffects,
      audioFeedbackEnabled: settings.audioFeedbackEnabled,
      notificationPreferences: settings.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
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

  setAudioFeedbackEnabled: async (value) => {
    await updateSettings({ audioFeedbackEnabled: value })
    set({ audioFeedbackEnabled: value })
  },

  setNotificationPreferences: async (prefs) => {
    const current = get().notificationPreferences
    const updated = { ...current, ...prefs }
    await updateSettings({ notificationPreferences: updated })
    set({ notificationPreferences: updated })
  },

  setManualTheme: async (season, time) => {
    await updateSettings({ manualSeason: season, manualTime: time, themeMode: 'manual' })
    set({ manualSeason: season, manualTime: time, themeMode: 'manual' })
  }
}))
