/**
 * BreathPacer - Visual breath pacing practice tool
 *
 * Phase orchestrator with inline session management.
 * Follows the same hour-bank + DB pattern as RacingMind/OmCoach.
 *
 * Phases: setup → practice → summary
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useHourBankStore } from '../../stores/useHourBankStore'
import { useSessionStore } from '../../stores/useSessionStore'
import { addSession } from '../../lib/db/sessions'
import { db } from '../../lib/db/schema'
import { BreathPacerSetup, type BreathDuration } from './BreathPacerSetup'
import { BreathPacerPractice } from './BreathPacerPractice'
import { BreathPacerSummary } from './BreathPacerSummary'
import { Paywall } from '../Paywall'
import { LowHoursWarning } from '../LowHoursWarning'
import {
  type BreathPattern,
  type BreathTheme,
  BREATH_PATTERNS,
  BREATH_THEMES,
} from '../../lib/breathPatterns'
import type { Session } from '../../lib/db/types'

type BreathPacerPhase = 'setup' | 'practice' | 'summary'

const APP_STATE_KEY = 'primary'

interface BreathPacerProps {
  onClose: () => void
}

export function BreathPacer({ onClose }: BreathPacerProps) {
  const setFullscreen = useNavigationStore((s) => s.setFullscreen)
  const setView = useNavigationStore((s) => s.setView)
  const { canMeditate, isCriticallyLow, available } = useHourBankStore()
  const consumeSessionHours = useHourBankStore((s) => s.consumeSessionHours)
  const hydrateSessions = useSessionStore((s) => s.hydrate)

  const [phase, setPhase] = useState<BreathPacerPhase>('setup')
  const [isStarting, setIsStarting] = useState(false)

  // Session config
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(BREATH_PATTERNS[0])
  const [selectedTheme, setSelectedTheme] = useState<BreathTheme>(BREATH_THEMES[0])

  // Session timing
  const [startTime, setStartTime] = useState(0) // performance.now()
  const wallClockStartRef = useRef(0)
  const sessionUuidRef = useRef('')
  const durationSecondsRef = useRef(0)

  // Summary data
  const [completedCycles, setCompletedCycles] = useState(0)
  const [actualDurationSeconds, setActualDurationSeconds] = useState(0)

  // Paywall
  const [showPaywall, setShowPaywall] = useState(false)
  const [showLowHoursWarning, setShowLowHoursWarning] = useState(false)
  const [pendingSession, setPendingSession] = useState<{
    pattern: BreathPattern
    duration: BreathDuration
    theme: BreathTheme
  } | null>(null)

  // Fullscreen during practice
  useEffect(() => {
    setFullscreen(phase === 'practice')
    return () => setFullscreen(false)
  }, [phase, setFullscreen])

  /**
   * Internal: start the session after hour bank checks pass
   */
  const startSessionInternal = useCallback(
    async (pattern: BreathPattern, duration: BreathDuration, theme: BreathTheme) => {
      setIsStarting(true)

      const uuid = uuidv4()
      const perfNow = performance.now()
      const wallClock = Date.now()
      const durationSec = duration * 60

      sessionUuidRef.current = uuid
      wallClockStartRef.current = wallClock
      durationSecondsRef.current = durationSec

      // Consume hours upfront
      try {
        await consumeSessionHours(durationSec)
      } catch (err) {
        console.error('[BreathPacer] Failed to consume hours:', err)
      }

      // Mark session in progress
      try {
        const appState = await db.appState.get(APP_STATE_KEY)
        if (appState) {
          await db.appState.update(APP_STATE_KEY, {
            sessionInProgress: true,
            sessionStartTime: wallClock,
          })
        }
      } catch (err) {
        console.error('[BreathPacer] Failed to mark session in progress:', err)
      }

      setSelectedPattern(pattern)
      setSelectedTheme(theme)
      setStartTime(perfNow)
      setPhase('practice')
      setIsStarting(false)
    },
    [consumeSessionHours]
  )

  /**
   * Handle begin from setup — check hour bank
   */
  const handleBegin = useCallback(
    (pattern: BreathPattern, duration: BreathDuration, theme: BreathTheme) => {
      if (!canMeditate) {
        setShowPaywall(true)
        return
      }
      if (isCriticallyLow) {
        setPendingSession({ pattern, duration, theme })
        setShowLowHoursWarning(true)
        return
      }
      startSessionInternal(pattern, duration, theme)
    },
    [canMeditate, isCriticallyLow, startSessionInternal]
  )

  /**
   * Handle practice completion — save session to DB
   */
  const handlePracticeComplete = useCallback(
    async (cycles: number) => {
      const wallClockEnd = Date.now()
      const elapsed = performance.now() - startTime
      const durationSec = Math.round(elapsed / 1000)

      setCompletedCycles(cycles)
      setActualDurationSeconds(durationSec)

      // Build session record
      const session: Omit<Session, 'id'> = {
        uuid: sessionUuidRef.current,
        startTime: wallClockStartRef.current,
        endTime: wallClockEnd,
        durationSeconds: durationSec,
        sessionType: 'practice',
        practiceToolId: 'breath-pacer',
        breathPacerMetrics: {
          completedCycles: cycles,
          patternId: selectedPattern.id,
          patternName: selectedPattern.name,
        },
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

        await hydrateSessions()
      } catch (err) {
        console.error('[BreathPacer] Failed to save session:', err)
      }

      setPhase('summary')
    },
    [startTime, selectedPattern, hydrateSessions]
  )

  /**
   * Cancel session — go back to setup without saving
   */
  const handleCancel = useCallback(() => {
    // Clear session-in-progress
    db.appState.get(APP_STATE_KEY).then((appState) => {
      if (appState) {
        db.appState.update(APP_STATE_KEY, {
          sessionInProgress: false,
          sessionStartTime: undefined,
        })
      }
    })
    setPhase('setup')
  }, [])

  /**
   * Navigate to Timer for meditation
   */
  const handleMeditateNow = useCallback(() => {
    setView('timer')
    onClose()
  }, [setView, onClose])

  /**
   * Practice again
   */
  const handlePracticeAgain = useCallback(() => {
    setCompletedCycles(0)
    setActualDurationSeconds(0)
    setPhase('setup')
  }, [])

  return (
    <div className={`flex flex-col h-full bg-base ${phase === 'setup' ? 'pb-20' : ''}`}>
      {/* Header — only in setup and summary */}
      {phase !== 'practice' && (
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <button onClick={onClose} className="text-sm text-ink/70 hover:text-ink">
            Close
          </button>
          <h2 className="text-sm font-medium text-ink">Breath Pacer</h2>
          <div className="w-12" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {phase === 'setup' && <BreathPacerSetup onBegin={handleBegin} isLoading={isStarting} />}

        {phase === 'practice' && (
          <BreathPacerPractice
            pattern={selectedPattern}
            theme={selectedTheme}
            durationSeconds={durationSecondsRef.current}
            startTime={startTime}
            onComplete={handlePracticeComplete}
            onCancel={handleCancel}
          />
        )}

        {phase === 'summary' && (
          <BreathPacerSummary
            pattern={selectedPattern}
            durationSeconds={actualDurationSeconds}
            completedCycles={completedCycles}
            onMeditateNow={handleMeditateNow}
            onPracticeAgain={handlePracticeAgain}
            onClose={onClose}
          />
        )}
      </div>

      {/* Paywall */}
      <Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Low hours warning */}
      <LowHoursWarning
        isOpen={showLowHoursWarning}
        onClose={() => setShowLowHoursWarning(false)}
        onContinue={() => {
          setShowLowHoursWarning(false)
          if (pendingSession) {
            startSessionInternal(
              pendingSession.pattern,
              pendingSession.duration,
              pendingSession.theme
            )
            setPendingSession(null)
          }
        }}
        onTopUp={() => {
          setShowLowHoursWarning(false)
          setPendingSession(null)
          setShowPaywall(true)
        }}
        availableHours={available}
      />
    </div>
  )
}
