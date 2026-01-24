/**
 * OmCoachResults - Post-session summary screen
 *
 * Redesigned for vocal coherence:
 * - Shows overall coherence score with component breakdown
 * - Displays stability, smoothness, and continuity scores
 * - Shows session median frequency (informational only)
 * - Provides actionable suggestions based on performance
 * - Bridge CTA to meditation with neuroscience framing
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { OmCoachMetrics } from '../../lib/db/types'
import { MindStateSlider } from '../RacingMind/MindStateSlider'

// Coherence data from session
export interface CoherenceMetrics {
  averageCoherenceScore: number // 0-100 overall
  pitchStabilityScore: number // 0-100
  amplitudeSmoothnessScore: number // 0-100
  voicingContinuityScore: number // 0-100
  sessionMedianFrequency: number | null
}

interface OmCoachResultsProps {
  durationSeconds: number
  metrics: OmCoachMetrics
  lockedCycles?: number
  totalCycles?: number
  coherenceMetrics?: CoherenceMetrics | null
  onClose: () => void
  onPracticeAgain: () => void
  onMeditateNow?: () => void
}

/**
 * Get color based on score percentage
 */
function getScoreColor(percent: number): string {
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
 * Get feedback label based on coherence score
 */
function getScoreLabel(score: number): { label: string; color: 'success' | 'warning' | 'muted' } {
  if (score >= 70) return { label: 'Stable', color: 'success' }
  if (score >= 50) return { label: 'Building', color: 'warning' }
  return { label: 'Finding rhythm', color: 'muted' }
}

/**
 * Generate actionable suggestion based on coherence scores
 */
function getActionableSuggestion(coherence: CoherenceMetrics): {
  focus: string
  suggestion: string
} {
  const {
    pitchStabilityScore,
    amplitudeSmoothnessScore,
    voicingContinuityScore,
    averageCoherenceScore,
  } = coherence

  // All doing well
  if (averageCoherenceScore >= 70) {
    return {
      focus: 'Excellent technique',
      suggestion:
        'Your voice is stable and consistent. Try extending your session duration or experimenting with longer breath cycles.',
    }
  }

  // Find the weakest component
  const scores = [
    { name: 'stability', score: pitchStabilityScore },
    { name: 'smoothness', score: amplitudeSmoothnessScore },
    { name: 'continuity', score: voicingContinuityScore },
  ]
  const lowest = scores.reduce((a, b) => (a.score < b.score ? a : b))

  // All struggling
  if (averageCoherenceScore < 30) {
    return {
      focus: 'Focus on steady breath',
      suggestion:
        'Take a deep breath and let the sound flow evenly. Start with a comfortable pitch that you can hold steadily - any pitch works.',
    }
  }

  // Specific component feedback
  switch (lowest.name) {
    case 'stability':
      return {
        focus: 'Hold a steady pitch',
        suggestion:
          "Try to maintain one comfortable note throughout each phase. Don't worry about hitting a specific frequency - find your natural tone and keep it steady.",
      }
    case 'smoothness':
      return {
        focus: 'Even breath support',
        suggestion:
          'Keep your volume consistent throughout each sound. Avoid sudden surges or breathy drops. Let the breath flow evenly.',
      }
    case 'continuity':
      return {
        focus: 'Sustain your voice',
        suggestion:
          'Work on sustaining your voice through each phase. Take fuller breaths to support longer tones without breaks.',
      }
    default:
      return {
        focus: 'Keep practicing',
        suggestion:
          'Focus on maintaining one steady, comfortable tone throughout all three sounds.',
      }
  }
}

export function OmCoachResults({
  durationSeconds,
  metrics,
  lockedCycles = 0,
  totalCycles = 0,
  coherenceMetrics,
  onClose,
  onPracticeAgain,
  onMeditateNow,
}: OmCoachResultsProps) {
  const [postScore, setPostScore] = useState<number | null>(null)

  // Use coherence score if available, otherwise fall back to alignment score
  const mainScore = coherenceMetrics?.averageCoherenceScore ?? metrics.averageAlignmentScore
  const feedback = getScoreLabel(mainScore)
  const hasCoherenceData = coherenceMetrics !== null && coherenceMetrics !== undefined

  // Calculate lock rate
  const lockRate = totalCycles > 0 ? Math.round((lockedCycles / totalCycles) * 100) : 0

  // Get contextual label for the settled score
  const getSettledLabel = useCallback(() => {
    if (postScore === null) return null
    if (postScore <= 3) return 'Starting to ground'
    if (postScore <= 5) return 'Noticeably more present'
    if (postScore <= 7) return 'Settled and centered'
    return 'Deeply grounded'
  }, [postScore])

  const settledLabel = getSettledLabel()

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

        <h1 className="font-serif text-2xl text-ink mb-6">Practice Complete</h1>

        {/* Post-session assessment */}
        <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
          <MindStateSlider value={postScore} onChange={setPostScore} scaleType="settled" />
        </div>

        {/* Settled celebration - Animated when post score is selected */}
        <AnimatePresence>
          {settledLabel && (
            <motion.div
              className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="text-center">
                <p className="text-lg font-serif text-ink mb-1">{settledLabel}</p>
                <p className="text-xs text-ink/50">The resonance is still with you.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Vocal Coherence Card */}
        {hasCoherenceData && coherenceMetrics && (
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
            {/* Header with score */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-ink">Vocal Coherence</h3>
                <p className="text-xs text-ink/50 mt-0.5">Stability of your practice</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif text-ink">{Math.round(mainScore)}%</p>
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

            {/* Coherence component breakdown */}
            <div className="space-y-3 mb-4">
              <ComponentBar
                label="Stability"
                sublabel="Pitch steadiness"
                percent={coherenceMetrics.pitchStabilityScore}
                weight={50}
              />
              <ComponentBar
                label="Smoothness"
                sublabel="Even volume"
                percent={coherenceMetrics.amplitudeSmoothnessScore}
                weight={30}
              />
              <ComponentBar
                label="Continuity"
                sublabel="Sustained voicing"
                percent={coherenceMetrics.voicingContinuityScore}
                weight={20}
              />
            </div>

            {/* Session median frequency with therapeutic context */}
            {coherenceMetrics.sessionMedianFrequency && (
              <div className="text-center mb-4 py-2">
                <div className="text-sm text-ink/70">
                  Your natural tone:{' '}
                  <span className="font-medium text-ink">
                    ~{Math.round(coherenceMetrics.sessionMedianFrequency)} Hz
                  </span>
                </div>
                {coherenceMetrics.sessionMedianFrequency >= 100 &&
                  coherenceMetrics.sessionMedianFrequency <= 160 && (
                    <div className="text-xs text-success-text mt-1">
                      In the therapeutic range from steady, relaxed chanting
                    </div>
                  )}
              </div>
            )}

            {/* Focus area / suggestion */}
            {(() => {
              const suggestion = getActionableSuggestion(coherenceMetrics)
              return (
                <div className="bg-base rounded-lg p-3">
                  <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">
                    {suggestion.focus}
                  </p>
                  <p className="text-sm text-ink/70 leading-relaxed">{suggestion.suggestion}</p>
                </div>
              )
            })()}

            {/* How it works - collapsible */}
            <details className="mt-4 group">
              <summary className="text-xs text-ink/40 cursor-pointer hover:text-ink/60 transition-colors">
                How scoring works
              </summary>
              <div className="mt-3 pt-3 border-t border-border-subtle text-xs text-ink/50 space-y-2">
                <p>
                  <strong className="text-ink/70">Stability (50%):</strong> How steady your pitch
                  stays within each phase. Low variance = high score.
                </p>
                <p>
                  <strong className="text-ink/70">Smoothness (30%):</strong> How even your volume
                  stays. No breathy drops or sudden surges.
                </p>
                <p>
                  <strong className="text-ink/70">Continuity (20%):</strong> How much of the time
                  you're actively voicing vs. silence or breaks.
                </p>
                <p>
                  <strong className="text-ink/70">Locked cycle:</strong> 70%+ coherence. Your
                  technique is solid and consistent.
                </p>
              </div>
            </details>
          </div>
        )}

        {/* Fallback for old sessions without coherence data */}
        {!hasCoherenceData && metrics.averageAlignmentScore > 0 && (
          <div className="w-full max-w-sm bg-elevated rounded-xl p-5 mb-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-ink">Alignment Score</h3>
                <p className="text-xs text-ink/50 mt-0.5">From previous scoring system</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif text-ink">
                  {Math.round(metrics.averageAlignmentScore)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bridge CTA - The vibration continues */}
        <AnimatePresence>
          {postScore !== null && onMeditateNow && (
            <motion.div
              className="w-full max-w-sm bg-accent/5 border border-accent/20 rounded-xl p-5 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
            >
              <h3 className="font-serif text-lg text-ink text-center mb-2">
                The Vibration Continues.
              </h3>
              <p className="text-sm text-ink/70 text-center leading-relaxed mb-4">
                Your nervous system just shifted. Extended exhale activated your parasympathetic
                response. Close your eyes. Let the resonance settle into silence.
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
        <div className="w-full max-w-sm space-y-3 mt-auto">
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

/**
 * Individual component progress bar with sublabel
 */
function ComponentBar({
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
          <span className="text-sm font-medium text-ink tabular-nums">{Math.round(percent)}%</span>
          <span className="text-[10px] text-ink/30">({weight}%)</span>
        </div>
      </div>
      <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: getScoreColor(percent) }}
        />
      </div>
    </div>
  )
}
