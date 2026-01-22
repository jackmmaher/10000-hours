/**
 * useOmSession - Session management for Aum Coach practice
 *
 * Handles:
 * - Session timing (start/stop)
 * - Saving session to database with practice tool metadata
 * - Hour bank consumption (deducted at session START with selected duration)
 * - Actual time spent added to meditation total
 * - Session-in-progress recovery
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { addSession } from '../lib/db/sessions'
import { db } from '../lib/db/schema'
import { useHourBankStore } from '../stores/useHourBankStore'
import { useSessionStore } from '../stores/useSessionStore'
import type { Session, OmCoachMetrics } from '../lib/db/types'

export interface OmSessionState {
  isActive: boolean
  sessionUuid: string | null
  startTime: number | null // performance.now() for accurate timing
  wallClockStart: number | null // Date.now() for database storage
}

export interface OmSessionResult {
  uuid: string
  durationSeconds: number
  metrics: OmCoachMetrics
}

export interface UseOmSessionResult {
  // Session state
  state: OmSessionState
  // Start a new Aum Coach session (deducts selectedDurationSeconds from hour bank at START)
  startSession: (selectedDurationSeconds: number) => Promise<void>
  // End the session and save to database (saves ACTUAL time spent to meditation total)
  endSession: (
    metrics: Omit<OmCoachMetrics, 'vocalizationSeconds'> & { vocalizationRatio: number }
  ) => Promise<OmSessionResult | null>
  // Cancel without saving (NOTE: hours already deducted at start are not refunded)
  cancelSession: () => void
  // Get elapsed seconds
  getElapsedSeconds: () => number
}

const APP_STATE_KEY = 'primary'

export function useOmSession(): UseOmSessionResult {
  const [state, setState] = useState<OmSessionState>({
    isActive: false,
    sessionUuid: null,
    startTime: null,
    wallClockStart: null,
  })

  // Refs for timing accuracy
  const startTimeRef = useRef<number | null>(null)
  const wallClockStartRef = useRef<number | null>(null)
  const sessionUuidRef = useRef<string | null>(null)

  // Store access for hour consumption and session hydration
  const consumeSessionHours = useHourBankStore((s) => s.consumeSessionHours)
  const hydrateSessions = useSessionStore((s) => s.hydrate)

  /**
   * Check for and recover session-in-progress on mount
   */
  useEffect(() => {
    const checkRecovery = async () => {
      try {
        const appState = await db.appState.get(APP_STATE_KEY)
        if (appState?.sessionInProgress && appState.sessionStartTime) {
          // For Aum Coach, we don't auto-recover mid-session since
          // real-time audio is required. Just clear the flag.
          await db.appState.update(APP_STATE_KEY, {
            sessionInProgress: false,
            sessionStartTime: undefined,
          })
        }
      } catch (error) {
        console.error('[AumSession] Recovery check failed:', error)
      }
    }
    checkRecovery()
  }, [])

  /**
   * Start a new Aum Coach session
   * Deducts selectedDurationSeconds from hour bank at START
   */
  const startSession = useCallback(
    async (selectedDurationSeconds: number): Promise<void> => {
      const uuid = uuidv4()
      const now = performance.now()
      const wallClock = Date.now()

      // Store in refs for timing
      sessionUuidRef.current = uuid
      startTimeRef.current = now
      wallClockStartRef.current = wallClock

      // Deduct selected duration from hour bank at START
      // This ensures user "pays" for the session upfront
      try {
        await consumeSessionHours(selectedDurationSeconds)
      } catch (error) {
        console.error('[AumSession] Failed to consume hours at start:', error)
        // Continue anyway - don't block session start
      }

      // Mark session in progress for crash recovery
      try {
        const appState = await db.appState.get(APP_STATE_KEY)
        if (appState) {
          await db.appState.update(APP_STATE_KEY, {
            sessionInProgress: true,
            sessionStartTime: wallClock,
          })
        }
      } catch (error) {
        console.error('[AumSession] Failed to mark session in progress:', error)
      }

      setState({
        isActive: true,
        sessionUuid: uuid,
        startTime: now,
        wallClockStart: wallClock,
      })
    },
    [consumeSessionHours]
  )

  /**
   * End the session and save to database
   */
  const endSession = useCallback(
    async (
      metrics: Omit<OmCoachMetrics, 'vocalizationSeconds'> & { vocalizationRatio: number }
    ): Promise<OmSessionResult | null> => {
      const uuid = sessionUuidRef.current
      const startTime = startTimeRef.current
      const wallClockStart = wallClockStartRef.current

      if (!uuid || startTime === null || wallClockStart === null) {
        console.warn('[AumSession] Cannot end session: no active session')
        return null
      }

      const now = performance.now()
      const wallClockEnd = Date.now()
      const durationMs = now - startTime
      const durationSeconds = Math.round(durationMs / 1000)

      // Calculate vocalization time from ratio
      const vocalizationSeconds = Math.round(durationSeconds * metrics.vocalizationRatio)

      const omCoachMetrics: OmCoachMetrics = {
        completedCycles: metrics.completedCycles,
        averageAlignmentScore: metrics.averageAlignmentScore,
        vocalizationSeconds,
      }

      // Build session record
      const session: Omit<Session, 'id'> = {
        uuid,
        startTime: wallClockStart,
        endTime: wallClockEnd,
        durationSeconds,
        sessionType: 'practice',
        practiceToolId: 'om-coach',
        omCoachMetrics,
      }

      try {
        // Save to database (actual time spent goes to meditation total)
        await addSession(session)

        // NOTE: Hours were already deducted at session START with the selected duration
        // The actual time spent is saved to the session for meditation total tracking

        // Clear session-in-progress flag
        const appState = await db.appState.get(APP_STATE_KEY)
        if (appState) {
          await db.appState.update(APP_STATE_KEY, {
            sessionInProgress: false,
            sessionStartTime: undefined,
          })
        }

        // Refresh session store to include new session
        await hydrateSessions()

        // Clear local state
        sessionUuidRef.current = null
        startTimeRef.current = null
        wallClockStartRef.current = null

        setState({
          isActive: false,
          sessionUuid: null,
          startTime: null,
          wallClockStart: null,
        })

        return {
          uuid,
          durationSeconds,
          metrics: omCoachMetrics,
        }
      } catch (error) {
        console.error('[AumSession] Failed to save session:', error)
        return null
      }
    },
    [consumeSessionHours, hydrateSessions]
  )

  /**
   * Cancel session without saving
   */
  const cancelSession = useCallback((): void => {
    // Clear session-in-progress flag
    db.appState.get(APP_STATE_KEY).then((appState) => {
      if (appState) {
        db.appState.update(APP_STATE_KEY, {
          sessionInProgress: false,
          sessionStartTime: undefined,
        })
      }
    })

    sessionUuidRef.current = null
    startTimeRef.current = null
    wallClockStartRef.current = null

    setState({
      isActive: false,
      sessionUuid: null,
      startTime: null,
      wallClockStart: null,
    })
  }, [])

  /**
   * Get elapsed seconds (for UI display)
   */
  const getElapsedSeconds = useCallback((): number => {
    const startTime = startTimeRef.current
    if (startTime === null) return 0
    return Math.floor((performance.now() - startTime) / 1000)
  }, [])

  return {
    state,
    startSession,
    endSession,
    cancelSession,
    getElapsedSeconds,
  }
}
