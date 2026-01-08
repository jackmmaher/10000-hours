/**
 * VoiceBadge - Visual indicator of meditation credibility
 *
 * Displays Voice score as a dot pattern with subtle color/glow treatment.
 * Compact enough for feed cards, meaningful enough to spot differences.
 *
 * Visual language:
 * - Dots: 1-5 filled circles showing score range
 * - Color: Neutral → Green → Amber progression (via Living Theme CSS variables)
 * - Glow: Subtle luminosity for high scores (earned, not given)
 *
 * Styling now uses CSS variables from the Living Theme system:
 * - --voice-{level}-bg: Background color
 * - --voice-{level}-text: Text color
 * - --voice-{level}-dot: Dot fill color
 */

import { getVoiceVisual, VoiceLevel } from '../lib/voice'

interface VoiceBadgeProps {
  score: number
  /** Show numeric score alongside dots */
  showScore?: boolean
  /** Compact mode for tight spaces */
  compact?: boolean
}

/**
 * Get CSS variable values for a voice level
 */
function getVoiceStyles(level: VoiceLevel) {
  return {
    bg: `var(--voice-${level}-bg)`,
    text: `var(--voice-${level}-text)`,
    dot: `var(--voice-${level}-dot)`
  }
}

export function VoiceBadge({ score, showScore = false, compact = false }: VoiceBadgeProps) {
  const visual = getVoiceVisual(score)
  const colors = getVoiceStyles(visual.level)

  // Glow styles for high scorers - use theme-aware amber glow
  const glowStyles = {
    none: {},
    subtle: { boxShadow: '0 0 4px var(--voice-high-dot, rgba(180,160,100,0.2))' },
    medium: { boxShadow: '0 0 6px var(--voice-high-dot, rgba(180,160,100,0.3))' },
    strong: { boxShadow: '0 0 8px var(--voice-high-dot, rgba(180,160,100,0.4))' }
  }

  const dotSize = compact ? 'w-1 h-1' : 'w-1.5 h-1.5'
  const gap = compact ? 'gap-0.5' : 'gap-1'
  const padding = compact ? 'px-1.5 py-0.5' : 'px-2 py-1'

  return (
    <div
      className={`inline-flex items-center ${gap} ${padding} rounded-full transition-all duration-300`}
      style={{
        backgroundColor: colors.bg,
        ...glowStyles[visual.glow]
      }}
    >
      {/* Dot pattern */}
      <div className={`flex items-center ${gap}`}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`${dotSize} rounded-full transition-colors duration-300`}
            style={{
              backgroundColor: dot <= visual.dots ? colors.dot : 'var(--border-subtle, rgba(0,0,0,0.1))'
            }}
          />
        ))}
      </div>

      {/* Optional numeric score */}
      {showScore && (
        <span
          className="text-[10px] tabular-nums font-medium ml-1"
          style={{ color: colors.text }}
        >
          {score}
        </span>
      )}
    </div>
  )
}

/**
 * VoiceBadgeWithHours - Badge variant that shows Voice score prominently
 * For Explore feed cards and SessionCard
 */
interface VoiceBadgeWithScoreProps {
  score: number
}

export function VoiceBadgeWithHours({ score }: VoiceBadgeWithScoreProps) {
  const visual = getVoiceVisual(score)
  const colors = getVoiceStyles(visual.level)

  // Glow styles for high scorers - use theme-aware amber glow
  const glowStyles = {
    none: {},
    subtle: { boxShadow: '0 0 4px var(--voice-high-dot, rgba(180,160,100,0.2))' },
    medium: { boxShadow: '0 0 6px var(--voice-high-dot, rgba(180,160,100,0.3))' },
    strong: { boxShadow: '0 0 8px var(--voice-high-dot, rgba(180,160,100,0.4))' }
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300"
      style={{
        backgroundColor: colors.bg,
        ...glowStyles[visual.glow]
      }}
    >
      {/* Dot pattern */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className="w-1 h-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: dot <= visual.dots ? colors.dot : 'var(--border-subtle, rgba(0,0,0,0.1))'
            }}
          />
        ))}
      </div>

      {/* Voice score display */}
      <span
        className="text-[10px] tabular-nums font-medium"
        style={{ color: colors.text }}
      >
        {score}
      </span>
    </div>
  )
}
