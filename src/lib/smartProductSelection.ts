/**
 * Smart Product Selection
 *
 * Context-aware algorithm for recommending hour packs.
 * Considers user maturity, consumption rate, practice goals, and milestone proximity.
 */

import { PRODUCT_IDS, PRODUCT_HOURS } from './purchases'
import { getNearMissInfo, GOAL_PRESETS } from './milestones'
import { formatHours } from './hourBank'

// Ordered products by hours (ascending)
const PRODUCTS_ASCENDING = [
  PRODUCT_IDS.STARTER, // 10h
  PRODUCT_IDS.FLOW, // 25h
  PRODUCT_IDS.DEDICATED, // 50h
  PRODUCT_IDS.COMMITTED, // 75h
  PRODUCT_IDS.SERIOUS, // 100h
] as const

const PRODUCT_HOURS_ASCENDING = [10, 25, 50, 75, 100]

// Estimated prices for spend calculation (USD, approximate)
// Used to determine Lifetime upsell threshold
const ESTIMATED_PRICE_PER_HOUR = 0.15 // ~average across packs

/**
 * Estimate total spend based on hours purchased.
 * Conservative estimate using average price per hour.
 */
function estimateTotalSpend(totalPurchased: number): number {
  return totalPurchased * ESTIMATED_PRICE_PER_HOUR
}

/**
 * Find the next goal tier above a given value.
 * Returns undefined if already at or above max preset.
 */
function findNextGoalTier(currentGoal: number): number | undefined {
  return GOAL_PRESETS.find((g) => g > currentGoal)
}

/**
 * Calculate goal context for messaging.
 */
function calculateGoalContext(
  totalConsumed: number,
  available: number,
  recommendedHours: number,
  practiceGoalHours?: number
): ProductSelection['goalContext'] {
  if (!practiceGoalHours) return undefined

  const hoursToGoal = Math.max(0, practiceGoalHours - totalConsumed)
  const hoursAfterPurchase = available + recommendedHours
  const willCompleteGoal = totalConsumed + hoursAfterPurchase >= practiceGoalHours
  const hoursAfterGoal = willCompleteGoal
    ? totalConsumed + hoursAfterPurchase - practiceGoalHours
    : 0

  return {
    hoursToGoal,
    willCompleteGoal,
    hoursAfterGoal,
    suggestedNextGoal: willCompleteGoal ? findNextGoalTier(practiceGoalHours) : undefined,
  }
}

export interface SelectionContext {
  totalConsumed: number // Total hours consumed (user maturity)
  totalPurchased: number // Total hours ever purchased (for spend estimation)
  available: number // Hours remaining
  purchaseCount: number // Number of purchases made
  practiceGoalHours?: number // User's goal (undefined = infinite mode)
  firstSessionDate?: number // For calculating consumption rate
}

export interface ProductSelection {
  recommended: string // Main recommendation
  smaller: string // Smaller option
  larger: string // Larger option (may be lifetime)
  showLifetime: boolean // Whether lifetime should be in top 3
  message?: string // Optional context message (e.g., near milestone)
  goalContext?: {
    // Goal-aware context for messaging
    hoursToGoal: number // Hours needed to reach goal
    willCompleteGoal: boolean // If recommended pack completes goal
    hoursAfterGoal: number // Hours remaining after goal (for extension prompt)
    suggestedNextGoal?: number // Next goal tier to suggest
  }
}

/**
 * Get months since first session.
 * Returns at least 0.5 to avoid division issues.
 */
function monthsSinceFirstSession(firstSessionDate?: number): number {
  if (!firstSessionDate) return 1
  const now = Date.now()
  const msPerMonth = 30 * 24 * 60 * 60 * 1000
  const months = (now - firstSessionDate) / msPerMonth
  return Math.max(0.5, months)
}

/**
 * Find the product index closest to a target hour amount.
 * Returns the index of the nearest product that is >= targetHours,
 * or the largest product if none are big enough.
 */
function findNearestProductIndex(targetHours: number): number {
  // Find first product >= targetHours
  const idx = PRODUCT_HOURS_ASCENDING.findIndex((h) => h >= targetHours)
  if (idx >= 0) return idx
  // All products are smaller than target - return largest
  return PRODUCT_HOURS_ASCENDING.length - 1
}

/**
 * Build a Goldilocks selection (smaller, recommended, larger).
 */
function buildGoldilocks(recommendedIdx: number, showLifetime = false): ProductSelection {
  const smallerIdx = Math.max(0, recommendedIdx - 1)
  const largerIdx = Math.min(PRODUCTS_ASCENDING.length - 1, recommendedIdx + 1)

  return {
    smaller: PRODUCTS_ASCENDING[smallerIdx],
    recommended: PRODUCTS_ASCENDING[recommendedIdx],
    larger:
      showLifetime && largerIdx === PRODUCTS_ASCENDING.length - 1
        ? PRODUCT_IDS.LIFETIME
        : PRODUCTS_ASCENDING[largerIdx],
    showLifetime,
  }
}

