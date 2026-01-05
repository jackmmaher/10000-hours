/**
 * Premium Store - Manages subscription state and tier logic
 *
 * Tracks:
 * - Current tier (free/premium)
 * - Trial status (expired or not)
 * - First session date (for Day 31 calculation)
 * - Premium expiry date
 */

import { create } from 'zustand'
import { TierType, getProfile, updateProfile } from '../lib/db'
import { getDaysSinceFirstSession, shouldTriggerPaywall, isInTrialOrPremium } from '../lib/tierLogic'

interface PremiumState {
  // State
  tier: TierType
  trialExpired: boolean
  firstSessionDate?: number
  trialEndDate?: number
  premiumExpiryDate?: number
  isLoading: boolean

  // Computed (derived from state)
  daysSinceFirstSession: number
  isPremiumOrTrial: boolean
  shouldShowPaywall: boolean

  // Actions
  hydrate: () => Promise<void>
  setTier: (tier: TierType) => Promise<void>
  markTrialExpired: () => Promise<void>
  setFirstSessionDate: (timestamp: number) => Promise<void>
  setPremiumExpiry: (timestamp: number) => Promise<void>
  refreshComputedState: () => void
}

export const usePremiumStore = create<PremiumState>((set, get) => ({
  // Initial state
  tier: 'free',
  trialExpired: false,
  firstSessionDate: undefined,
  trialEndDate: undefined,
  premiumExpiryDate: undefined,
  isLoading: true,

  // Computed defaults
  daysSinceFirstSession: 0,
  isPremiumOrTrial: true, // Default to true until loaded
  shouldShowPaywall: false,

  hydrate: async () => {
    const profile = await getProfile()

    const daysSinceFirst = getDaysSinceFirstSession(profile.firstSessionDate)
    const isPremiumOrTrial = isInTrialOrPremium(daysSinceFirst, profile.tier, profile.trialExpired)
    const shouldShow = shouldTriggerPaywall(daysSinceFirst, profile.trialExpired)

    set({
      tier: profile.tier,
      trialExpired: profile.trialExpired,
      firstSessionDate: profile.firstSessionDate,
      trialEndDate: profile.trialEndDate,
      premiumExpiryDate: profile.premiumExpiryDate,
      daysSinceFirstSession: daysSinceFirst,
      isPremiumOrTrial,
      shouldShowPaywall: shouldShow,
      isLoading: false
    })
  },

  setTier: async (tier) => {
    await updateProfile({ tier })
    set({ tier })
    get().refreshComputedState()
  },

  markTrialExpired: async () => {
    const trialEndDate = Date.now()
    await updateProfile({ trialExpired: true, trialEndDate })
    set({ trialExpired: true, trialEndDate })
    get().refreshComputedState()
  },

  setFirstSessionDate: async (timestamp) => {
    const { firstSessionDate } = get()
    // Only set if not already set
    if (!firstSessionDate) {
      await updateProfile({ firstSessionDate: timestamp })
      set({ firstSessionDate: timestamp })
      get().refreshComputedState()
    }
  },

  setPremiumExpiry: async (timestamp) => {
    await updateProfile({ premiumExpiryDate: timestamp })
    set({ premiumExpiryDate: timestamp })
  },

  refreshComputedState: () => {
    const { tier, trialExpired, firstSessionDate } = get()
    const daysSinceFirst = getDaysSinceFirstSession(firstSessionDate)
    const isPremiumOrTrial = isInTrialOrPremium(daysSinceFirst, tier, trialExpired)
    const shouldShow = shouldTriggerPaywall(daysSinceFirst, trialExpired)

    set({
      daysSinceFirstSession: daysSinceFirst,
      isPremiumOrTrial,
      shouldShowPaywall: shouldShow
    })
  }
}))
