/**
 * Settings Store - Manages user preferences
 *
 * Currently tracks:
 * - hideTimeDisplay: Premium feature to hide numbers during meditation
 * - themeMode: Simple light/dark/auto theme selection
 */

import { create } from 'zustand'
import { getSettings, updateSettings, ThemeMode } from '../lib/db'
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '../lib/notifications'

interface SettingsState {
  // State
  hideTimeDisplay: boolean
  themeMode: ThemeMode
  audioFeedbackEnabled: boolean
  notificationPreferences: NotificationPreferences
  isLoading: boolean

  // Actions
  hydrate: () => Promise<void>
  setHideTimeDisplay: (value: boolean) => Promise<void>
  setThemeMode: (value: ThemeMode) => Promise<void>
  setAudioFeedbackEnabled: (value: boolean) => Promise<void>
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  hideTimeDisplay: false,
  themeMode: 'auto',
  audioFeedbackEnabled: false,
  notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
  isLoading: true,

  hydrate: async () => {
    const settings = await getSettings()
    set({
      hideTimeDisplay: settings.hideTimeDisplay,
      themeMode: settings.themeMode as ThemeMode, // Cast handles legacy migration
      audioFeedbackEnabled: settings.audioFeedbackEnabled,
      notificationPreferences: settings.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
      isLoading: false,
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
}))
