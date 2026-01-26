/**
 * JourneyPractice - Practice section for Journey tab
 *
 * Displays practice features as large hero cards at the bottom of the Journey tab.
 * Layout:
 * - H2 "Practice" header
 * - Active features: Meditation Lock, Aum Coach (hero cards)
 * - "Coming Soon" label divider
 * - Coming soon features: Racing Mind, Perfect Posture (muted hero cards)
 *
 * Focus Mode flow matches Settings:
 * - If Screen Time is authorized → opens LockSetupFlow directly
 * - If not authorized → shows LockComingSoonModal first (explains approval is pending)
 */

import { useMeditationLock } from '../../hooks/useMeditationLock'
import { PracticeHeroCard } from './PracticeHeroCard'
import {
  getActiveFeatures,
  getComingSoonFeatures,
  type PracticeFeatureConfig,
} from './practiceFeatureConfig'

interface JourneyPracticeProps {
  /** Called when Screen Time is authorized - opens LockSetupFlow directly */
  onOpenLockModal: () => void
  /** Called when Screen Time is NOT authorized - shows LockComingSoonModal first */
  onOpenLockComingSoon: () => void
  onNavigateOmCoach: () => void
  onNavigateRacingMind: () => void
  onNavigatePosture?: () => void
  /** Called to open Commitment Mode setup flow */
  onOpenCommitmentModal?: () => void
}

export function JourneyPractice({
  onOpenLockModal,
  onOpenLockComingSoon,
  onNavigateOmCoach,
  onNavigateRacingMind,
  onNavigatePosture,
  onOpenCommitmentModal,
}: JourneyPracticeProps) {
  const meditationLock = useMeditationLock()

  const handleFeaturePress = (feature: PracticeFeatureConfig) => {
    if (feature.status === 'coming-soon') {
      return // No action for coming soon features
    }

    switch (feature.action) {
      case 'open-lock-modal':
        // Match Settings behavior: check authorization status first
        if (meditationLock.authorizationStatus === 'authorized') {
          onOpenLockModal()
        } else {
          onOpenLockComingSoon()
        }
        break
      case 'navigate-om-coach':
        onNavigateOmCoach()
        break
      case 'navigate-racing-mind':
        onNavigateRacingMind()
        break
      case 'navigate-posture':
        onNavigatePosture?.()
        break
      case 'open-commitment-modal':
        onOpenCommitmentModal?.()
        break
    }
  }

  const activeFeatures = getActiveFeatures()
  const comingSoonFeatures = getComingSoonFeatures()

  return (
    <section className="mt-12 pt-8 border-t border-ink/10">
      {/* Section header */}
      <h2 className="font-serif text-2xl text-ink mb-6">Practice</h2>

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
    </section>
  )
}
