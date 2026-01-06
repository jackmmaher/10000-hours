/**
 * WeeklyStats - Displays rolling 7-day meditation hours
 * Simple display of weekly activity without goal-based pressure
 */

import { useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { getWeeklyRollingSeconds } from '../lib/tierLogic'
import { formatTotalHours } from '../lib/format'

export function WeeklyGoal() {
  const { sessions } = useSessionStore()

  const weeklySeconds = useMemo(
    () => getWeeklyRollingSeconds(sessions),
    [sessions]
  )

  const weeklyFormatted = formatTotalHours(weeklySeconds)

  return (
    <div className="mb-8 pb-8 border-b border-ink/10">
      <p className="text-xs text-ink/50 uppercase tracking-wider mb-2">
        This week
      </p>

      <p className="font-serif text-xl text-ink">
        {weeklyFormatted}
      </p>
    </div>
  )
}
