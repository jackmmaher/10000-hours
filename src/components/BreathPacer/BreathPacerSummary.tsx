/**
 * BreathPacerSummary - Post-session results + bridge to meditation
 *
 * Shows pattern name, duration, completed cycles.
 * Primary CTA bridges to meditation timer.
 */

import { type BreathPattern, formatTimeDisplay } from '../../lib/breathPatterns'

interface BreathPacerSummaryProps {
  pattern: BreathPattern
  durationSeconds: number
  completedCycles: number
  onMeditateNow: () => void
  onPracticeAgain: () => void
  onClose: () => void
}

export function BreathPacerSummary({
  pattern,
  durationSeconds,
  completedCycles,
  onMeditateNow,
  onPracticeAgain,
  onClose,
}: BreathPacerSummaryProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
        {/* Title */}
        <div className="text-center mb-8 pt-4">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-ink mb-1">Session Complete</h1>
          <p className="text-sm text-ink/50">{pattern.name}</p>
        </div>

        {/* Stats */}
        <div className="bg-elevated rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-serif text-ink">{formatTimeDisplay(durationSeconds)}</p>
              <p className="text-xs text-ink/40 mt-1">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif text-ink">{completedCycles}</p>
              <p className="text-xs text-ink/40 mt-1">Cycles</p>
            </div>
          </div>
        </div>

        {/* Bridge card */}
        <div className="bg-accent/5 border border-accent/10 rounded-xl p-5 mb-8">
          <p className="text-sm text-ink/70 leading-relaxed text-center">
            Your nervous system is primed.
            <br />
            <span className="text-ink/50">
              This is the ideal moment to begin a silent meditation.
            </span>
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={onMeditateNow}
            className="w-full py-4 rounded-2xl bg-accent text-white font-medium text-base transition-all hover:bg-accent/90"
          >
            Begin Meditation
          </button>
          <div className="flex gap-3">
            <button
              onClick={onPracticeAgain}
              className="flex-1 py-3 rounded-xl bg-elevated text-ink/60 text-sm font-medium hover:text-ink transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-elevated text-ink/60 text-sm font-medium hover:text-ink transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
