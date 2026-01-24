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
  /** Whether user had a valid (non-stale) eye tracking calibration during this session */
  isCalibrated?: boolean
  onClose: () => void
  onPracticeAgain: () => void
  onMeditateNow?: () => void
  /** Callback to persist post-session score to database */
  onPostScoreUpdate?: (score: number) => void
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
  isCalibrated = false,
  onClose,
  onPracticeAgain,
  onMeditateNow,
  onPostScoreUpdate,
}: RacingMindSummaryProps) {
  const [postScore, setPostScore] = useState<number | null>(null)

  // Persist post-session score when it changes
  const handlePostScoreChange = useCallback(
    (score: number | null) => {
      setPostScore(score)
      if (score !== null && onPostScoreUpdate) {
        onPostScoreUpdate(score)
      }
    },
    [onPostScoreUpdate]
  )

  // Get contextual label for the calm score (celebrates the arrived state)
  const getCalmLabel = useCallback(() => {
    if (postScore === null) return null

    if (postScore <= 3) return 'Beginning to settle'
    if (postScore <= 5) return 'Noticeably calmer'
    if (postScore <= 7) return 'Significantly settled'
    return 'Deep stillness achieved'
  }, [postScore])

  // Get journey acknowledgment message (acknowledges they came in racing, without comparing numbers)
  const getJourneyMessage = useCallback(() => {
    if (postScore === null) return null

    // Acknowledge the journey based on whether they had a high racing mind coming in
    if (preSessionScore !== null && preSessionScore >= 7) {
      return 'You arrived with a racing mind. This is where you landed.'
    }
    return 'This is where you landed.'
  }, [postScore, preSessionScore])

  // Get reward message based on engagement + calm rating (no numerical comparison)
  const getRewardMessage = useCallback(() => {
    if (postScore === null || !trackingMetrics) return null

    const focusTime = formatFocusTime(trackingMetrics.focusTimeSeconds)
    const highEngagement = trackingMetrics.engagementPercent >= 75
    const feelsCalm = postScore >= 5

    if (highEngagement && feelsCalm) {
      return `${focusTime} of focused attention. Your presence contributed to this calm.`
    } else if (highEngagement && !feelsCalm) {
      return `${focusTime} of focused attention. The settling is happening. You'll feel it more each session.`
    } else if (!highEngagement && feelsCalm) {
      return `${focusTime} of attention. Imagine what deeper focus would feel like.`
    } else {
      return `${focusTime} of attention. More focus, more calm. That's the practice.`
    }
  }, [postScore, trackingMetrics])

  const calmLabel = getCalmLabel()
  const journeyMessage = getJourneyMessage()
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

          <h1 className="font-serif text-2xl text-ink mb-6">Practice Complete</h1>

          {/* Mind State Assessment - Always visible at top */}
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
            <MindStateSlider value={postScore} onChange={handlePostScoreChange} scaleType="calm" />
          </div>

          {/* Calm celebration - Animated when post score is selected */}
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

          {/* Metrics - Stacked cards with explanations */}
          <AnimatePresence>
            {postScore !== null && trackingMetrics && (
              <motion.div
                className="w-full max-w-sm space-y-3 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
              >
                {/* Focus Time */}
                <div className="bg-elevated rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink">Focus Time</span>
                    <span className="text-lg font-serif text-ink">
                      {formatFocusTime(trackingMetrics.focusTimeSeconds)}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink/50 leading-snug">
                    Time your gaze stayed with the orb. More focus time = deeper calm.
                  </p>
                </div>

                {/* Engagement Rate */}
                <div className="bg-elevated rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink">Engagement</span>
                    <span className="text-lg font-serif text-ink">
                      {Math.round(trackingMetrics.engagementPercent)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-ink/50 leading-snug">
                    Percentage of session spent tracking. Higher engagement, greater stillness.
                  </p>
                </div>

                {/* Longest Streak */}
                <div className="bg-elevated rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink">Best Streak</span>
                    <span className="text-lg font-serif text-ink">
                      {formatFocusTime(trackingMetrics.longestStreakSeconds)}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink/50 leading-snug">
                    Longest unbroken focus. Sustained attention quiets the racing mind.
                  </p>
                </div>
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

          {/* Bridge CTA - Same motion, eyes closed */}
          <AnimatePresence>
            {postScore !== null && onMeditateNow && (
              <motion.div
                className="w-full max-w-sm bg-accent/5 border border-accent/20 rounded-xl p-5 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }}
              >
                <h3 className="font-serif text-lg text-ink text-center mb-2">
                  Same Motion. Eyes Closed.
                </h3>
                <p className="text-sm text-ink/70 text-center leading-relaxed mb-4">
                  Your brain responds the same way—whether you see the orb or imagine it. Close your
                  eyes. Picture it drifting slowly. The stillness is yours to keep.
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

          {/* Calibration hint - Shows if tracking was used but user was NOT calibrated */}
          {postScore !== null && trackingMetrics && !isCalibrated && (
            <p className="w-full max-w-sm text-xs text-ink/40 text-center mb-4 italic">
              Calibrate before your next session for more accurate tracking
            </p>
          )}

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
