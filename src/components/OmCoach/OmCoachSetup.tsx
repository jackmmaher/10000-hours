/**
 * OmCoachSetup - Pre-session setup screen for Aum Coach
 *
 * Features:
 * - Duration picker (5/10/15 min)
 * - Timing mode selector (Traditional/Extended/Flexible)
 * - Dynamic cycle count based on mode
 * - Instructions for A-U-M practice
 */

import { useState } from 'react'
import { OPTIMAL_NO_FREQUENCY } from '../../hooks/usePitchDetection'
import {
  type SessionDuration,
  type TimingMode,
  getSessionCycles,
  getCycleDuration,
} from '../../hooks/useGuidedOmCycle'

interface OmCoachSetupProps {
  onBegin: (duration: SessionDuration, mode: TimingMode) => void
  isLoading?: boolean
  error?: string | null
}

const DURATIONS: SessionDuration[] = [5, 10, 15]

const TIMING_MODE_INFO: Record<
  TimingMode,
  {
    label: string
    description: string
  }
> = {
  traditional: {
    label: 'Traditional',
    description: 'Guided timing (3s-3s-6s)',
  },
  extended: {
    label: 'Extended',
    description: 'Longer holds (4s-4s-8s)',
  },
  flexible: {
    label: 'Flexible',
    description: 'Self-paced, app follows you',
  },
}

export function OmCoachSetup({ onBegin, isLoading, error }: OmCoachSetupProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(5)
  const [selectedMode, setSelectedMode] = useState<TimingMode>('traditional')

  const estimatedCycles = getSessionCycles(selectedDuration, selectedMode)
  const cycleDuration = getCycleDuration(selectedMode)
  const cycleDurationSec = cycleDuration > 0 ? Math.round(cycleDuration / 1000) : null

  return (
    <div className="flex flex-col h-full">
      {/* Centered container with max-width */}
      <div className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-ink mb-2">Aum Coach</h1>
          <p className="text-sm text-ink/60">Guided A-U-M practice with real-time feedback</p>
        </div>

        {/* Instructions */}
        <div className="bg-elevated rounded-xl p-4 mb-6">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">1</span>
              </div>
              <p className="text-sm text-ink">Follow the phases: Breathe → Ah → Oo → Mm</p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">2</span>
              </div>
              <p className="text-sm text-ink">
                Match your pitch to ~{OPTIMAL_NO_FREQUENCY} Hz for all sounds
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-accent">3</span>
              </div>
              <p className="text-sm text-ink">Complete cycles to build your alignment score</p>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-xs text-accent hover:underline"
          >
            {showDetails ? 'Hide' : 'Show'} science
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-base rounded-lg">
              <p className="text-xs text-ink/70 leading-relaxed">
                Humming at ~130 Hz increases nasal nitric oxide production 15-20x. Extended
                exhalation activates the parasympathetic nervous system. The A-U-M sequence engages
                different vocal resonances for full benefit.
              </p>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Timing Mode Picker */}
        <div className="mb-4">
          <p className="text-xs text-ink/50 mb-2 text-center uppercase tracking-wide">
            Timing Mode
          </p>
          <div className="flex gap-2">
            {(Object.keys(TIMING_MODE_INFO) as TimingMode[]).map((mode) => {
              const info = TIMING_MODE_INFO[mode]
              const isSelected = selectedMode === mode

              return (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex-1 py-2.5 px-2 rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-accent text-white'
                      : 'bg-elevated text-ink hover:bg-elevated/80'
                  }`}
                >
                  <div className="text-sm font-medium">{info.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-ink/50'}`}
                  >
                    {info.description}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration picker */}
        <div className="mb-4">
          <p className="text-xs text-ink/50 mb-2 text-center uppercase tracking-wide">Duration</p>
          <div className="flex gap-2">
            {DURATIONS.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`flex-1 py-3 rounded-xl transition-colors ${
                  selectedDuration === duration
                    ? 'bg-accent text-white'
                    : 'bg-elevated text-ink hover:bg-elevated/80'
                }`}
              >
                <div className="text-xl font-semibold">{duration}</div>
                <div
                  className={`text-xs ${
                    selectedDuration === duration ? 'text-white/70' : 'text-ink/50'
                  }`}
                >
                  min
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink/40 mt-2 text-center">
            {selectedMode === 'flexible' ? (
              <>~{estimatedCycles} cycles (self-paced)</>
            ) : (
              <>
                {estimatedCycles} cycles ({cycleDurationSec}s each)
              </>
            )}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => onBegin(selectedDuration, selectedMode)}
          disabled={isLoading}
          className="w-full h-14 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Starting...' : 'Begin Practice'}
        </button>

        <p className="text-xs text-ink/40 mt-3 text-center">Requires microphone access</p>
      </div>
    </div>
  )
}
