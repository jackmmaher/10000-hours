/**
 * AchievementGallery - Displays all achieved milestones with memory
 *
 * Premium/Trial: Full visibility with dates
 * FREE after trial: Achievements visible but dates faded/blurred
 *
 * Design principle: "Gold star on copybook" - never removed, just less visible
 */

import { useMemo, useEffect, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { getAchievements, Achievement } from '../lib/db'
import { getAchievementVisibility, MILESTONES } from '../lib/tierLogic'
import { getAdaptiveMilestone } from '../lib/calculations'
import { formatShortDate } from '../lib/format'

interface AchievementGalleryProps {
  onLockedTap?: () => void
}

// Format milestone label (e.g., "2h", "5h", "1k")
function formatMilestoneLabel(hours: number): string {
  if (hours >= 1000) {
    return `${hours / 1000}k`
  }
  return `${hours}h`
}

export function AchievementGallery({ onLockedTap }: AchievementGalleryProps) {
  const { sessions, totalSeconds } = useSessionStore()
  const { tier, trialExpired, isPremiumOrTrial } = usePremiumStore()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load achievements from database
  useEffect(() => {
    async function loadAchievements() {
      const loaded = await getAchievements()
      setAchievements(loaded)
      setIsLoading(false)
    }
    loadAchievements()
  }, [totalSeconds]) // Reload when total changes (new achievement might have been recorded)

  // Get visibility settings based on tier
  const visibility = useMemo(
    () => getAchievementVisibility(tier, trialExpired),
    [tier, trialExpired]
  )

  // Get current milestone progress
  const milestone = useMemo(
    () => getAdaptiveMilestone(sessions),
    [sessions]
  )

  // Find next few milestones to show
  const currentHours = totalSeconds / 3600

  // Get milestones to display (achieved + next)
  const displayMilestones = useMemo(() => {
    const achieved = achievements.slice(-4) // Last 4 achieved
    const nextIndex = MILESTONES.findIndex(m => m > currentHours)
    const nextMilestone = nextIndex >= 0 ? MILESTONES[nextIndex] : null
    return { achieved, nextMilestone, nextIndex }
  }, [achievements, currentHours])

  if (isLoading) {
    return null
  }

  // If no achievements and no progress, show nothing
  if (achievements.length === 0 && currentHours < 1) {
    return null
  }

  return (
    <div className="mb-10">
      <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">
        Milestones
      </p>

      {/* Achievement badges row */}
      <div className="flex items-end gap-4 overflow-x-auto pb-2">
        {displayMilestones.achieved.map((achievement) => (
          <button
            key={achievement.hours}
            onClick={() => !isPremiumOrTrial && onLockedTap?.()}
            className="flex flex-col items-center min-w-[48px] transition-opacity"
            style={{ opacity: visibility.opacity }}
          >
            {/* Badge */}
            <div className="w-10 h-10 rounded-full bg-indigo-deep flex items-center justify-center mb-1">
              <span className="text-xs font-medium text-cream">
                {formatMilestoneLabel(achievement.hours)}
              </span>
            </div>

            {/* Date - hidden or blurred for FREE tier */}
            {visibility.showDate ? (
              <span className="text-[10px] text-indigo-deep/50 whitespace-nowrap">
                {formatShortDate(new Date(achievement.achievedAt))}
              </span>
            ) : (
              <span
                className="text-[10px] text-indigo-deep/30 whitespace-nowrap"
                style={{ filter: visibility.blurred ? 'blur(3px)' : 'none' }}
              >
                {formatShortDate(new Date(achievement.achievedAt))}
              </span>
            )}
          </button>
        ))}

        {/* Next milestone (in progress) */}
        {displayMilestones.nextMilestone && (
          <div className="flex flex-col items-center min-w-[48px]">
            {/* Progress ring */}
            <div className="relative w-10 h-10 mb-1">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-indigo-deep/10"
                />
                {/* Progress arc */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(milestone.progressPercent / 100) * 100.5} 100.5`}
                  className="text-indigo-deep/40"
                />
              </svg>
              {/* Label */}
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-indigo-deep/50">
                {formatMilestoneLabel(displayMilestones.nextMilestone)}
              </span>
            </div>

            {/* Progress text */}
            <span className="text-[10px] text-indigo-deep/30 whitespace-nowrap">
              {Math.round(milestone.progressPercent)}%
            </span>
          </div>
        )}
      </div>

      {/* FREE tier message */}
      {!isPremiumOrTrial && achievements.length > 0 && (
        <button
          onClick={onLockedTap}
          className="mt-4 text-left w-full"
        >
          <p className="text-xs text-indigo-deep/40 italic">
            These moments remain.
          </p>
          <p className="text-[10px] text-indigo-deep/30 mt-1">
            Tap to see full history
          </p>
        </button>
      )}

      {/* Progress River - organic, flowing progress for premium users */}
      {isPremiumOrTrial && displayMilestones.nextMilestone && (
        <div className="mt-5">
          <div className="flex justify-between text-[10px] text-ink/40 mb-2">
            <span className="tabular-nums">{milestone.currentFormatted}</span>
            <span className="tabular-nums">{milestone.targetFormatted}</span>
          </div>
          {/* The River - organic rounded bar with gradient flow */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-cream-deep">
            {/* Main progress fill with bark-to-moss gradient */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${milestone.progressPercent}%`,
                background: 'linear-gradient(90deg, #A08060 0%, #87A878 100%)'
              }}
            />
            {/* Subtle shimmer overlay for life */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                animation: 'riverShimmer 3s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
