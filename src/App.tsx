import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useSessionStore } from './stores/useSessionStore'
import { useNavigationStore } from './stores/useNavigationStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useHourBankStore } from './stores/useHourBankStore'
import { useVoice } from './hooks/useVoice'
import {
  generateAttributionNotification,
  shouldCheckAttribution,
  markAttributionChecked,
} from './lib/attribution'
import { checkAndCreateReminders } from './lib/reminders'
import { checkVoiceGrowthNotification } from './lib/voice'
import { decayAffinities } from './lib/affinities'
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
import { InsightModal } from './components/InsightModal'
import { useAuthStore } from './stores/useAuthStore'
import { Onboarding, hasSeenOnboarding, markOnboardingSeen } from './components/Onboarding'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NeutralThemeProvider } from './components/NeutralThemeProvider'
import { ZenMessage } from './components/ZenMessage'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { ToastContainer } from './components/Toast'
import { ReviewPrompt } from './components/ReviewPrompt'
import { Store } from './components/Store'
import type { Session } from './lib/db'
import { shouldPromptForReview } from './lib/nativeReview'

function AppContent() {
  const {
    view,
    setView,
    showWelcomeCutscene,
    welcomeCutsceneShown,
    triggerWelcomeCutscene,
    dismissWelcomeCutscene,
    pendingInsightSessionId,
    pendingInsightSessionDuration,
    pendingMilestone,
    pendingSourceTemplateId,
    showInsightModal,
    hideInsightCaptureModal,
    clearPostSessionState,
    showReviewPrompt,
    reviewPromptMilestone,
    hideReviewPromptModal,
    queueReviewPromptAfterInsight,
  } = useNavigationStore()
  const {
    isLoading,
    hydrate,
    goalCompleted,
    justReachedEnlightenment,
    createInsightReminder,
    totalSeconds,
  } = useSessionStore()
  const settingsStore = useSettingsStore()
  const authStore = useAuthStore()
  const hourBankStore = useHourBankStore()

  // Initialize voice tracking - notifications handled centrally below
  const { voice } = useVoice()
  const previousVoiceScore = useRef<number | null>(null)

  // Track total hours for milestone detection (10h, 100h)
  const totalHours = useMemo(() => Math.floor(totalSeconds / 3600), [totalSeconds])
  const lastCheckedHours = useRef<number | null>(null)

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
      await hourBankStore.hydrate()

      // Decay affinities weekly (prevents runaway weights)
      await decayAffinities()

      // Check if should show onboarding
      if (!hasSeenOnboarding()) {
        setShowOnboarding(true)
      }
    }
    init()
  }, [hydrate, settingsStore, authStore, hourBankStore])

  // Trigger welcome cutscene on first load (after hydration)
  useEffect(() => {
    if (!isLoading && !settingsStore.isLoading && !showOnboarding && !welcomeCutsceneShown) {
      triggerWelcomeCutscene()
    }
  }, [
    isLoading,
    settingsStore.isLoading,
    showOnboarding,
    welcomeCutsceneShown,
    triggerWelcomeCutscene,
  ])

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

  // Check for review prompt after reaching practice goal
  useEffect(() => {
    if (justReachedEnlightenment) {
      // User just reached their practice goal - check if we should prompt for review
      shouldPromptForReview(undefined, true).then((shouldPrompt) => {
        if (shouldPrompt) {
          // Queue review to show after insight modal closes (if insight modal is or will be shown)
          // The insight modal shows when user navigates away from timer
          queueReviewPromptAfterInsight("You've reached your practice goal!")
        }
      })
    }
  }, [justReachedEnlightenment, queueReviewPromptAfterInsight])

  // Check for review prompt at hour milestones (10h, 100h)
  useEffect(() => {
    // Skip on first load - just record baseline
    if (lastCheckedHours.current === null) {
      lastCheckedHours.current = totalHours
      return
    }

    const previousHours = lastCheckedHours.current

    // Check if we just crossed 10 or 100 hour threshold
    if (totalHours >= 10 && previousHours < 10) {
      shouldPromptForReview(10).then((shouldPrompt) => {
        if (shouldPrompt) {
          queueReviewPromptAfterInsight("You've practiced for 10 hours!")
        }
      })
    } else if (totalHours >= 100 && previousHours < 100) {
      shouldPromptForReview(100).then((shouldPrompt) => {
        if (shouldPrompt) {
          queueReviewPromptAfterInsight("You've practiced for 100 hours!")
        }
      })
    }

    lastCheckedHours.current = totalHours
  }, [totalHours, queueReviewPromptAfterInsight])

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
    // Reconcile hour bank with actual session data (security fix)
    await hourBankStore.reconcileBalance()
    setCalendarRefreshKey((k) => k + 1)
  }, [hydrate, hourBankStore])

  const handleSessionEditDelete = useCallback(async () => {
    setEditingSession(null)
    // Refresh sessions from DB
    await hydrate()
    // No reconciliation on delete - hours stay consumed (security: no refunds)
    setCalendarRefreshKey((k) => k + 1)
  }, [hydrate])

  // Insight modal handlers (global - modal appears on any tab after leaving timer)
  const handleInsightComplete = useCallback(() => {
    hideInsightCaptureModal()
    clearPostSessionState()
  }, [hideInsightCaptureModal, clearPostSessionState])

  const handleInsightSkip = useCallback(() => {
    hideInsightCaptureModal()
    clearPostSessionState()
  }, [hideInsightCaptureModal, clearPostSessionState])

  const handleInsightRemindLater = useCallback(() => {
    if (pendingInsightSessionId) {
      createInsightReminder(pendingInsightSessionId)
    }
    hideInsightCaptureModal()
    clearPostSessionState()
  }, [
    pendingInsightSessionId,
    createInsightReminder,
    hideInsightCaptureModal,
    clearPostSessionState,
  ])

  // Loading state
  if (isLoading || settingsStore.isLoading) {
    return (
      <div className="h-full bg-cream flex items-center justify-center">
        <div className="w-1 h-1 bg-indigo-deep/30 rounded-full animate-pulse" />
      </div>
    )
  }

  // Welcome cutscene - shows on every app launch
  if (showWelcomeCutscene) {
    return (
      <NeutralThemeProvider>
        <ZenMessage
          isEnlightened={false}
          goalCompleted={goalCompleted}
          onComplete={dismissWelcomeCutscene}
          variant="welcome"
        />
      </NeutralThemeProvider>
    )
  }

  // Onboarding flow
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <NeutralThemeProvider>
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
        {view === 'settings' && (
          <Settings onBack={() => setView('profile')} onNavigateToStore={() => setView('store')} />
        )}
        {view === 'store' && <Store onBack={() => setView('settings')} />}

        {/* Session edit modal */}
        {editingSession && (
          <SessionEditModal
            session={editingSession}
            onClose={handleSessionEditClose}
            onSave={handleSessionEditSave}
            onDelete={handleSessionEditDelete}
          />
        )}

        {/* Toast notifications */}
        <ToastContainer />

        {/* Global insight capture modal - appears on any tab after leaving timer */}
        {showInsightModal && pendingInsightSessionId && (
          <InsightModal
            sessionId={pendingInsightSessionId}
            sessionDuration={pendingInsightSessionDuration}
            milestoneMessage={pendingMilestone}
            sourceTemplateId={pendingSourceTemplateId}
            onComplete={handleInsightComplete}
            onSkip={handleInsightSkip}
            onRemindLater={handleInsightRemindLater}
          />
        )}

        {/* Bottom navigation */}
        <Navigation />

        {/* PWA install prompt for iOS Safari */}
        <PWAInstallPrompt />

        {/* Review prompt modal - appears at moments of pride */}
        <ReviewPrompt
          isOpen={showReviewPrompt}
          onClose={hideReviewPromptModal}
          milestoneText={reviewPromptMilestone || undefined}
        />
      </div>
    </NeutralThemeProvider>
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
