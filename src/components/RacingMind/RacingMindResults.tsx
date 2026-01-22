/**
 * RacingMindResults - Post-session summary screen
 *
 * Features:
 * - Checkmark completion icon
 * - Self-assessment validation (before/after comparison)
 * - Eye tracking correlation (if available)
 * - Session duration stat
 * - Suggestion to try silent meditation
 * - CTAs: Meditate Now | Practice Again | Done
 */

import { formatElapsedTime } from '../../lib/racingMindAnimation'
import { ValidationDisplay } from './ValidationDisplay'
import type { TrackingMetrics } from './index'

interface RacingMindResultsProps {
  durationSeconds: number
  preSessionScore: number | null
  postSessionScore: number | null
  trackingMetrics: TrackingMetrics | null
  onClose: () => void
  onPracticeAgain: () => void
  onMeditateNow?: () => void
}

export function RacingMindResults({
  durationSeconds,
  preSessionScore,
  postSessionScore,
  trackingMetrics,
  onClose,
  onPracticeAgain,
  onMeditateNow,
}: RacingMindResultsProps) {
  const hasAssessment = preSessionScore !== null && postSessionScore !== null

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center min-h-full px-6 py-6">
        {/* Completion message */}
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl text-ink mb-2">Practice Complete</h1>
        <p className="text-sm text-ink/60 text-center mb-6">Session saved to your practice log</p>

        {/* Validation Display - shows before/after with eye tracking correlation */}
        {hasAssessment ? (
          <div className="mb-6">
            <ValidationDisplay
              preScore={preSessionScore}
              postScore={postSessionScore}
              trackingMetrics={trackingMetrics}
            />
          </div>
        ) : (
          /* Session Stats Card (fallback when no assessment) */
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
            <div className="text-center">
              <p className="text-xs text-ink/50 mb-1">Duration</p>
              <p className="text-2xl font-serif text-ink">{formatElapsedTime(durationSeconds)}</p>
            </div>
          </div>
        )}

        {/* Duration stat (when assessment is shown) */}
        {hasAssessment && (
          <div className="w-full max-w-sm bg-elevated rounded-xl p-4 mb-4 shadow-sm">
            <div className="text-center">
              <p className="text-xs text-ink/50 mb-1">Duration</p>
              <p className="text-xl font-serif text-ink">{formatElapsedTime(durationSeconds)}</p>
            </div>
          </div>
        )}

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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3 mt-auto">
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
  )
}
