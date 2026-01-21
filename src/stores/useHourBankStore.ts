/**
 * Hour Bank Store
 *
 * Manages the user's purchased meditation hours and purchase state.
 * Provides real-time balance tracking and purchase flow management.
 */

import { create } from 'zustand'
import type { PurchasesStoreProduct } from '@revenuecat/purchases-capacitor'
import {
  getHourBalance,
  canStartSession,
  consumeHours,
  addPurchasedHours,
  grantLifetimeAccess,
  initializeHourBank,
  reconcileConsumedHours,
  getPurchaseHistory,
  INITIAL_FREE_HOURS,
} from '../lib/hourBank'
import {
  getProducts,
  purchaseProduct,
  restorePurchases,
  PRODUCT_HOURS,
  PRODUCT_IDS,
  initializePurchases,
  isNativePlatform,
} from '../lib/purchases'

interface HourBankState {
  // Balance state
  totalPurchased: number
  totalConsumed: number
  available: number
  isLifetime: boolean
  deficit: number // Hours owed (0 if none)
  isLowHours: boolean // true if available < 1h
  isCriticallyLow: boolean // true if available < 30m and > 0
  purchaseCount: number // Number of purchases made

  // Purchase flow state
  products: PurchasesStoreProduct[]
  isLoadingProducts: boolean
  isPurchasing: boolean
  isRestoring: boolean
  purchaseError: string | null

  // Computed state
  canMeditate: boolean

  // Actions
  hydrate: () => Promise<void>
  refreshBalance: () => Promise<void>
  reconcileBalance: () => Promise<void>
  loadProducts: () => Promise<void>
  purchase: (productId: string) => Promise<boolean>
  restore: () => Promise<boolean>
  consumeSessionHours: (durationSeconds: number) => Promise<void>
  clearError: () => void

  // Dev-only actions for testing
  devSetHourBank: (purchased: number, consumed: number) => Promise<void>
}

