import { useEffect, useState, useCallback, useRef } from 'react'
import { useTheme } from './hooks/useTheme'
import { useSessionStore } from './stores/useSessionStore'
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
import { useAuthStore } from './stores/useAuthStore'
import { Onboarding, hasSeenOnboarding, markOnboardingSeen } from './components/Onboarding'
import { PaywallPremium } from './components/PaywallPremium'
import { MilestoneCelebration } from './components/MilestoneCelebration'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BreathingCanvas } from './components/BreathingCanvas'
import { AmbientAtmosphere } from './components/AmbientAtmosphere'
import { purchasePremium, restorePurchases } from './lib/purchases'

type PaywallSource = 'settings' | 'progress' | 'calendar'

function AppContent() {
  const { view, setView, isLoading, hydrate } = useSessionStore()
  const premiumStore = usePremiumStore()
  const settingsStore = useSettingsStore()
  const authStore = useAuthStore()

  // Apply dynamic theme based on time of day and season
  const themeState = useTheme()

  // Get visual effects preference
  const { visualEffects } = useSettingsStore()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallSource, setPaywallSource] = useState<PaywallSource>('settings')
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
    <BreathingCanvas enabled intensity={0.025}> {/* Increased from 0.015 for better visibility */}
      {/* Global ambient atmosphere layer */}
      <AmbientAtmosphere
        timeOfDay={themeState.timeOfDay}
        season={themeState.season}
        expressive={visualEffects === 'expressive'}
      />
      <div className="h-full">
        {view === 'timer' && <Timer />}
        {view === 'journey' && <Journey />}
        {view === 'progress' && <Progress />}
        {view === 'calendar' && <Calendar />}
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

      </div>
    </BreathingCanvas>
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
