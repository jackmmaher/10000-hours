/**
 * ValidationDisplay - Shows before/after self-assessment comparison
 *
 * Displays the change in mental state with contextual messaging.
 * When eye tracking data is available, correlates subjective and objective data.
 */

interface TrackingMetrics {
  improvementPercent: number
  accuracy?: number
  saccadeCount?: number
}

interface ValidationDisplayProps {
  preScore: number
  postScore: number
  trackingMetrics?: TrackingMetrics | null
}

export function ValidationDisplay({
  preScore,
  postScore,
  trackingMetrics,
}: ValidationDisplayProps) {
  const scoreDiff = postScore - preScore
  const feltCalmer = scoreDiff >= 1
  const trackingImproved = trackingMetrics && trackingMetrics.improvementPercent > 10

  // Determine the validation message based on subjective + objective data
  const getMessage = () => {
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
    if (!feltCalmer && !trackingImproved) {
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
  }

  const validation = getMessage()

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
            <p className="text-xs text-ink/50 mb-1">Before</p>
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
            {scoreDiff !== 0 && (
              <span
                className={`text-xs font-medium mt-1 ${
                  scoreDiff > 0 ? 'text-green-500' : 'text-ink/50'
                }`}
              >
                {scoreDiff > 0 ? '+' : ''}
                {scoreDiff}
              </span>
            )}
          </div>

          {/* After */}
          <div className="text-center">
            <p className="text-xs text-ink/50 mb-1">After</p>
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
        </div>
      )}
    </div>
  )
}
