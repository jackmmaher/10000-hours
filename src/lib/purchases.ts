/**
 * Purchases - RevenueCat integration for in-app purchases
 *
 * MOCK_MODE: Set to true during development
 * When false, uses real RevenueCat SDK
 *
 * Products:
 * - premium_annual: $4.99/year subscription
 *
 * Entitlements:
 * - premium: Unlocks full app experience
 */

// Set to false when RevenueCat is configured
const MOCK_MODE = true

// Simulated delay for mock purchases (ms)
const MOCK_DELAY = 1500

export interface PurchaseResult {
  success: boolean
  error?: string
}

export interface SubscriptionStatus {
  isActive: boolean
  expiryDate?: number
  productId?: string
}

/**
 * Initialize RevenueCat SDK
 * Call this on app startup
 */
export async function initializePurchases(): Promise<void> {
  if (MOCK_MODE) {
    console.log('[Purchases] Mock mode - skipping initialization')
    return
  }

  // TODO: Real RevenueCat initialization
  // await Purchases.configure({
  //   apiKey: 'your_revenuecat_api_key',
  // })
}

/**
 * Purchase the premium annual subscription
 */
export async function purchasePremium(): Promise<PurchaseResult> {
  if (MOCK_MODE) {
    console.log('[Purchases] Mock purchase - simulating...')
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
    console.log('[Purchases] Mock purchase - success!')
    return { success: true }
  }

  // TODO: Real RevenueCat purchase
  // try {
  //   const offerings = await Purchases.getOfferings()
  //   const premiumPackage = offerings.current?.availablePackages.find(
  //     p => p.identifier === 'premium_annual'
  //   )
  //   if (!premiumPackage) {
  //     return { success: false, error: 'Product not found' }
  //   }
  //   await Purchases.purchasePackage(premiumPackage)
  //   return { success: true }
  // } catch (error) {
  //   return { success: false, error: error.message }
  // }

  return { success: false, error: 'Not implemented' }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (MOCK_MODE) {
    console.log('[Purchases] Mock restore - simulating...')
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
    // In mock mode, restore always fails (no previous purchase)
    console.log('[Purchases] Mock restore - no purchases found')
    return { success: false, error: 'No purchases to restore' }
  }

  // TODO: Real RevenueCat restore
  // try {
  //   const customerInfo = await Purchases.restorePurchases()
  //   const hasPremium = customerInfo.entitlements.active['premium']
  //   return { success: !!hasPremium }
  // } catch (error) {
  //   return { success: false, error: error.message }
  // }

  return { success: false, error: 'Not implemented' }
}

/**
 * Check current subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (MOCK_MODE) {
    // In mock mode, always return inactive
    return { isActive: false }
  }

  // TODO: Real RevenueCat status check
  // try {
  //   const customerInfo = await Purchases.getCustomerInfo()
  //   const premiumEntitlement = customerInfo.entitlements.active['premium']
  //   if (premiumEntitlement) {
  //     return {
  //       isActive: true,
  //       expiryDate: new Date(premiumEntitlement.expirationDate).getTime(),
  //       productId: premiumEntitlement.productIdentifier,
  //     }
  //   }
  //   return { isActive: false }
  // } catch (error) {
  //   console.error('Failed to get subscription status:', error)
  //   return { isActive: false }
  // }

  return { isActive: false }
}

/**
 * Get available offerings (for displaying price)
 */
export async function getOfferings(): Promise<{ price: string } | null> {
  if (MOCK_MODE) {
    return { price: '$4.99' }
  }

  // TODO: Real RevenueCat offerings
  // try {
  //   const offerings = await Purchases.getOfferings()
  //   const premiumPackage = offerings.current?.availablePackages.find(
  //     p => p.identifier === 'premium_annual'
  //   )
  //   if (premiumPackage) {
  //     return { price: premiumPackage.product.priceString }
  //   }
  //   return null
  // } catch (error) {
  //   console.error('Failed to get offerings:', error)
  //   return null
  // }

  return null
}

/**
 * DEV ONLY: Simulate a successful purchase
 * Use this for testing the flow without real payments
 */
export async function devSimulatePurchase(): Promise<PurchaseResult> {
  if (!MOCK_MODE) {
    console.warn('[Purchases] devSimulatePurchase only works in mock mode')
    return { success: false, error: 'Only available in mock mode' }
  }

  console.log('[Purchases] DEV: Simulating successful purchase...')
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true }
}
