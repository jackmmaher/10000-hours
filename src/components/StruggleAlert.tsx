/**
 * StruggleAlert - Displays detected practice struggle signals
 *
 * Uses the detectStruggles() function from affinities to identify
 * patterns that might indicate the user is having difficulty.
 *
 * Shown conditionally in the Progress tab when struggles are detected.
 */

import { useState, useEffect } from 'react'
import { detectStruggles, StruggleSignal } from '../lib/affinities'

// Friendly messages for each struggle type
const STRUGGLE_MESSAGES: Record<StruggleSignal['type'], { title: string; tip: string }> = {
  early_exit: {
    title: 'Sessions ending early',
    tip: 'Try shorter planned durations to build confidence, then gradually increase.',
  },
  duration_jump: {
    title: 'Big duration jump',
    tip: 'Ambitious! If it felt hard, consider stepping back to build up gradually.',
  },
  shallow_practice: {
    title: 'Mostly short sessions',
    tip: 'Short sessions are valuable! When ready, try one longer sit to deepen the experience.',
  },
  inconsistent_timing: {
    title: 'Variable practice times',
    tip: 'A consistent time helps build the habit. Consider picking a regular slot.',
  },
}

interface StruggleAlertProps {
  className?: string
}

export function StruggleAlert({ className = '' }: StruggleAlertProps) {
  const [struggles, setStruggles] = useState<StruggleSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedTypes, setDismissedTypes] = useState<Set<string>>(() => {
    // Load dismissed types from localStorage
    try {
      const saved = localStorage.getItem('dismissedStruggles')
      if (saved) {
        const parsed = JSON.parse(saved)
        return new Set(parsed)
      }
    } catch {
      // Ignore parse errors
    }
    return new Set()
  })

  useEffect(() => {
    async function loadStruggles() {
      try {
        const detected = await detectStruggles()
        setStruggles(detected)
      } catch (err) {
        console.warn('Failed to detect struggles:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadStruggles()
  }, [])

  // Filter out dismissed struggles
  const visibleStruggles = struggles.filter((s) => !dismissedTypes.has(s.type))

  const handleDismiss = (type: string) => {
    const newDismissed = new Set(dismissedTypes)
    newDismissed.add(type)
    setDismissedTypes(newDismissed)
    // Persist to localStorage
    localStorage.setItem('dismissedStruggles', JSON.stringify([...newDismissed]))
  }

  // Don't render if loading or no visible struggles
  if (isLoading || visibleStruggles.length === 0) {
    return null
  }

  // Show only the first struggle to avoid overwhelming
  const struggle = visibleStruggles[0]
  const message = STRUGGLE_MESSAGES[struggle.type]

  return (
    <div className={`mb-6 ${className}`}>
      <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="font-medium text-amber-900 text-sm">{message.title}</p>
            </div>
            <p className="text-xs text-amber-700/80">{struggle.context}</p>
            <p className="text-xs text-amber-800 mt-2">{message.tip}</p>
          </div>
          <button
            onClick={() => handleDismiss(struggle.type)}
            className="ml-2 p-1 text-amber-400 hover:text-amber-600 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
