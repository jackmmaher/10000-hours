/**
 * Settings Store - Manages user preferences
 *
 * Currently tracks:
 * - hideTimeDisplay: Premium feature to hide numbers during meditation
 * - themeMode: Simple light/dark/auto theme selection
 */

import { create } from 'zustand'
import { getSettings, updateSettings } from '../lib/db'
import type { ThemeMode, ClockFace } from '../lib/db/types'
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '../lib/notifications'

interface SettingsState {
  // State
  hideTimeDisplay: boolean // Legacy: derived from clockFace for backward compat
  clockFace: ClockFace
  themeMode: ThemeMode
  audioFeedbackEnabled: boolean
  swissClockTickEnabled: boolean
  notificationPreferences: NotificationPreferences
  isLoading: boolean

  // Actions
  hydrate: () => Promise<void>
  setClockFace: (value: ClockFace) => Promise<void>
  setHideTimeDisplay: (value: boolean) => Promise<void>
  setThemeMode: (value: ThemeMode) => Promise<void>
  setAudioFeedbackEnabled: (value: boolean) => Promise<void>
  setSwissClockTickEnabled: (value: boolean) => Promise<void>
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  hideTimeDisplay: false,
  clockFace: 'numbers',
  themeMode: 'auto',
  audioFeedbackEnabled: false,
  swissClockTickEnabled: true,
  notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
  isLoading: true,

  hydrate: async () => {
    const settings = await getSettings()
    const clockFace = settings.clockFace || (settings.hideTimeDisplay ? 'orb' : 'numbers')
    set({
      hideTimeDisplay: clockFace === 'orb',
      clockFace,
      themeMode: settings.themeMode as ThemeMode,
      audioFeedbackEnabled: settings.audioFeedbackEnabled,
      swissClockTickEnabled: settings.swissClockTickEnabled ?? true,
      notificationPreferences: settings.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
      isLoading: false,
    })
  },

  setClockFace: async (value) => {
    const hideTimeDisplay = value === 'orb'
    await updateSettings({ clockFace: value, hideTimeDisplay })
    set({ clockFace: value, hideTimeDisplay })
  },

  setHideTimeDisplay: async (value) => {
    const clockFace = value ? 'orb' : 'numbers'
    await updateSettings({ hideTimeDisplay: value, clockFace })
    set({ hideTimeDisplay: value, clockFace })
  },

  setThemeMode: async (value) => {
    await updateSettings({ themeMode: value })
    set({ themeMode: value })
  },

  setAudioFeedbackEnabled: async (value) => {
    await updateSettings({ audioFeedbackEnabled: value })
    set({ audioFeedbackEnabled: value })
  },

  setSwissClockTickEnabled: async (value) => {
    await updateSettings({ swissClockTickEnabled: value })
    set({ swissClockTickEnabled: value })
  },

  setNotificationPreferences: async (prefs) => {
    const current = get().notificationPreferences
    const updated = { ...current, ...prefs }
    await updateSettings({ notificationPreferences: updated })
    set({ notificationPreferences: updated })
  },
}))
