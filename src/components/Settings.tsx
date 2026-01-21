/**
 * Settings - App configuration and preferences
 *
 * Accessed from Profile page via gear icon.
 * Contains:
 * - Account status (sign in to create)
 * - Theme selection (Auto / Light / Dark)
 * - Display options (hide time / orb mode)
 * - Data export
 * - Legal links
 * - Version info
 */

import { useState } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useHourBankStore } from '../stores/useHourBankStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { formatAvailableHours } from '../lib/hourBank'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { useMeditationLock } from '../hooks/useMeditationLock'
import { trackHideTimeToggle } from '../lib/analytics'
import { exportData } from '../lib/export'
import { AuthModal } from './AuthModal'
import { SuggestionForm } from './SuggestionForm'
import { LockSetupFlow } from './LockSetupFlow'
import { LockComingSoonModal } from './LockComingSoonModal'

interface SettingsProps {
  onBack: () => void
  onNavigateToStore: () => void
  onNavigateToPrivacy: () => void
  onNavigateToTerms: () => void
}

// Format lock active status display
// Example: "Active · 7:00 AM - 9:00 AM · M T W T F"
function formatLockActiveStatus(settings: {
  scheduleWindows: { startHour: number; startMinute: number; endHour: number; endMinute: number }[]
  activeDays: boolean[]
}): string {
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Format time range
  const window = settings.scheduleWindows[0]
  const timeRange = window
    ? `${formatTime(window.startHour, window.startMinute)} - ${formatTime(window.endHour, window.endMinute)}`
    : ''

  // Format active days
  const activeDayLetters = settings.activeDays
    .map((active, i) => (active ? DAY_LETTERS[i] : null))
    .filter(Boolean)
    .join(' ')

  return `Active · ${timeRange} · ${activeDayLetters}`
}

