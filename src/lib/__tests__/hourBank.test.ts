/**
 * Hour Bank Unit Tests
 *
 * Tests for all hour bank functions: balance calculations,
 * consumption, purchases, lifetime access, and formatting.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../db/schema'
import {
  getHourBalance,
  canStartSession,
  consumeHours,
  addPurchasedHours,
  grantLifetimeAccess,
  initializeHourBank,
  reconcileConsumedHours,
  formatHours,
  formatAvailableHours,
  INITIAL_FREE_HOURS,
} from '../hourBank'

describe('hourBank', () => {
  beforeEach(async () => {
    // Clear hour bank between tests
    await db.hourBank.clear()
  })

  describe('getHourBalance', () => {
    it('returns zeros for empty/new DB', async () => {
      const balance = await getHourBalance()

      expect(balance.totalPurchased).toBe(INITIAL_FREE_HOURS)
      expect(balance.totalConsumed).toBe(0)
      expect(balance.available).toBe(INITIAL_FREE_HOURS)
      expect(balance.isLifetime).toBe(false)
      expect(balance.deficit).toBe(0)
    })

    it('calculates available correctly', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 3,
        availableHours: 7,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()

      expect(balance.totalPurchased).toBe(10)
      expect(balance.totalConsumed).toBe(3)
      expect(balance.available).toBe(7)
      expect(balance.deficit).toBe(0)
    })

    it('calculates deficit correctly (consumed > purchased)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 12,
        availableHours: 0,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()

      expect(balance.available).toBe(0)
      expect(balance.deficit).toBe(2)
    })

    it('includes isLifetime flag', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10000,
        totalConsumedHours: 0,
        availableHours: 10000,
        isLifetime: true,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()

      expect(balance.isLifetime).toBe(true)
    })

    it('handles floating point edge cases', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.999999999,
        availableHours: 0.000000001,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()

      expect(balance.available).toBeCloseTo(0, 5)
      expect(balance.deficit).toBe(0)
    })
  })

  describe('consumeHours', () => {
    it('returns 0 for sessions < 60 seconds (minimum threshold)', async () => {
      await initializeHourBank()

      const consumed = await consumeHours(59)

      expect(consumed).toBe(0)
    })

    it('rounds up to nearest minute', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0,
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // 61 seconds = 2 minutes (rounded up) = 2/60 hours
      const consumed = await consumeHours(61)

      expect(consumed).toBe(2 / 60)
    })

    it('deducts from available hours', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0,
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // 600 seconds = 10 minutes = 1/6 hour
      await consumeHours(600)

      const balance = await getHourBalance()
      expect(balance.totalConsumed).toBeCloseTo(10 / 60, 5)
      expect(balance.available).toBeCloseTo(10 - 10 / 60, 5)
    })

    it('creates deficit when available exhausted', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 0.1, // 6 minutes
        totalConsumedHours: 0,
        availableHours: 0.1,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // 600 seconds = 10 minutes
      await consumeHours(600)

      const balance = await getHourBalance()
      expect(balance.available).toBe(0)
      expect(balance.deficit).toBeGreaterThan(0)
    })

    it('returns 0 for lifetime users (no deduction)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10000,
        totalConsumedHours: 100,
        availableHours: 9900,
        isLifetime: true,
        lastPurchaseAt: null,
        purchases: [],
      })

      const consumed = await consumeHours(3600) // 1 hour

      expect(consumed).toBe(0)

      const balance = await getHourBalance()
      expect(balance.totalConsumed).toBe(100) // Unchanged
    })

    it('validates input - negative duration', async () => {
      await initializeHourBank()

      const consumed = await consumeHours(-100)

      expect(consumed).toBe(0)
    })

    it('validates input - NaN duration', async () => {
      await initializeHourBank()

      const consumed = await consumeHours(NaN)

      expect(consumed).toBe(0)
    })

    it('validates input - Infinity duration', async () => {
      await initializeHourBank()

      const consumed = await consumeHours(Infinity)

      expect(consumed).toBe(0)
    })
  })

  describe('addPurchasedHours', () => {
    it('adds hours to totalPurchased', async () => {
      await initializeHourBank()

      await addPurchasedHours(10, 'test-product', 'tx-123')

      const balance = await getHourBalance()
      expect(balance.totalPurchased).toBe(INITIAL_FREE_HOURS + 10)
    })

    it('carries forward deficit (critical test)', async () => {
      // User has consumed 2 hours more than purchased
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 12,
        availableHours: 0,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // Purchase 20 more hours
      await addPurchasedHours(20, 'test-product', 'tx-123')

      const balance = await getHourBalance()
      // New purchased: 10 + 20 = 30
      // Available should be 30 - 12 = 18 (not 20, deficit carried forward)
      expect(balance.totalPurchased).toBe(30)
      expect(balance.available).toBe(18)
      expect(balance.deficit).toBe(0)
    })

    it('records purchase in history', async () => {
      await initializeHourBank()

      await addPurchasedHours(10, 'test-product', 'tx-123')

      const hourBank = await db.hourBank.get(1)
      expect(hourBank?.purchases).toHaveLength(1)
      expect(hourBank?.purchases[0].productId).toBe('test-product')
      expect(hourBank?.purchases[0].transactionId).toBe('tx-123')
      expect(hourBank?.purchases[0].hours).toBe(10)
    })

    it('validates input - negative hours', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0,
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await addPurchasedHours(-5, 'test-product', 'tx-123')

      const balance = await getHourBalance()
      // Should be unchanged
      expect(balance.totalPurchased).toBe(10)
    })

    it('validates input - zero hours', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0,
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await addPurchasedHours(0, 'test-product', 'tx-123')

      const balance = await getHourBalance()
      // Should be unchanged
      expect(balance.totalPurchased).toBe(10)
    })

    it('validates input - NaN hours', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0,
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await addPurchasedHours(NaN, 'test-product', 'tx-123')

      const balance = await getHourBalance()
      // Should be unchanged
      expect(balance.totalPurchased).toBe(10)
    })

    it('handles duplicate transactionId', async () => {
      await initializeHourBank()

      await addPurchasedHours(10, 'test-product', 'tx-123')
      await addPurchasedHours(10, 'test-product', 'tx-123') // Same transaction

      const hourBank = await db.hourBank.get(1)
      // Note: Current implementation doesn't prevent duplicates
      // This test documents current behavior
      expect(hourBank?.purchases?.length).toBeGreaterThanOrEqual(1)
    })

    it('creates hour bank if none exists', async () => {
      // Don't initialize - start fresh
      await addPurchasedHours(10, 'test-product', 'tx-123')

      const balance = await getHourBalance()
      expect(balance.totalPurchased).toBe(INITIAL_FREE_HOURS + 10)
    })
  })

  describe('grantLifetimeAccess', () => {
    it('sets isLifetime flag', async () => {
      await initializeHourBank()

      await grantLifetimeAccess('tx-lifetime')

      const balance = await getHourBalance()
      expect(balance.isLifetime).toBe(true)
    })

    it('sets totalPurchased to 10000', async () => {
      await initializeHourBank()

      await grantLifetimeAccess('tx-lifetime')

      const balance = await getHourBalance()
      expect(balance.totalPurchased).toBe(10000)
    })

    it('handles high consumed hours - clamps availableHours to 0 minimum', async () => {
      // User has consumed more than 10000 hours before upgrading
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 15000,
        totalConsumedHours: 10500,
        availableHours: 4500,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await grantLifetimeAccess('tx-lifetime')

      const balance = await getHourBalance()
      // availableHours should be clamped to 0, not negative
      expect(balance.available).toBe(0)
      expect(balance.available).toBeGreaterThanOrEqual(0)
      expect(balance.isLifetime).toBe(true)
    })

    it('creates hour bank if none exists', async () => {
      // Don't initialize
      await grantLifetimeAccess('tx-lifetime')

      const balance = await getHourBalance()
      expect(balance.isLifetime).toBe(true)
      expect(balance.totalPurchased).toBe(10000)
      expect(balance.available).toBe(10000)
    })
  })

  describe('canStartSession', () => {
    it('returns true when available > 0', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 5,
        availableHours: 5,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const canStart = await canStartSession()

      expect(canStart).toBe(true)
    })

    it('returns true for lifetime users', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10000,
        totalConsumedHours: 10000,
        availableHours: 0,
        isLifetime: true,
        lastPurchaseAt: null,
        purchases: [],
      })

      const canStart = await canStartSession()

      expect(canStart).toBe(true)
    })

    it('returns false when available = 0', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 10,
        availableHours: 0,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const canStart = await canStartSession()

      expect(canStart).toBe(false)
    })

    it('returns based on INITIAL_FREE_HOURS for new user', async () => {
      // Don't initialize - test new user state
      const canStart = await canStartSession()

      expect(canStart).toBe(INITIAL_FREE_HOURS > 0)
    })
  })

  describe('formatHours', () => {
    it('formats minutes only for < 1h', () => {
      expect(formatHours(0.5)).toBe('30m')
      expect(formatHours(0.25)).toBe('15m')
      expect(formatHours(0.75)).toBe('45m')
    })

    it('formats hours only when minutes are 0', () => {
      expect(formatHours(1)).toBe('1h')
      expect(formatHours(2)).toBe('2h')
      expect(formatHours(10)).toBe('10h')
    })

    it('formats hours and minutes for mixed values', () => {
      expect(formatHours(1.5)).toBe('1h 30m')
      expect(formatHours(2.25)).toBe('2h 15m')
      expect(formatHours(5.75)).toBe('5h 45m')
    })

    it('handles 0', () => {
      expect(formatHours(0)).toBe('0m')
    })

    it('handles negative values', () => {
      expect(formatHours(-1)).toBe('0m')
      expect(formatHours(-0.5)).toBe('0m')
    })

    it('handles decimal edge cases', () => {
      // 1/60 hour = 1 minute
      expect(formatHours(1 / 60)).toBe('1m')
      // Very small but positive
      expect(formatHours(0.01)).toBe('1m') // Rounds to 1 minute
    })
  })

  describe('formatAvailableHours', () => {
    it('returns "Lifetime" for >= 10000 hours', () => {
      expect(formatAvailableHours(10000)).toBe('Lifetime')
      expect(formatAvailableHours(15000)).toBe('Lifetime')
    })

    it('returns hours only for >= 100 hours', () => {
      expect(formatAvailableHours(100)).toBe('100h')
      expect(formatAvailableHours(500)).toBe('500h')
      expect(formatAvailableHours(999)).toBe('999h')
    })

    it('uses formatHours for < 100 hours', () => {
      expect(formatAvailableHours(1.5)).toBe('1h 30m')
      expect(formatAvailableHours(0.5)).toBe('30m')
      expect(formatAvailableHours(99)).toBe('99h')
    })
  })

  describe('initializeHourBank', () => {
    it('creates hour bank with initial values', async () => {
      await initializeHourBank()

      const balance = await getHourBalance()
      expect(balance.totalPurchased).toBe(INITIAL_FREE_HOURS)
      expect(balance.totalConsumed).toBe(0)
      expect(balance.isLifetime).toBe(false)
    })

    it('does not overwrite existing hour bank', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 50,
        totalConsumedHours: 10,
        availableHours: 40,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await initializeHourBank()

      const balance = await getHourBalance()
      expect(balance.totalPurchased).toBe(50) // Unchanged
      expect(balance.totalConsumed).toBe(10) // Unchanged
    })
  })

  describe('Edge Cases Matrix', () => {
    it('new user: purchased=10, consumed=0', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0,
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()
      expect(balance.available).toBe(10)
      expect(balance.deficit).toBe(0)
    })

    it('low hours: purchased=10, consumed=9.2 (0.8h remaining)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.2,
        availableHours: 0.8,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()
      expect(balance.available).toBeCloseTo(0.8, 5)
      expect(balance.deficit).toBe(0)
    })

    it('critical: purchased=10, consumed=9.6 (0.4h remaining)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.6,
        availableHours: 0.4,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()
      expect(balance.available).toBeCloseTo(0.4, 5)
      expect(balance.deficit).toBe(0)
    })

    it('deficit: purchased=10, consumed=10.5', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 10.5,
        availableHours: 0,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()
      expect(balance.available).toBe(0)
      expect(balance.deficit).toBeCloseTo(0.5, 5)
    })

    it('at 1h boundary: purchased=10, consumed=9 (exactly 1h remaining)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9,
        availableHours: 1,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()
      expect(balance.available).toBe(1)
      expect(balance.deficit).toBe(0)
    })

    it('at 30m boundary: purchased=10, consumed=9.5 (exactly 30m remaining)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.5,
        availableHours: 0.5,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()
      expect(balance.available).toBe(0.5)
      expect(balance.deficit).toBe(0)
    })

    it('just under 30m: purchased=10, consumed=9.51 (0.49h remaining)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.51,
        availableHours: 0.49,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      const balance = await getHourBalance()
      expect(balance.available).toBeCloseTo(0.49, 5)
      expect(balance.deficit).toBe(0)
    })

    it('purchase with deficit: clears deficit correctly', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 10.5,
        availableHours: 0,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await addPurchasedHours(20, 'test', 'tx-123')

      const balance = await getHourBalance()
      // 30 purchased - 10.5 consumed = 19.5 available
      expect(balance.totalPurchased).toBe(30)
      expect(balance.available).toBeCloseTo(19.5, 5)
      expect(balance.deficit).toBe(0)
    })
  })

  describe('reconcileConsumedHours', () => {
    beforeEach(async () => {
      // Clear sessions too for reconciliation tests
      await db.sessions.clear()
    })

    it('increases consumed when sessions edited UP', async () => {
      // Hour bank shows 5 min consumed
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 5 / 60, // 5 min
        availableHours: 10 - 5 / 60,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // Session was edited to 60 min
      await db.sessions.add({
        uuid: 'test-session-1',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        durationSeconds: 3600, // 60 min
      })

      await reconcileConsumedHours()

      const balance = await getHourBalance()
      expect(balance.totalConsumed).toBe(1) // Updated to 60 min = 1 hour
      expect(balance.available).toBe(9)
    })

    it('handles session edit UP exploit (critical security test)', async () => {
      // User completed 5-min session, hour bank recorded 5 min
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 5 / 60, // ~0.083h
        availableHours: 10 - 5 / 60,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // User then edited session to 60 minutes via UI
      await db.sessions.add({
        uuid: 'exploit-session',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        durationSeconds: 3600, // 60 min (edited up from 5 min)
      })

      // Before fix: hour bank would still show 5 min consumed
      // After fix: reconcile should update to 60 min consumed
      await reconcileConsumedHours()

      const balance = await getHourBalance()
      expect(balance.totalConsumed).toBe(1) // 60 min = 1 hour
      expect(balance.available).toBe(9) // 10 - 1 = 9 hours
    })

    it('does NOT refund when sessions deleted', async () => {
      // Hour bank shows 1 hour consumed
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 1,
        availableHours: 9,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // No sessions in DB (user deleted them)
      // Don't add any sessions

      await reconcileConsumedHours()

      const balance = await getHourBalance()
      expect(balance.totalConsumed).toBe(1) // UNCHANGED - no refund!
      expect(balance.available).toBe(9) // UNCHANGED
    })

    it('does NOT refund when sessions edited DOWN', async () => {
      // Hour bank shows 1 hour consumed
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 1, // 60 min
        availableHours: 9,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // Session edited DOWN to 30 min
      await db.sessions.add({
        uuid: 'edited-down-session',
        startTime: Date.now() - 1800000,
        endTime: Date.now(),
        durationSeconds: 1800, // 30 min
      })

      await reconcileConsumedHours()

      const balance = await getHourBalance()
      expect(balance.totalConsumed).toBe(1) // UNCHANGED - no refund!
      expect(balance.available).toBe(9) // UNCHANGED
    })

    it('skips reconciliation for lifetime users', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10000,
        totalConsumedHours: 100, // Arbitrary consumed amount
        availableHours: 9900,
        isLifetime: true,
        lastPurchaseAt: null,
        purchases: [],
      })

      // Sessions total 50 hours
      await db.sessions.add({
        uuid: 'lifetime-session',
        startTime: Date.now() - 180000000,
        endTime: Date.now(),
        durationSeconds: 180000, // 50 hours
      })

      await reconcileConsumedHours()

      const balance = await getHourBalance()
      // Consumed should be unchanged for lifetime users
      expect(balance.totalConsumed).toBe(100)
      expect(balance.isLifetime).toBe(true)
    })

    it('handles multiple sessions correctly', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0, // Incorrectly shows 0
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // Add multiple sessions
      const now = Date.now()
      await db.sessions.bulkAdd([
        {
          uuid: 'session-1',
          startTime: now - 3600000,
          endTime: now - 3000000,
          durationSeconds: 600, // 10 min
        },
        {
          uuid: 'session-2',
          startTime: now - 2400000,
          endTime: now - 1200000,
          durationSeconds: 1200, // 20 min
        },
        {
          uuid: 'session-3',
          startTime: now - 600000,
          endTime: now,
          durationSeconds: 600, // 10 min
        },
      ])

      await reconcileConsumedHours()

      const balance = await getHourBalance()
      // Total: 10 + 20 + 10 = 40 min = 40/60 hours
      expect(balance.totalConsumed).toBeCloseTo(40 / 60, 5)
      expect(balance.available).toBeCloseTo(10 - 40 / 60, 5)
    })

    it('handles deficit after reconciliation (edited beyond purchased)', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 1, // Only 1 hour purchased
        totalConsumedHours: 0.5,
        availableHours: 0.5,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      // Session edited to 2 hours (beyond purchased amount)
      await db.sessions.add({
        uuid: 'over-limit-session',
        startTime: Date.now() - 7200000,
        endTime: Date.now(),
        durationSeconds: 7200, // 2 hours
      })

      await reconcileConsumedHours()

      const balance = await getHourBalance()
      expect(balance.totalConsumed).toBe(2) // 2 hours consumed
      expect(balance.available).toBe(0) // Clamped to 0
      expect(balance.deficit).toBe(1) // 1 hour deficit
    })

    it('does nothing if hour bank does not exist', async () => {
      // Don't create hour bank, just have a session
      await db.sessions.add({
        uuid: 'orphan-session',
        startTime: Date.now() - 1800000,
        endTime: Date.now(),
        durationSeconds: 1800,
      })

      // Should not throw
      await expect(reconcileConsumedHours()).resolves.toBeUndefined()
    })
  })
})
