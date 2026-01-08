import { useEffect, useState, useCallback, useRef } from 'react'
import { useSessionStore } from './stores/useSessionStore'
import { useNavigationStore } from './stores/useNavigationStore'
import { usePremiumStore } from './stores/usePremiumStore'
import { useSettingsStore } from './stores/useSettingsStore'
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
import { PaywallPremium } from './components/PaywallPremium'
import { MilestoneCelebration } from './components/MilestoneCelebration'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LivingTheme } from './components/LivingTheme'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { purchasePremium, restorePurchases } from './lib/purchases'
import type { Session } from './lib/db'

type PaywallSource = 'settings' | 'progress' | 'calendar'

function AppContent() {
  const { view, setView } = useNavigationStore()
  const { isLoading, hydrate } = useSessionStore()
  const premiumStore = usePremiumStore()
  const settingsStore = useSettingsStore()
  const authStore = useAuthStore()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallSource, setPaywallSource] = useState<PaywallSource>('settings')
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)
  const hasInitialized = useRef(false)

  // Hydrate all stores on mount (runs once)
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const init = async () => {
      await hydrate()
      await premiumStore.hydrate()
      await settingsStore.hydrate()
      await authStore.initialize()

      // Check if should show onboarding
      if (!hasSeenOnboarding()) {
        setShowOnboarding(true)
      }
    }
    init()
  }, [hydrate, premiumStore, settingsStore, authStore])

  // Handlers
  const handleOnboardingComplete = useCallback(() => {
    markOnboardingSeen()
    setShowOnboarding(false)
  }, [])

  const handleShowPaywall = useCallback((source: PaywallSource = 'settings') => {
    setPaywallSource(source)
    setShowPaywall(true)
  }, [])

  const handlePaywallDismiss = useCallback(() => {
    setShowPaywall(false)
  }, [])

  const handlePurchase = useCallback(async () => {
    const result = await purchasePremium()
    if (result.success) {
      await premiumStore.setTier('premium')
      // Set expiry to 1 year from now
      const expiryDate = Date.now() + 365 * 24 * 60 * 60 * 1000
      await premiumStore.setPremiumExpiry(expiryDate)
      setShowPaywall(false)
    } else {
      // Handle error - could show a toast
      console.error('Purchase failed:', result.error)
    }
  }, [premiumStore])

  const handleRestore = useCallback(async () => {
    const result = await restorePurchases()
    if (result.success) {
      await premiumStore.setTier('premium')
      setShowPaywall(false)
    } else {
      // Handle error - could show a toast
      console.error('Restore failed:', result.error)
    }
  }, [premiumStore])

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
    setCalendarRefreshKey(k => k + 1)
  }, [hydrate])

  const handleSessionEditDelete = useCallback(async () => {
    setEditingSession(null)
    // Refresh sessions from DB
    await hydrate()
    setCalendarRefreshKey(k => k + 1)
  }, [hydrate])

  // Loading state
  if (isLoading || premiumStore.isLoading || settingsStore.isLoading) {
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
          <Calendar
            refreshKey={calendarRefreshKey}
            onEditSession={handleEditSession}
          />
        )}
        {view === 'insights' && <Insights />}
        {view === 'pearls' && <PearlsFeed />}
        {view === 'explore' && <Explore />}
        {view === 'saved-pearls' && <SavedPearls />}
        {view === 'profile' && (
          <Profile
            onNavigateToSettings={() => setView('settings')}
          />
        )}
        {view === 'settings' && (
          <Settings
            onBack={() => setView('profile')}
            onShowPaywall={() => handleShowPaywall('settings')}
            onRestorePurchase={handleRestore}
          />
        )}

        {/* Session edit modal */}
        {editingSession && (
          <SessionEditModal
            session={editingSession}
            onClose={handleSessionEditClose}
            onSave={handleSessionEditSave}
            onDelete={handleSessionEditDelete}
          />
        )}

        {/* Paywall overlay */}
        {showPaywall && (
          <PaywallPremium
            source={paywallSource}
            onDismiss={handlePaywallDismiss}
            onPurchase={handlePurchase}
            onRestore={handleRestore}
          />
        )}

        {/* Milestone celebration overlay */}
        <MilestoneCelebration />

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