/**
 * Smart product selection based on full user context.
 *
 * Algorithm priority:
 * 1. Spend-based Lifetime: If spent $80+ or 4+ purchases, surface Lifetime
 * 2. Near milestone: Suggest pack to cross threshold
 * 3. Goal-aware: If user has goal, consider hours to completion
 * 4. First-time user: Based on goal or conservative middle-ground
 * 5. Power user (100h+ consumed): Push toward larger packs/lifetime
 * 6. Returning/depleted user: Based on consumption history
 *
 * All selections include goal context for messaging when applicable.
 */
export function getSmartSelection(ctx: SelectionContext): ProductSelection {
  const {
    totalConsumed,
    totalPurchased,
    available,
    purchaseCount,
    practiceGoalHours,
    firstSessionDate,
  } = ctx

  // Calculate estimated spend for Lifetime threshold
  const estimatedSpend = estimateTotalSpend(totalPurchased)

  // Helper to add goal context to any selection
  const withGoalContext = (
    selection: ProductSelection,
    recommendedHours: number
  ): ProductSelection => {
    const goalContext = calculateGoalContext(
      totalConsumed,
      available,
      recommendedHours,
      practiceGoalHours
    )
    return goalContext ? { ...selection, goalContext } : selection
  }

  // 1. SPEND-BASED LIFETIME TRIGGER
  // Users who've spent $80+ or made 4+ purchases are prime Lifetime candidates
  const isHighValueUser = estimatedSpend >= 80 || purchaseCount >= 4
  const hasNotBoughtLifetime = totalPurchased < 10000 // Lifetime grants 10000h

  if (isHighValueUser && hasNotBoughtLifetime && totalConsumed >= 50) {
    // High-value user: strongly recommend Lifetime
    const selection: ProductSelection = {
      smaller: PRODUCT_IDS.SERIOUS, // 100h as "continue as you are" option
      recommended: PRODUCT_IDS.LIFETIME,
      larger: PRODUCT_IDS.LIFETIME,
      showLifetime: true,
      message:
        "You've invested in your practice. Lifetime removes the need to ever think about hours again.",
    }
    return withGoalContext(selection, 10000)
  }

  // 2. NEAR MILESTONE: suggest pack to cross threshold
  const nearMiss = getNearMissInfo(totalConsumed, practiceGoalHours)
  if (nearMiss && nearMiss.hoursRemaining <= 0.5) {
    // They need just a small boost to hit the milestone
    // Recommend Starter (10h) - leaves them with extra hours for goal extension
    const selection: ProductSelection = {
      recommended: PRODUCT_IDS.STARTER,
      smaller: PRODUCT_IDS.STARTER,
      larger: PRODUCT_IDS.FLOW,
      showLifetime: false,
      message: `Just ${formatHours(nearMiss.hoursRemaining)} from ${nearMiss.nextMilestone}h milestone`,
    }
    return withGoalContext(selection, PRODUCT_HOURS[PRODUCT_IDS.STARTER])
  }

  // 3. GOAL-AWARE SELECTION: Consider hours to goal completion
  if (practiceGoalHours && totalConsumed > 0) {
    const hoursToGoal = practiceGoalHours - totalConsumed

    // User is close to completing goal (within 100h)
    if (hoursToGoal > 0 && hoursToGoal <= 100) {
      // Find smallest pack that gets them past goal (leaving some for extension prompt)
      const idx = findNearestProductIndex(hoursToGoal - available)
      const recommendedIdx = Math.max(0, idx) // At least Starter

      // Build message based on how this pack relates to their goal
      const recommendedHours = PRODUCT_HOURS_ASCENDING[recommendedIdx]
      const hoursAfterPurchase = available + recommendedHours
      const willComplete = totalConsumed + hoursAfterPurchase >= practiceGoalHours
      const hoursRemaining = willComplete
        ? totalConsumed + hoursAfterPurchase - practiceGoalHours
        : 0

      let message: string | undefined
      if (willComplete && hoursRemaining > 0) {
        const nextGoal = findNextGoalTier(practiceGoalHours)
        if (nextGoal) {
          message = `Completes your ${practiceGoalHours}h goal with ${Math.round(hoursRemaining)}h to start toward ${nextGoal}h`
        } else {
          message = `Completes your ${practiceGoalHours}h goal with hours to spare`
        }
      }

      const selection = buildGoldilocks(recommendedIdx, false)
      return withGoalContext({ ...selection, message }, recommendedHours)
    }
  }

  // 4. FIRST-TIME USER (no consumed hours, no purchases)
  const isFirstTime = totalConsumed === 0 && purchaseCount === 0

  if (isFirstTime) {
    if (practiceGoalHours) {
      // Goal-based sizing: pack should last ~4 months at implied daily rate
      // Assume they want to reach goal in ~1 year
      const dailyRate = practiceGoalHours / 365
      const monthlyNeed = dailyRate * 30
      const idealPack = monthlyNeed * 4 // 4 months worth

      const idx = findNearestProductIndex(idealPack)
      const recommendedHours = PRODUCT_HOURS_ASCENDING[idx]
      const selection = buildGoldilocks(idx, false)
      return withGoalContext(selection, recommendedHours)
    }

    // No goal: conservative middle-ground (Flow/Dedicated/Committed)
    return {
      smaller: PRODUCT_IDS.FLOW, // 25h
      recommended: PRODUCT_IDS.DEDICATED, // 50h
      larger: PRODUCT_IDS.COMMITTED, // 75h
      showLifetime: false,
    }
  }

  // 5. POWER USER: 100h+ consumed (spend-based already handled above)
  const isPowerUser = totalConsumed >= 100

  if (isPowerUser) {
    // Very committed user (200h+): suggest lifetime
    if (totalConsumed >= 200) {
      const selection: ProductSelection = {
        smaller: PRODUCT_IDS.SERIOUS,
        recommended: PRODUCT_IDS.LIFETIME,
        larger: PRODUCT_IDS.LIFETIME,
        showLifetime: true,
      }
      return withGoalContext(selection, 10000)
    }

    // Power user but not yet at 200h: suggest larger packs with lifetime as option
    const selection: ProductSelection = {
      smaller: PRODUCT_IDS.COMMITTED,
      recommended: PRODUCT_IDS.SERIOUS,
      larger: PRODUCT_IDS.LIFETIME,
      showLifetime: true,
    }
    return withGoalContext(selection, PRODUCT_HOURS[PRODUCT_IDS.SERIOUS])
  }

  // 6. RETURNING USER with hours remaining: extend runway
  if (available > 0 && totalConsumed > 0) {
    const months = monthsSinceFirstSession(firstSessionDate)
    const monthlyBurn = totalConsumed / months

    // Target: 4 more months of runway
    const idealTopUp = Math.max(monthlyBurn * 4 - available, 10)
    const idx = findNearestProductIndex(idealTopUp)
    const recommendedHours = PRODUCT_HOURS_ASCENDING[idx]
    const selection = buildGoldilocks(idx, false)
    return withGoalContext(selection, recommendedHours)
  }

  // 7. DEPLETED USER: based on consumption history
  if (totalConsumed > 0) {
    const months = monthsSinceFirstSession(firstSessionDate)
    const monthlyBurn = totalConsumed / months

    // Target: 4 months of runway
    const idealPack = monthlyBurn * 4
    const idx = findNearestProductIndex(Math.max(idealPack, 25)) // At least Flow
    const recommendedHours = PRODUCT_HOURS_ASCENDING[idx]
    const selection = buildGoldilocks(idx, false)
    return withGoalContext(selection, recommendedHours)
  }

  // Fallback: default middle-ground recommendation
  return {
    smaller: PRODUCT_IDS.FLOW,
    recommended: PRODUCT_IDS.DEDICATED,
    larger: PRODUCT_IDS.COMMITTED,
    showLifetime: false,
  }
}

/**
 * Product configuration type
 */
export interface ProductConfig {
  id: string
  name: string
  tagline: string
  isLifetime?: boolean
}

/**
 * Product display configuration.
 * Shared between Paywall and Store components.
 */
export const PRODUCT_CONFIG: ProductConfig[] = [
  {
    id: PRODUCT_IDS.STARTER,
    name: 'Starter',
    tagline: '2 weeks of daily practice',
  },
  {
    id: PRODUCT_IDS.FLOW,
    name: 'Flow',
    tagline: '1 month of daily practice',
  },
  {
    id: PRODUCT_IDS.DEDICATED,
    name: 'Dedicated',
    tagline: '4 months of daily practice',
  },
  {
    id: PRODUCT_IDS.COMMITTED,
    name: 'Committed',
    tagline: '6 months of daily practice',
  },
  {
    id: PRODUCT_IDS.SERIOUS,
    name: 'Serious',
    tagline: '1 year of daily practice',
  },
  {
    id: PRODUCT_IDS.LIFETIME,
    name: 'Lifetime',
    tagline: 'Meditate freely, forever',
    isLifetime: true,
  },
]
