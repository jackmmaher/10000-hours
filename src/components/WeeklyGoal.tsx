/**
 * WeeklyGoal - Displays rolling 7-day progress toward adaptive weekly goal
 * Used for FREE tier after Day 31
 *
 * Shows:
 * - Current hours this week (rolling 7-day)
 * - Adaptive goal (80% of trial average)
 * - Progress bar that can fluctuate
 */

import { useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { getWeeklyGoalProgress } from '../lib/tierLogic'

export function WeeklyGoal() {
  const { sessions } = useSessionStore()
  const { trialEndDate } = usePremiumStore()

  const progress = useMemo(
    () => getWeeklyGoalProgress(sessions, trialEndDate),
    [sessions, trialEndDate]
  )

  return (
    <div className="mb-8 pb-8 border-b border-indigo-deep/10">
      <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-2">
        This week
      </p>

      {/* Progress bar */}
      <div className="h-2 bg-indigo-deep/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-deep/60 transition-all duration-500 rounded-full"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between items-baseline mt-2">
        <p className="text-sm text-indigo-deep/70">
          <span className="font-medium text-indigo-deep">{progress.current}h</span>
          {' '}of {progress.goal}h
        </p>
        <p className="text-xs text-indigo-deep/40">
          {progress.percent}%
        </p>
      </div>

      {/* Subtitle explaining the goal */}
      <p className="text-xs text-indigo-deep/30 mt-1 italic">
        Based on your first 30 days
      </p>
    </div>
  )
}
