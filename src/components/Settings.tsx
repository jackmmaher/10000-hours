/**
 * Settings - App configuration and preferences
 *
 * Accessed from Profile page via gear icon.
 * Contains:
 * - Account status (sign in to create)
 * - Theme selection (time of day × season)
 * - Display options (hide time / orb mode)
 * - Data export
 * - Legal links
 * - Version info
 */

import { useState } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useThemeInfo } from '../hooks/useTheme'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { trackHideTimeToggle } from '../lib/analytics'
import { TimeOverride, ThemeMode } from '../lib/db'
import { getThemeName, Season } from '../lib/themeEngine'
import { exportData } from '../lib/export'
import { AuthModal } from './AuthModal'

interface SettingsProps {
  onBack: () => void
}

// Living theme season options (no neutral - that's handled separately)
const LIVING_SEASON_OPTIONS: { value: Season; label: string; icon: string }[] = [
  { value: 'spring', label: 'Spring', icon: '🌱' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
]

const TIME_OPTIONS: { value: TimeOverride; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'daytime', label: 'Daytime' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
]

// Helper to check if using living theme
const isLivingTheme = (mode: ThemeMode) => mode === 'living-auto' || mode === 'living-manual'

// Helper to get neutral mode from themeMode
const getNeutralMode = (mode: ThemeMode): 'auto' | 'light' | 'dark' => {
  if (mode === 'neutral-light') return 'light'
  if (mode === 'neutral-dark') return 'dark'
  return 'auto'
}

export function Settings({ onBack }: SettingsProps) {
  const {
    hideTimeDisplay,
    setHideTimeDisplay,
    themeMode,
    visualEffects,
    setVisualEffects,
    audioFeedbackEnabled,
    setAudioFeedbackEnabled,
    notificationPreferences,
    setNotificationPreferences,
    manualSeason,
    manualTime,
    setManualTheme,
    setNeutralMode,
    setLivingMode,
    toggleLivingTheme,
  } = useSettingsStore()
  const { user, isAuthenticated, signOut, isLoading: authLoading, refreshProfile } = useAuthStore()
  const { timeOfDay, season } = useThemeInfo()
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: refreshProfile,
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
          opacity: isPulling || isRefreshing ? 1 : 0,
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          <span className="text-sm text-moss">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= 80
                ? 'Release to refresh'
                : 'Pull to refresh'}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Profile
        </button>

        <h1 className="font-serif text-2xl text-ink mb-10">Settings</h1>

        {/* Account Status - at top */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Account</p>

          {isAuthenticated && user ? (
            <div className="p-5 bg-card/90 backdrop-blur-md shadow-sm rounded-xl">
              <p className="text-sm text-ink/60 mb-2">{user.email}</p>
              <p className="text-xs text-ink/40 mb-4">You can create and share pearls</p>
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
              className="w-full p-5 bg-card/90 backdrop-blur-md shadow-sm
                rounded-xl text-left hover:bg-card/95 hover:shadow-md transition-all
                active:scale-[0.99] touch-manipulation"
            >
              <p className="text-sm text-ink font-medium">Sign in to create</p>
              <p className="text-xs text-ink/40 mt-1">
                Share pearls and guided meditations with the community
              </p>
              <div className="mt-4 py-2.5 px-4 bg-ink text-cream text-sm rounded-lg text-center">
                Sign in
              </div>
            </button>
          )}
        </div>

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
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Hide time display
              </p>
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

          {/* Visual Effects - Calm vs Expressive */}
          <button
            onClick={() => {
              haptic.light()
              setVisualEffects(visualEffects === 'calm' ? 'expressive' : 'calm')
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Visual effects
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {visualEffects === 'calm'
                  ? 'Calm — subtle, minimal atmosphere'
                  : 'Expressive — aurora, shooting stars, shimmer'}
              </p>
            </div>
            {/* Custom organic toggle - theme aware */}
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{
                background:
                  visualEffects === 'expressive' ? 'var(--toggle-on)' : 'var(--toggle-off)',
              }}
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

          {/* Audio Feedback */}
          <button
            onClick={() => {
              haptic.light()
              const newValue = !audioFeedbackEnabled
              setAudioFeedbackEnabled(newValue)
              // Preview the completion sound when enabling
              if (newValue) {
                audio.complete()
              }
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Audio feedback
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Subtle sounds on session complete and milestones
              </p>
            </div>
            {/* Custom organic toggle - theme aware */}
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{
                background: audioFeedbackEnabled ? 'var(--toggle-on)' : 'var(--toggle-off)',
              }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${audioFeedbackEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>
        </div>

        {/* Notifications */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Notifications</p>

          {/* Attribution notifications */}
          <button
            onClick={() => {
              haptic.light()
              setNotificationPreferences({
                attributionEnabled: !notificationPreferences.attributionEnabled,
              })
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Impact updates
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                When your shared content helps others
              </p>
            </div>
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{
                background: notificationPreferences.attributionEnabled
                  ? 'var(--toggle-on)'
                  : 'var(--toggle-off)',
              }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${notificationPreferences.attributionEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>

          {/* Milestone notifications */}
          <button
            onClick={() => {
              haptic.light()
              setNotificationPreferences({
                milestoneEnabled: !notificationPreferences.milestoneEnabled,
              })
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Milestone achievements
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Save milestone moments to notification history
              </p>
            </div>
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{
                background: notificationPreferences.milestoneEnabled
                  ? 'var(--toggle-on)'
                  : 'var(--toggle-off)',
              }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${notificationPreferences.milestoneEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>

          {/* Gentle reminders */}
          <button
            onClick={() => {
              haptic.light()
              setNotificationPreferences({
                gentleRemindersEnabled: !notificationPreferences.gentleRemindersEnabled,
              })
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Session reminders
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Reminder before planned sessions
              </p>
            </div>
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{
                background: notificationPreferences.gentleRemindersEnabled
                  ? 'var(--toggle-on)'
                  : 'var(--toggle-off)',
              }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${notificationPreferences.gentleRemindersEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>

          {/* Reminder timing - only show when gentle reminders enabled */}
          {notificationPreferences.gentleRemindersEnabled && (
            <div className="py-4">
              <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                Remind me
              </p>
              <div className="flex gap-2">
                {[15, 30, 60].map((minutes) => {
                  const isActive = notificationPreferences.reminderMinutesBefore === minutes
                  return (
                    <button
                      key={minutes}
                      onClick={() => {
                        haptic.light()
                        setNotificationPreferences({ reminderMinutesBefore: minutes })
                      }}
                      className={`
                        flex-1 py-2.5 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                        ${
                          isActive
                            ? 'bg-moss text-cream'
                            : 'bg-cream-warm text-ink hover:bg-cream-deep'
                        }
                      `}
                    >
                      <p className={`text-xs ${isActive ? 'text-cream' : 'text-ink/60'}`}>
                        {minutes} min before
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Theme</p>

          {/* Neutral Theme Picker: Auto / Light / Dark */}
          <div className="mb-4">
            <div className="flex gap-2">
              {(['auto', 'light', 'dark'] as const).map((mode) => {
                const isActive = !isLivingTheme(themeMode) && getNeutralMode(themeMode) === mode
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      haptic.light()
                      setNeutralMode(mode)
                    }}
                    className={`
                      flex-1 py-3 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                      ${
                        isActive
                          ? 'bg-moss text-cream'
                          : 'bg-cream-warm text-ink hover:bg-cream-deep'
                      }
                    `}
                  >
                    <p className={`text-sm font-medium ${isActive ? 'text-cream' : 'text-ink/80'}`}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </p>
                  </button>
                )
              })}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {isLivingTheme(themeMode)
                ? 'Living theme is active'
                : getNeutralMode(themeMode) === 'auto'
                  ? 'Follows your system preference'
                  : `Always ${getNeutralMode(themeMode)} mode`}
            </p>
          </div>

          {/* Living Theme Toggle */}
          <button
            onClick={() => {
              haptic.light()
              toggleLivingTheme(!isLivingTheme(themeMode))
            }}
            className="w-full flex items-center justify-between py-4 active:scale-[0.99] transition-transform touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Living theme
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {isLivingTheme(themeMode)
                  ? themeMode === 'living-auto'
                    ? `Adapts to time & season — ${currentThemeName}`
                    : `Fixed to ${manualSeason} ${manualTime}`
                  : 'Seasonal colors based on time and location'}
              </p>
            </div>
            <div
              className="relative w-12 h-7 rounded-full transition-colors duration-300"
              style={{
                background: isLivingTheme(themeMode) ? 'var(--toggle-on)' : 'var(--toggle-off)',
              }}
            >
              <div
                className={`
                  absolute top-1 w-5 h-5 rounded-full shadow-sm
                  transition-transform duration-300
                  ${isLivingTheme(themeMode) ? 'translate-x-6' : 'translate-x-1'}
                `}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </div>
          </button>

          {/* Living Theme Options (expanded when living theme is on) */}
          {isLivingTheme(themeMode) && (
            <div className="mt-2 space-y-4 pl-1">
              {/* Auto / Manual Toggle */}
              <div>
                <div className="flex gap-2">
                  {(['auto', 'manual'] as const).map((mode) => {
                    const isActive = themeMode === `living-${mode}`
                    return (
                      <button
                        key={mode}
                        onClick={() => {
                          haptic.light()
                          setLivingMode(mode)
                        }}
                        className={`
                          flex-1 py-2.5 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                          ${
                            isActive
                              ? 'bg-moss text-cream'
                              : 'bg-cream-warm text-ink hover:bg-cream-deep'
                          }
                        `}
                      >
                        <p
                          className={`text-xs font-medium ${isActive ? 'text-cream' : 'text-ink/70'}`}
                        >
                          {mode === 'auto' ? 'Auto' : 'Manual'}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Season and Time pickers (only when manual) */}
              {themeMode === 'living-manual' && (
                <>
                  {/* Season Picker */}
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                      Season
                    </p>
                    <div className="flex gap-2">
                      {LIVING_SEASON_OPTIONS.map((option) => {
                        const isActive = manualSeason === option.value
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              haptic.light()
                              setManualTheme(option.value, manualTime)
                            }}
                            className={`
                              flex-1 py-2.5 px-1 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                              ${
                                isActive
                                  ? 'bg-moss text-cream'
                                  : 'bg-cream-warm text-ink hover:bg-cream-deep'
                              }
                            `}
                          >
                            <span className="text-sm">{option.icon}</span>
                            <p
                              className={`text-xs mt-0.5 ${isActive ? 'text-cream' : 'text-ink/60'}`}
                            >
                              {option.label}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time of Day Picker */}
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                      Time of day
                    </p>
                    <div className="flex gap-2">
                      {TIME_OPTIONS.map((option) => {
                        const isActive = manualTime === option.value
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              haptic.light()
                              setManualTheme(manualSeason as Season, option.value)
                            }}
                            className={`
                              flex-1 py-2.5 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                              ${
                                isActive
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
                </>
              )}
            </div>
          )}
        </div>

        {/* Data */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Your Data</p>
          <button
            onClick={() => {
              haptic.light()
              exportData()
            }}
            className="w-full p-4 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99] touch-manipulation"
          >
            <p className="text-sm text-ink font-medium">Export Your Data</p>
            <p className="text-xs text-ink/40 mt-1">
              Download your meditation journal and wellbeing tracking
            </p>
          </button>
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
        </div>
      </div>

      {/* Version */}
      <footer className="pb-20 text-center">
        <p className="font-serif text-xs text-ink/25 italic">Still Hours · v3.0.0</p>
      </footer>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to create"
        subtitle="Share pearls and guided meditations with the community"
      />
    </div>
  )
}
