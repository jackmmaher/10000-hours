/**
 * Hour Bank Logic
 *
 * Manages the user's purchased meditation hours.
 * Tracks consumption and determines session availability.
 *
 * Consumption Model:
 * - Hours are deducted after each completed session
 * - Minimum session length for deduction: 1 minute (to avoid micro-deductions)
 * - Deduction is rounded up to nearest minute
 * - Sessions can always complete (no mid-session cutoff)
 * - New sessions require available hours
 */

import { db } from './db/schema'
import { getTotalSeconds } from './db/sessions'

// Minimum session duration (in seconds) to count as consumption
const MIN_SESSION_DURATION_SECONDS = 60

// Initial free hours for new users (0 = paywall on first session attempt)
export const INITIAL_FREE_HOURS = 0

/**
 * Get the current hour bank balance
 */
export async function getHourBalance(): Promise<{
  totalPurchased: number
  totalConsumed: number
  available: number
  isLifetime: boolean
  deficit: number
}> {
  const hourBank = await db.hourBank.get(1)

  if (!hourBank) {
    // New user - return initial state
    return {
      totalPurchased: INITIAL_FREE_HOURS,
      totalConsumed: 0,
      available: INITIAL_FREE_HOURS,
      isLifetime: false,
      deficit: 0,
    }
  }

  // Calculate deficit: positive if consumed more than purchased
  const deficit = Math.max(0, hourBank.totalConsumedHours - hourBank.totalPurchasedHours)

  return {
    totalPurchased: hourBank.totalPurchasedHours,
    totalConsumed: hourBank.totalConsumedHours,
    available: hourBank.availableHours,
    isLifetime: hourBank.isLifetime,
    deficit,
  }
}

/**
 * Check if the user can start a new session
 */
export async function canStartSession(): Promise<boolean> {
  const balance = await getHourBalance()

  // Lifetime users can always start
  if (balance.isLifetime) return true

  // Check if there are available hours
  return balance.available > 0
}

/**
 * Consume hours after a session completes
 * @param durationSeconds - Session duration in seconds
 * @returns The amount of hours consumed
 */
export async function consumeHours(durationSeconds: number): Promise<number> {
  // Validate input
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    console.warn('[hourBank] Invalid durationSeconds:', durationSeconds)
    return 0
  }

  // Sessions shorter than minimum don't consume hours
  if (durationSeconds < MIN_SESSION_DURATION_SECONDS) {
    return 0
  }

  const balance = await getHourBalance()

  // Lifetime users don't consume from bank (unlimited)
  if (balance.isLifetime) {
    return 0
  }

  // Convert seconds to hours (round up to nearest minute, then to hours)
  const minutes = Math.ceil(durationSeconds / 60)
  const hours = minutes / 60

  // Get current hour bank or create default
  let hourBank = await db.hourBank.get(1)
  if (!hourBank) {
    hourBank = {
      id: 1,
      totalPurchasedHours: INITIAL_FREE_HOURS,
      totalConsumedHours: 0,
      availableHours: INITIAL_FREE_HOURS,
      isLifetime: false,
      lastPurchaseAt: null,
      purchases: [],
    }
    await db.hourBank.add(hourBank)
  }

  // Calculate new consumed hours
  const newConsumed = hourBank.totalConsumedHours + hours
  const newAvailable = Math.max(0, hourBank.totalPurchasedHours - newConsumed)

  // Update the hour bank
  await db.hourBank.update(1, {
    totalConsumedHours: newConsumed,
    availableHours: newAvailable,
  })

  return hours
}

/**
 * Add hours from a purchase
 * @param hours - Number of hours to add
 * @param productId - The product ID that was purchased
 * @param transactionId - The transaction ID from the store
 */
export async function addPurchasedHours(
  hours: number,
  productId: string,
  transactionId: string
): Promise<void> {
  // Validate input
  if (!Number.isFinite(hours) || hours <= 0) {
    console.warn('[hourBank] Invalid hours value:', hours)
    return
  }

  let hourBank = await db.hourBank.get(1)

  if (!hourBank) {
    // Create initial hour bank
    hourBank = {
      id: 1,
      totalPurchasedHours: INITIAL_FREE_HOURS + hours,
      totalConsumedHours: 0,
      availableHours: INITIAL_FREE_HOURS + hours,
      isLifetime: false,
      lastPurchaseAt: Date.now(),
      purchases: [
        {
          productId,
          transactionId,
          hours,
          purchasedAt: Date.now(),
        },
      ],
    }
    await db.hourBank.add(hourBank)
  } else {
    // Add to existing bank
    const newPurchases = [
      ...(hourBank.purchases || []),
      {
        productId,
        transactionId,
        hours,
        purchasedAt: Date.now(),
      },
    ]

    // Calculate new totals, properly accounting for any deficit
    // (consumed more than purchased means new hours should offset the debt)
    const newTotalPurchased = hourBank.totalPurchasedHours + hours
    const newAvailable = Math.max(0, newTotalPurchased - hourBank.totalConsumedHours)

    await db.hourBank.update(1, {
      totalPurchasedHours: newTotalPurchased,
      availableHours: newAvailable,
      lastPurchaseAt: Date.now(),
      purchases: newPurchases,
    })
  }
}

