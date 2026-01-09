/**
 * VoiceBadge - Visual indicator of meditation experience
 *
 * Integrated with the Living Theme system - colors shift naturally
 * with the sun position, using the same visual language as cards.
 *
 * Design philosophy:
 * - Glassmorphic background (matches cards)
 * - Text color from theme (--text-secondary)
 * - Dots use theme accent color
 * - Progression through intensity, not distinct hues
 * - High scores earn a subtle glow (using --accent-glow)
 *
 * Level progression:
 * - 0-19: 1 dot (new practitioner)
 * - 20-44: 2 dots (growing)
 * - 45-69: 3-4 dots (established)
 * - 70+: 5 dots + glow (high voice)
 */

import { getVoiceVisual } from '../lib/voice'

interface VoiceBadgeProps {
  score: number
  /** Show numeric score alongside dots */
  showScore?: boolean
  /** Compact mode for tight spaces */
  compact?: boolean
}

export function VoiceBadge({ score, showScore = false, compact = false }: VoiceBadgeProps) {
  const visual = getVoiceVisual(score)

  // Glow intensity based on level - only high scores get glow
  const glowStyle = visual.glow !== 'none'
    ? { boxShadow: `0 0 ${visual.glow === 'strong' ? '12px' : visual.glow === 'medium' ? '8px' : '4px'} var(--accent-glow, rgba(0,0,0,0.1))` }
    : {}

  const dotSize = compact ? 'w-1 h-1' : 'w-1.5 h-1.5'
  const gap = compact ? 'gap-0.5' : 'gap-1'
  const padding = compact ? 'px-1.5 py-0.5' : 'px-2 py-1'

  // Background classes - uses theme's card background with glassmorphism
  const bgClass = visual.level === 'high'
    ? 'bg-card/70'
    : visual.level === 'established'
      ? 'bg-card/60'
      : 'bg-card/50'

  return (
    <div
      className={`
        inline-flex items-center ${gap} ${padding} rounded-full
        ${bgClass} backdrop-blur-sm border border-ink/5
        transition-all duration-500
      `}
      style={glowStyle}
    >
      {/* Dot pattern */}
      <div className={`flex items-center ${gap}`}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`${dotSize} rounded-full transition-all duration-500`}
            style={{
              backgroundColor: dot <= visual.dots
                ? 'var(--accent, #7C9A6E)'
                : 'var(--border-subtle, rgba(0,0,0,0.1))'
            }}
          />
        ))}
      </div>

      {/* Optional numeric score */}
      {showScore && (
        <span
          className="text-[10px] tabular-nums font-medium ml-1"
          style={{ color: 'var(--text-secondary, #6B7280)' }}
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

  // Glow intensity based on level - only high scores get glow
  const glowStyle = visual.glow !== 'none'
    ? { boxShadow: `0 0 ${visual.glow === 'strong' ? '12px' : visual.glow === 'medium' ? '8px' : '4px'} var(--accent-glow, rgba(0,0,0,0.1))` }
    : {}

  // Background classes - uses theme's card background with glassmorphism
  const bgClass = visual.level === 'high'
    ? 'bg-card/70'
    : visual.level === 'established'
      ? 'bg-card/60'
      : 'bg-card/50'

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        ${bgClass} backdrop-blur-sm border border-ink/5
        transition-all duration-500
      `}
      style={glowStyle}
    >
      {/* Dot pattern */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className="w-1 h-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: dot <= visual.dots
                ? 'var(--accent, #7C9A6E)'
                : 'var(--border-subtle, rgba(0,0,0,0.1))'
            }}
          />
        ))}
      </div>

      {/* Voice score display */}
      <span
        className="text-[10px] tabular-nums font-medium"
        style={{ color: 'var(--text-secondary, #6B7280)' }}
      >
        {score}
      </span>
    </div>
  )
}
