/**
 * Settings - User preferences and account status
 *
 * Features:
 * - Tier status display (FREE / PREMIUM)
 * - "Unlock full journey" banner (Day 31+ FREE)
 * - Hide Time Display toggle (Premium only)
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
  const { tier, isPremiumOrTrial, daysSinceFirstSession } = usePremiumStore()
  const { hideTimeDisplay, setHideTimeDisplay } = useSettingsStore()

  const swipeHandlers = useSwipe({
    onSwipeRight: () => setView('stats'),
    onSwipeDown: () => setView('timer')
  })

  const handleHideTimeToggle = async () => {
    if (!isPremiumOrTrial) {
      onShowPaywall()
      return
    }
    const newValue = !hideTimeDisplay
    await setHideTimeDisplay(newValue)
    trackHideTimeToggle(newValue)
  }

  return (
    <div className="h-full bg-cream overflow-y-auto" {...swipeHandlers}>
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Header */}
        <button
          onClick={() => setView('stats')}
          className="flex items-center text-sm text-indigo-deep/50 mb-8 hover:text-indigo-deep/70 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          back
        </button>

        <h1 className="font-serif text-2xl text-indigo-deep mb-8">Settings</h1>

        {/* Tier Status Banner */}
        {!isPremiumOrTrial && (
          <button
            onClick={onShowPaywall}
            className="w-full mb-8 p-4 bg-cream-warm rounded-lg text-left border border-indigo-deep/10 hover:border-indigo-deep/20 transition-colors"
          >
            <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-1">
              Your journey
            </p>
            <p className="text-lg text-indigo-deep font-medium">
              {daysSinceFirstSession} days meditating
            </p>
            <p className="text-sm text-indigo-deep/50 mt-1">
              30-day window active
            </p>
            <div className="mt-3 py-2 px-4 bg-indigo-deep text-cream text-sm rounded text-center">
              Unlock full journey — $4.99/year
            </div>
          </button>
        )}

        {tier === 'premium' && (
          <div className="mb-8 p-4 bg-cream-warm rounded-lg border border-indigo-deep/10">
            <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-1">
              Your journey
            </p>
            <p className="text-lg text-indigo-deep font-medium">
              Premium
            </p>
            <p className="text-sm text-indigo-deep/50 mt-1">
              Full history unlocked
            </p>
          </div>
        )}

        {/* Settings Options */}
        <div className="space-y-1 mb-8">
          {/* Hide Time Display */}
          <button
            onClick={handleHideTimeToggle}
            className="w-full flex items-center justify-between py-4 border-b border-indigo-deep/10"
          >
            <div className="text-left">
              <p className="text-sm text-indigo-deep">Hide time display</p>
              <p className="text-xs text-indigo-deep/40 mt-0.5">
                Meditate without watching numbers
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isPremiumOrTrial && (
                <span className="text-xs text-indigo-deep/30">Premium</span>
              )}
              <div
                className={`
                  w-10 h-6 rounded-full transition-colors relative
                  ${hideTimeDisplay && isPremiumOrTrial ? 'bg-indigo-deep' : 'bg-indigo-deep/20'}
                  ${!isPremiumOrTrial ? 'opacity-50' : ''}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-cream shadow transition-transform
                    ${hideTimeDisplay && isPremiumOrTrial ? 'translate-x-5' : 'translate-x-1'}
                  `}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Links */}
        <div className="space-y-1 mb-8">
          <a
            href="#"
            className="block py-3 text-sm text-indigo-deep/60 hover:text-indigo-deep transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="block py-3 text-sm text-indigo-deep/60 hover:text-indigo-deep transition-colors"
          >
            Terms of Service
          </a>
          <button
            onClick={onRestorePurchase}
            className="block w-full text-left py-3 text-sm text-indigo-deep/60 hover:text-indigo-deep transition-colors"
          >
            Restore Purchase
          </button>
        </div>

        {/* Version */}
        <p className="text-xs text-indigo-deep/30 text-center">
          10,000 Hours v1.0.0
        </p>
      </div>
    </div>
  )
}