/**
 * Grant lifetime access
 * @param transactionId - The transaction ID from the store
 */
export async function grantLifetimeAccess(transactionId: string): Promise<void> {
  let hourBank = await db.hourBank.get(1)

  if (!hourBank) {
    hourBank = {
      id: 1,
      totalPurchasedHours: 10000,
      totalConsumedHours: 0,
      availableHours: 10000,
      isLifetime: true,
      lastPurchaseAt: Date.now(),
      purchases: [
        {
          productId: 'lifetime',
          transactionId,
          hours: 10000,
          purchasedAt: Date.now(),
        },
      ],
    }
    await db.hourBank.add(hourBank)
  } else {
    await db.hourBank.update(1, {
      totalPurchasedHours: 10000,
      availableHours: Math.max(0, 10000 - hourBank.totalConsumedHours),
      isLifetime: true,
      lastPurchaseAt: Date.now(),
      purchases: [
        ...(hourBank.purchases || []),
        {
          productId: 'lifetime',
          transactionId,
          hours: 10000,
          purchasedAt: Date.now(),
        },
      ],
    })
  }
}

/**
 * Initialize hour bank for new users
 */
export async function initializeHourBank(): Promise<void> {
  const existing = await db.hourBank.get(1)
  if (existing) return

  await db.hourBank.add({
    id: 1,
    totalPurchasedHours: INITIAL_FREE_HOURS,
    totalConsumedHours: 0,
    availableHours: INITIAL_FREE_HOURS,
    isLifetime: false,
    lastPurchaseAt: null,
    purchases: [],
  })
}

/**
 * Get purchase history
 */
export async function getPurchaseHistory(): Promise<
  Array<{
    productId: string
    transactionId: string
    hours: number
    purchasedAt: number
  }>
> {
  const hourBank = await db.hourBank.get(1)
  return hourBank?.purchases || []
}

/**
 * Format hours for display
 * @param hours - Number of hours
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatHours(hours: number): string {
  if (hours <= 0) return '0m'

  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Calculate hours remaining in a nice display format
 * Always shows h m format, never decimal
 */
export function formatAvailableHours(available: number): string {
  if (available >= 10000) return 'Lifetime'
  if (available >= 100) return `${Math.floor(available)}h`
  // Always use h m format for consistency
  return formatHours(available)
}

/**
 * Reconcile hour bank consumption with actual session data.
 *
 * SECURITY: Only reconciles UPWARD. If sessions total MORE than
 * currently consumed, increases consumed. Never decreases consumed
 * (prevents delete-for-refund exploit).
 *
 * | Action             | Effect on Hour Bank                     |
 * |--------------------|-----------------------------------------|
 * | Session completion | consumed += duration                    |
 * | Session edit UP    | consumed += difference (via reconcile)  |
 * | Session edit DOWN  | NO CHANGE (no refund)                   |
 * | Session delete     | NO CHANGE (no refund)                   |
 */
export async function reconcileConsumedHours(): Promise<void> {
  const totalSeconds = await getTotalSeconds()
  const sessionHours = totalSeconds / 3600

  const hourBank = await db.hourBank.get(1)
  if (!hourBank) return

  // Skip reconciliation for lifetime users (unlimited hours)
  if (hourBank.isLifetime) return

  // CRITICAL: Only reconcile UPWARD
  // If sessions total MORE than consumed, user edited duration UP
  // If sessions total LESS than consumed, user deleted/edited DOWN - NO REFUND
  if (sessionHours <= hourBank.totalConsumedHours) {
    return // Do nothing - no refunds
  }

  // Sessions exceed consumed: user edited UP, charge the difference
  const newAvailable = Math.max(0, hourBank.totalPurchasedHours - sessionHours)

  await db.hourBank.update(1, {
    totalConsumedHours: sessionHours,
    availableHours: newAvailable,
  })
}
