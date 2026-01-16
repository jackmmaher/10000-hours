/**
 * Hour Bank Store Tests
 *
 * Tests for hour bank state management: flags, deficit tracking,
 * hydration, refresh, and dev tools.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../lib/db/schema'
import { useHourBankStore } from '../useHourBankStore'
import { INITIAL_FREE_HOURS } from '../../lib/hourBank'

// Mock the purchases module to avoid RevenueCat initialization
vi.mock('../../lib/purchases', () => ({
  getProducts: vi.fn().mockResolvedValue([]),
  purchaseProduct: vi.fn(),
  restorePurchases: vi.fn(),
  PRODUCT_HOURS: {},
  PRODUCT_IDS: { LIFETIME: 'lifetime' },
  initializePurchases: vi.fn().mockResolvedValue(undefined),
  isNativePlatform: vi.fn().mockReturnValue(false),
}))

// Helper to reset store between tests
function resetStore() {
  useHourBankStore.setState({
    totalPurchased: INITIAL_FREE_HOURS,
    totalConsumed: 0,
    available: INITIAL_FREE_HOURS,
    isLifetime: false,
    deficit: 0,
    isLowHours: false,
    isCriticallyLow: false,
    products: [],
    isLoadingProducts: false,
    isPurchasing: false,
    isRestoring: false,
    purchaseError: null,
    canMeditate: true,
  })
}

describe('useHourBankStore', () => {
  beforeEach(async () => {
    // Clear database and reset store
    await db.hourBank.clear()
    resetStore()
  })

  describe('State Flags', () => {
    it('isLowHours true when 0 < available < 1h', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.2,
        availableHours: 0.8, // 48 minutes
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(true)
      expect(state.available).toBeCloseTo(0.8, 5)
    })

    it('isLowHours false at exactly 1h', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9,
        availableHours: 1, // Exactly 1 hour
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(false)
    })

    it('isCriticallyLow true when 0 < available < 0.5h', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.6,
        availableHours: 0.4, // 24 minutes
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isCriticallyLow).toBe(true)
      expect(state.isLowHours).toBe(true) // Also low
    })

    it('isCriticallyLow false at exactly 0.5h', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.5,
        availableHours: 0.5, // Exactly 30 minutes
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isCriticallyLow).toBe(false)
      expect(state.isLowHours).toBe(true) // Still low (< 1h)
    })

    it('both flags false when available = 0', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 10,
        availableHours: 0,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(false)
      expect(state.isCriticallyLow).toBe(false)
      expect(state.canMeditate).toBe(false)
    })

    it('both flags false when hours are plentiful', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 100,
        totalConsumedHours: 10,
        availableHours: 90,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(false)
      expect(state.isCriticallyLow).toBe(false)
      expect(state.canMeditate).toBe(true)
    })
  })

  describe('Deficit Tracking', () => {
    it('deficit calculated correctly', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 12,
        availableHours: 0,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.deficit).toBe(2)
    })

    it('no deficit when consumed < purchased', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 5,
        availableHours: 5,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.deficit).toBe(0)
    })
  })

  describe('hydrate() and refreshBalance()', () => {
    it('loads from DB correctly', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 50,
        totalConsumedHours: 20,
        availableHours: 30,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().hydrate()

      const state = useHourBankStore.getState()
      expect(state.totalPurchased).toBe(50)
      expect(state.totalConsumed).toBe(20)
      expect(state.available).toBe(30)
    })

    it('computes all derived flags', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.3,
        availableHours: 0.7,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(true)
      expect(state.isCriticallyLow).toBe(false)
      expect(state.canMeditate).toBe(true)
      expect(state.deficit).toBe(0)
    })

    it('handles empty DB (first run)', async () => {
      // Database is empty
      await useHourBankStore.getState().hydrate()

      const state = useHourBankStore.getState()
      expect(state.totalPurchased).toBe(INITIAL_FREE_HOURS)
      expect(state.totalConsumed).toBe(0)
      expect(state.available).toBe(INITIAL_FREE_HOURS)
      expect(state.isLifetime).toBe(false)
    })

    it('handles lifetime user', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10000,
        totalConsumedHours: 500,
        availableHours: 9500,
        isLifetime: true,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isLifetime).toBe(true)
      expect(state.canMeditate).toBe(true)
    })
  })

  describe('devSetHourBank()', () => {
    it('sets purchased/consumed correctly', async () => {
      await useHourBankStore.getState().devSetHourBank(100, 30)

      const state = useHourBankStore.getState()
      expect(state.totalPurchased).toBe(100)
      expect(state.totalConsumed).toBe(30)
      expect(state.available).toBe(70)
    })

    it('computes available and deficit', async () => {
      await useHourBankStore.getState().devSetHourBank(10, 15)

      const state = useHourBankStore.getState()
      expect(state.available).toBe(0)
      expect(state.deficit).toBe(5)
    })

    it('resets isLifetime flag', async () => {
      // First set as lifetime
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10000,
        totalConsumedHours: 0,
        availableHours: 10000,
        isLifetime: true,
        lastPurchaseAt: null,
        purchases: [],
      })

      // Use dev tool to set different values
      await useHourBankStore.getState().devSetHourBank(10, 5)

      // Check database was updated
      const hourBank = await db.hourBank.get(1)
      expect(hourBank?.isLifetime).toBe(false)
    })

    it('computes isLowHours correctly', async () => {
      await useHourBankStore.getState().devSetHourBank(10, 9.3)

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(true)
      expect(state.isCriticallyLow).toBe(false)
    })

    it('computes isCriticallyLow correctly', async () => {
      await useHourBankStore.getState().devSetHourBank(10, 9.7)

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(true)
      expect(state.isCriticallyLow).toBe(true)
    })

    it('updates canMeditate flag', async () => {
      await useHourBankStore.getState().devSetHourBank(10, 10)

      const state = useHourBankStore.getState()
      expect(state.canMeditate).toBe(false)

      await useHourBankStore.getState().devSetHourBank(10, 5)

      const newState = useHourBankStore.getState()
      expect(newState.canMeditate).toBe(true)
    })

    it('creates hour bank if none exists', async () => {
      // No hour bank exists
      await useHourBankStore.getState().devSetHourBank(50, 10)

      const hourBank = await db.hourBank.get(1)
      expect(hourBank).toBeDefined()
      expect(hourBank?.totalPurchasedHours).toBe(50)
      expect(hourBank?.totalConsumedHours).toBe(10)
    })

    describe('presets', () => {
      it('plentiful hours: purchased=100, consumed=10', async () => {
        await useHourBankStore.getState().devSetHourBank(100, 10)

        const state = useHourBankStore.getState()
        expect(state.available).toBe(90)
        expect(state.isLowHours).toBe(false)
        expect(state.isCriticallyLow).toBe(false)
        expect(state.canMeditate).toBe(true)
      })

      it('low hours: purchased=10, consumed=9.2 (48min remaining)', async () => {
        await useHourBankStore.getState().devSetHourBank(10, 9.2)

        const state = useHourBankStore.getState()
        expect(state.available).toBeCloseTo(0.8, 5)
        expect(state.isLowHours).toBe(true)
        expect(state.isCriticallyLow).toBe(false)
        expect(state.canMeditate).toBe(true)
      })

      it('critical hours: purchased=10, consumed=9.6 (24min remaining)', async () => {
        await useHourBankStore.getState().devSetHourBank(10, 9.6)

        const state = useHourBankStore.getState()
        expect(state.available).toBeCloseTo(0.4, 5)
        expect(state.isLowHours).toBe(true)
        expect(state.isCriticallyLow).toBe(true)
        expect(state.canMeditate).toBe(true)
      })

      it('zero hours: purchased=10, consumed=10', async () => {
        await useHourBankStore.getState().devSetHourBank(10, 10)

        const state = useHourBankStore.getState()
        expect(state.available).toBe(0)
        expect(state.isLowHours).toBe(false)
        expect(state.isCriticallyLow).toBe(false)
        expect(state.canMeditate).toBe(false)
      })

      it('deficit: purchased=10, consumed=12', async () => {
        await useHourBankStore.getState().devSetHourBank(10, 12)

        const state = useHourBankStore.getState()
        expect(state.available).toBe(0)
        expect(state.deficit).toBe(2)
        expect(state.canMeditate).toBe(false)
      })
    })
  })

  describe('consumeSessionHours()', () => {
    it('updates balance after consumption', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 0,
        availableHours: 10,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      // Consume 10 minutes (600 seconds)
      await useHourBankStore.getState().consumeSessionHours(600)

      const state = useHourBankStore.getState()
      expect(state.totalConsumed).toBeCloseTo(10 / 60, 5)
      expect(state.available).toBeCloseTo(10 - 10 / 60, 5)
    })
  })

  describe('clearError()', () => {
    it('clears purchase error', () => {
      useHourBankStore.setState({ purchaseError: 'Test error' })

      expect(useHourBankStore.getState().purchaseError).toBe('Test error')

      useHourBankStore.getState().clearError()

      expect(useHourBankStore.getState().purchaseError).toBeNull()
    })
  })

  describe('Edge Cases Matrix', () => {
    it('at exactly 1 hour boundary', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9,
        availableHours: 1,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.available).toBe(1)
      expect(state.isLowHours).toBe(false) // >= 1 is not low
    })

    it('at exactly 30 minute boundary', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.5,
        availableHours: 0.5,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.available).toBe(0.5)
      expect(state.isLowHours).toBe(true) // < 1h
      expect(state.isCriticallyLow).toBe(false) // >= 0.5 is not critically low
    })

    it('just under 30 minutes', async () => {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: 10,
        totalConsumedHours: 9.51,
        availableHours: 0.49,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })

      await useHourBankStore.getState().refreshBalance()

      const state = useHourBankStore.getState()
      expect(state.isLowHours).toBe(true)
      expect(state.isCriticallyLow).toBe(true) // < 0.5h
    })
  })
})
