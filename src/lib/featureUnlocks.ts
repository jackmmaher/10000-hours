/**
 * Feature Unlocks
 *
 * Some features are unlocked by Voice tier as earned privileges.
 * This rewards sustained engagement without paywall mechanics.
 *
 * Design philosophy:
 * - Features are rewards for sustained practice, not artificial gatekeeping
 * - High-tier users get recognition, not advantages
 * - Language is positive ("you've earned access") not negative ("you can't access")
 */

import { VoiceTier } from './voice'

export interface FeatureUnlock {
  id: string
  name: string
  description: string
  requiredTier: VoiceTier
}

// Order of tiers for comparison
const TIER_ORDER: VoiceTier[] = ['newcomer', 'practitioner', 'established', 'respected', 'mentor']

export const FEATURE_UNLOCKS: FeatureUnlock[] = [
  {
    id: 'extended_sessions',
    name: 'Extended Sessions',
    description: 'Sessions longer than 60 minutes',
    requiredTier: 'established'
  },
  {
    id: 'course_creation',
    name: 'Course Creation',
    description: 'Create multi-session meditation courses',
    requiredTier: 'mentor'
  },
  {
    id: 'advanced_insights',
    name: 'Advanced Insights',
    description: 'Deeper practice pattern analysis',
    requiredTier: 'respected'
  }
]

/**
 * Get all features unlocked at or below a given tier
 */
export function getUnlockedFeatures(tier: VoiceTier): FeatureUnlock[] {
  const tierIndex = TIER_ORDER.indexOf(tier)

  return FEATURE_UNLOCKS.filter(feature => {
    const requiredIndex = TIER_ORDER.indexOf(feature.requiredTier)
    return tierIndex >= requiredIndex
  })
}

/**
 * Check if a specific feature is unlocked for a given tier
 */
export function isFeatureUnlocked(featureId: string, tier: VoiceTier): boolean {
  const unlocked = getUnlockedFeatures(tier)
  return unlocked.some(f => f.id === featureId)
}

/**
 * Get the required tier for a feature
 */
export function getRequiredTier(featureId: string): VoiceTier | null {
  const feature = FEATURE_UNLOCKS.find(f => f.id === featureId)
  return feature?.requiredTier || null
}

/**
 * Get tier display name for unlock messages
 */
export function getTierDisplayName(tier: VoiceTier): string {
  const names: Record<VoiceTier, string> = {
    newcomer: 'Newcomer',
    practitioner: 'Practitioner',
    established: 'Established',
    respected: 'Respected',
    mentor: 'Mentor'
  }
  return names[tier]
}
