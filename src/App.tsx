import { useEffect, useState, useCallback, useRef } from 'react'
import { useSessionStore } from './stores/useSessionStore'
import { useNavigationStore } from './stores/useNavigationStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useVoice } from './hooks/useVoice'
import {
  generateAttributionNotification,
  shouldCheckAttribution,
  markAttributionChecked,
} from './lib/attribution'
import { checkAndCreateReminders } from './lib/reminders'
import { checkVoiceGrowthNotification } from './lib/voice'
import { Timer } from './components/Timer'
import { Calendar } from './components/Calendar'
import { Settings } from './components/Settings'
import { Profile } from './components/Profile'
import { Insights } from './components/Insights'
import { PearlsFeed } from './components/PearlsFeed'
import { SavedPearls } from './components/SavedPearls'
import { Navigation } from './components/Navigation'
import { Journey } from './components/Journey'
import { Explore } from './components/Explore'
import { Progress } from './components/Progress'
import { SessionEditModal } from './components/SessionEditModal'
import { useAuthStore } from './stores/useAuthStore'
import { Onboarding, hasSeenOnboarding, markOnboardingSeen } from './components/Onboarding'
import { MilestoneCelebration } from './components/MilestoneCelebration'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LivingTheme } from './components/LivingTheme'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { ToastContainer } from './components/Toast'
import type { Session } from './lib/db'

function AppContent() {
  const { view, setView } = useNavigationStore()
  const { isLoading, hydrate } = useSessionStore()
  const settingsStore = useSettingsStore()
  const authStore = useAuthStore()

  // Initialize voice tracking - notifications handled centrally below
  const { voice } = useVoice()
  const previousVoiceScore = useRef<number | null>(null)

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)
  const hasInitialized = useRef(false)

  // Hydrate all stores on mount (runs once)
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const init = async () => {
      await hydrate()
      await settingsStore.hydrate()
      await authStore.initialize()

      // Check if should show onboarding
      if (!hasSeenOnboarding()) {
        setShowOnboarding(true)
      }
    }
    init()
  }, [hydrate, settingsStore, authStore])

  // Voice growth notification check (singleton - only runs here)
  // This prevents race conditions from multiple useVoice instances
  useEffect(() => {
    if (voice === null) return

    const currentScore = voice.total

    // Skip on first load - just record baseline
    if (previousVoiceScore.current === null) {
      previousVoiceScore.current = currentScore
      return
    }

    // Check for threshold crossings if score changed
    if (previousVoiceScore.current !== currentScore) {
      checkVoiceGrowthNotification({
        previousScore: previousVoiceScore.current,
        currentScore,
      }).catch((err) => {
        console.warn('Failed to check voice growth notification:', err)
      })
      previousVoiceScore.current = currentScore
    }
  }, [voice])

  // Weekly attribution check (delayed to not block initial load)
  useEffect(() => {
    const user = authStore.user
    if (!user) return

    // Respect user's notification preferences
    if (!settingsStore.notificationPreferences.attributionEnabled) return

    // Check attribution weekly (oxytocin trigger)
    if (shouldCheckAttribution()) {
      const timeout = setTimeout(async () => {
        await generateAttributionNotification(user.id)
        markAttributionChecked()
      }, 5000) // 5 second delay

      return () => clearTimeout(timeout)
    }
  }, [authStore.user, settingsStore.notificationPreferences.attributionEnabled])

  // Gentle reminder check (runs on load and every 5 minutes)
  useEffect(() => {
    // Check on load (after short delay)
    const initialCheck = setTimeout(checkAndCreateReminders, 3000)

    // Check periodically (every 5 minutes)
    const interval = setInterval(checkAndCreateReminders, 5 * 60 * 1000)

    return () => {
      clearTimeout(initialCheck)
      clearInterval(interval)
    }
  }, [])

  // Handlers
  const handleOnboardingComplete = useCallback(() => {
    markOnboardingSeen()
    setShowOnboarding(false)
  }, [])

  // Session editing handlers
  const handleEditSession = useCallback((session: Session) => {
    setEditingSession(session)
  }, [])

  const handleSessionEditClose = useCallback(() => {
    setEditingSession(null)
  }, [])

  const handleSessionEditSave = useCallback(async () => {
    setEditingSession(null)
    // Refresh sessions from DB
    await hydrate()
    setCalendarRefreshKey((k) => k + 1)
  }, [hydrate])

  const handleSessionEditDelete = useCallback(async () => {
    setEditingSession(null)
    // Refresh sessions from DB
    await hydrate()
    setCalendarRefreshKey((k) => k + 1)
  }, [hydrate])

  // Loading state
  if (isLoading || settingsStore.isLoading) {
    return (
      <div className="h-full bg-cream flex items-center justify-center">
        <div className="w-1 h-1 bg-indigo-deep/30 rounded-full animate-pulse" />
      </div>
    )
  }

  // Onboarding flow
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <LivingTheme breathingIntensity={0.02}>
      <div className="h-full">
        {view === 'timer' && <Timer />}
        {view === 'journey' && <Journey />}
        {view === 'progress' && <Progress />}
        {view === 'calendar' && (
          <Calendar refreshKey={calendarRefreshKey} onEditSession={handleEditSession} />
        )}
        {view === 'insights' && <Insights />}
        {view === 'pearls' && <PearlsFeed />}
        {view === 'explore' && <Explore />}
        {view === 'saved-pearls' && <SavedPearls />}
        {view === 'profile' && <Profile onNavigateToSettings={() => setView('settings')} />}
        {view === 'settings' && <Settings onBack={() => setView('profile')} />}

        {/* Session edit modal */}
        {editingSession && (
          <SessionEditModal
            session={editingSession}
            onClose={handleSessionEditClose}
            onSave={handleSessionEditSave}
            onDelete={handleSessionEditDelete}
          />
        )}

        {/* Milestone celebration overlay */}
        <MilestoneCelebration />

        {/* Toast notifications */}
        <ToastContainer />

        {/* Bottom navigation */}
        <Navigation />

        {/* PWA install prompt for iOS Safari */}
        <PWAInstallPrompt />
      </div>
    </LivingTheme>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App
