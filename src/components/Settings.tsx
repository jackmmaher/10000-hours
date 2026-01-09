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
import { useTapFeedback } from '../hooks/useTapFeedback'
import { trackHideTimeToggle } from '../lib/analytics'
import { SeasonOverride, TimeOverride } from '../lib/db'
import { getThemeName } from '../lib/themeEngine'
import { downloadJSON, downloadCSV } from '../lib/export'
import { AuthModal } from './AuthModal'

interface SettingsProps {
  onBack: () => void
  onShowPaywall: () => void
  onRestorePurchase: () => void
}

const SEASON_OPTIONS: { value: SeasonOverride; label: string; icon: string }[] = [
  { value: 'spring', label: 'Spring', icon: '🌱' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
  { value: 'neutral', label: 'Neutral', icon: '○' }
]

const TIME_OPTIONS: { value: TimeOverride; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'daytime', label: 'Daytime' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' }
]

const QUICK_PRESETS: { label: string; season: SeasonOverride; time: TimeOverride }[] = [
  { label: 'Neutral Light', season: 'neutral', time: 'daytime' },
  { label: 'Neutral Dark', season: 'neutral', time: 'night' },
  { label: 'Spring Dawn', season: 'spring', time: 'morning' },
  { label: 'Summer Day', season: 'summer', time: 'daytime' },
  { label: 'Autumn Evening', season: 'autumn', time: 'evening' },
  { label: 'Winter Night', season: 'winter', time: 'night' }
]

export function Settings({ onBack, onShowPaywall, onRestorePurchase }: SettingsProps) {
  const {
    hideTimeDisplay, setHideTimeDisplay,
    skipInsightCapture, setSkipInsightCapture,
    themeMode, setThemeMode,
    visualEffects, setVisualEffects,
    manualSeason, manualTime, setManualTheme
  } = useSettingsStore()
  const { user, isAuthenticated, signOut, isLoading: authLoading, refreshProfile } = useAuthStore()
  const { tier, isPremium } = usePremiumStore()
  const { timeOfDay, season } = useThemeInfo()
  const haptic = useTapFeedback()
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
          onClick={() => {
            haptic.light()
            onBack()
          }}
          className="flex items-center text-sm text-ink/40 mb-10 hover:text-ink/60 transition-colors active:scale-[0.98] touch-manipulation"
          aria-label="Go back to profile"
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
            onClick={() => {
              haptic.light()
              onShowPaywall()
            }}
            className="w-full mb-8 p-5 bg-card/90 backdrop-blur-md border border-ink/5 shadow-sm
              rounded-xl text-left hover:bg-card/95 hover:shadow-md transition-all active:scale-[0.99] touch-manipulation"
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
            onClick={() => {
              haptic.light()
              handleHideTimeToggle()
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Hide time display</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Meditate without watching numbers (orb mode)
              </p>
            </div>
            {/* Custom organic toggle - theme aware */}
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{ background: hideTimeDisplay ? 'var(--toggle-on)' : 'var(--toggle-off)' }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${hideTimeDisplay ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>

          {/* Skip Insight Capture */}
          <button
            onClick={() => {
              haptic.light()
              setSkipInsightCapture(!skipInsightCapture)
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Skip insight capture</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Go straight to timer after sessions
              </p>
            </div>
            {/* Custom organic toggle - theme aware */}
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{ background: skipInsightCapture ? 'var(--toggle-on)' : 'var(--toggle-off)' }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${skipInsightCapture ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>

          {/* Visual Effects - Calm vs Expressive */}
          <button
            onClick={() => {
              haptic.light()
              setVisualEffects(visualEffects === 'calm' ? 'expressive' : 'calm')
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Visual effects</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {visualEffects === 'calm'
                  ? 'Calm — subtle, minimal atmosphere'
                  : 'Expressive — aurora, shooting stars, shimmer'}
              </p>
            </div>
            {/* Custom organic toggle - theme aware */}
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{ background: visualEffects === 'expressive' ? 'var(--toggle-on)' : 'var(--toggle-off)' }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${visualEffects === 'expressive' ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>
        </div>

        {/* Theme Personalization */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Theme</p>

          {/* Auto/Manual Toggle */}
          <button
            onClick={() => {
              haptic.light()
              setThemeMode(themeMode === 'auto' ? 'manual' : 'auto')
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Living theme</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {themeMode === 'auto'
                  ? `Adapts to time & season — ${currentThemeName}`
                  : 'Fixed to your selection'}
              </p>
            </div>
            {/* Custom organic toggle - theme aware */}
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{ background: themeMode === 'auto' ? 'var(--toggle-on)' : 'var(--toggle-off)' }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${themeMode === 'auto' ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>

          {/* Expandable section header */}
          <button
            onClick={() => {
              haptic.light()
              setShowThemeDetail(!showThemeDetail)
            }}
            className="w-full flex items-center justify-between py-4 touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Personalize</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {themeMode === 'manual'
                  ? `${manualSeason.charAt(0).toUpperCase() + manualSeason.slice(1)} ${manualTime}`
                  : 'Choose a fixed theme'}
              </p>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${showThemeDetail ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showThemeDetail && (
            <div className="mt-2 space-y-4">
              {/* Quick Presets */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Quick presets</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PRESETS.map((preset) => {
                    const isActive = themeMode === 'manual' && manualSeason === preset.season && manualTime === preset.time
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          haptic.light()
                          setManualTheme(preset.season, preset.time)
                        }}
                        className={`
                          p-3 rounded-xl text-left transition-all duration-200 touch-manipulation active:scale-[0.97]
                          ${isActive
                            ? 'bg-moss text-cream'
                            : 'bg-cream-warm text-ink hover:bg-cream-deep'
                          }
                        `}
                      >
                        <p className={`text-xs font-medium ${isActive ? 'text-cream' : ''}`}>
                          {preset.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Season Picker */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Season</p>
                <div className="flex gap-2">
                  {SEASON_OPTIONS.map((option) => {
                    const isActive = themeMode === 'manual' && manualSeason === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          haptic.light()
                          setManualTheme(option.value, manualTime)
                        }}
                        className={`
                          flex-1 py-2.5 px-1 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                          ${isActive
                            ? 'bg-moss text-cream'
                            : 'bg-cream-warm text-ink hover:bg-cream-deep'
                          }
                        `}
                      >
                        <span className="text-sm">{option.icon}</span>
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-cream' : 'text-ink/60'}`}>
                          {option.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time of Day Picker */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Time of day</p>
                <div className="flex gap-2">
                  {TIME_OPTIONS.map((option) => {
                    const isActive = themeMode === 'manual' && manualTime === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          haptic.light()
                          setManualTheme(manualSeason, option.value)
                        }}
                        className={`
                          flex-1 py-2.5 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                          ${isActive
                            ? 'bg-moss text-cream'
                            : 'bg-cream-warm text-ink hover:bg-cream-deep'
                          }
                        `}
                      >
                        <p className={`text-xs ${isActive ? 'text-cream' : 'text-ink/60'}`}>
                          {option.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Your Data</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                haptic.light()
                downloadJSON()
              }}
              className="w-full p-4 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99] touch-manipulation"
            >
              <p className="text-sm text-ink font-medium">Export as JSON</p>
              <p className="text-xs text-ink/40 mt-1">
                Full data backup including insights
              </p>
            </button>
            <button
              onClick={() => {
                haptic.light()
                downloadCSV()
              }}
              className="w-full p-4 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99] touch-manipulation"
            >
              <p className="text-sm text-ink font-medium">Export sessions as CSV</p>
              <p className="text-xs text-ink/40 mt-1">
                Spreadsheet-compatible format
              </p>
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Account</p>
          {isAuthenticated && user ? (
            <div className="p-4 bg-cream-warm rounded-xl">
              <p className="text-sm text-ink/60 mb-3">{user.email}</p>
              <button
                onClick={() => {
                  haptic.light()
                  signOut()
                }}
                disabled={authLoading}
                className="text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
              >
                {authLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                haptic.light()
                setShowAuthModal(true)
              }}
              className="w-full p-4 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99] touch-manipulation"
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
            className="block py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="block py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
          >
            Terms of Service
          </a>
          <button
            onClick={() => {
              haptic.light()
              onRestorePurchase()
            }}
            className="block w-full text-left py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
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
