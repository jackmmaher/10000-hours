/**
 * Store - In-app hour pack store
 *
 * Full-page store view showing all available hour packs.
 * Accessible from Settings. Displays current balance, purchase options,
 * and value comparison.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useHourBankStore } from '../stores/useHourBankStore'
import { PRODUCT_IDS, PRODUCT_HOURS } from '../lib/purchases'
import { formatAvailableHours, formatHours } from '../lib/hourBank'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { Button } from './Button'
import { ReviewCarousel } from './ReviewCarousel'

interface StoreProps {
  onBack: () => void
}

// Product display configuration with time-context
const PRODUCT_CONFIG = [
  {
    id: PRODUCT_IDS.STARTER,
    name: 'Starter',
    tagline: '2 weeks of daily sessions',
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
    tagline: '6 months of commitment',
  },
  {
    id: PRODUCT_IDS.SERIOUS,
    name: 'Serious',
    tagline: '1 year of daily practice',
    bestValue: true,
  },
  {
    id: PRODUCT_IDS.LIFETIME,
    name: 'Lifetime',
    tagline: 'Meditate freely, forever',
    highlight: true,
  },
]

export function Store({ onBack }: StoreProps) {
  const {
    products,
    isLoadingProducts,
    isPurchasing,
    isRestoring,
    purchaseError,
    purchase,
    restore,
    loadProducts,
    clearError,
    available,
    totalConsumed,
    totalPurchased,
    isLifetime,
    deficit,
  } = useHourBankStore()

  // First-time user detection
  const isFirstTime = totalPurchased === 0

  const haptic = useTapFeedback()

  // Load products on mount
  useEffect(() => {
    if (products.length === 0) {
      loadProducts()
    }
  }, [products.length, loadProducts])

  // Find product by ID
  const getProduct = (productId: string) => {
    return products.find((p) => p.identifier === productId)
  }

  // Calculate price per hour for display
  const getPricePerHour = (productId: string): string => {
    const product = getProduct(productId)
    const hours = PRODUCT_HOURS[productId]
    if (!product || !hours) return ''
    const pricePerHour = product.price / hours
    return `$${pricePerHour.toFixed(3)}/hr`
  }

  // Handle purchase
  const handlePurchase = async (productId: string) => {
    clearError()
    await purchase(productId)
  }

  // Handle restore
  const handleRestore = async () => {
    clearError()
    await restore()
  }

  return (
    <div className="h-full bg-[var(--bg-base)] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 safe-area-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptic.light()
              onBack()
            }}
            className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="font-serif text-2xl text-[var(--text-primary)]">Hour Packs</h1>
        </div>
        {isFirstTime && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Purchase meditation time to begin
          </p>
        )}
      </div>

      {/* Current balance */}
      <motion.div
        className="mx-6 mb-4 p-4 bg-[var(--bg-deep)] rounded-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Available Hours</p>
            <p className="text-2xl font-medium text-[var(--text-primary)]">
              {isLifetime ? 'Lifetime' : formatAvailableHours(available)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--text-tertiary)]">Practiced</p>
            <p className="text-lg text-[var(--text-secondary)]">{formatHours(totalConsumed)}</p>
          </div>
        </div>
        {isLifetime && (
          <p className="mt-2 text-sm text-[var(--accent)]">
            You have lifetime access - unlimited meditation!
          </p>
        )}
      </motion.div>

      {/* Deficit info */}
      {deficit > 0 && !isLifetime && (
        <motion.div
          className="mx-6 mb-4 p-3 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-sm text-[var(--text-secondary)]">
            From your last session: {formatHours(deficit)}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            This will be deducted from your purchase.
          </p>
        </motion.div>
      )}

      {/* Error message */}
      {purchaseError && (
        <div className="mx-6 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--error-bg)' }}>
          <p className="text-sm" style={{ color: 'var(--error-text)' }}>
            {purchaseError}
          </p>
        </div>
      )}

      {/* Products list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {PRODUCT_CONFIG.map((config, index) => {
              const product = getProduct(config.id)
              const hours = PRODUCT_HOURS[config.id]

              return (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    p-4 rounded-xl
                    ${
                      config.highlight
                        ? 'bg-[var(--accent)]/10 border-2 border-[var(--accent)]'
                        : 'bg-[var(--bg-deep)] border border-[var(--border)]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">{config.name}</h3>
                        {config.popular && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                            Popular
                          </span>
                        )}
                        {config.bestValue && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                            Best Value
                          </span>
                        )}
                        {config.highlight && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                            Best Value
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">{config.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[var(--text-primary)]">
                        {product?.priceString || '...'}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {hours === 10000 ? '10,000 hours' : `${hours} hours`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {hours < 10000 && getPricePerHour(config.id)}
                    </p>
                    <Button
                      variant={config.highlight ? 'primary' : 'secondary'}
                      size="md"
                      onClick={() => handlePurchase(config.id)}
                      loading={isPurchasing}
                      disabled={isPurchasing || isRestoring || isLifetime}
                    >
                      {isLifetime ? 'Owned' : 'Purchase'}
                    </Button>
                  </div>
                </motion.div>
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

        {/* Restore purchases */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              haptic.light()
              handleRestore()
            }}
            disabled={isRestoring || isPurchasing}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          >
            {isRestoring ? 'Restoring...' : 'Restore Previous Purchases'}
          </button>
        </div>
      </div>
    </div>
  )
}
