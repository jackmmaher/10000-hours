/**
 * FrequencyScale - Gradient frequency scale for Aum Coach
 *
 * Features:
 * - Gradient color based on proximity to 130 Hz target
 * - Accuracy percentage display
 * - Glow effect intensifies near target
 * - Theme-aware colors
 */

import { OPTIMAL_NO_FREQUENCY } from '../../hooks/usePitchDetection'

interface FrequencyScaleProps {
  frequency: number | null
  isWithinTolerance: boolean
}

// Frequency range
const FREQ_MIN = 100
const FREQ_MAX = 160
const TARGET = OPTIMAL_NO_FREQUENCY // 130 Hz

// Markers
const MARKERS = [100, 115, 130, 145, 160]

/**
 * Calculate accuracy percentage based on distance from target
 * 130 Hz = 100%, 100 Hz or 160 Hz = 0%
 */
function calculateAccuracy(frequency: number): number {
  const distance = Math.abs(frequency - TARGET)
  const maxDistance = 30 // 30 Hz from target = 0%
  return Math.max(0, Math.round(100 - (distance / maxDistance) * 100))
}

/**
 * Get color class based on accuracy
 */
function getColorClass(accuracy: number): string {
  if (accuracy >= 95) return 'bg-green-500' // Perfect
  if (accuracy >= 80) return 'bg-green-400' // Excellent
  if (accuracy >= 65) return 'bg-lime-400' // Good
  if (accuracy >= 50) return 'bg-yellow-400' // Close
  if (accuracy >= 30) return 'bg-orange-400' // Keep adjusting
  return 'bg-ink/30' // Find it
}

/**
 * Get text color class based on accuracy
 */
function getTextColorClass(accuracy: number): string {
  if (accuracy >= 95) return 'text-green-500'
  if (accuracy >= 80) return 'text-green-400'
  if (accuracy >= 65) return 'text-lime-500'
  if (accuracy >= 50) return 'text-yellow-500'
  if (accuracy >= 30) return 'text-orange-400'
  return 'text-ink/50'
}

/**
 * Get glow intensity based on accuracy (0-1)
 */
function getGlowIntensity(accuracy: number): number {
  if (accuracy >= 80) return 1
  if (accuracy >= 50) return 0.6
  if (accuracy >= 30) return 0.3
  return 0
}

export function FrequencyScale({
  frequency,
  isWithinTolerance: _isWithinTolerance,
}: FrequencyScaleProps) {
  // Calculate position as percentage
  const getPosition = (freq: number): number => {
    const clamped = Math.max(FREQ_MIN, Math.min(FREQ_MAX, freq))
    return ((clamped - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * 100
  }

  const indicatorPosition = frequency !== null ? getPosition(frequency) : null
  const accuracy = frequency !== null ? calculateAccuracy(frequency) : 0
  const colorClass = frequency !== null ? getColorClass(accuracy) : 'bg-ink/30'
  const textColorClass = frequency !== null ? getTextColorClass(accuracy) : 'text-ink/50'
  const glowIntensity = frequency !== null ? getGlowIntensity(accuracy) : 0

  // Target zone highlight (visual gradient background)
  const targetStart = getPosition(TARGET - 15) // Wider visual zone
  const targetEnd = getPosition(TARGET + 15)
  const targetWidth = targetEnd - targetStart

  return (
    <div className="w-full px-2">
      {/* Frequency display with accuracy */}
      {frequency !== null && (
        <div className="flex items-baseline justify-center gap-2 mb-3">
          <span
            className={`text-2xl font-semibold tabular-nums ${textColorClass} transition-colors duration-150`}
          >
            {Math.round(frequency)} Hz
          </span>
          <span className={`text-sm font-medium ${textColorClass} transition-colors duration-150`}>
            ({accuracy}%)
          </span>
        </div>
      )}

      {frequency === null && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl text-ink/30">— Hz</span>
        </div>
      )}

      {/* Scale container */}
      <div className="relative h-10">
        {/* Gradient background showing target zone */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-6 rounded-full overflow-hidden"
          style={{
            left: `${targetStart}%`,
            width: `${targetWidth}%`,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.15) 30%, rgba(34, 197, 94, 0.25) 50%, rgba(34, 197, 94, 0.15) 70%, transparent 100%)',
          }}
        />

        {/* Scale line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-ink/10 rounded-full" />

        {/* Markers */}
        {MARKERS.map((freq) => {
          const position = getPosition(freq)
          const isTarget = freq === TARGET

          return (
            <div
              key={freq}
              className="absolute top-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${position}%` }}
            >
              {/* Tick */}
              <div
                className={`w-px ${isTarget ? 'h-4 bg-green-500' : 'h-2 bg-ink/20'}`}
                style={{ marginTop: isTarget ? '-8px' : '-4px' }}
              />
              {/* Label */}
              <span
                className={`text-[10px] mt-1.5 tabular-nums ${
                  isTarget ? 'font-bold text-green-500' : 'text-ink/40'
                }`}
              >
                {freq}
              </span>
            </div>
          )
        })}

        {/* Current frequency indicator */}
        {indicatorPosition !== null && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${indicatorPosition}%`,
              transition: 'left 75ms ease-out',
            }}
          >
            {/* Glow effect */}
            {glowIntensity > 0 && (
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
                  glowIntensity > 0.5
                    ? `0 0 12px rgba(34, 197, 94, ${glowIntensity * 0.6}), 0 2px 8px rgba(0,0,0,0.15)`
                    : '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        )}
      </div>

      {/* Target hint */}
      <p className="text-[10px] text-ink/30 text-center mt-1">Target: {TARGET} Hz</p>
    </div>
  )
}
