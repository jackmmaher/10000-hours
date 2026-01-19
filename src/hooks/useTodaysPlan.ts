/**
 * useTodaysPlan - Hook to get today's active plan with enforceGoal
 *
 * Returns the current/upcoming planned session for today, including
 * whether goal enforcement is enabled.
 */

import { useState, useEffect } from 'react'
import { getNextPlannedSession, PlannedSession } from '../lib/db'

interface TodaysPlan {
  plan: PlannedSession | null
  isLoading: boolean
  // Convenience accessors
  goalSeconds: number | null
  enforceGoal: boolean
}

export function useTodaysPlan(): TodaysPlan {
  const [plan, setPlan] = useState<PlannedSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadPlan() {
      try {
        const nextPlan = await getNextPlannedSession()

        if (!mounted) return

        // Only use plan if it's for today
        if (nextPlan) {
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
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadPlan()

    return () => {
      mounted = false
    }
  }, [])

  return {
    plan,
    isLoading,
    goalSeconds: plan?.duration ? plan.duration * 60 : null,
    enforceGoal: plan?.enforceGoal ?? false,
  }
}
