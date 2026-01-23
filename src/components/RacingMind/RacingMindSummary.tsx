/**
 * RacingMindSummary - Unified post-session summary card
 *
 * Combines the post-assessment (mind rating) and results into a single screen.
 * When the user rates their mind, the analysis reveals with animation.
 *
 * Flow:
 * 1. User sees "How is your mind now?" slider at top
 * 2. User selects a rating
 * 3. Analysis ("You went from 7 → 5") reveals with animation
 * 4. Eye tracking data and session stats visible
 * 5. CTAs at bottom: Meditate Now, Practice Again, Done
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MindStateSlider } from './MindStateSlider'
import { formatElapsedTime } from '../../lib/racingMindAnimation'
import type { TrackingMetrics } from './index'

interface RacingMindSummaryProps {
  durationSeconds: number
  preSessionScore: number | null
  trackingMetrics: TrackingMetrics | null
  onClose: () => void
  onPracticeAgain: () => void
  onMeditateNow?: () => void
}

export function RacingMindSummary({
  durationSeconds,
  preSessionScore,
  trackingMetrics,
  onClose,
  onPracticeAgain,
  onMeditateNow,
}: RacingMindSummaryProps) {
  const [postScore, setPostScore] = useState<number | null>(null)

  // Determine improvement message when post score is selected
  // NEW PARADIGM: preSessionScore = racing (1-10, higher = worse)
  //               postScore = calm (1-10, higher = better)
  const getImprovementMessage = useCallback(() => {
    if (preSessionScore === null || postScore === null) return null

    // We celebrate high calm scores - the post score directly indicates benefit
    if (postScore >= 7) {
      return {
        title: `Racing mind of ${preSessionScore} → Calm of ${postScore}`,
        subtitle: 'Significant mental shift achieved',
        isPositive: true,
      }
    } else if (postScore >= 4) {
      return {
        title: `Racing mind of ${preSessionScore} → Calm of ${postScore}`,
        subtitle: 'Your mind is settling',
        isPositive: true,
      }
    } else {
      return {
        title: `Racing mind of ${preSessionScore} → Calm of ${postScore}`,
        subtitle: 'Some sessions plant seeds for later',
        isPositive: null,
      }
    }
  }, [preSessionScore, postScore])

  // Get validation message based on subjective + objective data
  // NEW PARADIGM: postScore is on calm scale (higher = better)
  const getValidationMessage = useCallback(() => {
    if (postScore === null || preSessionScore === null) return null

    // User reports feeling calmer if postScore (calm) is 5+
    const feltCalmer = postScore >= 5
    const trackingImproved = trackingMetrics && trackingMetrics.improvementPercent > 10

    if (feltCalmer && trackingImproved) {
      return {
        title: 'Your Eyes Confirm It',
        message: `Eye tracking showed your focus smoothed by ${Math.round(trackingMetrics!.improvementPercent)}% over the session`,
        icon: 'check',
      }
    }
    if (feltCalmer && !trackingImproved && trackingMetrics) {
      return {
        title: 'Trust What You Feel',
        message: 'Your mind knows when it has settled, even when the data is subtle',
        icon: 'heart',
      }
    }
    if (!feltCalmer && trackingImproved) {
      return {
        title: 'More Happened Than You Realize',
        message: `Your focus smoothed by ${Math.round(trackingMetrics!.improvementPercent)}% - the benefits are building`,
        icon: 'sparkle',
      }
    }
    if (!feltCalmer && !trackingImproved && trackingMetrics) {
      return {
        title: 'Some Sessions Plant Seeds',
        message: 'Not every session feels transformative. The practice itself matters.',
        icon: 'seed',
      }
    }
    // No tracking data available
    if (feltCalmer) {
      return {
        title: 'Your Mind Settled',
        message: 'You felt the shift. That awareness itself is valuable.',
        icon: 'check',
      }
    }
    return {
      title: 'Practice Continues',
      message: 'Some sessions are about showing up. That counts.',
      icon: 'seed',
    }
  }, [preSessionScore, postScore, trackingMetrics])

  const improvementMessage = getImprovementMessage()
  const validationMessage = getValidationMessage()

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable content area */}
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

          <h1 className="font-serif text-2xl text-ink mb-2">Practice Complete</h1>
          <p className="text-sm text-ink/60 text-center mb-6">Session saved to your practice log</p>

          {/* Mind State Assessment - Always visible at top */}
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
            <MindStateSlider value={postScore} onChange={setPostScore} scaleType="calm" />
          </div>

          {/* Improvement reveal - Animated when post score is selected */}
          <AnimatePresence>
            {improvementMessage && (
              <motion.div
                className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="text-center">
                  <p className="text-lg font-serif text-ink mb-1">{improvementMessage.title}</p>
                  <p
                    className={`text-sm ${
                      improvementMessage.isPositive === true
                        ? 'text-green-600'
                        : improvementMessage.isPositive === false
                          ? 'text-ink/50'
                          : 'text-ink/60'
                    }`}
                  >
                    {improvementMessage.subtitle}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation Message - Shows after rating */}
          <AnimatePresence>
            {validationMessage && (
              <motion.div
                className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    {validationMessage.icon === 'check' && (
                      <svg
                        className="w-4 h-4 text-accent"
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
                    )}
                    {validationMessage.icon === 'heart' && (
                      <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    )}
                    {validationMessage.icon === 'sparkle' && (
                      <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                      </svg>
                    )}
                    {validationMessage.icon === 'seed' && (
                      <svg
                        className="w-4 h-4 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink mb-1">{validationMessage.title}</p>
                    <p className="text-xs text-ink/60">{validationMessage.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Eye Tracking Stats - Shows after rating if available */}
          <AnimatePresence>
            {postScore !== null && trackingMetrics && (
              <motion.div
                className="w-full max-w-sm bg-elevated rounded-xl p-4 mb-4 shadow-sm"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
              >
                <p className="text-xs text-ink/50 mb-3 text-center uppercase tracking-wide">
                  Eye Tracking Data
                </p>
                <div className="flex justify-around text-center">
                  {trackingMetrics.accuracy !== undefined && (
                    <div>
                      <p className="text-lg font-serif text-ink">
                        {Math.round(trackingMetrics.accuracy)}%
                      </p>
                      <p className="text-[10px] text-ink/50">Accuracy</p>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-serif text-ink">
                      {trackingMetrics.improvementPercent > 0 ? '+' : ''}
                      {Math.round(trackingMetrics.improvementPercent)}%
                    </p>
                    <p className="text-[10px] text-ink/50">Smoothness</p>
                  </div>
                  {trackingMetrics.saccadeCount !== undefined && (
                    <div>
                      <p className="text-lg font-serif text-ink">{trackingMetrics.saccadeCount}</p>
                      <p className="text-[10px] text-ink/50">Saccades</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration stat */}
          <div className="w-full max-w-sm bg-elevated rounded-xl p-4 mb-4 shadow-sm">
            <div className="text-center">
              <p className="text-xs text-ink/50 mb-1">Duration</p>
              <p className="text-xl font-serif text-ink">{formatElapsedTime(durationSeconds)}</p>
            </div>
          </div>

          {/* Suggestion Card */}
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink mb-1">Ready to go deeper?</p>
                <p className="text-xs text-ink/60">
                  Your mind is now calmer and more receptive. Try a silent meditation to deepen your
                  practice.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons - scrolls with content */}
          <div className="w-full max-w-sm space-y-3 pb-6">
            {onMeditateNow && (
              <button
                onClick={onMeditateNow}
                className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors"
              >
                Meditate Now
              </button>
            )}
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
