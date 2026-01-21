/**
 * useTodaysPlan - Hook to get today's active plan with enforceGoal
 *
 * Returns the current/upcoming planned session for today, including
 * whether goal enforcement is enabled.
 */

import { useState, useEffect, useCallback } from 'react'
import { getNextPlannedSession, updatePlannedSession, PlannedSession } from '../lib/db'

interface TodaysPlan {
  plan: PlannedSession | null
  isLoading: boolean
  // Convenience accessors
  goalSeconds: number | null
  enforceGoal: boolean
  // Actions
  refresh: () => Promise<void>
  markComplete: () => Promise<void>
  clearPlan: () => void
}

export function useTodaysPlan(): TodaysPlan {
  const [plan, setPlan] = useState<PlannedSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadPlan = useCallback(async () => {
    try {
      const nextPlan = await getNextPlannedSession()

      // Only use plan if it's for today and not completed
      if (nextPlan && !nextPlan.completed) {
        const planDate = new Date(nextPlan.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        planDate.setHours(0, 0, 0, 0)

        if (planDate.getTime() === today.getTime()) {
          setPlan(nextPlan)
        } else {
          setPlan(null)
        }
      } else {
        setPlan(null)
      }
    } catch (error) {
      console.error('[useTodaysPlan] Failed to load plan:', error)
      setPlan(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  // Refresh plan from DB
  const refresh = useCallback(async () => {
    await loadPlan()
  }, [loadPlan])

  // Mark plan as complete and clear from state
  const markComplete = useCallback(async () => {
    if (plan?.id) {
      try {
        await updatePlannedSession(plan.id, { completed: true })
        setPlan(null)
      } catch (error) {
        console.error('[useTodaysPlan] Failed to mark complete:', error)
      }
    }
  }, [plan])

  // Immediately clear plan from local state (for UI responsiveness)
  const clearPlan = useCallback(() => {
    setPlan(null)
  }, [])

  return {
    plan,
    isLoading,
    goalSeconds: plan?.duration ? plan.duration * 60 : null,
    enforceGoal: plan?.enforceGoal ?? false,
    refresh,
    markComplete,
    clearPlan,
  }
}
