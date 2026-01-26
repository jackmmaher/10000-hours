/**
 * Exercises - Practice tools tab
 *
 * Full-page component displaying all practice tools to prepare for meditation.
 * Replaces the Profile tab in the main navigation.
 *
 * Layout:
 * - Header: "Exercises" with subtitle
 * - Active features: Meditation Lock, Aum Coach, Racing Mind (hero cards)
 * - "Coming Soon" label divider
 * - Coming soon features: Perfect Posture (muted hero cards)
 *
 * Interaction:
 * - Pull-to-refresh: Refreshes meditation lock status
 * - Swipe navigation: Timer (down/right), Progress (left)
 */

import { useRef } from 'react'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSwipe } from '../hooks/useSwipe'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useMeditationLock } from '../hooks/useMeditationLock'
import { PracticeHeroCard } from './Journey/PracticeHeroCard'
import {
  getActiveFeatures,
  getComingSoonFeatures,
  type PracticeFeatureConfig,
} from './Journey/practiceFeatureConfig'
import { LockSetupFlow } from './LockSetupFlow'
import { LockComingSoonModal } from './LockComingSoonModal'
import { CommitmentSetupFlow } from './CommitmentSetupFlow'
import { useState } from 'react'

export function Exercises() {
  const { setView } = useNavigationStore()
  const meditationLock = useMeditationLock()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [showLockSetupFlow, setShowLockSetupFlow] = useState(false)
  const [showLockComingSoon, setShowLockComingSoon] = useState(false)
  const [showCommitmentSetupFlow, setShowCommitmentSetupFlow] = useState(false)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => {
      meditationLock.refreshStatus?.()
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  })

  // Swipe navigation
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setView('timer')
      }
    },
    onSwipeLeft: () => setView('progress'),
    onSwipeRight: () => setView('timer'),
  })

  const handleFeaturePress = (feature: PracticeFeatureConfig) => {
    if (feature.status === 'coming-soon') {
      return // No action for coming soon features
    }

    switch (feature.action) {
      case 'open-lock-modal':
        // Match Settings behavior: check authorization status first
        if (meditationLock.authorizationStatus === 'authorized') {
          setShowLockSetupFlow(true)
        } else {
          setShowLockComingSoon(true)
        }
        break
      case 'navigate-om-coach':
        setView('om-coach')
        break
      case 'navigate-racing-mind':
        setView('racing-mind')
        break
      case 'navigate-posture':
        setView('posture')
        break
      case 'open-commitment-modal':
        setShowCommitmentSetupFlow(true)
        break
    }
  }

  const activeFeatures = getActiveFeatures()
  const comingSoonFeatures = getComingSoonFeatures()

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
        {/* Page header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-ink mb-2">Exercises</h1>
          <p className="text-ink/60 text-lg leading-relaxed">
            Practice tools to prepare for meditation
          </p>
        </div>

        {/* Active features */}
        <div className="space-y-4">
          {activeFeatures.map((feature) => (
            <PracticeHeroCard
              key={feature.id}
              feature={feature}
              lockSettings={feature.id === 'meditation-lock' ? meditationLock.settings : undefined}
              onPress={() => handleFeaturePress(feature)}
            />
          ))}
        </div>

        {/* Coming Soon divider */}
        {comingSoonFeatures.length > 0 && (
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-xs font-medium tracking-wider uppercase text-ink/40">
              Coming Soon
            </span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>
        )}

        {/* Coming soon features */}
        <div className="space-y-4">
          {comingSoonFeatures.map((feature) => (
            <PracticeHeroCard
              key={feature.id}
              feature={feature}
              onPress={() => handleFeaturePress(feature)}
            />
          ))}
        </div>
      </div>

      {/* Lock Coming Soon modal - shows before setup when Screen Time isn't ready */}
      <LockComingSoonModal
        isOpen={showLockComingSoon}
        onClose={() => setShowLockComingSoon(false)}
        onContinueSetup={() => {
          setShowLockComingSoon(false)
          setShowLockSetupFlow(true)
        }}
      />

      {showLockSetupFlow && (
        <LockSetupFlow
          onComplete={() => {
            setShowLockSetupFlow(false)
            // Refresh meditation lock status after setup completes
            meditationLock.refreshStatus?.()
          }}
          onClose={() => setShowLockSetupFlow(false)}
        />
      )}

      {showCommitmentSetupFlow && (
        <CommitmentSetupFlow
          onComplete={() => {
            setShowCommitmentSetupFlow(false)
          }}
          onClose={() => setShowCommitmentSetupFlow(false)}
        />
      )}
    </div>
  )
}
