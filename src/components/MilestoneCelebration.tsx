/**
 * MilestoneCelebration - Brief acknowledgment when milestone achieved
 *
 * Design principle: Zen neutrality. State the fact, don't celebrate.
 * "The path continues." - not "Amazing job!"
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

  // Format milestone name
  const milestoneName = justAchievedMilestone.hours >= 1000
    ? `${justAchievedMilestone.hours / 1000}k hours`
    : `${justAchievedMilestone.hours} hours`

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
      <p className="font-serif text-3xl text-indigo-deep mb-4">
        {milestoneName}
      </p>

      {/* Zen message */}
      <p className="text-sm text-indigo-deep/50 italic">
        The path continues.
      </p>
    </div>
  )
}
