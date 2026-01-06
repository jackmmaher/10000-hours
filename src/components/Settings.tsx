/**
 * Settings - User preferences and account status
 *
 * Features:
 * - Tier status display (FREE / PREMIUM)
 * - Hide Time Display toggle
 * - Privacy Policy, Terms links
 * - Restore Purchase
 * - Version number
 */

import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useSwipe } from '../hooks/useSwipe'
import { trackHideTimeToggle } from '../lib/analytics'

interface SettingsProps {
  onShowPaywall: () => void
  onRestorePurchase: () => void
}

export function Settings({ onShowPaywall, onRestorePurchase }: SettingsProps) {
  const { setView } = useSessionStore()
  const { tier, isPremium } = usePremiumStore()
  const { hideTimeDisplay, setHideTimeDisplay } = useSettingsStore()

  const swipeHandlers = useSwipe({
    onSwipeRight: () => setView('stats'),
    onSwipeDown: () => setView('timer')
  })

  const handleHideTimeToggle = async () => {
    const newValue = !hideTimeDisplay
    await setHideTimeDisplay(newValue)
    trackHideTimeToggle(newValue)
  }

  return (
    <div className="h-full bg-cream overflow-y-auto flex flex-col" {...swipeHandlers}>
      <div className="px-6 py-8 max-w-lg mx-auto flex-1">
        {/* Header */}
        <button
          onClick={() => setView('stats')}
          className="flex items-center text-sm text-ink/40 mb-10 hover:text-ink/60 transition-colors active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="font-serif text-2xl text-ink mb-10">Settings</h1>

        {/* Tier Status Banner */}
        {tier === 'free' && (
          <button
            onClick={onShowPaywall}
            className="w-full mb-10 p-5 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99]"
          >
            <p className="font-serif text-xs text-ink/40 tracking-wide mb-2">
              Your Plan
            </p>
            <p className="text-lg text-ink font-medium">
              Free
            </p>
            <p className="text-sm text-ink/40 mt-1">
              Full meditation tracking
            </p>
            <div className="mt-4 py-2.5 px-4 bg-ink text-cream text-sm rounded-lg text-center">
              Upgrade to Premium — $4.99/year
            </div>
          </button>
        )}

        {isPremium && (
          <div className="mb-10 p-5 bg-cream-warm rounded-xl">
            <p className="font-serif text-xs text-ink/40 tracking-wide mb-2">
              Your Plan
            </p>
            <p className="text-lg text-ink font-medium">
              Premium
            </p>
            <p className="text-sm text-ink/40 mt-1">
              Enhanced features unlocked
            </p>
          </div>
        )}

        {/* Settings Options */}
        <div className="mb-10">
          {/* Hide Time Display - with custom organic toggle */}
          <button
            onClick={handleHideTimeToggle}
            className="w-full flex items-center justify-between py-5 active:scale-[0.99] transition-transform"
          >
            <div className="text-left">
              <p className="text-sm text-ink">Hide time display</p>
              <p className="text-xs text-ink/35 mt-1">
                Meditate without watching numbers
              </p>
            </div>
            {/* Custom organic toggle */}
            <div
              className={`
                relative w-12 h-7 rounded-full transition-colors duration-300
                ${hideTimeDisplay ? 'bg-moss' : 'bg-cream-deep'}
              `}
            >
              {/* Pearl-like knob with gradient */}
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${hideTimeDisplay ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #FFF, #F7F3EA)'
                }}
              />
            </div>
          </button>
        </div>

        {/* Links - with breathing space */}
        <div className="space-y-2 mb-10">
          <a
            href="#"
            className="block py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="block py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors"
          >
            Terms of Service
          </a>
          <button
            onClick={onRestorePurchase}
            className="block w-full text-left py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors"
          >
            Restore Purchase
          </button>
        </div>
      </div>

      {/* Version as quiet signature */}
      <footer className="pb-8 text-center">
        <p className="font-serif text-xs text-ink/25 italic">
          10,000 Hours · v1.0.0
        </p>
      </footer>
    </div>
  )
}
