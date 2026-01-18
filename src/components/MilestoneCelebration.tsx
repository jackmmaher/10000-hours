/**
 * MilestoneCelebration - Brief acknowledgment when milestone achieved
 *
 * Design principle: Zen neutrality. State the fact, don't celebrate.
 * "The path continues." - not "Amazing job!"
 *
 * Supports three milestone types:
 * - Hours: "100 hours" with "The path continues."
 * - Sessions: "100th session" with "Each moment matters."
 * - Weekly firsts: "First morning sit this week" with "A beautiful beginning."
 */

import { useEffect, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'

export function MilestoneCelebration() {
  const { justAchievedMilestone, clearMilestoneCelebration } = useSessionStore()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (justAchievedMilestone) {
      // Show the celebration
      setIsVisible(true)

      // Auto-dismiss after 2.5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        // Clear after fade animation
        setTimeout(clearMilestoneCelebration, 300)
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [justAchievedMilestone, clearMilestoneCelebration])

  if (!justAchievedMilestone) return null

  // Get display text and zen message based on milestone type
  const getMilestoneDisplay = () => {
    // New milestone types have 'type' property
    if ('type' in justAchievedMilestone) {
      const milestone = justAchievedMilestone as { type: string; label: string; zenMessage: string }
      return {
        name: milestone.label,
        zenMessage: milestone.zenMessage,
      }
    }

    // Legacy hour-based milestone (Achievement type)
    const hours = justAchievedMilestone.hours
    return {
      name: hours >= 1000 ? `${hours / 1000}k hours` : `${hours} hours`,
      zenMessage: 'The path continues.',
    }
  }

  const { name, zenMessage } = getMilestoneDisplay()

  return (
    <div
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-cream transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={() => {
        setIsVisible(false)
        setTimeout(clearMilestoneCelebration, 300)
      }}
    >
      {/* Subtle dot */}
      <div className="w-2 h-2 rounded-full bg-indigo-deep/30 mb-6" />

      {/* Milestone name */}
      <p className="font-serif text-3xl text-indigo-deep mb-4 text-center px-8">{name}</p>

      {/* Zen message */}
      <p className="text-sm text-indigo-deep/50 italic">{zenMessage}</p>
    </div>
  )
}
