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
        relative flex flex-col items-center justify-center h-full px-8 pb-[10vh]
        transition-colors duration-400 select-none
        bg-cream
      `}
      onClick={handleTap}
      {...swipeHandlers}
    >
      {/* Layer 1: Theater background - dims the whole room (extends to cover iOS safe areas) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ inset: '-100px', backgroundColor: 'var(--theater-center)' }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'pending' || phase === 'active' || phase === 'settling' ? 1 : 0,
        }}
        transition={{
          duration: phase === 'pending' ? 8 : 4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />

      {/* Layer 2: Radial spotlight vignette - sfumato (blur smudges all edges) */}
      <motion.div
        className="absolute pointer-events-none animate-spotlight-breathe"
        style={{
          inset: '-20%',
          filter: 'blur(40px)',
          background: `radial-gradient(
            ellipse 45% 35% at center 42%,
            transparent 0%,
            transparent 10%,
            color-mix(in oklab, var(--theater-edge) 5%, transparent) 20%,
            color-mix(in oklab, var(--theater-edge) 15%, transparent) 30%,
            color-mix(in oklab, var(--theater-edge) 30%, transparent) 42%,
            color-mix(in oklab, var(--theater-edge) 50%, transparent) 55%,
            color-mix(in oklab, var(--theater-edge) 70%, transparent) 70%,
            color-mix(in oklab, var(--theater-edge) 88%, transparent) 85%,
            var(--theater-edge) 100%
          )`,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'pending' || phase === 'active' || phase === 'settling' ? 1 : 0,
        }}
        transition={{
          duration: phase === 'pending' ? 8 : 4,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* Layer 3: Center glow - luminous spot behind timer */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: '-10%',
          filter: 'blur(60px)',
          background: `radial-gradient(
            ellipse 25% 20% at center 43%,
            var(--theater-glow) 0%,
            transparent 100%
          )`,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'pending' || phase === 'active' || phase === 'settling' ? 1 : 0,
        }}
        transition={{
          duration: phase === 'pending' ? 8 : 4,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* Timer Display - z-10 to stay above theater layers */}
      <div className="relative z-10">
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
      </div>

      {/* Contextual hints - fade in/out matching seconds animation pattern */}
      <AnimatePresence mode="wait">
        {phase === 'resting' && (
          <motion.p
            key="resting-hint"
            className="absolute bottom-[38vh] z-10 text-sm tracking-wide text-indigo-deep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            tap to meditate
          </motion.p>
        )}
        {phase === 'pending' && (
          <motion.p
            key="pending-hint"
            className="absolute bottom-[38vh] z-10 text-sm tracking-wide text-indigo-deep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            beginning meditation...
          </motion.p>
        )}
        {phase === 'active' && (
          <motion.p
            key="active-hint"
            className="absolute bottom-[38vh] z-10 text-sm tracking-wide text-indigo-deep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            tap to end meditation
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
