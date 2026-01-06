/**
 * Premium Store - Manages subscription state
 *
 * Simple value-add model:
 * - FREE: Full core functionality
 * - PREMIUM: Enhanced features (Whisper, AI formatting, share pearls, cloud sync)
 */

import { create } from 'zustand'
import { TierType, getProfile, updateProfile } from '../lib/db'
import { isPremium as checkIsPremium } from '../lib/tierLogic'

interface PremiumState {
  // State
  tier: TierType
  premiumExpiryDate?: number
  isLoading: boolean

  // Computed
  isPremium: boolean

  // Actions
  hydrate: () => Promise<void>
  setTier: (tier: TierType) => Promise<void>
  setPremiumExpiry: (timestamp: number) => Promise<void>
}

export const usePremiumStore = create<PremiumState>((set) => ({
  // Initial state
  tier: 'free',
  premiumExpiryDate: undefined,
  isLoading: true,

  // Computed
  isPremium: false,

  hydrate: async () => {
    const profile = await getProfile()

    set({
      tier: profile.tier,
      premiumExpiryDate: profile.premiumExpiryDate,
      isPremium: checkIsPremium(profile.tier),
      isLoading: false
    })
  },

  setTier: async (tier) => {
    await updateProfile({ tier })
    set({
      tier,
      isPremium: checkIsPremium(tier)
    })
  },

  setPremiumExpiry: async (timestamp) => {
    await updateProfile({ premiumExpiryDate: timestamp })
    set({ premiumExpiryDate: timestamp })
  }
}))
