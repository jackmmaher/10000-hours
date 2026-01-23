/**
 * ValidationDisplay - DEPRECATED
 *
 * This component is no longer used. The new results screen logic is
 * consolidated in RacingMindSummary.tsx per the eye tracking KPIs redesign.
 *
 * Keeping this file to avoid breaking imports, but it should be removed
 * in a future cleanup.
 */

import type { TrackingMetrics } from './index'

interface ValidationDisplayProps {
  preScore: number
  postScore: number
  trackingMetrics?: TrackingMetrics | null
}

/**
 * Format seconds as "Xm Ys"
 */
function formatFocusTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) {
    return `${secs}s`
  }
  return `${mins}m ${secs}s`
}

/**
 * Get engagement label based on percentage
 */
function getEngagementLabel(percent: number): { label: string; color: string } {
  if (percent >= 85) return { label: 'Excellent', color: 'text-green-500' }
  if (percent >= 75) return { label: 'Good', color: 'text-accent' }
  if (percent >= 60) return { label: 'Moderate', color: 'text-ink/70' }
  return { label: 'Developing', color: 'text-ink/50' }
}

export function ValidationDisplay({
  preScore,
  postScore,
  trackingMetrics,
}: ValidationDisplayProps) {
  // New paradigm: preScore = racing (higher = worse), postScore = calm (higher = better)
  const highEngagement = trackingMetrics && trackingMetrics.engagementPercent >= 75
  const feelsCalm = postScore >= 5

  // Determine the validation message based on subjective + objective data
  const getMessage = () => {
    if (highEngagement && feelsCalm) {
      return {
        title: 'You Earned That',
        message: `${formatFocusTime(trackingMetrics!.focusTimeSeconds)} of focus. Calm of ${postScore}.`,
        icon: 'check',
      }
    }
    if (highEngagement && !feelsCalm) {
      return {
        title: 'The Settling Is Happening',
        message: `${formatFocusTime(trackingMetrics!.focusTimeSeconds)} of focus. You'll feel it more each session.`,
        icon: 'sparkle',
      }
    }
    if (!highEngagement && feelsCalm && trackingMetrics) {
      return {
        title: 'Imagine Full Focus',
        message: `${formatFocusTime(trackingMetrics.focusTimeSeconds)} of focus. Calm of ${postScore}.`,
        icon: 'heart',
      }
    }
    if (!highEngagement && !feelsCalm && trackingMetrics) {
      return {
        title: 'More Focus, More Calm',
        message: `${formatFocusTime(trackingMetrics.focusTimeSeconds)} of focus. That's the deal.`,
        icon: 'seed',
      }
    }
    // No tracking data available
    if (feelsCalm) {
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
  }

  const validation = getMessage()
  const engagementLabel = trackingMetrics
    ? getEngagementLabel(trackingMetrics.engagementPercent)
    : null

  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Before/After Score Comparison */}
      <div className="bg-elevated rounded-xl p-5">
        <p className="text-xs text-ink/50 mb-3 text-center uppercase tracking-wide">
          Your Mind State
        </p>

        <div className="flex items-center justify-center gap-4">
          {/* Before */}
          <div className="text-center">
            <p className="text-xs text-ink/50 mb-1">Racing</p>
            <div className="text-2xl font-serif text-ink">{preScore}</div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <svg
              className="w-6 h-6 text-ink/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          {/* After */}
          <div className="text-center">
            <p className="text-xs text-ink/50 mb-1">Calm</p>
            <div className="text-2xl font-serif text-ink">{postScore}</div>
          </div>
        </div>
      </div>

      {/* Validation Message */}
      <div className="bg-elevated rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            {validation.icon === 'check' && (
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
            {validation.icon === 'heart' && (
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            {validation.icon === 'sparkle' && (
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
              </svg>
            )}
            {validation.icon === 'seed' && (
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
            <p className="text-sm font-medium text-ink mb-1">{validation.title}</p>
            <p className="text-xs text-ink/60">{validation.message}</p>
          </div>
        </div>
      </div>

      {/* Eye Tracking Stats (if available) */}
      {trackingMetrics && (
        <div className="bg-elevated rounded-xl p-4">
          <p className="text-xs text-ink/50 mb-3 text-center uppercase tracking-wide">
            Eye Tracking Insights
          </p>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-lg font-serif text-ink">
                {formatFocusTime(trackingMetrics.focusTimeSeconds)}
              </p>
              <p className="text-[10px] text-ink/50 mt-0.5">Focus</p>
            </div>
            {engagementLabel && (
              <div>
                <p className={`text-sm font-medium ${engagementLabel.color}`}>
                  {engagementLabel.label}
                </p>
                <p className="text-[10px] text-ink/50 mt-0.5">Engaged</p>
              </div>
            )}
            <div>
              <p className="text-lg font-serif text-ink">
                {formatFocusTime(trackingMetrics.longestStreakSeconds)}
              </p>
              <p className="text-[10px] text-ink/50 mt-0.5">Streak</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
