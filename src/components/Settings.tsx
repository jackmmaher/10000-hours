/**
 * Settings - App configuration and preferences
 *
 * Accessed from Profile page via gear icon.
 * Contains:
 * - Hour Packs (prominent card at top)
 * - Theme selection (Auto / Light / Dark)
 * - Display & Audio (accordion - hide time / audio feedback)
 * - Notifications (accordion - impact updates / milestones / reminders)
 * - Data export
 * - Legal links
 * - Version info
 */

import { useState } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useHourBankStore } from '../stores/useHourBankStore'
import { formatAvailableHours } from '../lib/hourBank'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { useMeditationLock } from '../hooks/useMeditationLock'
import { trackHideTimeToggle } from '../lib/analytics'
import { exportData } from '../lib/export'
import { LockSetupFlow } from './LockSetupFlow'
import { LockComingSoonModal } from './LockComingSoonModal'
import { CommitmentStatus } from './CommitmentStatus'
import { CommitmentEmergencyExit } from './CommitmentEmergencyExit'

interface SettingsProps {
  onBack: () => void
  onNavigateToStore: () => void
  onNavigateToPrivacy: () => void
  onNavigateToTerms: () => void
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
  const { refreshProfile } = useAuthStore()
  const { available, isLifetime } = useHourBankStore()
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()
  const meditationLock = useMeditationLock()
  const [showLockSetupFlow, setShowLockSetupFlow] = useState(false)
  const [showLockComingSoon, setShowLockComingSoon] = useState(false)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showEmergencyExit, setShowEmergencyExit] = useState(false)
  const [commitmentStatusKey, setCommitmentStatusKey] = useState(0)

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

        {/* Hour Packs - prominent card at TOP */}
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

        {/* Display & Audio - accordion */}
        <div className="mb-8">
          <button
            onClick={() => {
              haptic.light()
              setShowDisplaySettings(!showDisplaySettings)
            }}
            className="w-full flex items-center justify-between py-4"
          >
            <p className="font-serif text-sm text-ink/50 tracking-wide">Display & Audio</p>
            <svg
              className={`w-5 h-5 text-ink/30 transition-transform ${showDisplaySettings ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showDisplaySettings && (
            <div className="space-y-0">
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
          )}
        </div>

        {/* Notifications - accordion */}
        <div className="mb-8">
          <button
            onClick={() => {
              haptic.light()
              setShowNotificationSettings(!showNotificationSettings)
            }}
            className="w-full flex items-center justify-between py-4"
          >
            <p className="font-serif text-sm text-ink/50 tracking-wide">Notifications</p>
            <svg
              className={`w-5 h-5 text-ink/30 transition-transform ${showNotificationSettings ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showNotificationSettings && (
            <div className="space-y-0">
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
          )}
        </div>

        {/* Commitment Mode */}
        <div className="mb-8">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Commitment Mode</p>
          <CommitmentStatus
            key={commitmentStatusKey}
            compact
            onViewDetails={() => {
              haptic.light()
              setShowEmergencyExit(true)
            }}
          />
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

      {/* Commitment Emergency Exit modal */}
      <CommitmentEmergencyExit
        isOpen={showEmergencyExit}
        onClose={() => setShowEmergencyExit(false)}
        onComplete={() => {
          setShowEmergencyExit(false)
          // Refresh commitment status to reflect deactivation
          setCommitmentStatusKey((k) => k + 1)
        }}
      />
    </div>
  )
}