export const useHourBankStore = create<HourBankState>((set, get) => ({
  // Initial state
  totalPurchased: INITIAL_FREE_HOURS,
  totalConsumed: 0,
  available: INITIAL_FREE_HOURS,
  isLifetime: false,
  deficit: 0,
  isLowHours: false,
  isCriticallyLow: false,
  purchaseCount: 0,

  products: [],
  isLoadingProducts: false,
  isPurchasing: false,
  isRestoring: false,
  purchaseError: null,

  canMeditate: true,

  // Hydrate from database on app start
  hydrate: async () => {
    try {
      // Initialize hour bank if needed
      await initializeHourBank()

      // Initialize RevenueCat
      await initializePurchases()

      // Get current balance and purchase history
      const balance = await getHourBalance()
      const canStart = await canStartSession()
      const purchases = await getPurchaseHistory()

      // Calculate low hours flags (1 hour = 1.0, 30 min = 0.5)
      const isLowHours = balance.available > 0 && balance.available < 1
      const isCriticallyLow = balance.available > 0 && balance.available < 0.5

      set({
        totalPurchased: balance.totalPurchased,
        totalConsumed: balance.totalConsumed,
        available: balance.available,
        isLifetime: balance.isLifetime,
        deficit: balance.deficit,
        isLowHours,
        isCriticallyLow,
        purchaseCount: purchases.length,
        canMeditate: canStart,
      })

      // Load products in background
      get().loadProducts()
    } catch (error) {
      console.error('[HourBankStore] Hydration failed:', error)
    }
  },

  // Refresh balance from database
  refreshBalance: async () => {
    try {
      const balance = await getHourBalance()
      const canStart = await canStartSession()
      const purchases = await getPurchaseHistory()

      // Calculate low hours flags (1 hour = 1.0, 30 min = 0.5)
      const isLowHours = balance.available > 0 && balance.available < 1
      const isCriticallyLow = balance.available > 0 && balance.available < 0.5

      set({
        totalPurchased: balance.totalPurchased,
        totalConsumed: balance.totalConsumed,
        available: balance.available,
        isLifetime: balance.isLifetime,
        deficit: balance.deficit,
        isLowHours,
        isCriticallyLow,
        purchaseCount: purchases.length,
        canMeditate: canStart,
      })
    } catch (error) {
      console.error('[HourBankStore] Failed to refresh balance:', error)
    }
  },

  // Reconcile consumed hours with actual session data
  // Call after session edits/deletes to close the duration exploit
  reconcileBalance: async () => {
    try {
      await reconcileConsumedHours()
      await get().refreshBalance()
    } catch (error) {
      console.error('[HourBankStore] Failed to reconcile balance:', error)
    }
  },

  // Load available products from store
  loadProducts: async () => {
    set({ isLoadingProducts: true })

    try {
      const products = await getProducts()
      set({ products, isLoadingProducts: false })
    } catch (error) {
      console.error('[HourBankStore] Failed to load products:', error)
      set({ isLoadingProducts: false })
    }
  },

  // Purchase a product
  purchase: async (productId: string) => {
    set({ isPurchasing: true, purchaseError: null })

    try {
      const result = await purchaseProduct(productId)

      if (!result.success) {
        if (result.error === 'cancelled') {
          // User cancelled - not an error
          set({ isPurchasing: false })
          return false
        }
        set({ isPurchasing: false, purchaseError: result.error || 'Purchase failed' })
        return false
      }

      // Get hours for this product
      const hours = PRODUCT_HOURS[productId] || 0

      if (productId === PRODUCT_IDS.LIFETIME) {
        // Grant lifetime access
        await grantLifetimeAccess(result.customerInfo?.originalAppUserId || 'unknown')
      } else {
        // Add purchased hours
        await addPurchasedHours(
          hours,
          productId,
          result.customerInfo?.originalAppUserId || 'unknown'
        )
      }

      // Refresh balance
      await get().refreshBalance()

      set({ isPurchasing: false })
      return true
    } catch (error) {
      console.error('[HourBankStore] Purchase failed:', error)
      set({
        isPurchasing: false,
        purchaseError: error instanceof Error ? error.message : 'Purchase failed',
      })
      return false
    }
  },

  // Restore previous purchases
  restore: async () => {
    set({ isRestoring: true, purchaseError: null })

    try {
      const result = await restorePurchases()

      if (!result.success) {
        set({ isRestoring: false, purchaseError: result.error || 'Restore failed' })
        return false
      }

      // Check customer info for lifetime entitlement
      if (result.customerInfo?.entitlements.active['lifetime']) {
        await grantLifetimeAccess(result.customerInfo.originalAppUserId || 'restored')
      }

      // Note: For consumable products (hour packs), we rely on local storage
      // RevenueCat doesn't track consumable consumption

      // Refresh balance
      await get().refreshBalance()

      set({ isRestoring: false })
      return true
    } catch (error) {
      console.error('[HourBankStore] Restore failed:', error)
      set({
        isRestoring: false,
        purchaseError: error instanceof Error ? error.message : 'Restore failed',
      })
      return false
    }
  },

  // Consume hours after a session
  consumeSessionHours: async (durationSeconds: number) => {
    try {
      await consumeHours(durationSeconds)
      await get().refreshBalance()
    } catch (error) {
      console.error('[HourBankStore] Failed to consume hours:', error)
    }
  },

  // Clear purchase error
  clearError: () => {
    set({ purchaseError: null })
  },

  // Dev-only: Set hour bank state directly for testing
  devSetHourBank: async (purchased: number, consumed: number) => {
    if (!import.meta.env.DEV) {
      console.warn('devSetHourBank is only available in development mode')
      return
    }

    const { db } = await import('../lib/db/schema')
    const available = Math.max(0, purchased - consumed)
    const deficit = Math.max(0, consumed - purchased)
    const isLowHours = available > 0 && available < 1
    const isCriticallyLow = available > 0 && available < 0.5

    // Update database
    const hourBank = await db.hourBank.get(1)
    if (hourBank) {
      await db.hourBank.update(1, {
        totalPurchasedHours: purchased,
        totalConsumedHours: consumed,
        availableHours: available,
        isLifetime: false,
      })
    } else {
      await db.hourBank.add({
        id: 1,
        totalPurchasedHours: purchased,
        totalConsumedHours: consumed,
        availableHours: available,
        isLifetime: false,
        lastPurchaseAt: null,
        purchases: [],
      })
    }

    // Update store state
    set({
      totalPurchased: purchased,
      totalConsumed: consumed,
      available,
      deficit,
      isLowHours,
      isCriticallyLow,
      canMeditate: available > 0,
    })
  },
}))

// Helper to check if running on web (for development)
export const isWebPlatform = (): boolean => {
  return !isNativePlatform()
}
