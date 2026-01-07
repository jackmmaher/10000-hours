/**
 * MilestoneBadges - Horizontal scroll of earned achievements
 *
 * Shows badges for milestones achieved with progress to next.
 * Fog of war: only shows earned badges + next milestone.
 */

import { useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { getAdaptiveMilestone } from '../lib/calculations'

// Badge icons/emojis for different hour milestones
const MILESTONE_BADGES: Record<number, { emoji: string; name: string }> = {
  2: { emoji: '🌱', name: 'Seedling' },
  5: { emoji: '🌿', name: 'Sprout' },
  10: { emoji: '🪨', name: 'First Stone' },
  25: { emoji: '🌲', name: 'Sapling' },
  50: { emoji: '🏔️', name: 'Foothill' },
  100: { emoji: '⛰️', name: 'Mountain' },
  250: { emoji: '🌊', name: 'River' },
  500: { emoji: '🔥', name: 'Flame' },
  750: { emoji: '🌙', name: 'Moon' },
  1000: { emoji: '✨', name: 'Thousand' },
  1500: { emoji: '🌸', name: 'Blossom' },
  2000: { emoji: '🦋', name: 'Metamorphosis' },
  2500: { emoji: '🌅', name: 'Horizon' },
  3500: { emoji: '🦅', name: 'Eagle' },
  5000: { emoji: '🐉', name: 'Dragon' },
  6500: { emoji: '🌌', name: 'Galaxy' },
  7500: { emoji: '💫', name: 'Nebula' },
  8500: { emoji: '🔮', name: 'Crystal' },
  10000: { emoji: '☀️', name: 'Enlightened' }
}

export function MilestoneBadges() {
  const { sessions, totalSeconds } = useSessionStore()

  const totalHours = totalSeconds / 3600
  const milestone = useMemo(() => getAdaptiveMilestone(sessions), [sessions])

  // Get achieved milestones
  const achievedMilestones = useMemo(() => {
    return Object.keys(MILESTONE_BADGES)
      .map(Number)
      .filter(hours => totalHours >= hours)
      .sort((a, b) => b - a) // Most recent first
  }, [totalHours])

  // If no milestones yet, show encouraging message
  if (achievedMilestones.length === 0) {
    return (
      <div className="mb-8">
        <div className="bg-cream-deep rounded-xl p-4 text-center">
          <p className="text-sm text-ink/50 mb-2">
            Your first milestone awaits
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl opacity-50">🌱</span>
            <div className="flex-1 max-w-32">
              <div className="h-2 bg-cream rounded-full overflow-hidden">
                <div
                  className="h-full bg-moss transition-all duration-500"
                  style={{ width: `${milestone.progressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-ink/40">{milestone.targetHours}h</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {/* Achieved badges */}
        {achievedMilestones.map((hours) => {
          const badge = MILESTONE_BADGES[hours]
          return (
            <div
              key={hours}
              className="flex-shrink-0 flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-cream-deep flex items-center justify-center text-2xl shadow-sm">
                {badge.emoji}
              </div>
              <span className="text-[10px] text-ink/40 mt-1">
                {hours >= 1000 ? `${hours / 1000}k` : hours}h
              </span>
            </div>
          )
        })}

        {/* Next milestone (dimmed with progress) */}
        {milestone.targetHours <= 10000 && (
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-cream-deep flex items-center justify-center text-2xl opacity-30 relative">
              {MILESTONE_BADGES[milestone.targetHours]?.emoji || '✦'}
              {/* Progress ring */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 48 48"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-moss/30"
                  strokeDasharray={`${(milestone.progressPercent / 100) * 138} 138`}
                />
              </svg>
            </div>
            <span className="text-[10px] text-ink/30 mt-1">
              {milestone.targetHours >= 1000 ? `${milestone.targetHours / 1000}k` : milestone.targetHours}h
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
