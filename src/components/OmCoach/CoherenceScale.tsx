/**
 * CoherenceScale - Vocal coherence visualization for Aum Coach
 *
 * Enhanced with:
 * - Freezes display during breathe phase (shows last score or "—")
 * - "Begin..." cue 1.5s before Ah starts
 * - Smooth transitions between states
 *
 * Features:
 * - Full gradient bar from orange (low) to green (high)
 * - Percentage display with "Vocal Coherence" label
 * - Glow effect intensifies at higher coherence
 * - Theme-aware colors
 */

import { useState, useEffect, useRef } from 'react'
import type { CyclePhase } from '../../hooks/useGuidedOmCycle'

interface CoherenceScaleProps {
  coherence: number // 0-100
  currentPhase: CyclePhase
  phaseTimeRemainingMs: number | null // Time left in current phase
}

// Markers on the scale
const MARKERS = [0, 25, 50, 75, 100]

// Time before Ah to show "Begin..." cue (ms)
const BEGIN_CUE_DURATION_MS = 1500

/**
 * Get color class based on coherence percentage
 */
function getColorClass(coherence: number): string {
  if (coherence >= 90) return 'bg-green-500' // Excellent
  if (coherence >= 75) return 'bg-green-400' // Great
  if (coherence >= 60) return 'bg-lime-400' // Good
  if (coherence >= 45) return 'bg-yellow-400' // Building
  if (coherence >= 30) return 'bg-orange-400' // Finding rhythm
  return 'bg-ink/30' // Warming up
}

/**
 * Get text color class based on coherence
 */
function getTextColorClass(coherence: number): string {
  if (coherence >= 90) return 'text-green-500'
  if (coherence >= 75) return 'text-green-400'
  if (coherence >= 60) return 'text-lime-500'
  if (coherence >= 45) return 'text-yellow-500'
  if (coherence >= 30) return 'text-orange-400'
  return 'text-ink/50'
}

/**
 * Get glow intensity based on coherence (0-1)
 */
function getGlowIntensity(coherence: number): number {
  if (coherence >= 75) return 1
  if (coherence >= 50) return 0.6
  if (coherence >= 30) return 0.3
  return 0
}

/**
 * Get feedback label for coherence level
 */
function getCoherenceLabel(coherence: number, isBreathing: boolean, showBeginCue: boolean): string {
  if (showBeginCue) return 'Begin chanting...'
  if (isBreathing) return 'Breathe in deeply'
  if (coherence >= 90) return 'Excellent stability'
  if (coherence >= 75) return 'Great stability'
  if (coherence >= 60) return 'Good stability'
  if (coherence >= 45) return 'Building stability'
  if (coherence >= 30) return 'Finding rhythm'
  return 'Warming up'
}

