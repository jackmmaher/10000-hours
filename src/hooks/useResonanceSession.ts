/**
 * useResonanceSession - Session management for Resonance Anchor practice
 *
 * Handles:
 * - Session timing (start/stop)
 * - Saving session to database with practice tool metadata
 * - Hour bank consumption (deducted at session START with selected duration)
 * - Session-in-progress recovery
 *
 * Follows the same pattern as useRacingMindSession for consistency.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { addSession } from '../lib/db/sessions'
import { db } from '../lib/db/schema'
import { useHourBankStore } from '../stores/useHourBankStore'
import { useSessionStore } from '../stores/useSessionStore'
import type { Session, ResonanceAnchorMetrics } from '../lib/db/types'

export interface ResonanceSessionState {
  isActive: boolean
  sessionUuid: string | null
  startTime: number | null // performance.now() for accurate timing
  wallClockStart: number | null // Date.now() for database storage
  selectedDurationSeconds: number | null
}

export interface ResonanceSessionResult {
  uuid: string
  durationSeconds: number
}

export interface EndResonanceSessionParams {
  preSessionScore?: number
  totalHummingMs?: number
  averageStability?: number
  cyclesCompleted?: number
}

export interface UseResonanceSessionResult {
  state: ResonanceSessionState
  startSession: (selectedDurationSeconds: number) => Promise<void>
  endSession: (params?: EndResonanceSessionParams) => Promise<ResonanceSessionResult | null>
  updateSessionMetrics: (uuid: string, metrics: Partial<ResonanceAnchorMetrics>) => Promise<void>
  cancelSession: () => void
  getElapsedSeconds: () => number
  getProgress: () => number
}

const APP_STATE_KEY = 'primary'

export function useResonanceSession(): UseResonanceSessionResult {
  const [state, setState] = useState<ResonanceSessionState>({
    isActive: false,
    sessionUuid: null,
    startTime: null,
    wallClockStart: null,
    selectedDurationSeconds: null,
  })

  // Refs for timing accuracy
  const startTimeRef = useRef<number | null>(null)
  const wallClockStartRef = useRef<number | null>(null)
  const sessionUuidRef = useRef<string | null>(null)
  const selectedDurationRef = useRef<number | null>(null)

  // Store access
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
          // For Resonance Anchor, we don't auto-recover mid-session since
          // the audio/haptic experience can't be resumed. Just clear the flag.
          await db.appState.update(APP_STATE_KEY, {
            sessionInProgress: false,
            sessionStartTime: undefined,
          })
        }
      } catch (error) {
        console.error('[ResonanceSession] Recovery check failed:', error)
      }
    }
    checkRecovery()
  }, [])

  /**
   * Start a new Resonance Anchor session
   */
  const startSession = useCallback(
    async (selectedDurationSeconds: number): Promise<void> => {
      const uuid = uuidv4()
      const now = performance.now()
      const wallClock = Date.now()

      sessionUuidRef.current = uuid
      startTimeRef.current = now
      wallClockStartRef.current = wallClock
      selectedDurationRef.current = selectedDurationSeconds

      // Deduct selected duration from hour bank at START
      try {
        await consumeSessionHours(selectedDurationSeconds)
      } catch (error) {
        console.error('[ResonanceSession] Failed to consume hours at start:', error)
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
        console.error('[ResonanceSession] Failed to mark session in progress:', error)
      }

      setState({
        isActive: true,
        sessionUuid: uuid,
        startTime: now,
        wallClockStart: wallClock,
        selectedDurationSeconds,
      })
    },
    [consumeSessionHours]
  )

  /**
   * End the session and save to database
   */
  const endSession = useCallback(
    async (params?: EndResonanceSessionParams): Promise<ResonanceSessionResult | null> => {
      const uuid = sessionUuidRef.current
      const startTime = startTimeRef.current
      const wallClockStart = wallClockStartRef.current

      if (!uuid || startTime === null || wallClockStart === null) {
        console.warn('[ResonanceSession] Cannot end session: no active session')
        return null
      }

      const now = performance.now()
      const wallClockEnd = Date.now()
      const durationMs = now - startTime
      const durationSeconds = Math.round(durationMs / 1000)

      // Build resonance metrics
      const resonanceAnchorMetrics: ResonanceAnchorMetrics | undefined = params
        ? {
            preSessionScore: params.preSessionScore,
            totalHummingSeconds: params.totalHummingMs
              ? Math.round(params.totalHummingMs / 1000)
              : undefined,
            averageStability: params.averageStability
              ? Math.round(params.averageStability)
              : undefined,
            cyclesCompleted: params.cyclesCompleted,
          }
        : undefined

      // Build session record
      const session: Omit<Session, 'id'> = {
        uuid,
        startTime: wallClockStart,
        endTime: wallClockEnd,
        durationSeconds,
        sessionType: 'practice',
        practiceToolId: 'resonance-anchor',
        resonanceAnchorMetrics,
      }

      try {
        await addSession(session)

        // Clear session-in-progress flag
        const appState = await db.appState.get(APP_STATE_KEY)
        if (appState) {
          await db.appState.update(APP_STATE_KEY, {
            sessionInProgress: false,
            sessionStartTime: undefined,
          })
        }

        // Refresh session store
        await hydrateSessions()

        // Clear local state
        sessionUuidRef.current = null
        startTimeRef.current = null
        wallClockStartRef.current = null
        selectedDurationRef.current = null

        setState({
          isActive: false,
          sessionUuid: null,
          startTime: null,
          wallClockStart: null,
          selectedDurationSeconds: null,
        })

        return { uuid, durationSeconds }
      } catch (error) {
        console.error('[ResonanceSession] Failed to save session:', error)
        return null
      }
    },
    [hydrateSessions]
  )

  /**
   * Update session metrics after post-session assessment
   */
  const updateSessionMetrics = useCallback(
    async (uuid: string, metrics: Partial<ResonanceAnchorMetrics>): Promise<void> => {
      try {
        const session = await db.sessions.where('uuid').equals(uuid).first()
        if (session) {
          const existingMetrics = session.resonanceAnchorMetrics || {}
          await db.sessions
            .where('uuid')
            .equals(uuid)
            .modify({
              resonanceAnchorMetrics: { ...existingMetrics, ...metrics },
            })
          console.debug('[ResonanceSession] Updated metrics for session:', uuid, metrics)
        } else {
          console.warn('[ResonanceSession] Session not found for metrics update:', uuid)
        }
      } catch (error) {
        console.error('[ResonanceSession] Failed to update session metrics:', error)
      }
    },
    []
  )

  /**
   * Cancel session without saving
   */
  const cancelSession = useCallback((): void => {
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
    selectedDurationRef.current = null

    setState({
      isActive: false,
      sessionUuid: null,
      startTime: null,
      wallClockStart: null,
      selectedDurationSeconds: null,
    })
  }, [])

  /**
   * Get elapsed seconds
   */
  const getElapsedSeconds = useCallback((): number => {
    const startTime = startTimeRef.current
    if (startTime === null) return 0
    return Math.floor((performance.now() - startTime) / 1000)
  }, [])

  /**
   * Get progress (0-1) based on selected duration
   */
  const getProgress = useCallback((): number => {
    const startTime = startTimeRef.current
    const selectedDuration = selectedDurationRef.current
    if (startTime === null || selectedDuration === null) return 0
    const elapsed = (performance.now() - startTime) / 1000
    return Math.min(1, elapsed / selectedDuration)
  }, [])

  return {
    state,
    startSession,
    endSession,
    updateSessionMetrics,
    cancelSession,
    getElapsedSeconds,
    getProgress,
  }
}
