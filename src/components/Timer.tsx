import { useEffect, useCallback, useState } from 'react'
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
import { ZenMessage } from './ZenMessage'
import { HemingwayTime } from './HemingwayTime'
import { InsightModal } from './InsightModal'
import { GooeyOrb } from './GooeyOrb'

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
  const [transitionState, setTransitionState] = useState<
    'idle' | 'exhaling' | 'inhaling' | 'running' | 'merging' | 'settling'
  >('idle')

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
          flex flex-col items-center justify-center h-full px-8
          transition-colors duration-400 select-none
          ${isRunning ? 'bg-cream-dark' : 'bg-cream'}
        `}
          onClick={handleTap}
          {...swipeHandlers}
        >
          {/* Total hours display (idle/complete) or running timer */}
          <div className="flex flex-col items-center">
            {timerPhase === 'complete' && lastSessionDuration ? (
              // Just completed
              <div className="animate-fade-in">
                {shouldHideTime ? (
                  // Hide time mode - settling gooey orb
                  <div className="flex flex-col items-center">
                    <GooeyOrb transitionState="settling" />
                    <p className="font-serif text-lg text-indigo-deep/70 mt-2 animate-fade-in">
                      Complete
                    </p>
                  </div>
                ) : (
                  // Normal mode - show added time
                  <>
                    <HemingwayTime
                      seconds={totalSeconds}
                      mode="cumulative"
                      className="text-indigo-deep"
                    />
                    <p className="text-sm text-indigo-deep/50 mt-2 text-center">
                      {formatSessionAdded(lastSessionDuration)}
                    </p>
                  </>
                )}
              </div>
            ) : isRunning ? (
              // Running
              shouldHideTime ? (
                // Hide time mode - gooey orb with transition awareness
                <GooeyOrb
                  transitionState={transitionState === 'inhaling' ? 'inhaling' : 'running'}
                />
              ) : (
                // Normal mode - show running timer with transition awareness
                <>
                  {/* Inhaling: first second appearing (timer just started) */}
                  {transitionState === 'inhaling' && (
                    <div className="animate-timer-inhale">
                      <HemingwayTime seconds={0} mode="active" className="text-indigo-deep" />
                    </div>
                  )}

                  {/* Running: normal active display */}
                  {transitionState === 'running' && (
                    <HemingwayTime seconds={elapsed} mode="active" className="text-indigo-deep" />
                  )}
                </>
              )
            ) : // Idle or transitioning
            shouldHideTime ? (
              // Hide time mode - gooey orb with transition awareness
              <div className="flex flex-col items-center">
                <GooeyOrb transitionState={transitionState} />
                {transitionState === 'idle' && (
                  <p className="text-xs text-indigo-deep/30 mt-6">tap to begin</p>
                )}
              </div>
            ) : (
              // Normal mode - handle idle and transition states (not running)
              <div className="flex flex-col items-center">
                {/* Exhaling: cumulative fading out */}
                {transitionState === 'exhaling' && (
                  <div className="animate-timer-exhale">
                    <HemingwayTime
                      seconds={totalSeconds}
                      mode="cumulative"
                      className="text-indigo-deep"
                    />
                  </div>
                )}

                {/* Merging: session rising, cumulative appearing */}
                {transitionState === 'merging' && (
                  <div className="relative">
                    <div className="animate-session-merge-rise absolute inset-0 flex items-center justify-center">
                      <HemingwayTime
                        seconds={lastSessionDuration || 0}
                        mode="active"
                        className="text-indigo-deep"
                      />
                    </div>
                    <div className="animate-cumulative-merge-in">
                      <HemingwayTime
                        seconds={totalSeconds}
                        mode="cumulative"
                        className="text-indigo-deep"
                      />
                    </div>
                  </div>
                )}

                {/* Settling: cumulative with breath pulse */}
                {transitionState === 'settling' && (
                  <div className="animate-pulse-soft">
                    <HemingwayTime
                      seconds={totalSeconds}
                      mode="cumulative"
                      className="text-indigo-deep"
                    />
                  </div>
                )}

                {/* Idle: cumulative breathing */}
                {transitionState === 'idle' && timerPhase === 'idle' && (
                  <>
                    <HemingwayTime
                      seconds={totalSeconds}
                      mode="cumulative"
                      breathing={true}
                      className="text-indigo-deep"
                    />
                    {/* Near-miss visibility - subtle anticipation trigger */}
                    {nearMiss && (
                      <p className="text-xs text-indigo-deep/40 mt-2 animate-fade-in">
                        {nearMiss.hoursRemaining < 0.1
                          ? `Almost at ${nearMiss.nextMilestone}h`
                          : `${(nearMiss.hoursRemaining * 60).toFixed(0)} min to ${nearMiss.nextMilestone}h`}
                      </p>
                    )}
                  </>
                )}
              </div>
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
