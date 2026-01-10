/**
 * Onboarding - Single screen intro for new users
 *
 * Honest, fellow-traveler tone. No marketing fluff.
 * Just explains what the app is and lets them begin.
 *
 * Only shows on first launch (stored in localStorage)
 */

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="h-full bg-cream flex flex-col">
      {/* Content - vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <h1 className="font-serif text-2xl text-ink mb-3 leading-relaxed">
          There's no destination.
        </h1>
        <p className="text-lg text-ink/60 mb-2">
          Just practice, and showing up again.
        </p>
        <p className="text-base text-ink/50 mb-12">
          This is a place to do that.
        </p>

        {/* Reassurance line */}
        <p className="text-sm text-ink/40">
          No account needed. Just start.
        </p>
      </div>

      {/* CTA */}
      <div className="p-8">
        <button
          onClick={onComplete}
          className="w-full py-3.5 bg-ink text-cream rounded-xl font-medium
            hover:bg-ink/90 transition-colors active:scale-[0.98] touch-manipulation"
        >
          Begin
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
