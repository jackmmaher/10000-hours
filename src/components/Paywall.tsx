/**
 * Paywall - Purchase modal for hour packs
 *
 * Shows when user's available hours are depleted.
 * Displays hour pack options with pricing and value comparison.
 * Follows the app's minimal, non-pushy aesthetic.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useHourBankStore } from '../stores/useHourBankStore'
import { PRODUCT_IDS, PRODUCT_HOURS } from '../lib/purchases'
import { formatAvailableHours, formatHours } from '../lib/hourBank'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { Button } from './Button'

interface PaywallProps {
  isOpen: boolean
  onClose: () => void
}

// Product display configuration
const PRODUCT_CONFIG = [
  {
    id: PRODUCT_IDS.STARTER,
    name: 'Starter',
    tagline: 'Begin your journey',
  },
  {
    id: PRODUCT_IDS.FLOW,
    name: 'Flow',
    tagline: 'Find your rhythm',
  },
  {
    id: PRODUCT_IDS.DEDICATED,
    name: 'Dedicated',
    tagline: 'Deepen your practice',
    popular: true,
  },
  {
    id: PRODUCT_IDS.COMMITTED,
    name: 'Committed',
    tagline: 'Embrace the path',
  },
  {
    id: PRODUCT_IDS.SERIOUS,
    name: 'Serious',
    tagline: 'Transform your life',
  },
  {
    id: PRODUCT_IDS.LIFETIME,
    name: 'Lifetime',
    tagline: 'The complete journey',
    highlight: true,
  },
]

export function Paywall({ isOpen, onClose }: PaywallProps) {
  const {
    products,
    isLoadingProducts,
    isPurchasing,
    isRestoring,
    purchaseError,
    purchase,
    restore,
    clearError,
    available,
    deficit,
    totalPurchased,
  } = useHourBankStore()

  // Determine user state for context-aware messaging
  const isFirstTime = totalPurchased === 0
  const hasHoursRemaining = available > 0

  // Context-aware title
  const title = isFirstTime
    ? 'Start Your Journey'
    : hasHoursRemaining
      ? 'Top Up Your Hours'
      : 'Continue Your Practice'

  // Context-aware subtitle
  const subtitle = isFirstTime
    ? 'Still Hours uses meditation hours instead of subscriptions. Purchase time to begin your practice.'
    : hasHoursRemaining
      ? `You have ${formatAvailableHours(available)} remaining. Add more to keep practicing.`
      : "You've used your meditation time. Add more to continue your practice."

  const haptic = useTapFeedback()

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  // Find product by ID
  const getProduct = (productId: string) => {
    return products.find((p) => p.identifier === productId)
  }

  // Handle purchase
  const handlePurchase = async (productId: string) => {
    haptic.medium()
    clearError()
    const success = await purchase(productId)
    if (success) {
      onClose()
    }
  }

  // Handle restore
  const handleRestore = async () => {
    clearError()
    await restore()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onTouchStart={handleTouchEvent}
          onTouchMove={handleTouchEvent}
          onTouchEnd={handleTouchEvent}
        >
          <motion.div
            className="bg-[var(--bg-base)] rounded-t-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[var(--text-tertiary)]" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4">
              <h2 className="font-serif text-2xl text-[var(--text-primary)]">{title}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
              {deficit > 0 && (
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  From your last session: {formatHours(deficit)} will be deducted from your
                  purchase.
                </p>
              )}
            </div>

            {/* Scrollable products */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
              {/* Error message */}
              {purchaseError && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--error-bg)' }}>
                  <p className="text-sm" style={{ color: 'var(--error-text)' }}>
                    {purchaseError}
                  </p>
                </div>
              )}

              {/* Loading state */}
              {isLoadingProducts && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Product grid */}
              {!isLoadingProducts && (
                <div className="space-y-3">
                  {PRODUCT_CONFIG.map((config) => {
                    const product = getProduct(config.id)
                    const hours = PRODUCT_HOURS[config.id]

                    return (
                      <button
                        key={config.id}
                        onClick={() => handlePurchase(config.id)}
                        disabled={isPurchasing || isRestoring}
                        className={`
                          w-full p-4 rounded-xl text-left
                          transition-all duration-150
                          ${
                            config.highlight
                              ? 'bg-[var(--accent)]/10 border-2 border-[var(--accent)]'
                              : config.popular
                                ? 'bg-[var(--bg-deep)] border-2 border-[var(--text-primary)]/20'
                                : 'bg-[var(--bg-deep)] border border-[var(--border)]'
                          }
                          hover:scale-[1.02] active:scale-[0.98]
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[var(--text-primary)]">
                                {config.name}
                              </span>
                              {config.popular && (
                                <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-white rounded-full">
                                  Popular
                                </span>
                              )}
                              {config.highlight && (
                                <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-white rounded-full">
                                  Best Value
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                              {config.tagline}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-[var(--text-primary)]">
                              {product?.priceString || '...'}
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)]">
                              {hours === 10000 ? 'Unlimited' : `${hours} hours`}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Value comparison */}
              <div className="mt-6 p-4 bg-[var(--bg-deep)] rounded-xl">
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="font-medium">Why hours?</span> Unlike subscriptions that charge
                  whether you practice or not, you only pay for the time you actually meditate. Our
                  100-hour pack costs less than 2 months of typical meditation app subscriptions.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-8 pt-4 safe-area-bottom border-t border-[var(--border)]">
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleRestore}
                  loading={isRestoring}
                  disabled={isPurchasing}
                >
                  Restore
                </Button>
                <Button variant="secondary" fullWidth onClick={onClose}>
                  Maybe later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
