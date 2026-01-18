/**
 * VoiceBadge - Visual indicator of meditation experience
 *
 * Uses living theme accent color with opacity variations:
 * - High (70+): Full opacity + glow (earned distinction)
 * - Established (45-69): 85% opacity
 * - Growing (20-44): 70% opacity
 * - New (0-19): Muted/faded
 *
 * Design philosophy:
 * - Harmonizes with living theme (no jarring fixed colors)
 * - Dot count is primary signal (1-5 dots)
 * - Glow provides earned distinction for high scores
 * - Color intensity reinforces level without fighting theme
 *
 * Level progression:
 * - 0-19: 1 dot (new practitioner)
 * - 20-44: 2 dots (growing)
 * - 45-69: 3-4 dots (established)
 * - 70+: 5 dots + glow (high voice)
 */

import { getVoiceVisual, VoiceLevel, getVoiceTier } from '../lib/voice'

/**
 * Get dot color with opacity based on voice level
 * Uses --accent from living theme with varying intensity
 */
function getVoiceDotStyle(level: VoiceLevel): string {
  switch (level) {
    case 'high':
      return 'var(--accent)' // Full intensity + glow handles distinction
    case 'established':
      return 'color-mix(in srgb, var(--accent) 85%, transparent)'
    case 'growing':
      return 'color-mix(in srgb, var(--accent) 70%, transparent)'
    case 'new':
    default:
      return 'var(--text-muted, rgba(0,0,0,0.3))'
  }
}

/**
 * Get text color with appropriate contrast for each level
 */
function getVoiceTextStyle(level: VoiceLevel): string {
  switch (level) {
    case 'high':
    case 'established':
      return 'var(--text-primary, #1a1a1a)'
    case 'growing':
    case 'new':
    default:
      return 'var(--text-secondary, #6B7280)'
  }
}

interface VoiceBadgeProps {
  score: number
  /** Show numeric score alongside dots */
  showScore?: boolean
  /** Show tier label (e.g., "Practitioner", "Mentor") */
  showLabel?: boolean
  /** Compact mode for tight spaces */
  compact?: boolean
}

export function VoiceBadge({
  score,
  showScore = false,
  showLabel = false,
  compact = false,
}: VoiceBadgeProps) {
  const visual = getVoiceVisual(score)
  const tier = getVoiceTier(score)

  // Glow intensity based on level - only high scores get glow
  const glowStyle =
    visual.glow !== 'none'
      ? {
          boxShadow: `0 0 ${visual.glow === 'strong' ? '12px' : visual.glow === 'medium' ? '8px' : '4px'} var(--accent-glow, rgba(0,0,0,0.1))`,
        }
      : {}

  const dotSize = compact ? 'w-1 h-1' : 'w-1.5 h-1.5'
  const gap = compact ? 'gap-0.5' : 'gap-1'
  const padding = compact ? 'px-1.5 py-0.5' : 'px-2 py-1'

  // Background style - use color-mix for opacity (Tailwind opacity modifiers don't work with CSS vars)
  const bgStyle =
    visual.level === 'high'
      ? { backgroundColor: 'var(--bg-elevated)' }
      : visual.level === 'established'
        ? { backgroundColor: 'color-mix(in srgb, var(--bg-elevated) 90%, transparent)' }
        : { backgroundColor: 'color-mix(in srgb, var(--bg-elevated) 80%, transparent)' }

  // Shadow class only for high voice
  const shadowClass = visual.level === 'high' ? 'shadow-sm' : ''

  return (
    <div
      className={`
        inline-flex items-center ${gap} ${padding} rounded-full
        ${shadowClass}
        transition-all duration-500
      `}
      style={{ ...glowStyle, ...bgStyle }}
    >
      {/* Dot pattern */}
      <div className={`flex items-center ${gap}`}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`${dotSize} rounded-full transition-all duration-500`}
            style={{
              backgroundColor:
                dot <= visual.dots
                  ? getVoiceDotStyle(visual.level)
                  : 'var(--border-subtle, rgba(0,0,0,0.1))',
            }}
          />
        ))}
      </div>

      {/* Optional tier label */}
      {showLabel && (
        <span
          className="text-[10px] font-medium ml-1"
          style={{ color: getVoiceTextStyle(visual.level) }}
        >
          {tier.label}
        </span>
      )}

      {/* Optional numeric score */}
      {showScore && (
        <span
          className="text-[10px] tabular-nums font-medium ml-1"
          style={{ color: getVoiceTextStyle(visual.level) }}
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
  const glowStyle =
    visual.glow !== 'none'
      ? {
          boxShadow: `0 0 ${visual.glow === 'strong' ? '12px' : visual.glow === 'medium' ? '8px' : '4px'} var(--accent-glow, rgba(0,0,0,0.1))`,
        }
      : {}

  // Background style - use color-mix for opacity (Tailwind opacity modifiers don't work with CSS vars)
  const bgStyle =
    visual.level === 'high'
      ? { backgroundColor: 'var(--bg-elevated)' }
      : visual.level === 'established'
        ? { backgroundColor: 'color-mix(in srgb, var(--bg-elevated) 90%, transparent)' }
        : { backgroundColor: 'color-mix(in srgb, var(--bg-elevated) 80%, transparent)' }

  // Shadow class only for high voice
  const shadowClass = visual.level === 'high' ? 'shadow-sm' : ''

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        ${shadowClass}
        transition-all duration-500
      `}
      style={{ ...glowStyle, ...bgStyle }}
    >
      {/* Dot pattern */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className="w-1 h-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor:
                dot <= visual.dots
                  ? getVoiceDotStyle(visual.level)
                  : 'var(--border-subtle, rgba(0,0,0,0.1))',
            }}
          />
        ))}
      </div>

      {/* Voice score display */}
      <span
        className="text-[10px] tabular-nums font-medium"
        style={{ color: getVoiceTextStyle(visual.level) }}
      >
        {score}
      </span>
    </div>
  )
}
