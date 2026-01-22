/**
 * OmCoachResults - Post-session summary screen
 *
 * Redesigned for clarity:
 * - Clear explanation of what's being measured
 * - Sublabels explaining each component
 * - Actionable suggestions based on performance
 * - Collapsible "how it works" section
 */

import type { OmCoachMetrics } from '../../lib/db/types'
import type { PhonemeAlignmentData } from '../../hooks/useGuidedOmCycle'

interface OmCoachResultsProps {
  durationSeconds: number
  metrics: OmCoachMetrics
  lockedCycles?: number
  totalCycles?: number
  phonemeAlignment?: PhonemeAlignmentData | null
  onClose: () => void
  onPracticeAgain: () => void
  onMeditateNow?: () => void
}

/**
 * Calculate alignment percentage for a phoneme
 */
function calculatePhonemePercent(data: { totalMs: number; inRangeMs: number }): number {
  return data.totalMs > 0 ? Math.round((data.inRangeMs / data.totalMs) * 100) : 0
}

/**
 * Get color based on alignment percentage
 */
function getAlignmentColor(percent: number): string {
  if (percent >= 70) return 'var(--success-icon)'
  if (percent >= 50) return 'var(--accent)'
  if (percent >= 30) return 'var(--text-muted)'
  return 'var(--text-tertiary)'
}

/**
 * Format seconds as MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get feedback label based on score
 */
function getScoreLabel(score: number): { label: string; color: 'success' | 'warning' | 'muted' } {
  if (score >= 70) return { label: 'Locked', color: 'success' }
  if (score >= 50) return { label: 'Building', color: 'warning' }
  return { label: 'Finding pitch', color: 'muted' }
}

/**
 * Generate actionable suggestion based on phoneme scores
 */
function getActionableSuggestion(
  ahPercent: number,
  ooPercent: number,
  mmPercent: number
): { focus: string; suggestion: string } {
  const avgScore = (ahPercent + ooPercent + mmPercent) / 3

  // All doing well
  if (avgScore >= 70) {
    return {
      focus: 'Excellent technique',
      suggestion:
        "You're consistently matching the target pitch. Try extending your session duration or experimenting with longer breath holds.",
    }
  }

  // Find the weakest area
  const scores = [
    { name: 'Ah', percent: ahPercent },
    { name: 'Oo', percent: ooPercent },
    { name: 'Mm', percent: mmPercent },
  ]
  const lowest = scores.reduce((a, b) => (a.percent < b.percent ? a : b))

  // All struggling
  if (avgScore < 30) {
    return {
      focus: 'Match the visual guide',
      suggestion:
        'Watch the frequency bar during practice. When it turns green, you\'re in range. Start with a low, relaxed hum around 130 Hz - think "ommm" in a deep voice.',
    }
  }

  // Specific phoneme feedback
  switch (lowest.name) {
    case 'Ah':
      return {
        focus: 'Improve your "Ah"',
        suggestion:
          'Open your mouth wide and relax your throat. Aim for a deep, resonant "Ahhh" sound - like sighing with your voice. Keep it steady, not wavering.',
      }
    case 'Oo':
      return {
        focus: 'Improve your "Oo"',
        suggestion:
          'Round your lips like saying "home." The pitch should stay the same as "Ah" - only your mouth shape changes. Feel the sound resonate in your chest.',
      }
    case 'Mm':
      return {
        focus: 'Extend your humming',
        suggestion:
          'Close your lips and hum steadily. Feel the vibration in your sinuses and forehead. This is the most beneficial part - try to make it the longest phase.',
      }
    default:
      return {
        focus: 'Keep practicing',
        suggestion: 'Focus on maintaining one steady pitch throughout all three sounds.',
      }
  }
}

