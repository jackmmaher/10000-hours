import { useEffect, useCallback, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTimerOrchestration } from '../hooks/useTimerOrchestration'
import { useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { getNearMissInfo } from '../lib/milestones'
import { getUserPreferences } from '../lib/db'
import { stageVariants, getLayerOpacity, layerTransition } from '../lib/motion'
import { ZenMessage } from './ZenMessage'
import { HemingwayTime } from './HemingwayTime'
import { InsightModal } from './InsightModal'
import { GooeyOrb } from './GooeyOrb'

/**
 * Timer - The Persistent Stage
 *
 * One container. Two layers. Continuous motion.
 *
 * The container never unmounts. Both display layers (cumulative and active)
 * exist simultaneously. Visibility is controlled by opacity animation.
 * Phase transitions flow as a choreographed timeline, not state jumps.
 */
export function Timer() {
  const {
    timerPhase: storeTimerPhase,
    totalSeconds,
    lastSessionDuration,
    justReachedEnlightenment,
    lastSessionUuid,
    justAchievedMilestone,
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

  // The orchestration hook - central control for animation timeline
  const { phase, beginSession, endSession, activeDisplaySeconds } = useTimerOrchestration()

  // Near-miss visibility (dopamine anticipation)
  const [nearMiss, setNearMiss] = useState<{
    hoursRemaining: number
    nextMilestone: number
  } | null>(null)

  // Load near-miss info when resting
  useEffect(() => {
    if (phase === 'resting') {
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
  }, [phase, totalSeconds])

  // Derive running state for external systems
  const isRunning = phase === 'active'

  // Keep screen awake during session
  useWakeLock(isRunning)

  // Handle tap on main area
  const handleTap = useCallback(() => {
    if (phase === 'resting') {
      haptic.medium()
      beginSession()
    } else if (phase === 'active') {
      haptic.success()
      audio.complete()
      endSession()
    }
    // Ignore taps during transitions (departing, arriving, completing, resolving)
  }, [phase, beginSession, endSession, haptic, audio])

  // After session complete, navigate to Journey tab for calm offboarding
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
    triggerPostSessionFlow,
    completeSession,
  ])

  // Swipe handlers - horizontal navigation between tabs
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (phase === 'resting') {
        setView('journey')
      }
    },
  })

  // Handle enlightenment acknowledgment
  const handleEnlightenmentComplete = useCallback(() => {
    acknowledgeEnlightenment()
  }, [acknowledgeEnlightenment])

  // Show insight modal after animation settles
  useEffect(() => {
    if (phase === 'resting' && pendingInsightSessionId && !showInsightModal) {
      const timer = setTimeout(() => {
        showInsightCaptureModal()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [phase, pendingInsightSessionId, showInsightModal, showInsightCaptureModal])

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

  // Get layer opacity based on current phase
  const layerOpacity = useMemo(() => getLayerOpacity(phase), [phase])

  // Whether to show breathing animation (only when fully at rest)
  const showBreathing = phase === 'resting'

  // Hide time mode check
  const shouldHideTime = hideTimeDisplay

  return (
    <>
      {/* Enlightenment reveal */}
      {storeTimerPhase === 'enlightenment' && justReachedEnlightenment && (
        <ZenMessage isEnlightened={true} onComplete={handleEnlightenmentComplete} variant="after" />
      )}

      {/* Main timer screen - hidden during enlightenment reveal */}
      {!(storeTimerPhase === 'enlightenment' && justReachedEnlightenment) && (
        <div
          className={`
            flex flex-col items-center justify-center h-full px-8 pb-[10vh]
            transition-colors duration-400 select-none
            ${isRunning ? 'bg-cream-dark' : 'bg-cream'}
          `}
          onClick={handleTap}
          {...swipeHandlers}
        >
          {/* Timer Stage - THE PERSISTENT CONTAINER */}
          <motion.div
            className="relative flex flex-col items-center"
            variants={stageVariants}
            animate={phase}
            initial="resting"
          >
            {shouldHideTime ? (
              // Hide time mode - GooeyOrb with phase
              <div className="relative">
                <GooeyOrb phase={phase} />
                {/* Hint text for resting state */}
                {phase === 'resting' && (
                  <motion.p
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-indigo-deep/30 whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    tap to begin
                  </motion.p>
                )}
              </div>
            ) : (
              // Normal mode - dual layer display
              <div className="relative">
                {/* Cumulative Layer - always rendered, opacity controlled */}
                <motion.div
                  className="flex flex-col items-center"
                  animate={{ opacity: layerOpacity.cumulative }}
                  transition={layerTransition}
                  style={{
                    position:
                      layerOpacity.cumulative === 0 && layerOpacity.active === 1
                        ? 'absolute'
                        : 'relative',
                    pointerEvents: layerOpacity.cumulative > 0.5 ? 'auto' : 'none',
                  }}
                >
                  <HemingwayTime
                    seconds={totalSeconds}
                    mode="cumulative"
                    breathing={showBreathing}
                    className="text-indigo-deep"
                  />

                  {/* Near-miss visibility - subtle anticipation trigger */}
                  {phase === 'resting' && nearMiss && (
                    <motion.p
                      className="text-xs text-indigo-deep/40 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      {nearMiss.hoursRemaining < 0.1
                        ? `Almost at ${nearMiss.nextMilestone}h`
                        : `${(nearMiss.hoursRemaining * 60).toFixed(0)} min to ${nearMiss.nextMilestone}h`}
                    </motion.p>
                  )}
                </motion.div>

                {/* Active Layer - always rendered, opacity controlled */}
                <motion.div
                  className="flex flex-col items-center"
                  animate={{ opacity: layerOpacity.active }}
                  transition={layerTransition}
                  style={{
                    position:
                      layerOpacity.active === 0 && layerOpacity.cumulative === 1
                        ? 'absolute'
                        : 'relative',
                    top: 0,
                    left: 0,
                    right: 0,
                    pointerEvents: layerOpacity.active > 0.5 ? 'auto' : 'none',
                  }}
                >
                  <HemingwayTime
                    seconds={activeDisplaySeconds}
                    mode="active"
                    breathing={false}
                    className="text-indigo-deep"
                  />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Running state hint */}
          {isRunning && (
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
