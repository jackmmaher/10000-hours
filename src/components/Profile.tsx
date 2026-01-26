/**
 * Profile - User identity, preferences, and wellbeing tracking
 *
 * Features:
 * - Avatar and display name
 * - "Practicing since" tenure indicator
 * - Voice score badge (tappable → Progress)
 * - Meditation preferences (posture, discipline, duration, time)
 * - Wellbeing tracking with check-ins
 * - Gear icon → Settings sub-page
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useVoice } from '../hooks/useVoice'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import {
  getUserPreferences,
  updateUserPreferences,
  getWellbeingDimensions,
  getWellbeingSettings,
  getLatestCheckIns,
  getProfile,
  UserPreferences,
  WellbeingDimension,
  WellbeingCheckIn,
  WellbeingSettings,
} from '../lib/db'
// Practice Goal moved to Progress.tsx
import { VoiceBadge } from './VoiceBadge'
import { WellbeingCard } from './WellbeingCard'
import { ReciprocityCard } from './ReciprocityCard'
import { getReciprocityData, ReciprocityData } from '../lib/reciprocity'

// Preference options
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

export function Profile() {
  const { sessions } = useSessionStore()
  const { setView, setViewWithVoiceModal } = useNavigationStore()
  const { user, isAuthenticated } = useAuthStore()
  const { voice, isLoading: voiceLoading } = useVoice()
  const haptic = useTapFeedback()

  // Local state
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [dimensions, setDimensions] = useState<WellbeingDimension[]>([])
  const [latestCheckIns, setLatestCheckIns] = useState<Map<string, WellbeingCheckIn>>(new Map())
  const [wellbeingSettings, setWellbeingSettings] = useState<WellbeingSettings | null>(null)
  const [practicingSince, setPracticingSince] = useState<Date | null>(null)
  const [reciprocityData, setReciprocityData] = useState<ReciprocityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreferences, setShowPreferences] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [prefs, dims, wbSettings, profile] = await Promise.all([
        getUserPreferences(),
        getWellbeingDimensions(),
        getWellbeingSettings(),
        getProfile(),
      ])
      setPreferences(prefs)
      setDimensions(dims)
      setWellbeingSettings(wbSettings)

      if (profile.firstSessionDate) {
        setPracticingSince(new Date(profile.firstSessionDate))
      } else if (sessions.length > 0) {
        const firstSession = Math.min(...sessions.map((s) => s.startTime))
        setPracticingSince(new Date(firstSession))
      }

      // Load latest check-ins
      const checkIns = await getLatestCheckIns()
      setLatestCheckIns(checkIns)

      // Load reciprocity data if authenticated
      if (user?.id) {
        const reciprocity = await getReciprocityData(user.id)
        setReciprocityData(reciprocity)
      }
    } catch (err) {
      console.error('Failed to load profile data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sessions, user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reference to scroll container
  const scrollRef = useRef<HTMLDivElement>(null)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: loadData,
  })

  // Swipe navigation
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setView('timer')
      }
    },
    onSwipeRight: () => setView('progress'),
  })

  // Update preference
  const handlePreferenceChange = async (key: keyof UserPreferences, value: string) => {
    if (!preferences) return
    haptic.light()
    await updateUserPreferences({ [key]: value })
    setPreferences((prev) => (prev ? { ...prev, [key]: value } : null))
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

  if (isLoading) {
    return (
      <div className="h-full bg-cream flex items-center justify-center">
        <div className="w-1 h-1 bg-indigo-deep/30 rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="h-full bg-cream overflow-y-auto pt-16 pb-24"
      {...navSwipeHandlers}
      onTouchStart={(e) => {
        pullHandlers.onTouchStart(e)
        navSwipeHandlers.onTouchStart?.(e)
      }}
      onTouchMove={pullHandlers.onTouchMove}
      onTouchEnd={(e) => {
        pullHandlers.onTouchEnd()
        navSwipeHandlers.onTouchEnd?.(e)
      }}
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

      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-deep/20 to-moss/20 flex items-center justify-center">
            {preferences?.avatarUrl ? (
              <img
                src={preferences.avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-serif text-ink/60">{getInitials(displayName)}</span>
            )}
          </div>

          {/* Name and tenure */}
          <div className="flex-1">
            <h1 className="font-serif text-xl text-ink">{displayName}</h1>
            {practicingSince && (
              <p className="text-sm text-ink/40 mt-0.5">
                Practicing since {formatPracticingSince(practicingSince)}
              </p>
            )}
          </div>

          {/* Voice badge - tappable to open Voice modal on Progress */}
          {!voiceLoading && voice && (
            <button
              onClick={() => {
                haptic.light()
                setViewWithVoiceModal()
              }}
              className="flex flex-col items-center active:scale-[0.97] transition-transform touch-manipulation"
            >
              <VoiceBadge score={voice.total} showScore showLabel />
              <span className="text-[10px] text-ink/30 mt-1">Voice</span>
            </button>
          )}
        </div>

        {/* Account info (if signed in) */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 bg-cream-warm rounded-xl">
            <p className="text-sm text-ink/60">{user.email}</p>
          </div>
        )}

        {/* Meditation Preferences */}
        <div className="mb-6">
          <button
            onClick={() => {
              haptic.light()
              setShowPreferences(!showPreferences)
            }}
            className="w-full flex items-center justify-between p-4 bg-elevated shadow-sm
              rounded-xl hover:shadow-md transition-all touch-manipulation"
          >
            <div className="text-left">
              <p className="text-sm text-ink font-medium">Meditation Preferences</p>
              <p className="text-xs text-ink/40 mt-0.5">
                {preferences?.preferredDiscipline && preferences.preferredDiscipline !== 'varies'
                  ? DISCIPLINE_OPTIONS.find((d) => d.value === preferences.preferredDiscipline)
                      ?.label
                  : 'Set your defaults'}
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-ink/30 transition-transform ${showPreferences ? 'rotate-180' : ''}`}
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
            <div className="mt-3 p-4 bg-cream-warm rounded-xl space-y-4">
              {/* Posture */}
              <div>
                <p className="text-xs text-ink/50 mb-2">Preferred posture</p>
                <div className="flex flex-wrap gap-2">
                  {POSTURE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePreferenceChange('preferredPosture', opt.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97] ${
                        preferences?.preferredPosture === opt.value
                          ? 'bg-moss text-cream'
                          : 'bg-cream text-ink/60 hover:bg-cream-deep'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discipline */}
              <div>
                <p className="text-xs text-ink/50 mb-2">Preferred discipline</p>
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePreferenceChange('preferredDiscipline', opt.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97] ${
                        preferences?.preferredDiscipline === opt.value
                          ? 'bg-moss text-cream'
                          : 'bg-cream text-ink/60 hover:bg-cream-deep'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <p className="text-xs text-ink/50 mb-2">Typical duration</p>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePreferenceChange('preferredDuration', opt.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97] ${
                        preferences?.preferredDuration === opt.value
                          ? 'bg-moss text-cream'
                          : 'bg-cream text-ink/60 hover:bg-cream-deep'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <p className="text-xs text-ink/50 mb-2">Best time</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePreferenceChange('preferredTime', opt.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation active:scale-[0.97] ${
                        preferences?.preferredTime === opt.value
                          ? 'bg-moss text-cream'
                          : 'bg-cream text-ink/60 hover:bg-cream-deep'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wellbeing Tracking */}
        <WellbeingCard
          dimensions={dimensions}
          latestCheckIns={latestCheckIns}
          settings={wellbeingSettings}
          onRefresh={loadData}
        />

        {/* Community Reciprocity (only shown if user has community interactions) */}
        {reciprocityData && (
          <div className="mt-6">
            <ReciprocityCard data={reciprocityData} />
          </div>
        )}
      </div>
    </div>
  )
}
