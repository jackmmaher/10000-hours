/**
 * BreathPacerSetup - Pattern, duration, and theme selection
 *
 * Follows the established setup screen pattern (max-w-md mx-auto px-6 py-6).
 * No pre-session assessment — this tool is about simplicity.
 */

import { useState } from 'react'
import {
  BREATH_PATTERNS,
  BREATH_THEMES,
  type BreathPattern,
  type BreathTheme,
} from '../../lib/breathPatterns'

export type BreathDuration = 1 | 3 | 5 | 10

interface BreathPacerSetupProps {
  onBegin: (pattern: BreathPattern, duration: BreathDuration, theme: BreathTheme) => void
  isLoading?: boolean
}

const DURATION_OPTIONS: BreathDuration[] = [1, 3, 5, 10]

export function BreathPacerSetup({ onBegin, isLoading }: BreathPacerSetupProps) {
  const [selectedPattern, setSelectedPattern] = useState(BREATH_PATTERNS[0])
  const [selectedDuration, setSelectedDuration] = useState<BreathDuration>(3)
  const [selectedTheme, setSelectedTheme] = useState(BREATH_THEMES[0])

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col min-h-full w-full max-w-md mx-auto px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-ink mb-2">Breath Pacer</h1>
          <p className="text-sm text-ink/60">Follow the ball. Find your rhythm.</p>
        </div>

        {/* Pattern picker */}
        <div className="mb-6">
          <label className="text-xs font-medium tracking-wider uppercase text-ink/40 mb-3 block">
            Pattern
          </label>
          <div className="space-y-2">
            {BREATH_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={`w-full text-left rounded-xl p-4 transition-all ${
                  selectedPattern.id === pattern.id
                    ? 'bg-accent/10 ring-1 ring-accent/30'
                    : 'bg-elevated hover:bg-elevated/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm text-ink">{pattern.name}</span>
                      <span className="text-[10px] font-medium tracking-wider uppercase text-ink/30 bg-ink/5 px-1.5 py-0.5 rounded">
                        {pattern.category}
                      </span>
                    </div>
                    <p className="text-xs text-ink/50 font-mono">{pattern.subtitle}</p>
                    <p className="text-xs text-ink/40 mt-1 leading-relaxed">
                      {pattern.description}
                    </p>
                  </div>
                  {selectedPattern.id === pattern.id && (
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration picker */}
        <div className="mb-6">
          <label className="text-xs font-medium tracking-wider uppercase text-ink/40 mb-3 block">
            Duration
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedDuration === d
                    ? 'bg-accent text-white'
                    : 'bg-elevated text-ink/60 hover:text-ink'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Theme picker */}
        <div className="mb-8">
          <label className="text-xs font-medium tracking-wider uppercase text-ink/40 mb-3 block">
            Theme
          </label>
          <div className="flex gap-3">
            {BREATH_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-10 h-10 rounded-full transition-all ${
                    selectedTheme.id === theme.id
                      ? 'ring-2 ring-accent ring-offset-2 ring-offset-cream scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: theme.gradient }}
                />
                <span className="text-[10px] text-ink/40">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={() => onBegin(selectedPattern, selectedDuration, selectedTheme)}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-accent text-white font-medium text-base transition-all hover:bg-accent/90 disabled:opacity-50"
        >
          {isLoading ? 'Starting...' : 'Begin'}
        </button>
      </div>
    </div>
  )
}
