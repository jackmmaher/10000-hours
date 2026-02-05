/**
 * ResonanceAnchor - Disguised breath training through resonance matching
 *
 * Main orchestrator component that coordinates:
 * - Setup phase (duration picker, pre-assessment)
 * - Practice phase (breath engine + voice detection + haptics)
 * - Summary phase (post-assessment, metrics)
 *
 * Scientific foundation:
 * - Exhale-dominant slow breathing activates parasympathetic response
 * - Vocalization provides articulatory suppression of racing thoughts
 * - Haptic feedback creates felt sense of synchronization
 *
 * Follows RacingMind orchestrator pattern.
 */

import { useState, useCallback, useEffect } from 'react'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useHourBankStore } from '../../stores/useHourBankStore'
import { useResonanceSession, type ResonanceSessionResult } from '../../hooks/useResonanceSession'
import { ResonanceAnchorSetup, type SessionDuration } from './ResonanceAnchorSetup'
import { ResonanceAnchorPractice, type ResonancePracticeMetrics } from './ResonanceAnchorPractice'
import { ResonanceAnchorSummary } from './ResonanceAnchorSummary'
import { Paywall } from '../Paywall'
import { LowHoursWarning } from '../LowHoursWarning'

type ResonancePhase = 'setup' | 'practice' | 'summary'

interface ResonanceAnchorProps {
  onClose: () => void
}

export function ResonanceAnchor({ onClose }: ResonanceAnchorProps) {
  const setFullscreen = useNavigationStore((s) => s.setFullscreen)
  const setView = useNavigationStore((s) => s.setView)
  const { canMeditate, isCriticallyLow, available } = useHourBankStore()

  const [phase, setPhase] = useState<ResonancePhase>('setup')
  const [isStarting, setIsStarting] = useState(false)
  const [sessionResult, setSessionResult] = useState<ResonanceSessionResult | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(10)

  // Pre-session assessment score
  const [preSessionScore, setPreSessionScore] = useState<number | null>(null)

  // Practice metrics
  const [practiceMetrics, setPracticeMetrics] = useState<ResonancePracticeMetrics | null>(null)

  // Paywall modal states
  const [showPaywall, setShowPaywall] = useState(false)
  const [showLowHoursWarning, setShowLowHoursWarning] = useState(false)
  const [pendingSession, setPendingSession] = useState<{ duration: SessionDuration } | null>(null)

  // Session hook
  const resonanceSession = useResonanceSession()

  // Store session UUID for post-score update
  const [sessionUuid, setSessionUuid] = useState<string | null>(null)

  /**
   * Internal function to start the session
   */
  const startSessionInternal = useCallback(
    async (duration: SessionDuration) => {
      setIsStarting(true)

      try {
        const durationSeconds = duration * 60
        await resonanceSession.startSession(durationSeconds)

        setSelectedDuration(duration)
        setPhase('practice')
      } catch (err) {
        console.error('[ResonanceAnchor] Failed to start session:', err)
      } finally {
        setIsStarting(false)
      }
    },
    [resonanceSession]
  )

  /**
   * Handle begin button — checks hour bank before starting
   */
  const handleBegin = useCallback(
    (duration: SessionDuration, preScore: number) => {
      setPreSessionScore(preScore)

      if (!canMeditate) {
        setShowPaywall(true)
        return
      }

      if (isCriticallyLow) {
        setPendingSession({ duration })
        setShowLowHoursWarning(true)
        return
      }

      startSessionInternal(duration)
    },
    [canMeditate, isCriticallyLow, startSessionInternal]
  )

  /**
   * End the session (called when practice complete overlay CTA is clicked)
   */
  const handleEndSession = useCallback(
    async (metrics: ResonancePracticeMetrics) => {
      setPracticeMetrics(metrics)

      const result = await resonanceSession.endSession({
        preSessionScore: preSessionScore ?? undefined,
        totalHummingMs: metrics.totalHummingMs,
        averageStability: metrics.averageStability,
        cyclesCompleted: metrics.cyclesCompleted,
      })

      if (result) {
        setSessionResult(result)
        setSessionUuid(result.uuid)
      } else {
        setSessionResult({
          uuid: '',
          durationSeconds: resonanceSession.getElapsedSeconds(),
        })
      }

      setPhase('summary')
    },
    [resonanceSession, preSessionScore]
  )

  /**
   * Cancel session without saving
   */
  const handleCancel = useCallback(() => {
    resonanceSession.cancelSession()
    setPhase('setup')
  }, [resonanceSession])

  /**
   * Handle post-session score update from summary
   */
  const handlePostScoreUpdate = useCallback(
    async (postScore: number) => {
      if (sessionUuid) {
        await resonanceSession.updateSessionMetrics(sessionUuid, {
          postSessionScore: postScore,
        })
      }
    },
    [sessionUuid, resonanceSession]
  )

  /**
   * Practice again from results
   */
  const handlePracticeAgain = useCallback(() => {
    setSessionResult(null)
    setSessionUuid(null)
    setPreSessionScore(null)
    setPracticeMetrics(null)
    setPhase('setup')
  }, [])

  /**
   * Navigate to Timer tab for silent meditation
   */
  const handleMeditateNow = useCallback(() => {
    setView('timer')
    onClose()
  }, [setView, onClose])

  // Fullscreen mode during practice
  useEffect(() => {
    setFullscreen(phase === 'practice')
    return () => setFullscreen(false)
  }, [phase, setFullscreen])

  return (
    <div className={`flex flex-col h-full bg-base ${phase === 'setup' ? 'pb-20' : ''}`}>
      {/* Header — hidden during practice (fullscreen) */}
      {phase !== 'practice' && (
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <button onClick={onClose} className="text-sm text-ink/70 hover:text-ink">
            Close
          </button>
          <h2 className="text-sm font-medium text-ink">Resonance Anchor</h2>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {phase === 'setup' && <ResonanceAnchorSetup onBegin={handleBegin} isLoading={isStarting} />}

        {phase === 'practice' && (
          <ResonanceAnchorPractice
            durationSeconds={selectedDuration * 60}
            getElapsedSeconds={resonanceSession.getElapsedSeconds}
            onEnd={handleEndSession}
            onCancel={handleCancel}
          />
        )}

        {phase === 'summary' && sessionResult && (
          <ResonanceAnchorSummary
            durationSeconds={sessionResult.durationSeconds}
            preSessionScore={preSessionScore}
            practiceMetrics={practiceMetrics}
            onClose={onClose}
            onPracticeAgain={handlePracticeAgain}
            onMeditateNow={handleMeditateNow}
            onPostScoreUpdate={handlePostScoreUpdate}
          />
        )}
      </div>

      {/* Paywall modal */}
      <Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Low hours warning modal */}
      <LowHoursWarning
        isOpen={showLowHoursWarning}
        onClose={() => setShowLowHoursWarning(false)}
        onContinue={() => {
          setShowLowHoursWarning(false)
          if (pendingSession) {
            startSessionInternal(pendingSession.duration)
            setPendingSession(null)
          }
        }}
        onTopUp={() => {
          setShowLowHoursWarning(false)
          setPendingSession(null)
          setShowPaywall(true)
        }}
        availableHours={available}
      />
    </div>
  )
}
