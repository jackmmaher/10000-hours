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

import { useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import { useVoice } from '../hooks/useVoice'
import { trackHideTimeToggle } from '../lib/analytics'
import { AuthModal } from './AuthModal'
import { VoiceBreakdown } from './VoiceBreakdown'
import { ThemeMode } from '../lib/db'

interface SettingsProps {
  onShowPaywall: () => void
  onRestorePurchase: () => void
}

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'auto', label: 'Auto', description: 'Shifts with time of day' },
  { value: 'light', label: 'Light', description: 'Bright, clear' },
  { value: 'warm', label: 'Warm', description: 'Golden, soft' },
  { value: 'dark', label: 'Dark', description: 'Deep, restful' }
]

export function Settings({ onShowPaywall, onRestorePurchase }: SettingsProps) {
  const { setView } = useSessionStore()
  const { tier, isPremium } = usePremiumStore()
  const { hideTimeDisplay, setHideTimeDisplay, themeMode, setThemeMode } = useSettingsStore()
  const { user, isAuthenticated, profile, signOut, isLoading: authLoading } = useAuthStore()
  const { inputs, isLoading: voiceLoading } = useVoice()
  const [showAuthModal, setShowAuthModal] = useState(false)

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

        {/* Account Section */}
        <div className="mb-10 p-5 bg-cream-warm rounded-xl">
          <p className="font-serif text-xs text-ink/40 tracking-wide mb-3">
            Account
          </p>
          {isAuthenticated && user ? (
            <div>
              <p className="text-sm text-ink font-medium">
                {user.email}
              </p>
              {profile && (
                <div className="flex gap-4 mt-2 text-xs text-ink/50">
                  <span>{profile.totalKarma} karma</span>
                  <span>{profile.totalSaves} saves received</span>
                </div>
              )}
              <button
                onClick={signOut}
                disabled={authLoading}
                className="mt-4 py-2 px-4 text-sm text-ink/50 hover:text-ink/70 transition-colors"
              >
                {authLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-ink/60 mb-3">
                Sign in to share pearls and save community wisdom
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="py-2.5 px-4 bg-ink text-cream text-sm rounded-lg hover:bg-ink/90 transition-colors"
              >
                Sign in
              </button>
            </div>
          )}
        </div>

        {/* Voice Score Breakdown */}
        {!voiceLoading && inputs && (
          <div className="mb-10">
            <VoiceBreakdown inputs={inputs} />
          </div>
        )}

        {/* Settings Options */}
        <div className="mb-10 space-y-1">
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

          {/* Theme Selector */}
          <div className="py-5">
            <div className="mb-3">
              <p className="text-sm text-ink">Theme</p>
              <p className="text-xs text-ink/35 mt-1">
                Ambient colors that shift naturally
              </p>
            </div>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setThemeMode(option.value)}
                  className={`
                    flex-1 py-2.5 px-2 rounded-lg text-center transition-all duration-200
                    ${themeMode === option.value
                      ? 'bg-moss text-cream'
                      : 'bg-cream-deep text-ink/60 hover:bg-cream-deep/80'
                    }
                  `}
                >
                  <p className="text-xs font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          </div>
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
      <footer className="pb-20 text-center">
        <p className="font-serif text-xs text-ink/25 italic">
          10,000 Hours · v2.0.0
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in"
        subtitle="Join the community to share and save pearls"
      />
    </div>
  )
}
