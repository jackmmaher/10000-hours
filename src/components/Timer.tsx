import { useEffect, useCallback, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useBreathClock } from '../hooks/useBreathClock'
import { useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { UnifiedTime } from './UnifiedTime'
import { GooeyOrb } from './GooeyOrb'

/**
 * Timer - The Unified Experience
 *
 * Single component with extending/contracting seconds segment.
 * Transitions synchronized to the app's breathing cycle.
 * Live accumulation eliminates end-of-session value jumps.
 *
 * Phases:
 * - resting: cumulative only, breathing animation
 * - pending: waiting for inhale to start
 * - active: counting, seconds visible
 * - settling: waiting for exhale, seconds fading
 */
export function Timer() {
  // ============================================
  // STORES
  // ============================================
  const {
    totalSeconds: savedTotal,
    timerPhase: storeTimerPhase,
    startTimer,
    stopTimer,
    completeSession,
    lastSessionUuid,
    lastSessionDuration,
    justAchievedMilestone,
    justReachedEnlightenment,
    acknowledgeEnlightenment,
  } = useSessionStore()

  const { setView, triggerPostSessionFlow, setIsSettling } = useNavigationStore()
  const { hideTimeDisplay } = useSettingsStore()

  // ============================================
  // BREATH SYNCHRONIZATION
  // ============================================
  const { waitForPhase } = useBreathClock()

  // ============================================
  // LOCAL STATE
  // ============================================
  type TimerPhase = 'resting' | 'pending' | 'active' | 'settling'
  const [phase, setPhase] = useState<TimerPhase>('resting')
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [secondsOpacity, setSecondsOpacity] = useState(0)

  // Snapshot isolation: capture totalSeconds at session start to prevent
  // mid-session contamination from edits to past sessions elsewhere in app
  const [snapshotTotal, setSnapshotTotal] = useState<number | null>(null)

  // Ref to prevent double-interval creation (React.StrictMode fix)
  const intervalRef = useRef<number | null>(null)

  // ============================================
  // HAPTICS & AUDIO
  // ============================================
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()

  // ============================================
  // DERIVED STATE
  // ============================================

  // Live total: use snapshot during active session to prevent mid-session contamination
  // If someone edits a past session elsewhere, our display stays stable
  const liveTotal =
    phase === 'active' || phase === 'settling'
      ? (snapshotTotal ?? savedTotal) + sessionElapsed
      : savedTotal

  // Display state
  const showSeconds = phase === 'active' || phase === 'settling'
  const breathing = phase === 'resting'
  const isRunning = phase === 'active'

  // ============================================
  // WAKE LOCK
  // ============================================
  useWakeLock(isRunning)

  // ============================================
  // START SESSION
  // ============================================
  const handleStart = useCallback(async () => {
    if (phase !== 'resting') return

    // Immediate haptic acknowledgment
    haptic.medium()

    // CRITICAL: Capture snapshot of totalSeconds BEFORE any async operations
    // This isolates the session from any edits to past sessions elsewhere in the app
    // Round down to nearest minute so seconds display always starts at :00
    setSnapshotTotal(Math.floor(savedTotal / 60) * 60)

    // CRITICAL: Reset ALL session state IMMEDIATELY on tap
    // This ensures no stale values from previous sessions
    setSessionElapsed(0)
    setSessionStart(null)
    setSecondsOpacity(0)
    setPhase('pending')

    // Wait for breath alignment (next inhale)
    await waitForPhase('inhale')

    // Capture start time and begin
    const startTime = performance.now()
    setSessionStart(startTime)
    setSecondsOpacity(1)
    setPhase('active')
    startTimer() // Persist to DB for crash recovery
  }, [phase, haptic, waitForPhase, startTimer, savedTotal])

  // ============================================
  // END SESSION
  // ============================================
  const handleEnd = useCallback(async () => {
    if (phase !== 'active') return

    // Immediate haptic + audio acknowledgment
    haptic.success()
    audio.complete()
    setPhase('settling')

    // LOCK: Prevent navigation during settling window
    setIsSettling(true)

    // Wait for breath alignment (next exhale)
    await waitForPhase('exhale')

    // Hide seconds segment (fade out with exhale - 4 seconds)
    setSecondsOpacity(0)

    // Complete after fade finishes
    setTimeout(async () => {
      // Reset local state BEFORE store update to prevent race condition
      // (zustand update could trigger re-render with stale sessionElapsed)
      setPhase('resting')
      setSessionStart(null)
      setSessionElapsed(0)
      setSnapshotTotal(null) // Clear snapshot isolation
      await stopTimer() // Persist session to DB
      setIsSettling(false) // UNLOCK: Allow navigation again
    }, 4000)
  }, [phase, haptic, audio, waitForPhase, stopTimer, setIsSettling])

  // ============================================
  // POST-SESSION FLOW
  // ============================================
  useEffect(() => {
    if (storeTimerPhase === 'complete' && lastSessionUuid && lastSessionDuration) {
      let milestoneMessage: string | undefined

      if (justAchievedMilestone) {
        if ('type' in justAchievedMilestone) {
          milestoneMessage = justAchievedMilestone.label
        } else {
          milestoneMessage = `You just reached ${justAchievedMilestone.hours} hours`
        }
      }

      const timer = setTimeout(() => {
        // Silently acknowledge enlightenment if goal was just reached
        if (justReachedEnlightenment) {
          acknowledgeEnlightenment()
        }
        triggerPostSessionFlow(lastSessionUuid, lastSessionDuration, milestoneMessage)
        completeSession()
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [
    storeTimerPhase,
    lastSessionUuid,
    lastSessionDuration,
    justAchievedMilestone,
    justReachedEnlightenment,
    acknowledgeEnlightenment,
    triggerPostSessionFlow,
    completeSession,
  ])

  // ============================================
  // ELAPSED TIME TICKER
  // ============================================
  useEffect(() => {
    // Clear interval when not active
    if (phase !== 'active' || !sessionStart) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Prevent double-creation during React.StrictMode
    if (intervalRef.current) clearInterval(intervalRef.current)

    const tick = () => {
      const elapsed = Math.floor((performance.now() - sessionStart) / 1000)
      setSessionElapsed(elapsed)
    }

    tick() // Initial tick
    intervalRef.current = window.setInterval(tick, 100) // Update frequently for smooth display

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [phase, sessionStart])

  // ============================================
  // TAP HANDLER
  // ============================================
  const handleTap = useCallback(() => {
    if (phase === 'resting') {
      handleStart()
    } else if (phase === 'active') {
      handleEnd()
    }
    // Ignore taps during 'pending' and 'settling'
  }, [phase, handleStart, handleEnd])

  // ============================================
  // SWIPE HANDLERS
  // ============================================
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (phase === 'resting') {
        setView('journey')
      }
    },
  })

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      className={`
        flex flex-col items-center justify-center h-full px-8 pb-[10vh]
        transition-colors duration-400 select-none
        ${isRunning ? 'bg-cream-dark' : 'bg-cream'}
      `}
      onClick={handleTap}
      {...swipeHandlers}
    >
      {/* Timer Display */}
      {hideTimeDisplay ? (
        <GooeyOrb phase={phase} />
      ) : (
        <UnifiedTime
          totalSeconds={liveTotal}
          showSeconds={showSeconds}
          secondsOpacity={secondsOpacity}
          breathing={breathing}
          className="text-indigo-deep"
        />
      )}

      {/* Contextual hints - unified position, style, and shimmer animation */}
      <AnimatePresence mode="wait">
        {phase === 'resting' && (
          <motion.p
            key="resting-hint"
            className="absolute bottom-[38vh] text-xs tracking-wide text-indigo-deep/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            tap to meditate
          </motion.p>
        )}
        {phase === 'pending' && (
          <motion.p
            key="pending-hint"
            className="absolute bottom-[38vh] text-xs tracking-wide text-indigo-deep/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            beginning meditation...
          </motion.p>
        )}
        {phase === 'active' && (
          <motion.p
            key="active-hint"
            className="absolute bottom-[38vh] text-xs tracking-wide text-indigo-deep/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.25, 0.4, 0.25] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            tap to end meditation
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