export function CoherenceScale({
  coherence,
  currentPhase,
  phaseTimeRemainingMs,
}: CoherenceScaleProps) {
  const isBreathing = currentPhase === 'breathe'

  // Track last valid coherence score to display during breathe
  const lastValidScoreRef = useRef<number>(50) // Start at neutral 50
  const [displayScore, setDisplayScore] = useState<number>(50)

  // Determine if we should show the "Begin..." cue
  const showBeginCue =
    isBreathing && phaseTimeRemainingMs !== null && phaseTimeRemainingMs <= BEGIN_CUE_DURATION_MS

  // Update display score logic
  useEffect(() => {
    if (isBreathing) {
      // During breathe phase, keep showing the last valid score (frozen)
      // But if it's a new session (coherence is 0 and lastValid is still 50), show 50
      // This prevents jarring 0% display
    } else {
      // During vocal phases, update to current coherence
      if (coherence > 0) {
        lastValidScoreRef.current = coherence
        setDisplayScore(coherence)
      } else if (lastValidScoreRef.current > 0) {
        // If coherence is 0 but we have a last valid, use that briefly
        setDisplayScore(lastValidScoreRef.current)
      }
    }
  }, [coherence, isBreathing])

  // Reset last valid score at end of Mm (start of new cycle)
  useEffect(() => {
    if (currentPhase === 'breathe') {
      // Keep frozen at last score
    }
  }, [currentPhase])

  // Calculate visual state
  const scoreToShow = isBreathing ? lastValidScoreRef.current : displayScore
  const indicatorPosition = scoreToShow

  const colorClass = isBreathing ? 'bg-ink/30' : getColorClass(scoreToShow)
  const textColorClass = isBreathing ? 'text-ink/40' : getTextColorClass(scoreToShow)
  const glowIntensity = isBreathing ? 0 : getGlowIntensity(scoreToShow)
  const label = getCoherenceLabel(scoreToShow, isBreathing, showBeginCue)

  return (
    <div className="w-full px-2">
      {/* Coherence display with label */}
      <div className="flex flex-col items-center justify-center gap-1 mb-3">
        {isBreathing ? (
          // During breathe phase, show frozen score with visual dimming
          <span
            className={`text-2xl font-semibold tabular-nums transition-all duration-300 ${
              showBeginCue ? 'text-accent animate-pulse' : 'text-ink/30'
            }`}
          >
            {showBeginCue ? '...' : `${Math.round(lastValidScoreRef.current)}%`}
          </span>
        ) : (
          <span
            className={`text-2xl font-semibold tabular-nums ${textColorClass} transition-colors duration-150`}
          >
            {Math.round(displayScore)}%
          </span>
        )}
        <span className="text-xs text-ink/50">Vocal Coherence</span>
      </div>

      {/* Scale container */}
      <div className="relative h-10">
        {/* Full gradient background */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 left-0 right-0 h-6 rounded-full overflow-hidden transition-opacity duration-300 ${
            isBreathing ? 'opacity-30' : 'opacity-100'
          }`}
          style={{
            background:
              'linear-gradient(90deg, rgba(251, 146, 60, 0.15) 0%, rgba(250, 204, 21, 0.15) 35%, rgba(163, 230, 53, 0.15) 60%, rgba(34, 197, 94, 0.25) 100%)',
          }}
        />

        {/* Scale line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-ink/10 rounded-full" />

        {/* Markers */}
        {MARKERS.map((value) => {
          const position = value
          const isHighlight = value === 75 // Highlight the "good" threshold

          return (
            <div
              key={value}
              className={`absolute top-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-300 ${
                isBreathing ? 'opacity-30' : 'opacity-100'
              }`}
              style={{ left: `${position}%` }}
            >
              {/* Tick */}
              <div
                className={`w-px ${isHighlight ? 'h-4 bg-green-500/50' : 'h-2 bg-ink/20'}`}
                style={{ marginTop: isHighlight ? '-8px' : '-4px' }}
              />
              {/* Label */}
              <span
                className={`text-[10px] mt-1.5 tabular-nums ${
                  isHighlight ? 'font-medium text-green-500/70' : 'text-ink/40'
                }`}
              >
                {value}
              </span>
            </div>
          )
        })}

        {/* Current coherence indicator */}
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
            isBreathing ? 'opacity-40' : 'opacity-100'
          }`}
          style={{
            left: `${Math.min(100, Math.max(0, indicatorPosition))}%`,
            transition: 'left 150ms ease-out, opacity 300ms ease-out',
          }}
        >
          {/* Glow effect */}
          {glowIntensity > 0 && !isBreathing && (
            <div
              className={`absolute inset-0 rounded-full ${colorClass} blur-md`}
              style={{
                opacity: glowIntensity * 0.5,
                transform: 'scale(2)',
              }}
            />
          )}
          {/* Main indicator */}
          <div
            className={`relative w-5 h-5 rounded-full border-2 border-white shadow-lg ${colorClass} transition-colors duration-150`}
            style={{
              boxShadow:
                glowIntensity > 0.5 && !isBreathing
                  ? `0 0 12px rgba(34, 197, 94, ${glowIntensity * 0.6}), 0 2px 8px rgba(0,0,0,0.15)`
                  : '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
        </div>
      </div>

      {/* Feedback label */}
      <p
        className={`text-[10px] text-center mt-1 transition-colors duration-300 ${
          showBeginCue ? 'text-accent font-medium' : 'text-ink/30'
        }`}
      >
        {label}
      </p>
    </div>
  )
}
