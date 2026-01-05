/**
 * FrozenMilestone - Displays last achieved milestone in frozen state
 * Used for FREE tier after Day 31
 *
 * Shows:
 * - Last achieved milestone with checkmark
 * - Faded appearance
 * - "Your journey continues..." message
 */

import { useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { getLastAchievedMilestone } from '../lib/tierLogic'

interface FrozenMilestoneProps {
  onTap?: () => void
}

export function FrozenMilestone({ onTap }: FrozenMilestoneProps) {
  const { totalSeconds } = useSessionStore()

  const milestone = useMemo(() => {
    const totalHours = totalSeconds / 3600
    return getLastAchievedMilestone(totalHours)
  }, [totalSeconds])

  if (!milestone) {
    return null
  }

  return (
    <button
      onClick={onTap}
      className="w-full mb-8 pb-8 border-b border-indigo-deep/10 text-left"
    >
      <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-2">
        Milestones
      </p>

      {/* Frozen milestone display */}
      <div className="opacity-50">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-indigo-deep/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm text-indigo-deep/70">
            {milestone.name} achieved
          </span>
        </div>

        {/* Dashed line indicating frozen progress */}
        <div className="h-px bg-indigo-deep/20 my-3" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)'
        }} />

        <p className="text-sm text-indigo-deep/40 italic">
          Your journey continues...
        </p>
      </div>

      {/* Subtle unlock hint */}
      <p className="text-xs text-indigo-deep/30 mt-3">
        Tap to see your full progress
      </p>
    </button>
  )
}
