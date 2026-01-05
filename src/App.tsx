import { useEffect, useState, useCallback } from 'react'
import { useSessionStore } from './stores/useSessionStore'
import { usePremiumStore } from './stores/usePremiumStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { Timer } from './components/Timer'
import { Stats } from './components/Stats'
import { Calendar } from './components/Calendar'
import { Settings } from './components/Settings'
import { Onboarding, hasSeenOnboarding, markOnboardingSeen } from './components/Onboarding'
import { PaywallPremium } from './components/PaywallPremium'
import { purchasePremium, restorePurchases } from './lib/purchases'

type PaywallSource = 'day31' | 'settings' | 'stats' | 'calendar'

function App() {
  const { view, isLoading, hydrate } = useSessionStore()
  const premiumStore = usePremiumStore()
  const settingsStore = useSettingsStore()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallSource, setPaywallSource] = useState<PaywallSource>('settings')

  // Hydrate all stores on mount
  useEffect(() => {
    const init = async () => {
      await hydrate()
      await premiumStore.hydrate()
      await settingsStore.hydrate()

      // Check if should show onboarding
      if (!hasSeenOnboarding()) {
        setShowOnboarding(true)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Check for Day 31 trigger
  useEffect(() => {
    if (premiumStore.shouldShowPaywall && !showPaywall) {
      setPaywallSource('day31')
      setShowPaywall(true)
    }
  }, [premiumStore.shouldShowPaywall, showPaywall])

  // Handlers
  const handleOnboardingComplete = useCallback(() => {
    markOnboardingSeen()
    setShowOnboarding(false)
  }, [])

  const handleShowPaywall = useCallback((source: PaywallSource = 'settings') => {
    setPaywallSource(source)
    setShowPaywall(true)
  }, [])

  const handlePaywallDismiss = useCallback(async () => {
    setShowPaywall(false)
    // If this was Day 31 trigger, mark trial as expired
    if (paywallSource === 'day31') {
      await premiumStore.markTrialExpired()
    }
  }, [paywallSource, premiumStore])

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
    <div className="h-full">
      {view === 'timer' && <Timer />}
      {view === 'stats' && <Stats />}
      {view === 'calendar' && <Calendar />}
      {view === 'settings' && (
        <Settings
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
    </div>
  )
}

export default App
