/**
 * Header - Top navigation bar
 *
 * Displays voice score badge, app name, and action icons.
 * Fades out smoothly when timer starts, fades back when timer ends.
 * Fully theme-aware using CSS variables.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useVoice } from '../hooks/useVoice'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { VoiceBadgeWithHours } from './VoiceBadge'
import { NotificationBell } from './NotificationBell'
import { NotificationCenter } from './NotificationCenter'

interface HeaderProps {
  onNavigateToSettings: () => void
}

export function Header({ onNavigateToSettings }: HeaderProps) {
  const { timerPhase } = useSessionStore()
  const { setView, setViewWithVoiceModal, navigateToInsightCapture, isSettling } =
    useNavigationStore()
  const { voice, isLoading: isVoiceLoading } = useVoice()
  const haptic = useTapFeedback()

  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0)

  // Hide during active meditation phases (with smooth fade)
  const isTimerActive = timerPhase === 'preparing' || timerPhase === 'running'

  // BUG FIX 1: Close notification modal when timer becomes active
  // Prevents modal from staying open during meditation
  useEffect(() => {
    if (isTimerActive && showNotifications) {
      setShowNotifications(false)
      setNotificationRefreshKey((k) => k + 1)
    }
  }, [isTimerActive, showNotifications])

  // Navigation is disabled during settling window (4s after meditation ends)
  const isNavigationLocked = isSettling

  const handleVoiceBadgeClick = () => {
    if (isNavigationLocked) return // BUG FIX 2: Block during settling
    haptic.light()
    setViewWithVoiceModal()
  }

  const handleTitleClick = () => {
    if (isNavigationLocked) return // BUG FIX 2: Block during settling
    haptic.light()
    setView('timer')
  }

  const handleSettingsClick = () => {
    if (isNavigationLocked) return // BUG FIX 2: Block during settling
    haptic.light()
    onNavigateToSettings()
  }

  const handleNotificationsClose = () => {
    setShowNotifications(false)
    setNotificationRefreshKey((k) => k + 1)
  }

  return (
    <>
      <AnimatePresence>
        {!isTimerActive && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm safe-area-top"
            style={{
              background: 'var(--nav-bg)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className={`flex items-center justify-between h-14 max-w-lg mx-auto px-4 transition-opacity duration-300 ${isNavigationLocked ? 'opacity-50' : ''}`}
            >
              {/* Left: VoiceBadgeWithHours */}
              <button
                onClick={handleVoiceBadgeClick}
                disabled={isNavigationLocked}
                className={`transition-transform touch-manipulation ${isNavigationLocked ? 'cursor-not-allowed' : 'active:scale-95'}`}
                aria-label="View voice details"
              >
                {/* BUG FIX 3: Don't render badge until voice is loaded to prevent 0 flicker */}
                {!isVoiceLoading && voice ? (
                  <VoiceBadgeWithHours score={voice.total} />
                ) : (
                  <div className="w-16 h-6" /> // Placeholder to maintain layout
                )}
              </button>

              {/* Center: App name */}
              <button
                onClick={handleTitleClick}
                disabled={isNavigationLocked}
                className={`transition-transform touch-manipulation ${isNavigationLocked ? 'cursor-not-allowed' : 'active:scale-95'}`}
                aria-label="Go to timer"
              >
                <h1
                  className="font-serif font-medium"
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    letterSpacing: '0.03em',
                  }}
                >
                  Still Hours
                </h1>
              </button>

              {/* Right: Icons */}
              <div className="flex items-center gap-1">
                <NotificationBell
                  onPress={() => !isNavigationLocked && setShowNotifications(true)}
                  refreshKey={notificationRefreshKey}
                  disabled={isNavigationLocked}
                />
                <button
                  onClick={handleSettingsClick}
                  disabled={isNavigationLocked}
                  className={`p-2 text-ink/40 hover:text-ink/60 transition-colors touch-manipulation ${isNavigationLocked ? 'cursor-not-allowed' : 'active:scale-[0.95]'}`}
                  aria-label="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Notification Center modal */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={handleNotificationsClose}
        onInsightReminderClick={(sessionId) => {
          navigateToInsightCapture(sessionId)
        }}
      />
    </>
  )
}