export function OmCoachResults({
  durationSeconds,
  metrics,
  lockedCycles = 0,
  totalCycles = 0,
  phonemeAlignment,
  onClose,
  onPracticeAgain,
  onMeditateNow,
}: OmCoachResultsProps) {
  // Calculate per-phoneme alignment percentages
  const ahPercent = phonemeAlignment ? calculatePhonemePercent(phonemeAlignment.ah) : 0
  const ooPercent = phonemeAlignment ? calculatePhonemePercent(phonemeAlignment.oo) : 0
  const mmPercent = phonemeAlignment ? calculatePhonemePercent(phonemeAlignment.mm) : 0

  // Calculate weighted overall score (Mm weighted 50%, Ah and Oo 25% each)
  const alignmentScore = phonemeAlignment
    ? Math.round(ahPercent * 0.25 + ooPercent * 0.25 + mmPercent * 0.5)
    : metrics.averageAlignmentScore

  const feedback = getScoreLabel(alignmentScore)
  const suggestion = getActionableSuggestion(ahPercent, ooPercent, mmPercent)

  // Calculate lock rate
  const lockRate = totalCycles > 0 ? Math.round((lockedCycles / totalCycles) * 100) : 0

  const hasPhonemeData =
    phonemeAlignment &&
    (phonemeAlignment.ah.totalMs > 0 ||
      phonemeAlignment.oo.totalMs > 0 ||
      phonemeAlignment.mm.totalMs > 0)

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

        {/* Session Stats Card */}
        <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-ink/50 mb-1">Duration</p>
              <p className="text-lg font-medium text-ink">{formatDuration(durationSeconds)}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50 mb-1">Cycles</p>
              <p className="text-lg font-medium text-ink">
                {metrics.completedCycles}
                {totalCycles > 0 && <span className="text-ink/40"> / {totalCycles}</span>}
              </p>
            </div>
            {totalCycles > 0 && (
              <div>
                <p className="text-xs text-ink/50 mb-1">Locked</p>
                <p className="text-lg font-medium text-ink">
                  {lockedCycles}
                  {lockedCycles > 0 && (
                    <span className="text-xs text-success-text ml-1">({lockRate}%)</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pitch Alignment Card */}
        {hasPhonemeData && (
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
            {/* Header with score */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-ink">Pitch Alignment</h3>
                <p className="text-xs text-ink/50 mt-0.5">Time matching the target tone</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif text-ink">{alignmentScore}%</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    feedback.color === 'success'
                      ? 'bg-success-bg text-success-text'
                      : feedback.color === 'warning'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-ink/5 text-ink/50'
                  }`}
                >
                  {feedback.label}
                </span>
              </div>
            </div>

            {/* Phoneme breakdown with sublabels */}
            <div className="space-y-3 mb-4">
              <PhonemeBar label="Ah" sublabel="Open vowel" percent={ahPercent} weight={25} />
              <PhonemeBar label="Oo" sublabel="Rounded vowel" percent={ooPercent} weight={25} />
              <PhonemeBar
                label="Mm"
                sublabel="Humming (most beneficial)"
                percent={mmPercent}
                weight={50}
              />
            </div>

            {/* Focus area / suggestion */}
            <div className="bg-base rounded-lg p-3">
              <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">{suggestion.focus}</p>
              <p className="text-sm text-ink/70 leading-relaxed">{suggestion.suggestion}</p>
            </div>

            {/* How it works - collapsible */}
            <details className="mt-4 group">
              <summary className="text-xs text-ink/40 cursor-pointer hover:text-ink/60 transition-colors">
                How scoring works
              </summary>
              <div className="mt-3 pt-3 border-t border-border-subtle text-xs text-ink/50 space-y-2">
                <p>
                  <strong className="text-ink/70">Target pitch:</strong> ~130 Hz, a low comfortable
                  hum. The frequency bar turns green when you're in range.
                </p>
                <p>
                  <strong className="text-ink/70">Alignment %:</strong> How much time you spent
                  within ±50 cents of the target pitch.
                </p>
                <p>
                  <strong className="text-ink/70">Why Mm is 50%:</strong> Sustained humming at this
                  frequency increases nasal nitric oxide production 15x - the main health benefit.
                </p>
                <p>
                  <strong className="text-ink/70">Locked cycle:</strong> 70%+ alignment. A sign of
                  solid technique worth tracking.
                </p>
              </div>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3 mt-auto">
          <button
            onClick={onPracticeAgain}
            className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors"
          >
            Practice Again
          </button>
          {onMeditateNow && (
            <button
              onClick={onMeditateNow}
              className="w-full h-12 bg-[var(--button-secondary-bg)] hover:bg-[var(--bg-deep)] text-[var(--button-secondary-text)] font-medium rounded-xl transition-colors border border-[var(--border)]"
            >
              Meditate Now
            </button>
          )}
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

/**
 * Individual phoneme progress bar with sublabel
 */
function PhonemeBar({
  label,
  sublabel,
  percent,
  weight,
}: {
  label: string
  sublabel: string
  percent: number
  weight: number
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <span className="text-sm text-ink">{label}</span>
          <span className="text-xs text-ink/40 ml-2">{sublabel}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-ink tabular-nums">{percent}%</span>
          <span className="text-[10px] text-ink/30">({weight}%)</span>
        </div>
      </div>
      <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: getAlignmentColor(percent) }}
        />
      </div>
    </div>
  )
}
