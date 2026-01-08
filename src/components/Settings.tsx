/**
 * Settings - App configuration and preferences
 *
 * Accessed from Profile page via gear icon.
 * Contains:
 * - Theme selection (time of day × season)
 * - Display options (hide time / orb mode)
 * - Account actions (sign out)
 * - Legal links
 * - Version info
 */

import { useState } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useThemeInfo } from '../hooks/useTheme'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { trackHideTimeToggle } from '../lib/analytics'
import { ThemeMode } from '../lib/db'
import { getThemeName } from '../lib/themeEngine'
import { AuthModal } from './AuthModal'

interface SettingsProps {
  onBack: () => void
  onShowPaywall: () => void
  onRestorePurchase: () => void
}

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'auto', label: 'Auto', description: '16 variations across time and season' },
  { value: 'light', label: 'Light', description: 'Bright, clear — daytime energy' },
  { value: 'warm', label: 'Warm', description: 'Golden, soft — evening calm' },
  { value: 'dark', label: 'Dark', description: 'Deep, restful — night stillness' }
]

export function Settings({ onBack, onShowPaywall, onRestorePurchase }: SettingsProps) {
  const { hideTimeDisplay, setHideTimeDisplay, themeMode, setThemeMode } = useSettingsStore()
  const { user, isAuthenticated, signOut, isLoading: authLoading, refreshProfile } = useAuthStore()
  const { tier, isPremium } = usePremiumStore()
  const { timeOfDay, season } = useThemeInfo()
  const [showThemeDetail, setShowThemeDetail] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers
  } = usePullToRefresh({
    onRefresh: refreshProfile
  })

  // Get current auto theme description
  const currentThemeName = getThemeName(timeOfDay, season)

  const handleHideTimeToggle = async () => {
    const newValue = !hideTimeDisplay
    await setHideTimeDisplay(newValue)
    trackHideTimeToggle(newValue)
  }

  return (
    <div
      className="h-full bg-cream overflow-y-auto flex flex-col"
      onTouchStart={pullHandlers.onTouchStart}
      onTouchMove={pullHandlers.onTouchMove}
      onTouchEnd={pullHandlers.onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center overflow-hidden transition-all duration-200"
        style={{
          height: isPulling || isRefreshing ? Math.min(pullDistance, 80) : 0,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
      >
        <div className="flex items-center gap-2 py-2">
          {isRefreshing ? (
            <div className="w-5 h-5 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 text-moss transition-transform duration-200"
              style={{ transform: pullDistance >= 80 ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          <span className="text-sm text-moss">
            {isRefreshing ? 'Refreshing...' : pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      <div className="px-6 py-8 max-w-lg mx-auto flex-1">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center text-sm text-ink/40 mb-10 hover:text-ink/60 transition-colors active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Profile
        </button>

        <h1 className="font-serif text-2xl text-ink mb-10">Settings</h1>

        {/* Tier Status Banner */}
        {tier === 'free' && (
          <button
            onClick={onShowPaywall}
            className="w-full mb-8 p-5 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99]"
          >
            <p className="font-serif text-xs text-ink/40 tracking-wide mb-2">
              Your Plan
            </p>
            <p className="text-lg text-ink font-medium">Free</p>
            <p className="text-sm text-ink/40 mt-1">Full meditation tracking</p>
            <div className="mt-4 py-2.5 px-4 bg-ink text-cream text-sm rounded-lg text-center">
              Upgrade to Premium — $4.99/year
            </div>
          </button>
        )}

        {isPremium && (
          <div className="mb-8 p-5 bg-cream-warm rounded-xl">
            <p className="font-serif text-xs text-ink/40 tracking-wide mb-2">
              Your Plan
            </p>
            <p className="text-lg text-ink font-medium">Premium</p>
            <p className="text-sm text-ink/40 mt-1">Enhanced features unlocked</p>
          </div>
        )}

        {/* Display Options */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Display</p>

          {/* Hide Time Display - with custom organic toggle */}
          <button
            onClick={handleHideTimeToggle}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform"
          >
            <div className="text-left">
              <p className="text-sm text-ink">Hide time display</p>
              <p className="text-xs text-ink/35 mt-1">
                Meditate without watching numbers (orb mode)
              </p>
            </div>
            {/* Custom organic toggle */}
            <div
              className={`
                relative w-12 h-7 rounded-full transition-colors duration-300
                ${hideTimeDisplay ? 'bg-moss' : 'bg-cream-deep'}
              `}
            >
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

        {/* Theme */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Theme</p>

          <button
            onClick={() => setShowThemeDetail(!showThemeDetail)}
            className="w-full flex items-center justify-between py-4"
          >
            <div className="text-left">
              <p className="text-sm text-ink">Ambient theme</p>
              <p className="text-xs text-ink/35 mt-1">
                {themeMode === 'auto'
                  ? `Currently: ${currentThemeName}`
                  : `${THEME_OPTIONS.find(t => t.value === themeMode)?.label} mode`}
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-ink/30 transition-transform ${showThemeDetail ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showThemeDetail && (
            <div className="mt-2 space-y-2">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setThemeMode(option.value)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                    ${themeMode === option.value
                      ? 'bg-moss text-cream'
                      : 'bg-cream-warm text-ink hover:bg-cream-deep'
                    }
                  `}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className={`text-xs mt-0.5 ${themeMode === option.value ? 'text-cream/70' : 'text-ink/40'}`}>
                      {option.description}
                    </p>
                  </div>
                  {themeMode === option.value && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Account</p>
          {isAuthenticated && user ? (
            <div className="p-4 bg-cream-warm rounded-xl">
              <p className="text-sm text-ink/60 mb-3">{user.email}</p>
              <button
                onClick={signOut}
                disabled={authLoading}
                className="text-sm text-ink/50 hover:text-ink/70 transition-colors"
              >
                {authLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full p-4 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99]"
            >
              <p className="text-sm text-ink font-medium">Sign in</p>
              <p className="text-xs text-ink/40 mt-1">
                Sync your practice across devices
              </p>
            </button>
          )}
        </div>

        {/* Links */}
        <div className="space-y-1 mb-8">
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

      {/* Version */}
      <footer className="pb-20 text-center">
        <p className="font-serif text-xs text-ink/25 italic">
          10,000 Hours · v2.1.0
        </p>
      </footer>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in"
        subtitle="Sync your practice across devices"
      />
    </div>
  )
}
