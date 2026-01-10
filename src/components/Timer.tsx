import { useEffect, useCallback, useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTimer, useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { useBreathPacing } from '../hooks/useBreathPacing'
import { getBreathPattern } from '../lib/breathPacing'
import { formatTimer, formatTotalHours, formatSessionAdded } from '../lib/format'
import { ZenMessage } from './ZenMessage'
import { InsightCapture } from './InsightCapture'

export function Timer() {
  const {
    timerPhase,
    totalSeconds,
    lastSessionDuration,
    hasReachedEnlightenment,
    justReachedEnlightenment,
    lastSessionUuid,
    startPreparing,
    startTimer,
    stopTimer,
    acknowledgeEnlightenment,
    startInsightCapture,
    skipInsightCapture
  } = useSessionStore()
  const { setView } = useNavigationStore()

  const { hideTimeDisplay, skipInsightCapture: skipInsightSetting, breathPacingEnabled, breathPatternId } = useSettingsStore()
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()

  const { elapsed, isRunning } = useTimer()

  // Breath pacing (optional)
  const activePattern = useMemo(() => {
    if (breathPacingEnabled && breathPatternId) {
      return getBreathPattern(breathPatternId)
    }
    return null
  }, [breathPacingEnabled, breathPatternId])

  const breathState = useBreathPacing(activePattern, isRunning)

  // Calculate orb scale based on breath phase
  const getOrbScale = useCallback(() => {
    if (!breathState) return 1  // No pacing, default scale

    const { phase, progress } = breathState

    switch (phase) {
      case 'inhale':
        return 1 + (progress * 0.12)  // Scale from 1.0 to 1.12
      case 'exhale':
        return 1.12 - (progress * 0.12)  // Scale from 1.12 to 1.0
      case 'hold':
        return 1.12  // Hold at expanded
      case 'holdEmpty':
        return 1.0  // Hold at contracted
      default:
        return 1
    }
  }, [breathState])

  const orbScale = getOrbScale()

  // Hide time if setting is enabled
  const shouldHideTime = hideTimeDisplay

  // Keep screen awake during session
  useWakeLock(isRunning)

  // Handle tap on main area
  const handleTap = useCallback(() => {
    if (timerPhase === 'idle') {
      haptic.medium() // Session start - noticeable feedback
      startPreparing()
    } else if (timerPhase === 'running') {
      haptic.success() // Session complete - celebratory pattern
      audio.complete() // Audio chime (respects setting internally)
      stopTimer()
    }
    // Don't handle tap during 'complete' - let it transition to capture
  }, [timerPhase, startPreparing, stopTimer, haptic, audio])

  // After session complete, transition to insight capture (or skip if preference set)
  // Brief delay (800ms) for user to register completion, not a forced wait
  useEffect(() => {
    if (timerPhase === 'complete') {
      const handler = skipInsightSetting ? skipInsightCapture : startInsightCapture
      const timer = setTimeout(handler, 800)
      return () => clearTimeout(timer)
    }
  }, [timerPhase, startInsightCapture, skipInsightCapture, skipInsightSetting])

  // Swipe handlers - horizontal navigation between tabs
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (timerPhase === 'idle') {
        setView('journey')
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

      {/* Main timer screen - hidden during zen message phases */}
      {timerPhase !== 'preparing' && !(timerPhase === 'enlightenment' && justReachedEnlightenment) && (
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
                // Hide time mode - settling orb, gently releasing
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center" style={{ width: '160px', height: '160px' }}>
                    {/* Layer 1: Fading atmosphere */}
                    <div
                      className="absolute rounded-full animate-fade-out"
                      style={{
                        width: '140px',
                        height: '140px',
                        background: `radial-gradient(circle, var(--orb-atmosphere) 0%, transparent 60%)`,
                        animationDuration: '3s',
                        animationFillMode: 'forwards',
                      }}
                    />

                    {/* Layer 2: Settling core - gentle fade */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: `radial-gradient(circle at 35% 35%, var(--orb-core) 0%, var(--orb-mid) 40%, var(--orb-edge) 100%)`,
                        boxShadow: `
                          inset 0 0 25px rgba(255, 255, 255, 0.5),
                          0 0 50px var(--orb-glow),
                          0 6px 24px var(--shadow-color)
                        `,
                        animation: 'orbSettle 2s ease-out forwards',
                      }}
                    />

                    {/* Layer 3: Inner light - final glow */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: '35px',
                        height: '35px',
                        background: `radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)`,
                        animation: 'orbInnerGlow 4s ease-in-out infinite',
                      }}
                    />
                  </div>

                  <p className="font-serif text-lg text-indigo-deep/70 mt-2 animate-fade-in">
                    Complete
                  </p>
                </div>
              ) : (
                // Normal mode - show added time
                <>
                  <p className="font-serif text-display text-indigo-deep tabular-nums">
                    {formatTotalHours(totalSeconds)}
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
              // Hide time mode - luminous, living meditation orb (theme-aware)
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: '200px',
                  height: '200px',
                  transform: `scale(${orbScale})`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                {/* Layer 1: Ambient atmosphere - largest, most subtle */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '180px',
                    height: '180px',
                    background: `radial-gradient(circle, var(--orb-atmosphere) 0%, transparent 70%)`,
                    animation: 'atmosphereBreathe 6s ease-in-out infinite',
                  }}
                />

                {/* Layer 2: Soft outer glow */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '140px',
                    height: '140px',
                    background: `radial-gradient(circle, var(--orb-glow) 0%, transparent 60%)`,
                    filter: 'blur(16px)',
                    animation: 'glowPulse 4s ease-in-out infinite',
                  }}
                />

                {/* Layer 3: Secondary pulse ring - breathing halo */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '110px',
                    height: '110px',
                    background: `radial-gradient(circle, transparent 40%, var(--orb-glow) 70%, transparent 85%)`,
                    animation: 'orbPulseRing 4s ease-in-out infinite',
                  }}
                />

                {/* Layer 4: Core orb - the main sphere */}
                <div
                  className="absolute rounded-full animate-orb-breathe"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: `radial-gradient(circle at 35% 35%, var(--orb-core) 0%, var(--orb-mid) 40%, var(--orb-edge) 100%)`,
                    boxShadow: `
                      inset 0 0 30px rgba(255, 255, 255, 0.6),
                      inset 0 -8px 20px var(--orb-glow),
                      0 0 60px var(--orb-glow),
                      0 8px 32px var(--shadow-color)
                    `,
                  }}
                />

                {/* Layer 5: Inner light bloom - creates depth perception */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '50px',
                    height: '50px',
                    background: `radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 70%)`,
                    animation: 'orbInnerGlow 5s ease-in-out infinite',
                  }}
                />

                {/* Layer 6: Subtle shimmer - rotating ethereal shine */}
                <div
                  className="absolute rounded-full overflow-hidden"
                  style={{
                    width: '80px',
                    height: '80px',
                    animation: 'orbShimmer 20s linear infinite',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.15) 8deg, transparent 16deg, transparent 360deg)',
                    }}
                  />
                </div>

                {/* Breath phase indicator (when pacing enabled) */}
                {breathState && (
                  <p className="absolute -bottom-8 text-xs text-indigo-deep/40 text-center whitespace-nowrap">
                    {breathState.phase === 'inhale' && 'Breathe in...'}
                    {breathState.phase === 'exhale' && 'Breathe out...'}
                    {breathState.phase === 'hold' && 'Hold...'}
                    {breathState.phase === 'holdEmpty' && 'Empty...'}
                  </p>
                )}
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
              // Hide time mode - dormant orb waiting to be awakened
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center" style={{ width: '140px', height: '140px' }}>
                  {/* Layer 1: Soft ambient presence */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: '120px',
                      height: '120px',
                      background: `radial-gradient(circle, var(--orb-atmosphere) 0%, transparent 70%)`,
                      animation: 'atmosphereBreathe 8s ease-in-out infinite',
                    }}
                  />

                  {/* Layer 2: Dormant core - smaller, waiting */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: '50px',
                      height: '50px',
                      background: `radial-gradient(circle at 35% 35%, var(--orb-core) 0%, var(--orb-mid) 50%, var(--orb-edge) 100%)`,
                      boxShadow: `
                        inset 0 0 20px rgba(255, 255, 255, 0.4),
                        0 0 40px var(--orb-glow),
                        0 4px 20px var(--shadow-color)
                      `,
                      animation: 'orbBreathe 6s ease-in-out infinite',
                      opacity: 0.85,
                    }}
                  />

                  {/* Layer 3: Inner light - gentle pulse */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: '30px',
                      height: '30px',
                      background: `radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)`,
                      animation: 'orbInnerGlow 7s ease-in-out infinite',
                    }}
                  />
                </div>

                <p className="text-xs text-indigo-deep/30 mt-6">
                  tap to begin
                </p>
              </div>
            ) : (
              // Normal mode - show total or weekly hours based on tier
              <p className="font-serif text-display text-indigo-deep tabular-nums">
                {formatTotalHours(totalSeconds)}
              </p>
            )
          )}
        </div>


        {/* Running state hint */}
        {isRunning && (
          <p className="absolute bottom-24 text-xs text-ink/25">
            tap to end
          </p>
        )}
      </div>
      )}

      {/* Insight capture after session */}
      {timerPhase === 'capture' && (
        <InsightCapture
          sessionId={lastSessionUuid || undefined}
          onComplete={skipInsightCapture}
          onSkip={skipInsightCapture}
        />
      )}
    </>
  )
}
