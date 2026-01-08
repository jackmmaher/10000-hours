/**
 * VoiceBadge - Visual indicator of meditation credibility
 *
 * Displays Voice score as a dot pattern with subtle color/glow treatment.
 * Compact enough for feed cards, meaningful enough to spot differences.
 *
 * Visual language:
 * - Dots: 1-5 filled circles showing score range
 * - Color: Neutral → Green → Amber progression
 * - Glow: Subtle luminosity for high scores (earned, not given)
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

  // Glow styles for high scorers
  const glowStyles = {
    none: '',
    subtle: 'shadow-[0_0_4px_rgba(180,160,100,0.2)]',
    medium: 'shadow-[0_0_6px_rgba(180,160,100,0.3)]',
    strong: 'shadow-[0_0_8px_rgba(180,160,100,0.4)]'
  }

  const dotSize = compact ? 'w-1 h-1' : 'w-1.5 h-1.5'
  const gap = compact ? 'gap-0.5' : 'gap-1'
  const padding = compact ? 'px-1.5 py-0.5' : 'px-2 py-1'

  return (
    <div
      className={`
        inline-flex items-center ${gap} ${padding} rounded-full
        ${visual.bgColor} ${glowStyles[visual.glow]}
        transition-all duration-300
      `}
    >
      {/* Dot pattern */}
      <div className={`flex items-center ${gap}`}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`
              ${dotSize} rounded-full transition-colors duration-300
              ${dot <= visual.dots
                ? visual.color.replace('text-', 'bg-').replace('/70', '').replace('/40', '/60')
                : 'bg-ink/10'
              }
            `}
          />
        ))}
      </div>

      {/* Optional numeric score */}
      {showScore && (
        <span className={`text-[10px] tabular-nums font-medium ${visual.color} ml-1`}>
          {score}
        </span>
      )}
    </div>
  )
}

/**
 * VoiceBadgeWithHours - Badge variant that shows hours context
 * For Explore feed where hours still matter as raw signal
 */
interface VoiceBadgeWithHoursProps {
  score: number
  hours: number
}

export function VoiceBadgeWithHours({ score, hours }: VoiceBadgeWithHoursProps) {
  const visual = getVoiceVisual(score)

  const glowStyles = {
    none: '',
    subtle: 'shadow-[0_0_4px_rgba(180,160,100,0.2)]',
    medium: 'shadow-[0_0_6px_rgba(180,160,100,0.3)]',
    strong: 'shadow-[0_0_8px_rgba(180,160,100,0.4)]'
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        ${visual.bgColor} ${glowStyles[visual.glow]}
        transition-all duration-300
      `}
    >
      {/* Dot pattern */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`
              w-1 h-1 rounded-full transition-colors duration-300
              ${dot <= visual.dots
                ? visual.color.replace('text-', 'bg-').replace('/70', '').replace('/40', '/60')
                : 'bg-ink/10'
              }
            `}
          />
        ))}
      </div>

      {/* Separator */}
      <span className={`text-[10px] ${visual.color} opacity-40`}>·</span>

      {/* Hours display */}
      <span className={`text-[10px] tabular-nums ${visual.color} opacity-80`}>
        {hours.toLocaleString()} hrs
      </span>
    </div>
  )
}