export function Settings({
  onBack,
  onNavigateToStore,
  onNavigateToPrivacy,
  onNavigateToTerms,
}: SettingsProps) {
  const {
    hideTimeDisplay,
    setHideTimeDisplay,
    themeMode,
    setThemeMode,
    audioFeedbackEnabled,
    setAudioFeedbackEnabled,
    notificationPreferences,
    setNotificationPreferences,
  } = useSettingsStore()
  const { user, isAuthenticated, signOut, isLoading: authLoading, refreshProfile } = useAuthStore()
  const { available, isLifetime } = useHourBankStore()
  const { showReviewPromptModal } = useNavigationStore()
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()
  const meditationLock = useMeditationLock()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)
  const [showLockSetupFlow, setShowLockSetupFlow] = useState(false)
  const [showLockComingSoon, setShowLockComingSoon] = useState(false)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: refreshProfile,
  })

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
            <div className="p-5 bg-elevated shadow-sm rounded-xl">
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
              className="w-full p-5 bg-elevated shadow-sm
                rounded-xl text-left hover:shadow-md transition-all
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

        {/* Hour Packs */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Meditation Hours</p>
          <button
            onClick={() => {
              haptic.light()
              onNavigateToStore()
            }}
            className="w-full p-5 bg-elevated shadow-sm
              rounded-xl text-left hover:shadow-md transition-all
              active:scale-[0.99] touch-manipulation"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink font-medium">Hour Packs</p>
                <p className="text-xs text-ink/40 mt-1">
                  {isLifetime ? 'You have lifetime access' : 'Purchase meditation time'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-ink">
                  {isLifetime ? 'Lifetime' : formatAvailableHours(available)}
                </p>
                <p className="text-xs text-ink/40">available</p>
              </div>
            </div>
          </button>
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
                Subtle sound when session completes
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

        {/* Focus Mode - Meditation Lock (iOS only, shown in dev for preview) */}
        {(meditationLock.isAvailable || import.meta.env.DEV) && (
          <div className="mb-8">
            <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Focus Mode</p>
            <div className="p-5 bg-elevated shadow-sm rounded-xl space-y-4">
              <div>
                <p className="text-sm text-ink font-medium">Meditation Lock</p>
                <p className="text-xs text-ink/40 mt-1">
                  {meditationLock.settings?.enabled &&
                  meditationLock.settings.scheduleWindows.length > 0
                    ? formatLockActiveStatus(meditationLock.settings)
                    : 'Block distracting apps until you meditate'}
                </p>
              </div>

              {/* Setup Button - launches the guided setup flow */}
              {/* Shows "Coming Soon" modal if Screen Time isn't ready yet */}
              <button
                onClick={() => {
                  haptic.light()
                  // If Screen Time is authorized, go directly to setup
                  // Otherwise show the "Coming Soon" modal first
                  if (meditationLock.authorizationStatus === 'authorized') {
                    setShowLockSetupFlow(true)
                  } else {
                    setShowLockComingSoon(true)
                  }
                }}
                className="w-full py-2.5 px-4 bg-moss text-cream text-sm rounded-lg text-center
                  hover:bg-moss/90 transition-colors active:scale-[0.98] touch-manipulation"
              >
                {meditationLock.settings?.enabled ? 'Edit Focus Mode' : 'Set Up Focus Mode'}
              </button>

              {/* Authorization Status */}
              <div className="flex items-center justify-between py-2 border-t border-ink/5">
                <p className="text-xs text-ink/50">Screen Time</p>
                <p
                  className={`text-xs font-medium ${
                    meditationLock.authorizationStatus === 'authorized'
                      ? 'text-moss'
                      : meditationLock.authorizationStatus === 'denied'
                        ? 'text-red-500'
                        : 'text-ink/40'
                  }`}
                >
                  {meditationLock.authorizationStatus === 'authorized'
                    ? 'Authorized'
                    : meditationLock.authorizationStatus === 'denied'
                      ? 'Denied'
                      : 'Not Set Up'}
                </p>
              </div>

              {/* Quick authorize if not set up - only show on native iOS where it actually works */}
              {meditationLock.isAvailable &&
                meditationLock.authorizationStatus !== 'authorized' && (
                  <button
                    onClick={async () => {
                      haptic.light()
                      await meditationLock.requestAuth()
                    }}
                    disabled={meditationLock.isLoading}
                    className="w-full py-2.5 px-4 bg-cream-warm text-ink text-sm rounded-lg text-center
                    hover:bg-cream-deep transition-colors active:scale-[0.98] touch-manipulation
                    disabled:opacity-50"
                  >
                    {meditationLock.isLoading ? 'Requesting...' : 'Authorize Screen Time'}
                  </button>
                )}

              {/* Blocked Apps Status (only when authorized and apps blocked) */}
              {meditationLock.authorizationStatus === 'authorized' &&
                meditationLock.blockedAppTokens.length > 0 && (
                  <div className="flex items-center justify-between py-2 border-t border-ink/5">
                    <p className="text-xs text-ink/50">
                      {meditationLock.blockedAppTokens.length} app
                      {meditationLock.blockedAppTokens.length === 1 ? '' : 's'} blocked
                    </p>
                    <button
                      onClick={async () => {
                        haptic.light()
                        await meditationLock.unblock()
                      }}
                      disabled={meditationLock.isLoading}
                      className="text-xs text-red-500 hover:text-red-600 transition-colors touch-manipulation"
                    >
                      Unblock All
                    </button>
                  </div>
                )}

              {/* Error display */}
              {meditationLock.error && (
                <p className="text-xs text-red-500 py-2">{meditationLock.error}</p>
              )}

              {/* Deactivate option - only show when lock is enabled */}
              {meditationLock.settings?.enabled && (
                <div className="pt-3 border-t border-ink/5">
                  <button
                    onClick={async () => {
                      haptic.light()
                      if (
                        window.confirm(
                          'Deactivate Focus Lock? You can re-enable it anytime from this screen.'
                        )
                      ) {
                        await meditationLock.disable?.()
                      }
                    }}
                    className="text-xs text-ink/40 hover:text-red-500 transition-colors touch-manipulation"
                  >
                    Deactivate Focus Lock
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Theme */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Theme</p>
          <div className="flex gap-2">
            {(['auto', 'light', 'dark'] as const).map((mode) => {
              const isActive = themeMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => {
                    haptic.light()
                    setThemeMode(mode)
                  }}
                  className={`
                    flex-1 py-3 rounded-xl text-center transition-all duration-200 touch-manipulation active:scale-[0.97]
                    ${
                      isActive ? 'bg-moss text-cream' : 'bg-cream-warm text-ink hover:bg-cream-deep'
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
            {themeMode === 'auto' ? 'Follows your system preference' : `Always ${themeMode} mode`}
          </p>
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

        {/* Feedback */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Feedback</p>
          <button
            onClick={() => {
              haptic.light()
              setShowSuggestionForm(true)
            }}
            className="w-full p-4 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99] touch-manipulation"
          >
            <p className="text-sm text-ink font-medium">Suggest an App</p>
            <p className="text-xs text-ink/40 mt-1">
              Help us pick the next app to build. Your ideas matter.
            </p>
          </button>

          {/* Rate Still Hours */}
          <button
            onClick={() => {
              haptic.light()
              showReviewPromptModal('Share your experience')
            }}
            className="w-full p-4 bg-cream-warm rounded-xl text-left hover:bg-cream-deep transition-colors active:scale-[0.99] touch-manipulation mt-3"
          >
            <p className="text-sm text-ink font-medium">Rate Still Hours</p>
            <p className="text-xs text-ink/40 mt-1">Share your experience on the App Store</p>
          </button>
        </div>

        {/* Legal */}
        <div className="space-y-1 mb-8">
          <button
            onClick={() => {
              haptic.light()
              onNavigateToPrivacy()
            }}
            className="block w-full text-left py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => {
              haptic.light()
              onNavigateToTerms()
            }}
            className="block w-full text-left py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
          >
            Terms of Service
          </button>
        </div>
      </div>

      {/* Version & Copyright */}
      <footer className="pb-20 text-center space-y-1">
        <p className="font-serif text-xs text-ink/25 italic">Still Hours · v3.0.0</p>
        <p className="text-xs text-ink/20">© 2026 Still Hours. All rights reserved.</p>
      </footer>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to create"
        subtitle="Share pearls and guided meditations with the community"
      />

      {/* Suggestion form modal */}
      <SuggestionForm isOpen={showSuggestionForm} onClose={() => setShowSuggestionForm(false)} />

      {/* Lock Coming Soon modal - shows before setup when Screen Time isn't ready */}
      <LockComingSoonModal
        isOpen={showLockComingSoon}
        onClose={() => setShowLockComingSoon(false)}
        onContinueSetup={() => setShowLockSetupFlow(true)}
      />

      {/* Lock Setup Flow modal */}
      {showLockSetupFlow && (
        <LockSetupFlow
          onComplete={() => {
            setShowLockSetupFlow(false)
            // Refresh the meditation lock status
            meditationLock.refreshStatus?.()
          }}
          onClose={() => setShowLockSetupFlow(false)}
        />
      )}
    </div>
  )
}
