/**
 * OmCoachResults - Post-session summary screen
 *
 * Displays session statistics and per-phoneme alignment breakdown.
 * Mm is weighted 50% in overall score (most important for NO production).
 */

import type { OmCoachMetrics } from '../../lib/db/types'
import type { PhonemeAlignmentData } from '../../hooks/useGuidedOmCycle'
import { getAlignmentFeedback } from '../../hooks/useAlignmentScoring'

interface OmCoachResultsProps {
  durationSeconds: number
  metrics: OmCoachMetrics
  lockedCycles?: number // Number of cycles meeting 70% threshold
  totalCycles?: number // Total cycles in session
  phonemeAlignment?: PhonemeAlignmentData | null
  onClose: () => void
  onPracticeAgain: () => void
}

/**
 * Calculate alignment percentage for a phoneme
 */
function calculatePhonemePercent(data: { totalMs: number; inRangeMs: number }): number {
  return data.totalMs > 0 ? Math.round((data.inRangeMs / data.totalMs) * 100) : 0
}

/**
 * Get color class based on alignment percentage
 */
function getAlignmentColorClass(percent: number): string {
  if (percent >= 80) return 'bg-green-500'
  if (percent >= 60) return 'bg-lime-500'
  if (percent >= 40) return 'bg-yellow-500'
  if (percent >= 20) return 'bg-orange-500'
  return 'bg-ink/20'
}

/**
 * Format seconds as MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function OmCoachResults({
  durationSeconds,
  metrics,
  lockedCycles = 0,
  totalCycles = 0,
  phonemeAlignment,
  onClose,
  onPracticeAgain,
}: OmCoachResultsProps) {
  const feedback = getAlignmentFeedback(metrics.averageAlignmentScore)

  // Calculate vocalization percentage
  const vocalizationPercent =
    durationSeconds > 0 ? Math.round((metrics.vocalizationSeconds / durationSeconds) * 100) : 0

  // Calculate lock rate
  const lockRate = totalCycles > 0 ? Math.round((lockedCycles / totalCycles) * 100) : 0

  // Calculate per-phoneme alignment percentages
  const ahPercent = phonemeAlignment ? calculatePhonemePercent(phonemeAlignment.ah) : 0
  const ooPercent = phonemeAlignment ? calculatePhonemePercent(phonemeAlignment.oo) : 0
  const mmPercent = phonemeAlignment ? calculatePhonemePercent(phonemeAlignment.mm) : 0

  // Calculate weighted overall score (Mm weighted 50%, Ah and Oo 25% each)
  const weightedOverall = phonemeAlignment
    ? Math.round(ahPercent * 0.25 + ooPercent * 0.25 + mmPercent * 0.5)
    : metrics.averageAlignmentScore

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-8">
      {/* Completion message */}
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="font-serif text-2xl text-ink mb-2">Practice Complete</h1>
      <p className="text-sm text-ink/60 text-center mb-8">Session saved to your practice log</p>

      {/* Stats Card */}
      <div className="w-full max-w-sm bg-elevated rounded-xl p-6 mb-8 shadow-sm">
        {/* Duration */}
        <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
          <span className="text-sm text-ink/70">Duration</span>
          <span className="text-lg font-medium text-ink">{formatDuration(durationSeconds)}</span>
        </div>

        {/* Guided Cycles */}
        <div className="flex justify-between items-center py-4 border-b border-border-subtle">
          <span className="text-sm text-ink/70">Guided Cycles</span>
          <span className="text-lg font-medium text-ink">
            {metrics.completedCycles}
            {totalCycles > 0 ? ` / ${totalCycles}` : ''}
          </span>
        </div>

        {/* Locked Cycles (new) */}
        {totalCycles > 0 && (
          <div className="flex justify-between items-center py-4 border-b border-border-subtle">
            <span className="text-sm text-ink/70">Cycles Locked</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-ink">{lockedCycles}</span>
              {lockedCycles > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-success-bg text-success-text">
                  {lockRate}% rate
                </span>
              )}
            </div>
          </div>
        )}

        {/* Average Alignment */}
        <div className="flex justify-between items-center py-4 border-b border-border-subtle">
          <span className="text-sm text-ink/70">Alignment Score</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-ink">{metrics.averageAlignmentScore}%</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                feedback.color === 'success'
                  ? 'bg-success-bg text-success-text'
                  : feedback.color === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-elevated text-ink/60'
              }`}
            >
              {feedback.label}
            </span>
          </div>
        </div>

        {/* Vocalization Time */}
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-ink/70">Time Vocalizing</span>
          <span className="text-lg font-medium text-ink">
            {formatDuration(metrics.vocalizationSeconds)}
            <span className="text-sm text-ink/50 ml-1">({vocalizationPercent}%)</span>
          </span>
        </div>
      </div>

      {/* Per-Phoneme Alignment Breakdown */}
      {phonemeAlignment &&
        (phonemeAlignment.ah.totalMs > 0 ||
          phonemeAlignment.oo.totalMs > 0 ||
          phonemeAlignment.mm.totalMs > 0) && (
          <div className="w-full max-w-sm bg-elevated rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-sm font-medium text-ink mb-4">Alignment Breakdown</h3>

            {/* Ah */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-ink/70">Ah</span>
                <span className="text-sm font-medium text-ink tabular-nums">{ahPercent}%</span>
              </div>
              <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getAlignmentColorClass(ahPercent)}`}
                  style={{ width: `${ahPercent}%` }}
                />
              </div>
            </div>

            {/* Oo */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-ink/70">Oo</span>
                <span className="text-sm font-medium text-ink tabular-nums">{ooPercent}%</span>
              </div>
              <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getAlignmentColorClass(ooPercent)}`}
                  style={{ width: `${ooPercent}%` }}
                />
              </div>
            </div>

            {/* Mm (weighted 50%) */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-ink/70">
                  Mm <span className="text-[10px] text-ink/40">(50% weight)</span>
                </span>
                <span className="text-sm font-medium text-ink tabular-nums">{mmPercent}%</span>
              </div>
              <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getAlignmentColorClass(mmPercent)}`}
                  style={{ width: `${mmPercent}%` }}
                />
              </div>
            </div>

            {/* Overall weighted score */}
            <div className="pt-3 border-t border-border-subtle">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-ink">Overall Score</span>
                <span className="text-lg font-semibold text-ink tabular-nums">
                  {weightedOverall}%
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Encouragement based on performance */}
      <div className="w-full max-w-sm mb-8">
        {lockedCycles >= 10 ? (
          <p className="text-sm text-ink/70 text-center">
            Excellent! {lockedCycles} locked cycles shows mastery of the technique.
          </p>
        ) : lockedCycles >= 5 ? (
          <p className="text-sm text-ink/70 text-center">
            Great focus! Keep matching pitch and phonemes to lock more cycles.
          </p>
        ) : lockedCycles > 0 ? (
          <p className="text-sm text-ink/70 text-center">
            Good start! Stay within the pitch target to lock in more cycles.
          </p>
        ) : metrics.completedCycles > 0 ? (
          <p className="text-sm text-ink/70 text-center">
            Focus on smooth transitions from Ah to Oo to Mm while hitting the pitch.
          </p>
        ) : (
          <p className="text-sm text-ink/70 text-center">
            Follow the guided phases and aim for ~130 Hz to start locking cycles.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={onPracticeAgain}
          className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
        >
          Practice Again
        </button>
        <button
          onClick={onClose}
          className="w-full h-12 bg-base hover:bg-stone-100 text-ink font-medium rounded-lg transition-colors border border-border-subtle"
        >
          Done
        </button>
      </div>
    </div>
  )
}
