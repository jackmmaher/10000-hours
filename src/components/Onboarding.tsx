/**
 * Onboarding - 3-screen intro flow for new users
 *
 * Screens:
 * 1. "Your meditation companion" - App intro
 * 2. "Track your journey" - What the app does
 * 3. "30 days of full access" - Trial preview
 *
 * Only shows on first launch (stored in localStorage)
 */

import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const SCREENS = [
  {
    title: 'Your meditation companion',
    subtitle: 'A simple timer for the long path',
    description: 'No bells. No guided sessions. Just you and the practice.',
  },
  {
    title: 'Track your journey',
    subtitle: '10,000 hours is the horizon',
    description: 'Watch your practice grow over days, months, years. Every session counts.',
  },
  {
    title: '30 days of full access',
    subtitle: 'Experience everything',
    description: 'Your first 30 days include full stats, projections, and history. Then decide if you want to keep it.',
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0)

  const isLastScreen = currentScreen === SCREENS.length - 1
  const screen = SCREENS[currentScreen]

  const handleNext = () => {
    if (isLastScreen) {
      onComplete()
    } else {
      setCurrentScreen(currentScreen + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="h-full bg-cream flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-sm text-indigo-deep/40 hover:text-indigo-deep/60 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <h1 className="font-serif text-3xl text-indigo-deep mb-3">
          {screen.title}
        </h1>
        <p className="text-lg text-indigo-deep/60 mb-6">
          {screen.subtitle}
        </p>
        <p className="text-sm text-indigo-deep/50 max-w-xs">
          {screen.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {SCREENS.map((_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${index === currentScreen ? 'bg-indigo-deep' : 'bg-indigo-deep/20'}
              `}
            />
          ))}
        </div>

        {/* Next/Begin button */}
        <button
          onClick={handleNext}
          className="w-full py-3 bg-indigo-deep text-cream rounded-lg font-medium hover:bg-indigo-deep/90 transition-colors"
        >
          {isLastScreen ? 'Begin' : 'Next'}
        </button>
      </div>
    </div>
  )
}

// Helper to check if onboarding has been seen
export function hasSeenOnboarding(): boolean {
  return localStorage.getItem('hasSeenOnboarding') === 'true'
}

// Helper to mark onboarding as seen
export function markOnboardingSeen(): void {
  localStorage.setItem('hasSeenOnboarding', 'true')
}
