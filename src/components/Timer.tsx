import { useEffect, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTimer, useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { getNearMissInfo } from '../lib/milestones'
import { getUserPreferences } from '../lib/db'
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

      // After exhale animation, then inhale
      setTimeout(() => {
        setTransitionState('inhaling')
        startTimer()

        setTimeout(() => {
          setTransitionState('running')
        }, 400) // inhale duration
      }, 600) // exhale duration
    } else if (timerPhase === 'running') {
      haptic.success() // Session complete - celebratory pattern
      audio.complete() // Audio chime (respects setting internally)
      setSessionJustEnded(true)
      stopTimer()
    }
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
  // Simple: session fades out, cumulative fades in
  useEffect(() => {
    if (timerPhase === 'complete' && sessionJustEnded && lastSessionDuration) {
      setTransitionState('merging')

      // Session fades out, then cumulative appears
      setTimeout(() => {
        setTransitionState('settling')
        setSessionJustEnded(false)

        // Return to idle
        setTimeout(() => {
          setTransitionState('idle')
        }, 600)
      }, 800)
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
        // Show session time briefly before transitioning
        return { seconds: lastSessionDuration || 0, mode: 'active' as const }
      default:
        return { seconds: totalSeconds, mode: 'cumulative' as const }
    }
  }, [transitionState, totalSeconds, elapsed, lastSessionDuration])

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
          {/* Timer display */}
          <div className="flex flex-col items-center">
            {shouldHideTime ? (
              // Hide time mode - gooey orb
              <div className="flex flex-col items-center">
                <GooeyOrb transitionState={transitionState} />
                {transitionState === 'idle' && timerPhase === 'idle' && (
                  <p className="text-xs text-indigo-deep/30 mt-6 animate-fade-in">tap to begin</p>
                )}
              </div>
            ) : (
              // Normal mode - unified display with simple fades
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${transitionState}-${currentDisplay.mode}`}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <HemingwayTime
                    seconds={currentDisplay.seconds}
                    mode={currentDisplay.mode}
                    breathing={transitionState === 'idle' && timerPhase === 'idle'}
                    className="text-indigo-deep"
                  />

                  {/* Near-miss visibility - subtle anticipation trigger */}
                  {transitionState === 'idle' && timerPhase === 'idle' && nearMiss && (
                    <p className="text-xs text-indigo-deep/40 mt-2 animate-fade-in">
                      {nearMiss.hoursRemaining < 0.1
                        ? `Almost at ${nearMiss.nextMilestone}h`
                        : `${(nearMiss.hoursRemaining * 60).toFixed(0)} min to ${nearMiss.nextMilestone}h`}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Running state hint */}
          {isRunning && <p className="absolute bottom-24 text-xs text-ink/25">tap to end</p>}
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
