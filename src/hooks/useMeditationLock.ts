/**
 * Hook for Meditation Lock functionality
 *
 * Provides React state management for the Screen Time API integration.
 * Wraps the native plugin calls with loading states and error handling.
 *
 * Phase 4 additions:
 * - Lock state management (isLockActive, streakDays, etc.)
 * - Session lifecycle (startSession, completeSession)
 * - Settings access for celebration modal
 * - Next unlock window calculation
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  requestAuthorization,
  getAuthorizationStatus,
  showAppPicker,
  blockApps,
  unblockApps,
  getBlockedApps,
  isNativePlatform,
  AuthorizationStatus,
  LockState,
  SessionCompletionResult,
  getLockState,
  sessionStarted,
  sessionCompleted,
} from '../lib/meditationLock'
import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
} from '../lib/db/meditationLockSettings'
import type { MeditationLockSettings } from '../lib/db/types'

interface UseMeditationLockReturn {
  // State
  isAvailable: boolean
  authorizationStatus: AuthorizationStatus
  blockedAppTokens: string[]
  isLoading: boolean
  error: string | null

  // Lock state (Phase 3/4)
  lockState: LockState | null
  settings: MeditationLockSettings | null
  nextUnlockWindow: Date | null

  // Actions
  requestAuth: () => Promise<AuthorizationStatus>
  refreshStatus: () => Promise<void>
  selectApps: () => Promise<string[]>
  block: (tokens: string[]) => Promise<boolean>
  unblock: () => Promise<boolean>
  disable: () => Promise<boolean>

  // Session actions (Phase 4)
  refreshLockState: () => Promise<void>
  startSession: () => Promise<boolean>
  completeSession: (
    durationSeconds: number,
    isFallback: boolean
  ) => Promise<SessionCompletionResult>
}

/**
 * Calculate the next unlock window based on schedule settings
 */
function calculateNextUnlockWindow(settings: MeditationLockSettings): Date | null {
  if (!settings.scheduleWindows.length || !settings.activeDays.length) {
    return null
  }

  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday

  // Look up to 7 days ahead
  for (let offset = 0; offset < 7; offset++) {
    const targetDay = (currentDay + offset) % 7
    const isActiveDay = settings.activeDays[targetDay]

    if (!isActiveDay) continue

    // Find the first schedule window for this day
    for (const window of settings.scheduleWindows) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + offset)
      targetDate.setHours(window.startHour, window.startMinute, 0, 0)

      // If it's today, check if the window is still in the future
      if (offset === 0 && targetDate <= now) {
        continue
      }

      return targetDate
    }
  }

  return null
}

export function useMeditationLock(): UseMeditationLockReturn {
  const [isAvailable] = useState(() => isNativePlatform())
  const [authorizationStatus, setAuthorizationStatus] =
    useState<AuthorizationStatus>('notDetermined')
  const [blockedAppTokens, setBlockedAppTokens] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Phase 4: Lock state and settings
  const [lockState, setLockState] = useState<LockState | null>(null)
  const [settings, setSettings] = useState<MeditationLockSettings | null>(null)

  // Calculate next unlock window when settings change
  const nextUnlockWindow = useMemo(() => {
    if (!settings) return null
    return calculateNextUnlockWindow(settings)
  }, [settings])

  const refreshStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const status = await getAuthorizationStatus()
      setAuthorizationStatus(status)

      if (status === 'authorized') {
        const tokens = await getBlockedApps()
        setBlockedAppTokens(tokens)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh lock state from native layer
  const refreshLockState = useCallback(async () => {
    try {
      const state = await getLockState()
      setLockState(state)
    } catch (err) {
      console.error('[useMeditationLock] Failed to refresh lock state:', err)
    }
  }, [])

  // Load settings from IndexedDB
  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await getMeditationLockSettings()
      setSettings(loadedSettings)
    } catch (err) {
      console.error('[useMeditationLock] Failed to load settings:', err)
    }
  }, [])

  // Refresh all state on mount
  useEffect(() => {
    if (isAvailable) {
      refreshStatus()
      refreshLockState()
    }
    loadSettings()
  }, [isAvailable, refreshStatus, refreshLockState, loadSettings])

  const requestAuth = useCallback(async (): Promise<AuthorizationStatus> => {
    setIsLoading(true)
    setError(null)
    try {
      const status = await requestAuthorization()
      setAuthorizationStatus(status)
      return status
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authorization failed'
      setError(errorMsg)
      return 'notDetermined'
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectApps = useCallback(async (): Promise<string[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const tokens = await showAppPicker()
      return tokens
    } catch (err) {
      setError(err instanceof Error ? err.message : 'App picker failed')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const block = useCallback(async (tokens: string[]): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const success = await blockApps(tokens)
      if (success) {
        setBlockedAppTokens(tokens)
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Block failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unblock = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const success = await unblockApps()
      if (success) {
        setBlockedAppTokens([])
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unblock failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Disable Focus Lock - turns off enforcement but keeps settings
  const disable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      // Unblock any currently blocked apps
      if (blockedAppTokens.length > 0) {
        await unblockApps()
        setBlockedAppTokens([])
      }

      // Set enabled to false in settings
      await updateMeditationLockSettings({ enabled: false })

      // Refresh settings to reflect the change
      await loadSettings()

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable Focus Lock')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [blockedAppTokens, loadSettings])

  // Phase 4: Session management

  const startSession = useCallback(async (): Promise<boolean> => {
    try {
      const success = await sessionStarted()
      if (success) {
        await refreshLockState()
      }
      return success
    } catch (err) {
      console.error('[useMeditationLock] Failed to start session:', err)
      return false
    }
  }, [refreshLockState])

  const completeSession = useCallback(
    async (durationSeconds: number, isFallback: boolean): Promise<SessionCompletionResult> => {
      try {
        const result = await sessionCompleted(durationSeconds, isFallback)

        if (result.success && settings) {
          // Update local stats
          const dayOfWeek = new Date().getDay()
          const newCompletions = [...settings.completionsByDayOfWeek]
          newCompletions[dayOfWeek] = (newCompletions[dayOfWeek] || 0) + 1

          await updateMeditationLockSettings({
            totalUnlocks: settings.totalUnlocks + 1,
            lastUnlockAt: Date.now(),
            streakDays: result.streakDays ?? settings.streakDays + 1,
            totalHardDayFallbacks: isFallback
              ? settings.totalHardDayFallbacks + 1
              : settings.totalHardDayFallbacks,
            completionsByDayOfWeek: newCompletions,
          })

          // Refresh settings to get updated values
          await loadSettings()
        }

        // Refresh lock state
        await refreshLockState()

        return result
      } catch (err) {
        console.error('[useMeditationLock] Failed to complete session:', err)
        return { success: false, unlocked: false }
      }
    },
    [settings, loadSettings, refreshLockState]
  )

  return {
    isAvailable,
    authorizationStatus,
    blockedAppTokens,
    isLoading,
    error,
    lockState,
    settings,
    nextUnlockWindow,
    requestAuth,
    refreshStatus,
    selectApps,
    block,
    unblock,
    disable,
    refreshLockState,
    startSession,
    completeSession,
  }
}
