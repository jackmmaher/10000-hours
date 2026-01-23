/**
 * CoherenceScale - Vocal coherence visualization for Aum Coach
 *
 * Replaces FrequencyScale with a stability-focused metric.
 * Shows 0-100% coherence instead of Hz distance from target.
 *
 * Features:
 * - Full gradient bar from orange (low) to green (high)
 * - Percentage display with "Vocal Coherence" label
 * - Glow effect intensifies at higher coherence
 * - Theme-aware colors
 */

interface CoherenceScaleProps {
  coherence: number // 0-100
}

// Markers on the scale
const MARKERS = [0, 25, 50, 75, 100]

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
function getCoherenceLabel(coherence: number): string {
  if (coherence >= 90) return 'Excellent stability'
  if (coherence >= 75) return 'Great stability'
  if (coherence >= 60) return 'Good stability'
  if (coherence >= 45) return 'Building stability'
  if (coherence >= 30) return 'Finding rhythm'
  return 'Warming up'
}

export function CoherenceScale({ coherence }: CoherenceScaleProps) {
  // Calculate position as percentage (coherence already 0-100)
  const indicatorPosition = coherence

  const colorClass = getColorClass(coherence)
  const textColorClass = getTextColorClass(coherence)
  const glowIntensity = getGlowIntensity(coherence)
  const label = getCoherenceLabel(coherence)

  return (
    <div className="w-full px-2">
      {/* Coherence display with label */}
      <div className="flex flex-col items-center justify-center gap-1 mb-3">
        <span
          className={`text-2xl font-semibold tabular-nums ${textColorClass} transition-colors duration-150`}
        >
          {Math.round(coherence)}%
        </span>
        <span className="text-xs text-ink/50">Vocal Coherence</span>
      </div>

      {/* Scale container */}
      <div className="relative h-10">
        {/* Full gradient background */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-6 rounded-full overflow-hidden"
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
              className="absolute top-1/2 -translate-x-1/2 flex flex-col items-center"
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
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${Math.min(100, Math.max(0, indicatorPosition))}%`,
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
      </div>

      {/* Feedback label */}
      <p className="text-[10px] text-ink/30 text-center mt-1">{label}</p>
    </div>
  )
}
