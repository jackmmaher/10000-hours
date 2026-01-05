import { useEffect, useCallback, useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTimer, useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { formatTimer, formatTotalHours, formatSessionAdded } from '../lib/format'
import { getWeeklyRollingSeconds } from '../lib/tierLogic'
import { ZenMessage } from './ZenMessage'

export function Timer() {
  const {
    timerPhase,
    totalSeconds,
    lastSessionDuration,
    hasReachedEnlightenment,
    justReachedEnlightenment,
    sessions,
    startPreparing,
    startTimer,
    stopTimer,
    clearLastSession,
    acknowledgeEnlightenment,
    setView
  } = useSessionStore()

  const { isPremiumOrTrial } = usePremiumStore()
  const { hideTimeDisplay } = useSettingsStore()

  const { elapsed, isRunning } = useTimer()

  // Calculate weekly rolling seconds for FREE tier display
  const weeklySeconds = useMemo(
    () => getWeeklyRollingSeconds(sessions),
    [sessions]
  )

  // Only hide time if setting is on AND user has premium access
  const shouldHideTime = hideTimeDisplay && isPremiumOrTrial

  // Keep screen awake during session
  useWakeLock(isRunning)

  // Handle tap on main area
  const handleTap = useCallback(() => {
    if (timerPhase === 'idle') {
      startPreparing()
    } else if (timerPhase === 'running') {
      stopTimer()
    } else if (timerPhase === 'complete') {
      clearLastSession()
    }
  }, [timerPhase, startPreparing, stopTimer, clearLastSession])

  // Auto-clear complete state after a delay
  useEffect(() => {
    if (timerPhase === 'complete') {
      const timer = setTimeout(clearLastSession, 3000)
      return () => clearTimeout(timer)
    }
  }, [timerPhase, clearLastSession])

  // Swipe handlers
  const swipeHandlers = useSwipe({
    onSwipeUp: () => {
      if (timerPhase === 'idle') {
        setView('stats')
      }
    }
  })

  // Handle zen message completion
  const handleZenComplete = useCallback(() => {
    startTimer()
  }, [startTimer])

  // Handle enlightenment acknowledgment
  const handleEnlightenmentComplete = useCallback(() => {
    acknowledgeEnlightenment()
  }, [acknowledgeEnlightenment])

  const isFirstSession = sessions.length === 0

  return (
    <>
      {/* Pre-session zen message */}
      {timerPhase === 'preparing' && (
        <ZenMessage
          isEnlightened={hasReachedEnlightenment}
          onComplete={handleZenComplete}
          variant="before"
        />
      )}

      {/* Enlightenment reveal */}
      {timerPhase === 'enlightenment' && justReachedEnlightenment && (
        <ZenMessage
          isEnlightened={true}
          onComplete={handleEnlightenmentComplete}
          variant="after"
        />
      )}

      {/* Main timer screen */}
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
                // Hide time mode - just show completion message
                <p className="font-serif text-2xl text-indigo-deep">
                  Meditation complete
                </p>
              ) : (
                // Normal mode - show added time
                <>
                  <p className="font-serif text-display text-indigo-deep tabular-nums">
                    {isPremiumOrTrial ? formatTotalHours(totalSeconds) : formatTotalHours(weeklySeconds)}
                  </p>
                  <p className="text-sm text-indigo-deep/50 mt-2 text-center">
                    {formatSessionAdded(lastSessionDuration)}
                  </p>
                </>
              )}
            </div>
          ) : isRunning ? (
            // Running
            shouldHideTime ? (
              // Hide time mode - show alive breathing orb with glow
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full bg-indigo-deep/15 animate-breathe-slow"
                  style={{
                    boxShadow: '0 0 40px rgba(45, 52, 54, 0.15), 0 0 80px rgba(45, 52, 54, 0.08)'
                  }}
                />
                <div
                  className="absolute inset-0 w-24 h-24 rounded-full bg-indigo-deep/5 animate-pulse-soft"
                />
              </div>
            ) : (
              // Normal mode - show elapsed timer with breathing animation
              <p className="font-serif text-display text-indigo-deep tabular-nums animate-breathe">
                {formatTimer(elapsed)}
              </p>
            )
          ) : (
            // Idle
            shouldHideTime ? (
              // Hide time mode - simple prompt with hint
              <div className="flex flex-col items-center">
                <p className="font-serif text-2xl text-indigo-deep">
                  Just start meditating
                </p>
                <p className="text-xs text-indigo-deep/30 mt-4">
                  tap to begin
                </p>
              </div>
            ) : (
              // Normal mode - show total or weekly hours based on tier
              <>
                <p className="font-serif text-display text-indigo-deep tabular-nums">
                  {isPremiumOrTrial ? formatTotalHours(totalSeconds) : formatTotalHours(weeklySeconds)}
                </p>
                <p className="text-sm text-indigo-deep/40 mt-2">
                  {isPremiumOrTrial ? 'toward 10,000 hours' : 'this week'}
                </p>
              </>
            )
          )}
        </div>

        {/* Minimal interaction hint */}
        {timerPhase === 'idle' && (
          <div className="absolute bottom-24 flex flex-col items-center">
            {/* Single dot - the Jobs button */}
            {isFirstSession && (
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-deep/30 mb-6" />
            )}

            {/* Stats hint - clickable on desktop, swipeable on mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setView('stats')
              }}
              className="flex flex-col items-center hover:text-indigo-deep/50 transition-colors"
            >
              <p className="text-xs text-indigo-deep/25 tracking-wide">
                stats
              </p>
              <svg
                className="w-4 h-4 text-indigo-deep/20 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Running state hint */}
        {isRunning && (
          <p className="absolute bottom-24 text-xs text-indigo-deep/30">
            tap to end
          </p>
        )}
      </div>
    </>
  )
}
