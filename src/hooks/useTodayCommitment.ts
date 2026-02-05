/**
 * useTodayCommitment - Hook to get today's commitment requirements
 *
 * Returns whether Commitment Mode requires a session today,
 * including window timing and minimum duration.
 */

import { useState, useEffect, useCallback } from 'react'
import { getCommitmentSettings, getCommitmentDayLog } from '../lib/db/commitmentSettings'
import {
  isDayRequired,
  isWithinWindow,
  getStartOfDay,
  formatWindowForDisplay,
} from '../lib/commitment'

export interface TodayCommitmentState {
  /** Whether commitment mode is active */
  isActive: boolean
  /** Whether today is a required day */
  isRequired: boolean
  /** Whether today's session is already completed */
  isCompleted: boolean
  /** Whether current time is within the practice window */
  isWithinWindow: boolean
  /** Minimum session duration in minutes */
  minimumMinutes: number
  /** Human-readable window description */
  windowDescription: string
  /** Current day number (1-indexed) */
  currentDay: number
  /** Total commitment duration in days */
  totalDays: number
  /** Grace periods remaining */
  gracePeriodsRemaining: number
  /** Current streak days */
  streakDays: number
  /** Celebration ritual text */
  celebrationRitual: string | null
  /** Anchor routine text (habit stacking) */
  anchorRoutine: string | null
  /** Obstacles with coping responses */
  obstacles: Array<{ obstacle: string; copingResponse: string }>
  /** Minimum fallback session minutes ("hard day" minimum) */
  minimumFallbackMinutes: number
  /** Identity statement from setup */
  identityStatement: string | null
  /** Loading state */
  isLoading: boolean
  /** Refresh from database */
  refresh: () => Promise<void>
}

export function useTodayCommitment(): TodayCommitmentState {
  const [state, setState] = useState<Omit<TodayCommitmentState, 'refresh' | 'isLoading'>>({
    isActive: false,
    isRequired: false,
    isCompleted: false,
    isWithinWindow: true,
    minimumMinutes: 10,
    windowDescription: 'Anytime',
    currentDay: 1,
    totalDays: 30,
    gracePeriodsRemaining: 0,
    streakDays: 0,
    celebrationRitual: null,
    anchorRoutine: null,
    obstacles: [],
    minimumFallbackMinutes: 2,
    identityStatement: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadCommitment = useCallback(async () => {
    try {
      const settings = await getCommitmentSettings()

      if (!settings.isActive) {
        setState((prev) => ({ ...prev, isActive: false }))
        return
      }

      const now = Date.now()
      const today = getStartOfDay(now)

      // Check if today is required
      const required = isDayRequired(now, settings)

      // Check if within window
      const withinWindow = isWithinWindow(now, settings)

      // Check if already completed (or grace period used)
      const todayLog = await getCommitmentDayLog(today)
      const completed = todayLog?.outcome === 'completed' || todayLog?.outcome === 'grace'

      // Calculate current day number
      const startDay = getStartOfDay(settings.commitmentStartDate)
      const daysSinceStart = Math.floor((today - startDay) / (24 * 60 * 60 * 1000))
      const currentDay = Math.max(1, Math.min(daysSinceStart + 1, settings.commitmentDuration))

      // Grace periods remaining
      const graceRemaining = settings.gracePeriodCount - settings.gracePeriodUsed

      setState({
        isActive: true,
        isRequired: required,
        isCompleted: completed,
        isWithinWindow: withinWindow,
        minimumMinutes: settings.minimumSessionMinutes,
        windowDescription: formatWindowForDisplay(settings),
        currentDay,
        totalDays: settings.commitmentDuration,
        gracePeriodsRemaining: graceRemaining,
        streakDays: settings.currentStreakDays || 0,
        celebrationRitual: settings.celebrationRitual || null,
        anchorRoutine: settings.anchorRoutine || null,
        obstacles: settings.obstacles || [],
        minimumFallbackMinutes: settings.minimumFallbackMinutes || 2,
        identityStatement: settings.identityStatement || null,
      })
    } catch (error) {
      console.error('[useTodayCommitment] Failed to load:', error)
      setState((prev) => ({ ...prev, isActive: false }))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadCommitment()
  }, [loadCommitment])

  // Refresh periodically to update window status
  useEffect(() => {
    if (!state.isActive) return

    // Check every minute for window changes
    const interval = setInterval(loadCommitment, 60 * 1000)
    return () => clearInterval(interval)
  }, [state.isActive, loadCommitment])

  return {
    ...state,
    isLoading,
    refresh: loadCommitment,
  }
}
