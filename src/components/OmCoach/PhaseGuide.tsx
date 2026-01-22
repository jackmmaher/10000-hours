/**
 * PhaseGuide - Simple phase indicator strip
 *
 * Human-Crafted Design applied:
 * - Clean, minimal design without decorative arrows
 * - Theme-aware colors only (no hardcoded blues)
 * - Clear visual hierarchy
 * - Consistent spacing from scale
 * - Shows time remaining for each phase
 */

import { type CyclePhase, type TimingMode, getPhaseDurations } from '../../hooks/useGuidedOmCycle'

interface PhaseGuideProps {
  currentPhase: CyclePhase
  phaseProgress: number // 0-1
  phaseTimeRemainingMs: number | null
  timingMode: TimingMode
}

// Phase configuration
const VOCAL_PHASES: { key: 'ah' | 'oo' | 'mm'; label: string }[] = [
  { key: 'ah', label: 'Ah' },
  { key: 'oo', label: 'Oo' },
  { key: 'mm', label: 'Mm' },
]

function formatSeconds(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  return `${seconds}s`
}

export function PhaseGuide({
  currentPhase,
  phaseProgress,
  phaseTimeRemainingMs,
  timingMode,
}: PhaseGuideProps) {
  const isBreathing = currentPhase === 'breathe'
  const phaseDurations = getPhaseDurations(timingMode)

  // Determine which phases are completed in this cycle
  const getPhaseState = (phaseKey: 'ah' | 'oo' | 'mm'): 'active' | 'done' | 'upcoming' => {
    if (isBreathing) return 'upcoming'
    if (currentPhase === phaseKey) return 'active'
    if (currentPhase === 'oo' && phaseKey === 'ah') return 'done'
    if (currentPhase === 'mm' && (phaseKey === 'ah' || phaseKey === 'oo')) return 'done'
    return 'upcoming'
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Breathe indicator - shows during breathe phase */}
      {isBreathing && (
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-elevated">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-ink">Breathe in</span>
            {phaseTimeRemainingMs !== null && (
              <span className="text-xs text-ink/50 tabular-nums ml-1">
                {formatSeconds(phaseTimeRemainingMs)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Phase strip - always visible */}
      <div className="flex gap-2">
        {VOCAL_PHASES.map((phase) => {
          const state = getPhaseState(phase.key)
          const isActive = state === 'active'
          const isDone = state === 'done'
          const phaseDuration = phaseDurations[phase.key]

          return (
            <div
              key={phase.key}
              className={`flex-1 relative rounded-xl overflow-hidden transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 ring-1 ring-accent/30'
                  : isDone
                    ? 'bg-success-bg'
                    : 'bg-elevated'
              }`}
            >
              {/* Progress fill for active phase */}
              {isActive && (
                <div
                  className="absolute inset-0 bg-accent/15 origin-left"
                  style={{
                    transform: `scaleX(${phaseProgress})`,
                    transition: 'transform 100ms linear',
                  }}
                />
              )}

              {/* Content */}
              <div className="relative px-3 py-3 text-center">
                <div
                  className={`text-lg font-semibold transition-colors ${
                    isActive ? 'text-accent' : isDone ? 'text-success-icon' : 'text-ink/60'
                  }`}
                >
                  {phase.label}
                </div>

                <div
                  className={`text-xs tabular-nums mt-0.5 ${
                    isActive ? 'text-accent/70' : 'text-ink/40'
                  }`}
                >
                  {isActive && phaseTimeRemainingMs !== null
                    ? formatSeconds(phaseTimeRemainingMs)
                    : `${phaseDuration / 1000}s`}
                </div>

                {/* Checkmark for done phases */}
                {isDone && (
                  <div className="absolute top-1.5 right-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-success-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Target frequency hint - subtle */}
      <p className="text-xs text-ink/40 text-center mt-2">Target: 130 Hz for all sounds</p>
    </div>
  )
}
