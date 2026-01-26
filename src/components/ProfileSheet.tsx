/**
 * ProfileSheet - Bottom sheet for quick identity and account access
 *
 * Compact profile overview accessible from header.
 * - Avatar + Name + Tenure
 * - Voice Badge (tappable → Progress/Voice modal)
 * - Meditation Preferences accordion
 * - Account section (email, sign out)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/useAuthStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSessionStore } from '../stores/useSessionStore'
import { useVoice } from '../hooks/useVoice'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { getUserPreferences, updateUserPreferences, getProfile, UserPreferences } from '../lib/db'
import { VoiceBadge } from './VoiceBadge'

// Preference options (from Profile.tsx)
const POSTURE_OPTIONS = [
  { value: 'seated-cushion', label: 'Cushion' },
  { value: 'seated-chair', label: 'Chair' },
  { value: 'lying', label: 'Lying' },
  { value: 'walking', label: 'Walking' },
  { value: 'varies', label: 'Varies' },
]

const DISCIPLINE_OPTIONS = [
  { value: 'open', label: 'Open Awareness' },
  { value: 'breath', label: 'Breath Focus' },
  { value: 'vipassana', label: 'Vipassana' },
  { value: 'zen', label: 'Zen' },
  { value: 'loving-kindness', label: 'Loving Kindness' },
  { value: 'body-scan', label: 'Body Scan' },
  { value: 'varies', label: 'Varies' },
]

const DURATION_OPTIONS = [
  { value: '5-10', label: '5-10m' },
  { value: '15-20', label: '15-20m' },
  { value: '30+', label: '30+m' },
  { value: 'varies', label: 'Varies' },
]

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'varies', label: 'Varies' },
]

interface ProfileSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileSheet({ isOpen, onClose }: ProfileSheetProps) {
  const { user, isAuthenticated, signOut } = useAuthStore()
  const { setViewWithVoiceModal } = useNavigationStore()
  const { sessions } = useSessionStore()
  const { voice, isLoading: voiceLoading } = useVoice()
  const haptic = useTapFeedback()

  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [practicingSince, setPracticingSince] = useState<Date | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Load preferences and profile data
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      try {
        const [prefs, profile] = await Promise.all([getUserPreferences(), getProfile()])
        setPreferences(prefs)

        if (profile.firstSessionDate) {
          setPracticingSince(new Date(profile.firstSessionDate))
        } else if (sessions.length > 0) {
          const firstSession = Math.min(...sessions.map((s) => s.startTime))
          setPracticingSince(new Date(firstSession))
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
      }
    }

    loadData()
  }, [isOpen, sessions])

  // Update preference
  const handlePreferenceChange = async (key: keyof UserPreferences, value: string) => {
    if (!preferences) return
    haptic.light()
    await updateUserPreferences({ [key]: value })
    setPreferences((prev) => (prev ? { ...prev, [key]: value } : null))
  }

  // Sign out handler
  const handleSignOut = async () => {
    haptic.light()
    setIsSigningOut(true)
    try {
      await signOut()
      onClose()
    } catch (err) {
      console.error('Sign out failed:', err)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Format practicing since date
  const formatPracticingSince = (date: Date): string => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Get display name
  const displayName =
    preferences?.displayName || (user?.email ? user.email.split('@')[0] : 'Practitioner')

  // Get initials for avatar
  const getInitials = (name: string): string => {
    const parts = name.split(/[\s._-]+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-lg rounded-t-3xl shadow-xl max-h-[calc(90vh-env(safe-area-inset-top,0px))] flex flex-col"
              style={{ background: 'var(--bg-elevated)' }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-6">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--text-muted) 20%, transparent))',
                    }}
                  >
                    {preferences?.avatarUrl ? (
                      <img
                        src={preferences.avatarUrl}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-lg font-serif"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {getInitials(displayName)}
                      </span>
                    )}
                  </div>

                  {/* Name and tenure */}
                  <div className="flex-1">
                    <h2 className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>
                      {displayName}
                    </h2>
                    {practicingSince && (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Practicing since {formatPracticingSince(practicingSince)}
                      </p>
                    )}
                  </div>

                  {/* Voice badge - tappable to open Voice modal on Progress */}
                  {!voiceLoading && voice && (
                    <button
                      onClick={() => {
                        haptic.light()
                        onClose()
                        setViewWithVoiceModal()
                      }}
                      className="flex flex-col items-center active:scale-[0.97] transition-transform touch-manipulation"
                    >
                      <VoiceBadge score={voice.total} showScore showLabel />
                      <span className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        Voice
                      </span>
                    </button>
                  )}
                </div>

                {/* Meditation Preferences Accordion */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      haptic.light()
                      setShowPreferences(!showPreferences)
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:opacity-90 transition-all touch-manipulation"
                    style={{
                      background: 'var(--bg-elevated-hover)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Meditation Preferences
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {preferences?.preferredDiscipline &&
                        preferences.preferredDiscipline !== 'varies'
                          ? DISCIPLINE_OPTIONS.find(
                              (d) => d.value === preferences.preferredDiscipline
                            )?.label
                          : 'Set your defaults'}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${showPreferences ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
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

                  {/* Expanded preferences */}
                  {showPreferences && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 rounded-xl space-y-4"
                      style={{ background: 'var(--bg-surface)' }}
                    >
                      {/* Posture */}
                      <div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                          Preferred posture
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {POSTURE_OPTIONS.map((opt) => {
                            const isSelected = preferences?.preferredPosture === opt.value
                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handlePreferenceChange('preferredPosture', opt.value)
                                }
                                className="px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97]"
                                style={{
                                  background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                                  color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                }}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Discipline */}
                      <div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                          Preferred discipline
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {DISCIPLINE_OPTIONS.map((opt) => {
                            const isSelected = preferences?.preferredDiscipline === opt.value
                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handlePreferenceChange('preferredDiscipline', opt.value)
                                }
                                className="px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97]"
                                style={{
                                  background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                                  color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                }}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                          Typical duration
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {DURATION_OPTIONS.map((opt) => {
                            const isSelected = preferences?.preferredDuration === opt.value
                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handlePreferenceChange('preferredDuration', opt.value)
                                }
                                className="px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97]"
                                style={{
                                  background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                                  color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                }}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Time */}
                      <div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                          Best time
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {TIME_OPTIONS.map((opt) => {
                            const isSelected = preferences?.preferredTime === opt.value
                            return (
                              <button
                                key={opt.value}
                                onClick={() => handlePreferenceChange('preferredTime', opt.value)}
                                className="px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97]"
                                style={{
                                  background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                                  color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                }}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Account Section */}
                {isAuthenticated && user && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      Account
                    </p>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </p>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="text-sm font-medium transition-opacity active:opacity-70 touch-manipulation"
                      style={{ color: 'var(--accent)' }}
                    >
                      {isSigningOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>

              {/* Close button */}
              <div
                className="px-6 pb-4 pt-4 safe-area-bottom"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-opacity active:opacity-70"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
