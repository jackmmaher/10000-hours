/**
 * PlanSelector - Modal for selecting a planned session to attach content to
 *
 * Used when user wants to attach a pearl or insight to a planned session.
 * Shows upcoming plans and option to create new.
 */

import { useState, useEffect } from 'react'
import { PlannedSession, getUpcomingPlans } from '../lib/db'

interface PlanSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (plan: PlannedSession) => void
  onCreateNew: () => void
  title?: string
}

export function PlanSelector({
  isOpen,
  onClose,
  onSelectPlan,
  onCreateNew,
  title = 'Attach to Plan',
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<PlannedSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      getUpcomingPlans(14)
        .then(setPlans)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatPlanDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const planDate = new Date(timestamp)
    planDate.setHours(0, 0, 0, 0)

    if (planDate.getTime() === today.getTime()) return 'Today'
    if (planDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-cream rounded-t-2xl max-h-[70vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-ink/10">
          <h3 className="font-serif text-lg text-ink">{title}</h3>
          <button onClick={onClose} className="p-2 text-ink/50 hover:text-ink touch-manipulation">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-ink/50">
              <p className="mb-4">No upcoming plans</p>
              <button
                onClick={() => {
                  onCreateNew()
                  onClose()
                }}
                className="px-6 py-3 bg-moss text-cream rounded-xl font-medium touch-manipulation"
              >
                Plan a New Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    onSelectPlan(plan)
                    onClose()
                  }}
                  className="w-full text-left p-4 rounded-xl bg-white/50 border border-ink/10 hover:border-moss/50 transition-colors touch-manipulation"
                >
                  <p className="text-xs text-ink/50 mb-1">
                    {formatPlanDate(plan.date)}
                    {plan.plannedTime && ` at ${plan.plannedTime}`}
                  </p>
                  <p className="text-ink font-medium">
                    {plan.title || plan.discipline || 'Meditation'}
                  </p>
                  {plan.duration && <p className="text-sm text-ink/50">{plan.duration} minutes</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {plans.length > 0 && (
          <div className="p-4 border-t border-ink/10">
            <button
              onClick={() => {
                onCreateNew()
                onClose()
              }}
              className="w-full py-3 text-moss hover:text-moss/80 transition-colors touch-manipulation font-medium"
            >
              + Plan a New Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
