import { useEffect, useCallback, useState } from 'react'
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

  const { setView, triggerPostSessionFlow } = useNavigationStore()
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

  // ============================================
  // HAPTICS & AUDIO
  // ============================================
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()

  // ============================================
  // DERIVED STATE
  // ============================================

  // Live total: saved + current session progress
  const liveTotal =
    phase === 'active' || phase === 'settling' ? savedTotal + sessionElapsed : savedTotal

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

    // Reset session state before entering pending
    setSessionStart(null)
    setPhase('pending')

    // Wait for breath alignment (next inhale)
    await waitForPhase('inhale')

    // CRITICAL: Reset elapsed to 0 RIGHT HERE, immediately before starting
    // This ensures seconds display starts at 0, not accumulated wait time
    setSessionElapsed(0)

    // Capture start time and begin ATOMICALLY
    const startTime = performance.now()
    setSessionStart(startTime)
    setSecondsOpacity(1)
    setPhase('active')
    startTimer() // Persist to DB for crash recovery
  }, [phase, haptic, waitForPhase, startTimer])

  // ============================================
  // END SESSION
  // ============================================
  const handleEnd = useCallback(async () => {
    if (phase !== 'active') return

    // Immediate haptic + audio acknowledgment
    haptic.success()
    audio.complete()
    setPhase('settling')

    // Wait for breath alignment (next exhale)
    await waitForPhase('exhale')

    // Hide seconds segment (fade out with exhale - 4 seconds)
    setSecondsOpacity(0)

    // Complete after fade finishes
    setTimeout(async () => {
      await stopTimer() // Persist session to DB
      setPhase('resting')
      setSessionStart(null)
      setSessionElapsed(0)
    }, 4000)
  }, [phase, haptic, audio, waitForPhase, stopTimer])

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
    if (phase !== 'active' || !sessionStart) return

    const tick = () => {
      const elapsed = Math.floor((performance.now() - sessionStart) / 1000)
      setSessionElapsed(elapsed)
    }

    tick() // Initial tick
    const interval = setInterval(tick, 100) // Update frequently for smooth display

    return () => clearInterval(interval)
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
          sessionSeconds={sessionElapsed}
          showSeconds={showSeconds}
          secondsOpacity={secondsOpacity}
          breathing={breathing}
          className="text-indigo-deep"
        />
      )}

      {/* Pending state feedback - syncing with breath */}
      <AnimatePresence>
        {phase === 'pending' && (
          <motion.p
            className="text-sm text-indigo-deep/70 mt-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            syncing with your breath...
          </motion.p>
        )}
      </AnimatePresence>

      {/* Contextual hints */}
      {phase === 'resting' && (
        <motion.p
          className="text-xs text-indigo-deep/30 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          tap to begin
        </motion.p>
      )}

      {phase === 'active' && (
        <motion.p
          className="absolute bottom-24 text-xs text-ink/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          tap to end
        </motion.p>
      )}
    </div>
  )
}
