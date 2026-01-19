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
import { ReviewCarousel } from './ReviewCarousel'

interface PaywallProps {
  isOpen: boolean
  onClose: () => void
}

// Product display configuration with time-context taglines
const PRODUCT_CONFIG = [
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
    popular: true,
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
    ? 'Flexible meditation, no subscriptions. Pay only for sessions you complete.'
    : hasHoursRemaining
      ? `You have ${formatAvailableHours(available)} remaining. Top up anytime - your hours never expire.`
      : `Great progress! You've completed ${formatHours(totalPurchased)} hours. Choose a pack to continue.`

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
              {/* Urgency messaging for low hours */}
              {available > 0 && available < 1 && (
                <p className="text-xs text-[var(--accent)] mt-1">
                  Less than 1 hour remaining - add more to avoid interruption
                </p>
              )}
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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Name + badges row */}
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[var(--text-primary)]">
                                {config.name}
                              </span>
                              {config.popular && (
                                <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                                  Popular
                                </span>
                              )}
                              {config.highlight && (
                                <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                                  Best Value
                                </span>
                              )}
                            </div>
                            {/* Hours - PROMOTED */}
                            <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                              {hours === 10000 ? 'Unlimited hours' : `${hours} hours`}
                            </p>
                            {/* Tagline - improved visibility */}
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {config.tagline}
                            </p>
                          </div>
                          <div className="text-right">
                            {/* Price only - hours moved to left */}
                            <div className="font-medium text-[var(--text-primary)]">
                              {product?.priceString || '...'}
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
                <h3 className="font-medium text-[var(--text-primary)] mb-2">
                  Why hours instead of subscriptions?
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span style={{ color: 'var(--success-icon)' }} className="mt-0.5">
                      ✓
                    </span>
                    <span>Your data stays private - no tracking, no ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: 'var(--success-icon)' }} className="mt-0.5">
                      ✓
                    </span>
                    <span>Pay only for time you actually meditate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: 'var(--success-icon)' }} className="mt-0.5">
                      ✓
                    </span>
                    <span>No subscriptions - your hours never expire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: 'var(--success-icon)' }} className="mt-0.5">
                      ✓
                    </span>
                    <span>6x cheaper than typical meditation subscriptions</span>
                  </li>
                </ul>
              </div>

              {/* Social proof carousel */}
              <ReviewCarousel />

              {/* Risk reversal */}
              <p className="text-xs text-[var(--text-muted)] text-center mt-4">
                Questions? Hours never expire and work offline.
              </p>
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
