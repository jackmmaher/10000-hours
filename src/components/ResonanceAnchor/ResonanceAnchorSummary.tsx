/**
 * ResonanceAnchorSummary - Post-session results screen
 *
 * Follows RacingMindSummary pattern:
 * 1. User rates calm level (MindStateSlider)
 * 2. Reward message animates in
 * 3. Metrics display
 * 4. Bridge CTA: "Begin Meditation"
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MindStateSlider } from '../RacingMind/MindStateSlider'
import type { ResonancePracticeMetrics } from './ResonanceAnchorPractice'

interface ResonanceAnchorSummaryProps {
  durationSeconds: number
  preSessionScore: number | null
  practiceMetrics: ResonancePracticeMetrics | null
  onClose: () => void
  onPracticeAgain: () => void
  onMeditateNow?: () => void
  onPostScoreUpdate?: (score: number) => void
}

/**
 * Format seconds as "Xm Ys"
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export function ResonanceAnchorSummary({
  durationSeconds,
  preSessionScore,
  practiceMetrics,
  onClose,
  onPracticeAgain,
  onMeditateNow,
  onPostScoreUpdate,
}: ResonanceAnchorSummaryProps) {
  const [postScore, setPostScore] = useState<number | null>(null)

  const handlePostScoreChange = useCallback(
    (score: number | null) => {
      setPostScore(score)
      if (score !== null && onPostScoreUpdate) {
        onPostScoreUpdate(score)
      }
    },
    [onPostScoreUpdate]
  )

  // Contextual label for calm score
  const getCalmLabel = useCallback(() => {
    if (postScore === null) return null
    if (postScore <= 3) return 'Beginning to settle'
    if (postScore <= 5) return 'Noticeably calmer'
    if (postScore <= 7) return 'Significantly settled'
    return 'Deep stillness achieved'
  }, [postScore])

  // Journey acknowledgment
  const getJourneyMessage = useCallback(() => {
    if (postScore === null) return null
    if (preSessionScore !== null && preSessionScore >= 7) {
      return 'You arrived with a racing mind. This is where you landed.'
    }
    return 'This is where you landed.'
  }, [postScore, preSessionScore])

  const calmLabel = getCalmLabel()
  const journeyMessage = getJourneyMessage()

  // Computed metric values
  const resonanceTimeSeconds = practiceMetrics
    ? Math.round(practiceMetrics.totalHummingMs / 1000)
    : 0
  const steadinessPercent = practiceMetrics ? Math.round(practiceMetrics.averageStability) : 0

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center px-6 py-6">
          {/* Header */}
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-serif text-2xl text-ink mb-6">Practice Complete</h1>

          {/* Post-session assessment */}
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
            <MindStateSlider value={postScore} onChange={handlePostScoreChange} scaleType="calm" />
          </div>

          {/* Calm celebration */}
          <AnimatePresence>
            {calmLabel && (
              <motion.div
                className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="text-center">
                  <p className="text-lg font-serif text-ink mb-1">{calmLabel}</p>
                  {journeyMessage && <p className="text-xs text-ink/50">{journeyMessage}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics — shown after post score */}
          <AnimatePresence>
            {postScore !== null && practiceMetrics && (
              <motion.div
                className="w-full max-w-sm space-y-3 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
              >
                {/* Resonance Time */}
                <div className="bg-elevated rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink">Resonance Time</span>
                    <span className="text-lg font-serif text-ink">
                      {formatTime(resonanceTimeSeconds)}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink/50 leading-snug">
                    Time you spent humming in sync with the orb. More resonance = deeper calm.
                  </p>
                </div>

                {/* Steadiness */}
                <div className="bg-elevated rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink">Steadiness</span>
                    <span className="text-lg font-serif text-ink">{steadinessPercent}%</span>
                  </div>
                  <p className="text-[11px] text-ink/50 leading-snug">
                    How steady your hum was. A calm, even tone deepens the parasympathetic response.
                  </p>
                </div>

                {/* Mental Noise */}
                {preSessionScore !== null && (
                  <div className="bg-elevated rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink">Mental Noise</span>
                      <span className="text-lg font-serif text-ink">
                        {preSessionScore} → {postScore}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink/50 leading-snug">
                      Your self-reported mind state before and after practice.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration stat — when no metrics available */}
          {!practiceMetrics && (
            <div className="w-full max-w-sm bg-elevated rounded-xl p-4 mb-4 shadow-sm">
              <div className="text-center">
                <p className="text-xs text-ink/50 mb-1">Duration</p>
                <p className="text-xl font-serif text-ink">{formatTime(durationSeconds)}</p>
              </div>
            </div>
          )}

          {/* Bridge CTA */}
          <AnimatePresence>
            {postScore !== null && onMeditateNow && (
              <motion.div
                className="w-full max-w-sm bg-accent/5 border border-accent/20 rounded-xl p-5 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }}
              >
                <h3 className="font-serif text-lg text-ink text-center mb-2">
                  The Stillness Is Yours
                </h3>
                <p className="text-sm text-ink/70 text-center leading-relaxed mb-4">
                  Your breath is already slow. Your mind is already quiet. Close your eyes and let
                  the silence continue.
                </p>
                <button
                  onClick={onMeditateNow}
                  className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors"
                >
                  Begin Meditation
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secondary actions */}
          <div className="w-full max-w-sm space-y-3 pb-24">
            <button
              onClick={onPracticeAgain}
              className="w-full h-12 bg-[var(--button-secondary-bg)] hover:bg-[var(--bg-deep)] text-[var(--button-secondary-text)] font-medium rounded-xl transition-colors border border-[var(--border)]"
            >
              Practice Again
            </button>
            <button
              onClick={onClose}
              className="w-full h-12 text-ink/70 hover:text-ink font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
