/**
 * RacingMindSummary - Unified post-session summary card
 *
 * Combines the post-assessment (mind rating) and results into a single screen.
 * When the user rates their mind, the analysis reveals with animation.
 *
 * Flow:
 * 1. User sees "How is your mind now?" slider at top
 * 2. User selects a calm rating
 * 3. Reward message animates in
 * 4. Metrics row animates in
 * 5. Nudge text appears
 * 6. CTAs at bottom
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MindStateSlider } from './MindStateSlider'
import type { TrackingMetrics } from './index'

interface RacingMindSummaryProps {
  durationSeconds: number
  preSessionScore: number | null
  trackingMetrics: TrackingMetrics | null
  onClose: () => void
  onPracticeAgain: () => void
  onMeditateNow?: () => void
}

/**
 * Format seconds as "Xm Ys" (e.g., 522 seconds = "8m 42s")
 */
function formatFocusTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) {
    return `${secs}s`
  }
  return `${mins}m ${secs}s`
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
  // preSessionScore = racing (1-10, higher = worse)
  // postScore = calm (1-10, higher = better)
  const getImprovementMessage = useCallback(() => {
    if (preSessionScore === null || postScore === null) return null

    return {
      title: `Racing mind of ${preSessionScore} \u2192 Calm of ${postScore}`,
    }
  }, [preSessionScore, postScore])

  // Get reward message based on engagement + calm rating
  const getRewardMessage = useCallback(() => {
    if (postScore === null || !trackingMetrics) return null

    const focusTime = formatFocusTime(trackingMetrics.focusTimeSeconds)
    const highEngagement = trackingMetrics.engagementPercent >= 75
    const feelsCalm = postScore >= 5

    if (highEngagement && feelsCalm) {
      return `${focusTime} of focus. Calm of ${postScore}. You earned that.`
    } else if (highEngagement && !feelsCalm) {
      return `${focusTime} of focus. The settling is happening. You'll feel it more each session.`
    } else if (!highEngagement && feelsCalm) {
      return `${focusTime} of focus. Calm of ${postScore}. Imagine what full focus would feel like.`
    } else {
      return `${focusTime} of focus. More focus, more calm. That's the deal.`
    }
  }, [postScore, trackingMetrics])

  const improvementMessage = getImprovementMessage()
  const rewardMessage = getRewardMessage()

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
                  <p className="text-lg font-serif text-ink">{improvementMessage.title}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reward Message - Shows after rating */}
          <AnimatePresence>
            {rewardMessage && (
              <motion.div
                className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
              >
                <p className="text-sm text-ink/80 text-center leading-relaxed">{rewardMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics Row - Shows after rating if tracking available */}
          <AnimatePresence>
            {postScore !== null && trackingMetrics && (
              <motion.div
                className="w-full max-w-sm bg-elevated rounded-xl p-4 mb-4 shadow-sm"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
              >
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-lg font-serif text-ink">
                      {formatFocusTime(trackingMetrics.focusTimeSeconds)}
                    </p>
                    <p className="text-[10px] text-ink/50">Focus</p>
                  </div>
                  <div>
                    <p className="text-lg font-serif text-ink">
                      {Math.round(trackingMetrics.engagementPercent)}%
                    </p>
                    <p className="text-[10px] text-ink/50">Engaged</p>
                  </div>
                  <div>
                    <p className="text-lg font-serif text-ink">
                      {formatFocusTime(trackingMetrics.longestStreakSeconds)}
                    </p>
                    <p className="text-[10px] text-ink/50">Streak</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nudge text - Shows after metrics */}
          <AnimatePresence>
            {postScore !== null && (
              <motion.div
                className="w-full max-w-sm mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
              >
                <p className="text-xs text-ink/50 text-center">
                  Next session: eyes soft, center of the orb, let it lead.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration stat - Shows when no tracking metrics available */}
          {!trackingMetrics && (
            <div className="w-full max-w-sm bg-elevated rounded-xl p-4 mb-4 shadow-sm">
              <div className="text-center">
                <p className="text-xs text-ink/50 mb-1">Duration</p>
                <p className="text-xl font-serif text-ink">{formatFocusTime(durationSeconds)}</p>
              </div>
            </div>
          )}

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
