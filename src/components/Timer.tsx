import { useEffect, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTimer, useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { formatSessionAdded } from '../lib/format'
import { getNearMissInfo } from '../lib/milestones'
import { getUserPreferences } from '../lib/db'
import { springs, transitions } from '../lib/motion'
import { ZenMessage } from './ZenMessage'
import { HemingwayTime } from './HemingwayTime'
import { InsightModal } from './InsightModal'
import { GooeyOrb } from './GooeyOrb'

type TransitionState = 'idle' | 'exhaling' | 'inhaling' | 'running' | 'merging' | 'settling'

export function Timer() {
  const {
    timerPhase,
    totalSeconds,
    lastSessionDuration,
    justReachedEnlightenment,
    lastSessionUuid,
    justAchievedMilestone,
    startTimer,
    stopTimer,
    acknowledgeEnlightenment,
    completeSession,
  } = useSessionStore()
  const {
    setView,
    triggerPostSessionFlow,
    pendingInsightSessionId,
    pendingInsightSessionDuration,
    pendingMilestone,
    showInsightModal,
    showInsightCaptureModal,
    hideInsightCaptureModal,
    clearPostSessionState,
  } = useNavigationStore()
  const { createInsightReminder } = useSessionStore()

  const { hideTimeDisplay } = useSettingsStore()
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()

  const { elapsed, isRunning } = useTimer()

  // Transition state for animation choreography
  const [transitionState, setTransitionState] = useState<TransitionState>('idle')

  // Track for merge animation
  const [sessionJustEnded, setSessionJustEnded] = useState(false)

  // Near-miss visibility (dopamine anticipation)
  const [nearMiss, setNearMiss] = useState<{
    hoursRemaining: number
    nextMilestone: number
  } | null>(null)

  // Load near-miss info when idle
  useEffect(() => {
    if (timerPhase === 'idle') {
      const loadNearMiss = async () => {
        const prefs = await getUserPreferences()
        const currentHours = totalSeconds / 3600
        const info = getNearMissInfo(currentHours, prefs?.practiceGoalHours)
        setNearMiss(info)
      }
      loadNearMiss()
    } else {
      setNearMiss(null)
    }
  }, [timerPhase, totalSeconds])

  // Hide time if setting is enabled
  const shouldHideTime = hideTimeDisplay

  // Keep screen awake during session
  useWakeLock(isRunning)

  // Handle tap on main area
  const handleTap = useCallback(() => {
    if (timerPhase === 'idle' && transitionState === 'idle') {
      haptic.medium() // Session start - noticeable feedback
      setTransitionState('exhaling')

      // After exhale animation (800ms) + pause (200ms), then inhale
      setTimeout(() => {
        setTransitionState('inhaling')
        startTimer() // Skip preparing phase, start directly

        setTimeout(() => {
          setTransitionState('running')
        }, 600) // inhale duration - slower, more deliberate
      }, 1000) // exhale (800ms) + pause (200ms)
    } else if (timerPhase === 'running') {
      haptic.success() // Session complete - celebratory pattern
      audio.complete() // Audio chime (respects setting internally)
      setSessionJustEnded(true)
      stopTimer()
    }
    // Don't handle tap during 'complete' - let it transition to Journey
  }, [timerPhase, transitionState, startTimer, stopTimer, haptic, audio])

  // After session complete, navigate to Journey tab for calm offboarding
  useEffect(() => {
    if (timerPhase === 'complete' && lastSessionUuid && lastSessionDuration) {
      // Build milestone message if one was just achieved
      let milestoneMessage: string | undefined
      if (justAchievedMilestone) {
        if ('type' in justAchievedMilestone) {
          milestoneMessage = justAchievedMilestone.label
        } else {
          milestoneMessage = `You just reached ${justAchievedMilestone.hours} hours`
        }
      }

      // Brief moment to register completion, then navigate
      const timer = setTimeout(() => {
        triggerPostSessionFlow(lastSessionUuid, lastSessionDuration, milestoneMessage)
        completeSession()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [
    timerPhase,
    lastSessionUuid,
    lastSessionDuration,
    justAchievedMilestone,
    triggerPostSessionFlow,
    completeSession,
  ])

  // Handle merge animation after session ends
  // Total ~2.2 seconds to sync with chime and feel contemplative
  useEffect(() => {
    if (timerPhase === 'complete' && sessionJustEnded && lastSessionDuration) {
      setTransitionState('merging')

      // After merge animation (session rises and dissolves)
      setTimeout(() => {
        setTransitionState('settling')
        setSessionJustEnded(false)

        // After settle (cumulative breathes once), return to idle
        setTimeout(() => {
          setTransitionState('idle')
        }, 800) // settle duration - slow, restful
      }, 1400) // merge duration - unhurried ascent
    }
  }, [timerPhase, sessionJustEnded, lastSessionDuration])

  // Swipe handlers - horizontal navigation between tabs
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (timerPhase === 'idle') {
        setView('journey')
      }
    },
  })

  // Handle enlightenment acknowledgment
  const handleEnlightenmentComplete = useCallback(() => {
    acknowledgeEnlightenment()
  }, [acknowledgeEnlightenment])

  // Show insight modal after merge animation settles
  useEffect(() => {
    if (transitionState === 'idle' && pendingInsightSessionId && !showInsightModal) {
      const timer = setTimeout(() => {
        showInsightCaptureModal()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [transitionState, pendingInsightSessionId, showInsightModal, showInsightCaptureModal])

  // Handlers for insight modal actions
  const handleInsightComplete = useCallback(() => {
    hideInsightCaptureModal()
    clearPostSessionState()
  }, [hideInsightCaptureModal, clearPostSessionState])

  const handleInsightSkip = useCallback(() => {
    hideInsightCaptureModal()
    clearPostSessionState()
  }, [hideInsightCaptureModal, clearPostSessionState])

  const handleInsightRemindLater = useCallback(() => {
    if (pendingInsightSessionId) {
      createInsightReminder(pendingInsightSessionId)
    }
    hideInsightCaptureModal()
    clearPostSessionState()
  }, [
    pendingInsightSessionId,
    createInsightReminder,
    hideInsightCaptureModal,
    clearPostSessionState,
  ])

  // Unified display state - what to show based on transitionState
  const currentDisplay = useMemo(() => {
    switch (transitionState) {
      case 'idle':
      case 'settling':
        return { seconds: totalSeconds, mode: 'cumulative' as const }
      case 'exhaling':
        return { seconds: totalSeconds, mode: 'cumulative' as const }
      case 'inhaling':
        return { seconds: 0, mode: 'active' as const }
      case 'running':
        return { seconds: elapsed, mode: 'active' as const }
      case 'merging':
        // During merge, we show session time (will animate to cumulative)
        return { seconds: lastSessionDuration || 0, mode: 'active' as const }
      default:
        return { seconds: totalSeconds, mode: 'cumulative' as const }
    }
  }, [transitionState, totalSeconds, elapsed, lastSessionDuration])

  // Animation variants for different transition states
  const getAnimationProps = (state: TransitionState) => {
    switch (state) {
      case 'exhaling':
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: 0.95, opacity: 0 },
          transition: { duration: 0.8 },
        }
      case 'inhaling':
        return {
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.6 },
        }
      case 'running':
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: 1, opacity: 1 },
          transition: springs.quick,
        }
      case 'settling':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: springs.settle,
        }
      case 'idle':
      default:
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: 1, opacity: 1 },
          transition: springs.morph,
        }
    }
  }

  return (
    <>
      {/* Enlightenment reveal */}
      {timerPhase === 'enlightenment' && justReachedEnlightenment && (
        <ZenMessage isEnlightened={true} onComplete={handleEnlightenmentComplete} variant="after" />
      )}

      {/* Main timer screen - hidden during enlightenment reveal */}
      {!(timerPhase === 'enlightenment' && justReachedEnlightenment) && (
        <div
          className={`
          flex flex-col items-center justify-center h-full px-8 pb-[10vh]
          transition-colors duration-400 select-none
          ${isRunning ? 'bg-cream-dark' : 'bg-cream'}
        `}
          onClick={handleTap}
          {...swipeHandlers}
        >
          {/* Total hours display (idle/complete) or running timer */}
          <div className="flex flex-col items-center">
            {shouldHideTime ? (
              // Hide time mode - gooey orb with transition awareness
              <div className="flex flex-col items-center">
                <GooeyOrb transitionState={transitionState} />
                {transitionState === 'idle' && timerPhase === 'idle' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-indigo-deep/30 mt-6"
                  >
                    tap to begin
                  </motion.p>
                )}
              </div>
            ) : transitionState === 'merging' ? (
              // Merging: special case with session rising and cumulative appearing
              <div className="relative flex flex-col items-center">
                {/* Session time rising and dissolving */}
                <motion.div
                  initial={{ y: 0, scale: 1, opacity: 1 }}
                  animate={{ y: -30, scale: 0.6, opacity: 0 }}
                  transition={transitions.merge}
                  className="absolute"
                >
                  <HemingwayTime
                    seconds={lastSessionDuration || 0}
                    mode="active"
                    className="text-indigo-deep"
                    layoutGroup="session-merge"
                  />
                </motion.div>
                {/* Cumulative total appearing */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={transitions.cumulativeAppear}
                >
                  <HemingwayTime
                    seconds={totalSeconds}
                    mode="cumulative"
                    className="text-indigo-deep"
                    layoutGroup="cumulative-merge"
                  />
                </motion.div>
                {/* Session added indicator */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  className="text-sm text-indigo-deep/50 mt-2 text-center"
                >
                  {formatSessionAdded(lastSessionDuration || 0)}
                </motion.p>
              </div>
            ) : (
              // All other states: unified display with AnimatePresence
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${transitionState}-${currentDisplay.mode}`}
                  className="flex flex-col items-center"
                  {...getAnimationProps(transitionState)}
                >
                  <HemingwayTime
                    seconds={currentDisplay.seconds}
                    mode={currentDisplay.mode}
                    breathing={transitionState === 'idle' && timerPhase === 'idle'}
                    className="text-indigo-deep"
                  />

                  {/* Near-miss visibility - subtle anticipation trigger */}
                  {transitionState === 'idle' && timerPhase === 'idle' && nearMiss && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-indigo-deep/40 mt-2"
                    >
                      {nearMiss.hoursRemaining < 0.1
                        ? `Almost at ${nearMiss.nextMilestone}h`
                        : `${(nearMiss.hoursRemaining * 60).toFixed(0)} min to ${nearMiss.nextMilestone}h`}
                    </motion.p>
                  )}

                  {/* Settling indicator */}
                  {transitionState === 'settling' && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-indigo-deep/50 mt-2 text-center"
                    >
                      {formatSessionAdded(lastSessionDuration || 0)}
                    </motion.p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Running state hint */}
          {isRunning && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              className="absolute bottom-24 text-xs text-ink"
            >
              tap to end
            </motion.p>
          )}
        </div>
      )}

      {/* Insight capture modal - stays on timer tab */}
      {showInsightModal && pendingInsightSessionId && (
        <InsightModal
          sessionId={pendingInsightSessionId}
          sessionDuration={pendingInsightSessionDuration}
          milestoneMessage={pendingMilestone}
          onComplete={handleInsightComplete}
          onSkip={handleInsightSkip}
          onRemindLater={handleInsightRemindLater}
        />
      )}
    </>
  )
}
