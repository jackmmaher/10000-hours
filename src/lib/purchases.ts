/**
 * Purchases Service
 *
 * RevenueCat integration for in-app purchases.
 * Handles hour pack purchases and lifetime unlock.
 */

import { Capacitor } from '@capacitor/core'
import {
  Purchases,
  type CustomerInfo,
  type PurchasesStoreProduct,
  LOG_LEVEL,
} from '@revenuecat/purchases-capacitor'

// Product identifiers - must match App Store Connect / Play Console
export const PRODUCT_IDS = {
  STARTER: 'still_hours_10',
  FLOW: 'still_hours_25',
  DEDICATED: 'still_hours_50',
  COMMITTED: 'still_hours_75',
  SERIOUS: 'still_hours_100',
  LIFETIME: 'still_hours_lifetime',
} as const

// Hours included in each product
export const PRODUCT_HOURS: Record<string, number> = {
  [PRODUCT_IDS.STARTER]: 10,
  [PRODUCT_IDS.FLOW]: 25,
  [PRODUCT_IDS.DEDICATED]: 50,
  [PRODUCT_IDS.COMMITTED]: 75,
  [PRODUCT_IDS.SERIOUS]: 100,
  [PRODUCT_IDS.LIFETIME]: 10000, // Lifetime grants 10,000 hours
}

// Entitlement identifier for lifetime access
export const LIFETIME_ENTITLEMENT = 'lifetime'

// RevenueCat API keys - these should be from environment variables in production
const REVENUECAT_API_KEY_IOS = import.meta.env.VITE_REVENUECAT_IOS_KEY || ''
const REVENUECAT_API_KEY_ANDROID = import.meta.env.VITE_REVENUECAT_ANDROID_KEY || ''

// Check if we're running on a native platform
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform()
}

// Initialize RevenueCat
export async function initializePurchases(userId?: string): Promise<void> {
  if (!isNativePlatform()) {
    console.log('[Purchases] Skipping initialization - not on native platform')
    return
  }

  const platform = Capacitor.getPlatform()
  const apiKey = platform === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID

  if (!apiKey) {
    console.warn('[Purchases] No RevenueCat API key configured for platform:', platform)
    return
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
    await Purchases.configure({
      apiKey,
      appUserID: userId || undefined,
    })
    console.log('[Purchases] RevenueCat initialized successfully')
  } catch (error) {
    console.error('[Purchases] Failed to initialize RevenueCat:', error)
    throw error
  }
}

// Get available products
export async function getProducts(): Promise<PurchasesStoreProduct[]> {
  if (!isNativePlatform()) {
    console.log('[Purchases] Returning mock products - not on native platform')
    return getMockProducts()
  }

  try {
    const { products } = await Purchases.getProducts({
      productIdentifiers: Object.values(PRODUCT_IDS),
    })
    return products
  } catch (error) {
    console.error('[Purchases] Failed to get products:', error)
    return []
  }
}

// Purchase a product
export async function purchaseProduct(
  productId: string
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  if (!isNativePlatform()) {
    console.log('[Purchases] Simulating purchase - not on native platform')
    return { success: true }
  }

  try {
    const { customerInfo } = await Purchases.purchaseStoreProduct({
      product: { identifier: productId } as PurchasesStoreProduct,
    })
    return { success: true, customerInfo }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Purchase failed'
    console.error('[Purchases] Purchase failed:', error)

    // Check if user cancelled
    if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
      return { success: false, error: 'cancelled' }
    }

    return { success: false, error: errorMessage }
  }
}

// Check customer info and entitlements
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isNativePlatform()) {
    console.log('[Purchases] Returning mock info - not on native platform')
    return null
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo
  } catch (error) {
    console.error('[Purchases] Failed to get customer info:', error)
    return null
  }
}

// Check if user has lifetime access
export async function hasLifetimeAccess(): Promise<boolean> {
  const customerInfo = await getCustomerInfo()
  if (!customerInfo) return false

  return LIFETIME_ENTITLEMENT in (customerInfo.entitlements.active || {})
}

// Restore purchases
export async function restorePurchases(): Promise<{
  success: boolean
  customerInfo?: CustomerInfo
  error?: string
}> {
  if (!isNativePlatform()) {
    console.log('[Purchases] Simulating restore - not on native platform')
    return { success: true }
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases()
    return { success: true, customerInfo }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Restore failed'
    console.error('[Purchases] Restore failed:', error)
    return { success: false, error: errorMessage }
  }
}

// Set user ID for attribution (call after sign-in)
export async function identifyUser(userId: string): Promise<void> {
  if (!isNativePlatform()) return

  try {
    await Purchases.logIn({ appUserID: userId })
    console.log('[Purchases] User identified:', userId)
  } catch (error) {
    console.error('[Purchases] Failed to identify user:', error)
  }
}

// Log out user (call on sign-out)
export async function logOutUser(): Promise<void> {
  if (!isNativePlatform()) return

  try {
    await Purchases.logOut()
    console.log('[Purchases] User logged out')
  } catch (error) {
    console.error('[Purchases] Failed to log out user:', error)
  }
}

// Mock products for development (prices grossed up for Apple's 30% commission)
function getMockProducts(): PurchasesStoreProduct[] {
  return [
    {
      identifier: PRODUCT_IDS.STARTER,
      title: '10 Hours',
      description: 'Start your journey with 10 hours of meditation',
      price: 1.49,
      priceString: '$1.49',
      currencyCode: 'USD',
    },
    {
      identifier: PRODUCT_IDS.FLOW,
      title: '25 Hours',
      description: 'Enter the flow with 25 hours of meditation',
      price: 4.49,
      priceString: '$4.49',
      currencyCode: 'USD',
    },
    {
      identifier: PRODUCT_IDS.DEDICATED,
      title: '50 Hours',
      description: 'Dedicated practice with 50 hours of meditation',
      price: 7.49,
      priceString: '$7.49',
      currencyCode: 'USD',
    },
    {
      identifier: PRODUCT_IDS.COMMITTED,
      title: '75 Hours',
      description: 'Committed practice with 75 hours of meditation',
      price: 9.49,
      priceString: '$9.49',
      currencyCode: 'USD',
    },
    {
      identifier: PRODUCT_IDS.SERIOUS,
      title: '100 Hours',
      description: 'Serious practice with 100 hours of meditation',
      price: 11.49,
      priceString: '$11.49',
      currencyCode: 'USD',
    },
    {
      identifier: PRODUCT_IDS.LIFETIME,
      title: 'Lifetime Access',
      description: 'Unlimited meditation for life - 10,000 hours',
      price: 149.99,
      priceString: '$149.99',
      currencyCode: 'USD',
    },
  ] as PurchasesStoreProduct[]
}
