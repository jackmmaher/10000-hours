import { useEffect, useCallback, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useHourBankStore } from '../stores/useHourBankStore'
import { useTrialStore } from '../stores/useTrialStore'
import { formatHours } from '../lib/hourBank'
import { useBreathClock } from '../hooks/useBreathClock'
import { useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { useTodaysPlan } from '../hooks/useTodaysPlan'
import { UnifiedTime } from './UnifiedTime'
import { GooeyOrb } from './GooeyOrb'
import { Paywall } from './Paywall'
import { LowHoursWarning } from './LowHoursWarning'
import { DurationPicker } from './DurationPicker'
import { TrialCompleteModal } from './TrialCompleteModal'
import { LockCelebrationModal } from './LockCelebrationModal'
import { useMeditationLock } from '../hooks/useMeditationLock'
import { sendAccountabilityMessage } from '../lib/accountability'

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
    lastSourceTemplateId,
    justAchievedMilestone,
    justReachedEnlightenment,
    acknowledgeEnlightenment,
  } = useSessionStore()

  const { setView, triggerPostSessionFlow, setIsSettling } = useNavigationStore()
  const { hideTimeDisplay } = useSettingsStore()
  const { canMeditate, refreshBalance, isLowHours, isCriticallyLow, available } = useHourBankStore()
  const {
    isTrialActive,
    trialPhase,
    trialGoalSeconds,
    startTrial,
    setTrialPhase,
    completeTrial,
    cancelTrial,
  } = useTrialStore()
  const { plan: todaysPlan, goalSeconds, enforceGoal, markComplete } = useTodaysPlan()

  // Modal for trial completion
  const [showTrialComplete, setShowTrialComplete] = useState(false)

  // Meditation Lock integration
  const {
    lockState,
    settings: lockSettings,
    nextUnlockWindow,
    completeSession: completeLockSession,
  } = useMeditationLock()

  const [showLockCelebration, setShowLockCelebration] = useState(false)
  const [lockSessionResult, setLockSessionResult] = useState<{
    streakDays: number
    durationSeconds: number
    isFallback: boolean
  } | null>(null)

  // Modal states
  const [showPaywall, setShowPaywall] = useState(false)
  const [showLowHoursWarning, setShowLowHoursWarning] = useState(false)
  const [showDurationPicker, setShowDurationPicker] = useState(false)

  // ============================================
  // BREATH SYNCHRONIZATION
  // ============================================
  const { waitForPhase, getTimeUntilPhase } = useBreathClock()

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
  // Ref to prevent double-triggering auto-end
  const hasAutoEndedRef = useRef(false)

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
  // Trial mode: display from 0 (just sessionElapsed)
  const liveTotal = isTrialActive
    ? sessionElapsed
    : phase === 'active' || phase === 'settling'
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
  // iOS SAFE AREA THEATER MODE
  // ============================================
  // iOS paints <html> background into safe area regions at OS level.
  // Two-class system: theater-transitioning (controls timing), theater-mode (controls color)
  // This allows fast transitions for theme changes, slow transitions for theater enter/exit.
  useEffect(() => {
    const html = document.documentElement
    const isTheaterActive = phase === 'pending' || phase === 'active' || phase === 'settling'
    const wasTheaterActive = html.classList.contains('theater-mode')

    if (isTheaterActive && !wasTheaterActive) {
      // Entering theater mode - enable slow transition, then add color class
      html.classList.add('theater-transitioning')
      html.classList.add('theater-mode')

      // Remove transitioning class after animation completes (4s)
      const timeout = setTimeout(() => {
        html.classList.remove('theater-transitioning')
      }, 4000)

      return () => clearTimeout(timeout)
    } else if (!isTheaterActive && wasTheaterActive) {
      // Exiting theater mode - enable slow transition, then remove color class
      html.classList.add('theater-transitioning')
      html.classList.remove('theater-mode')

      // Remove transitioning class after animation completes (4s)
      const timeout = setTimeout(() => {
        html.classList.remove('theater-transitioning')
      }, 4000)

      return () => clearTimeout(timeout)
    }

    // Cleanup on unmount
    return () => {
      html.classList.remove('theater-mode')
      html.classList.remove('theater-transitioning')
    }
  }, [phase])

  // ============================================
  // START SESSION
  // ============================================
  // Core session start logic (separated to allow calling from warning modal)
  const startSession = useCallback(async () => {
    // Immediate haptic acknowledgment
    haptic.medium()

    // CRITICAL: Capture snapshot of totalSeconds BEFORE any async operations
    // This isolates the session from any edits to past sessions elsewhere in the app
    // Round down to nearest minute so seconds display always starts at :00
    // For trial mode, we start from 0 so snapshot is 0
    setSnapshotTotal(isTrialActive ? 0 : Math.floor(savedTotal / 60) * 60)

    // CRITICAL: Reset ALL session state IMMEDIATELY on tap
    // This ensures no stale values from previous sessions
    setSessionElapsed(0)
    setSessionStart(null)
    setSecondsOpacity(0)
    setPhase('pending')
    hasAutoEndedRef.current = false // Reset auto-end flag for new session

    // For trial mode, also set trial phase to pending
    if (isTrialActive) {
      setTrialPhase('pending')
    }

    // Wait for breath alignment (next inhale)
    await waitForPhase('inhale')

    // Capture start time and begin
    const startTime = performance.now()
    setSessionStart(startTime)
    setSecondsOpacity(1)
    setPhase('active')

    // For trial mode, set trial phase to active; otherwise persist to DB
    if (isTrialActive) {
      setTrialPhase('active')
    } else {
      startTimer() // Persist to DB for crash recovery
    }
  }, [haptic, waitForPhase, startTimer, savedTotal, isTrialActive, setTrialPhase])

  const handleStart = useCallback(async () => {
    if (phase !== 'resting') return

    // Trial mode: skip all checks, just start
    if (isTrialActive && trialPhase === 'pending') {
      // Trial was already set up by duration picker, now start
      await startSession()
      return
    }

    // Normal mode: check hours
    if (!canMeditate) {
      setShowPaywall(true)
      return
    }

    // Check if critically low (< 30 min) - show warning before proceeding
    if (isCriticallyLow) {
      setShowLowHoursWarning(true)
      return
    }

    await startSession()
  }, [phase, canMeditate, isCriticallyLow, startSession, isTrialActive, trialPhase])

  // ============================================
  // END SESSION
  // ============================================
  const handleEnd = useCallback(async () => {
    if (phase !== 'active') return

    // Calculate time until exhale for audio sync
    // This becomes the "holding phase" duration for the chime
    const timeUntilExhale = getTimeUntilPhase('exhale')

    // Immediate haptic + audio acknowledgment
    // Audio now adapts to breath alignment - holding phase until exhale, then crescendo + decay
    haptic.success()
    audio.complete(timeUntilExhale)
    setPhase('settling')

    // For trial mode, also set trial phase to settling
    if (isTrialActive) {
      setTrialPhase('settling')
    }

    // LOCK: Prevent navigation during settling window
    setIsSettling(true)

    // Wait for breath alignment (next exhale)
    await waitForPhase('exhale')

    // Hide seconds segment (fade out with exhale - 4 seconds)
    setSecondsOpacity(0)

    // Complete after fade finishes
    // Capture session duration before resetting state
    const finalDuration = sessionElapsed

    setTimeout(async () => {
      // Reset local state BEFORE store update to prevent race condition
      // (zustand update could trigger re-render with stale sessionElapsed)
      setPhase('resting')
      setSessionStart(null)
      setSessionElapsed(0)
      setSnapshotTotal(null) // Clear snapshot isolation

      if (isTrialActive) {
        // Trial mode: show completion modal, don't persist
        completeTrial()
        setShowTrialComplete(true)
      } else {
        // Normal mode: persist session to DB
        await stopTimer()
        await refreshBalance()

        // Check if this was a Focus Lock session
        // Focus Lock: triggers when the native lock is actively enforcing (iOS with Screen Time)
        if (lockState?.isLockActive && lockSettings) {
          // Determine if this is a fallback session (hard day mode)
          // Fallback = session shorter than required but at least minimum
          const requiredSeconds = (lockSettings.unlockDurationMinutes || 10) * 60
          const minimumSeconds = (lockSettings.minimumFallbackMinutes || 2) * 60
          const isFallback = finalDuration < requiredSeconds && finalDuration >= minimumSeconds

          const result = await completeLockSession(finalDuration, isFallback)
          const streakDays = result.streakDays ?? lockSettings.streakDays + 1

          // Store result for celebration modal
          setLockSessionResult({
            streakDays,
            durationSeconds: finalDuration,
            isFallback,
          })

          // Send accountability message if enabled
          if (
            lockSettings.accountabilityEnabled &&
            lockSettings.notifyOnCompletion &&
            lockSettings.accountabilityPhone
          ) {
            await sendAccountabilityMessage({
              type: 'completion',
              phone: lockSettings.accountabilityPhone,
              method: lockSettings.accountabilityMethod || 'sms',
              durationMinutes: Math.round(finalDuration / 60),
              userName: 'User', // Default name for accountability messages
            })
          }

          // Clear the session banner immediately
          await markComplete()

          // Delay celebration modal until "tap to meditate" has fully settled (4s fade in)
          // This syncs with the audio chime decay phase for a cohesive ceremony
          setTimeout(() => {
            setShowLockCelebration(true)
          }, 4500)
        }
      }

      setIsSettling(false) // UNLOCK: Allow navigation again
    }, 4000)
  }, [
    phase,
    haptic,
    audio,
    waitForPhase,
    getTimeUntilPhase,
    stopTimer,
    setIsSettling,
    refreshBalance,
    isTrialActive,
    setTrialPhase,
    completeTrial,
    sessionElapsed,
    lockState,
    lockSettings,
    completeLockSession,
    markComplete,
  ])

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
        triggerPostSessionFlow(
          lastSessionUuid,
          lastSessionDuration,
          milestoneMessage,
          lastSourceTemplateId || undefined
        )
        completeSession()
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [
    storeTimerPhase,
    lastSessionUuid,
    lastSessionDuration,
    lastSourceTemplateId,
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
  // GOAL ENFORCEMENT (AUTO-END)
  // ============================================
  // Handles both trial mode (trialGoalSeconds) and normal mode (enforceGoal + goalSeconds)
  useEffect(() => {
    if (phase !== 'active' || hasAutoEndedRef.current) return

    // Trial mode: auto-end at trial goal
    if (isTrialActive && trialGoalSeconds && sessionElapsed >= trialGoalSeconds) {
      hasAutoEndedRef.current = true
      handleEnd()
      return
    }

    // Normal mode: auto-end at enforced goal
    if (!isTrialActive && enforceGoal && goalSeconds && sessionElapsed >= goalSeconds) {
      hasAutoEndedRef.current = true
      handleEnd()
    }
  }, [phase, isTrialActive, trialGoalSeconds, enforceGoal, goalSeconds, sessionElapsed, handleEnd])

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
  // FREE TRIAL HANDLERS
  // ============================================
  const handleTryFree = useCallback(() => {
    setShowPaywall(false)
    setShowDurationPicker(true)
  }, [])

  const handleTrialDurationSelect = useCallback(
    (minutes: number) => {
      setShowDurationPicker(false)
      startTrial(minutes)
      // Trial will start when user taps (handleStart checks for trial pending state)
    },
    [startTrial]
  )

  const handleTrialCompleteClose = useCallback(() => {
    setShowTrialComplete(false)
    cancelTrial()
  }, [cancelTrial])

  // Auto-start trial session when user picks duration
  // This triggers the tap flow automatically
  useEffect(() => {
    if (isTrialActive && trialPhase === 'pending' && phase === 'resting') {
      // Start the trial session automatically
      startSession()
    }
  }, [isTrialActive, trialPhase, phase, startSession])

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
      {/* Layer 1: Theater background - dims the whole room (extends beyond viewport for iOS safe areas) */}
      <motion.div
        className="fixed pointer-events-none"
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
        className="fixed pointer-events-none animate-spotlight-breathe"
        style={{
          inset: '-50px',
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
        className="fixed pointer-events-none"
        style={{
          inset: '-50px',
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

      {/* Lock Session Banner - shows when there's an enforced goal session */}
      <AnimatePresence>
        {phase === 'resting' && todaysPlan && enforceGoal && (
          <motion.div
            key="lock-session-banner"
            className="absolute top-[18vh] z-10 text-center px-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'color-mix(in oklab, var(--accent) 15%, transparent)',
                border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--accent)' }}>
                {todaysPlan.title || `${todaysPlan.duration} min session`}
              </span>
              {todaysPlan.duration && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--on-accent)',
                  }}
                >
                  auto-stop
                </span>
              )}
            </div>
            {todaysPlan.notes && (
              <p className="text-xs mt-2 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                {todaysPlan.notes}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
            className="absolute bottom-[38vh] z-10 text-sm tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            {!canMeditate
              ? 'tap to add hours'
              : isLowHours && available > 0
                ? `${formatHours(available)} remaining · tap to meditate`
                : 'tap to meditate'}
          </motion.p>
        )}
        {phase === 'pending' && (
          <motion.p
            key="pending-hint"
            className="absolute bottom-[38vh] z-10 text-sm tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
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
            className="absolute bottom-[38vh] z-10 text-sm tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            tap to end meditation
          </motion.p>
        )}
      </AnimatePresence>

      {/* Paywall modal */}
      <Paywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onTryFree={handleTryFree}
      />

      {/* Duration picker for free trial */}
      <DurationPicker
        isOpen={showDurationPicker}
        mode="trial"
        onSelect={handleTrialDurationSelect}
        onClose={() => setShowDurationPicker(false)}
      />

      {/* Low hours warning modal */}
      <LowHoursWarning
        isOpen={showLowHoursWarning}
        onClose={() => setShowLowHoursWarning(false)}
        onContinue={() => {
          setShowLowHoursWarning(false)
          startSession()
        }}
        onTopUp={() => {
          setShowLowHoursWarning(false)
          setShowPaywall(true)
        }}
        availableHours={available}
      />

      {/* Trial complete modal */}
      <TrialCompleteModal
        isOpen={showTrialComplete}
        onClose={handleTrialCompleteClose}
        durationMinutes={trialGoalSeconds ? Math.round(trialGoalSeconds / 60) : undefined}
      />

      {/* Lock celebration modal */}
      <LockCelebrationModal
        isOpen={showLockCelebration}
        onClose={() => {
          setShowLockCelebration(false)
          setLockSessionResult(null)
        }}
        streakDays={lockSessionResult?.streakDays ?? lockSettings?.streakDays ?? 1}
        sessionDuration={lockSessionResult?.durationSeconds ?? 0}
        celebrationRitual={lockSettings?.celebrationRitual ?? null}
        nextUnlockWindow={nextUnlockWindow}
        isFallback={lockSessionResult?.isFallback ?? false}
      />
    </div>
  )
}
