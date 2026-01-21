/**
 * Paywall - Purchase modal for hour packs
 *
 * Shows when user's available hours are depleted.
 * Displays 3 recommended options based on user state with expandable full list.
 * Follows the app's minimal, non-pushy aesthetic.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHourBankStore } from '../stores/useHourBankStore'
import { PRODUCT_HOURS } from '../lib/purchases'
import { formatAvailableHours, formatHours } from '../lib/hourBank'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { Button } from './Button'
import { ReviewCarousel } from './ReviewCarousel'
import {
  getSmartSelection,
  PRODUCT_CONFIG,
  type SelectionContext,
} from '../lib/smartProductSelection'
import { getUserPreferences, getProfile } from '../lib/db'

interface PaywallProps {
  isOpen: boolean
  onClose: () => void
  onTryFree?: () => void // Optional: show "try free session" link for first-time users
}

export function Paywall({ isOpen, onClose, onTryFree }: PaywallProps) {
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
    totalConsumed,
    totalPurchased,
    purchaseCount,
  } = useHourBankStore()

  const [showAllOptions, setShowAllOptions] = useState(false)
  const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(null)

  // Determine user state for context-aware messaging
  const isFirstTime = totalConsumed === 0
  const isPowerUser = totalConsumed >= 100
  const hasHoursRemaining = available > 0

  // Load selection context when paywall opens
  useEffect(() => {
    if (!isOpen) return

    async function loadContext() {
      const [prefs, profile] = await Promise.all([getUserPreferences(), getProfile()])
      setSelectionContext({
        totalConsumed,
        totalPurchased,
        available,
        purchaseCount,
        practiceGoalHours: prefs.practiceGoalHours,
        firstSessionDate: profile.firstSessionDate,
      })
    }
    loadContext()
  }, [isOpen, totalConsumed, totalPurchased, available, purchaseCount])

  // Get recommended products based on full user context
  const selection = selectionContext ? getSmartSelection(selectionContext) : null

  // Context-aware title
  const title = isPowerUser
    ? 'Deepen Your Practice'
    : isFirstTime
      ? 'Start Your Journey'
      : hasHoursRemaining
        ? 'Top Up Your Hours'
        : 'Continue Your Practice'

  // Context-aware subtitle
  const subtitle = isFirstTime
    ? 'Flexible meditation, no subscriptions. Pay only for sessions you complete.'
    : isPowerUser
      ? `You've meditated ${formatHours(totalConsumed)} hours. Choose a pack to continue your journey.`
      : hasHoursRemaining
        ? `You have ${formatAvailableHours(available)} remaining. Top up anytime - your hours never expire.`
        : `Great progress! You've completed ${formatHours(totalConsumed)} hours. Choose a pack to continue.`

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
              {(isLoadingProducts || !selection) && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Product grid - 3 recommended options */}
              {!isLoadingProducts && selection && (
                <>
                  {/* Near milestone message */}
                  {selection.message && (
                    <p className="text-sm text-[var(--accent)] text-center mb-3">
                      {selection.message}
                    </p>
                  )}

                  {/* Primary 3 options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[selection.smaller, selection.recommended, selection.larger].map(
                      (productId, index) => {
                        const config = PRODUCT_CONFIG.find((c) => c.id === productId)
                        if (!config) return null
                        const product = getProduct(config.id)
                        const hours = PRODUCT_HOURS[config.id]
                        const isRecommended = productId === selection.recommended
                        const isLifetimeCard = config.isLifetime

                        return (
                          <button
                            key={config.id}
                            onClick={() => handlePurchase(config.id)}
                            disabled={isPurchasing || isRestoring}
                            className={`
                              p-4 rounded-xl text-left
                              transition-all duration-150
                              ${
                                isRecommended
                                  ? 'bg-[var(--accent)]/10 border-2 border-[var(--accent)] sm:scale-[1.02]'
                                  : isLifetimeCard
                                    ? 'bg-gradient-to-br from-[var(--accent)]/5 to-[var(--bg-elevated)] border border-[var(--accent)]/30'
                                    : 'bg-[var(--bg-deep)] border border-[var(--border)]'
                              }
                              hover:brightness-110 active:scale-[0.98]
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${index === 1 ? 'sm:order-2' : index === 0 ? 'sm:order-1' : 'sm:order-3'}
                            `}
                          >
                            <div className="flex flex-col">
                              {/* Name + badge row */}
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[var(--text-primary)]">
                                  {config.name}
                                </span>
                                {isRecommended && (
                                  <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                                    Popular
                                  </span>
                                )}
                                {isLifetimeCard && !isRecommended && (
                                  <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                                    Best Value
                                  </span>
                                )}
                              </div>
                              {/* Hours */}
                              <p className="text-sm font-medium text-[var(--text-secondary)]">
                                {hours === 10000 ? 'Unlimited hours' : `${hours} hours`}
                              </p>
                              {/* Price */}
                              <div className="font-medium text-[var(--text-primary)] mt-2">
                                {product?.priceString || '...'}
                              </div>
                            </div>
                          </button>
                        )
                      }
                    )}
                  </div>

                  {/* See all options toggle */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAllOptions(!showAllOptions)}
                      className="text-sm text-[var(--accent)] hover:underline transition-colors"
                    >
                      {showAllOptions ? 'Show less' : 'See all options'}
                    </button>
                  </div>

                  {/* Expanded options */}
                  <AnimatePresence>
                    {showAllOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 mt-4 pt-4 border-t border-[var(--border)]">
                          <p className="text-xs text-[var(--text-muted)] mb-2">All hour packs</p>
                          {PRODUCT_CONFIG.map((config) => {
                            const product = getProduct(config.id)
                            const hours = PRODUCT_HOURS[config.id]
                            const isRecommended = config.id === selection.recommended

                            return (
                              <button
                                key={config.id}
                                onClick={() => handlePurchase(config.id)}
                                disabled={isPurchasing || isRestoring}
                                className={`
                                  w-full p-3 rounded-lg text-left
                                  transition-all duration-150
                                  hover:brightness-110 active:scale-[0.98]
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  ${
                                    isRecommended
                                      ? 'bg-[var(--accent)]/10 border-2 border-[var(--accent)]'
                                      : 'bg-[var(--bg-deep)] border border-[var(--border)]'
                                  }
                                `}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-sm text-[var(--text-primary)]">
                                      {config.name}
                                    </span>
                                    {isRecommended && (
                                      <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-[#1C1917] rounded-full">
                                        Popular
                                      </span>
                                    )}
                                    <span className="text-sm text-[var(--text-secondary)]">
                                      {hours === 10000 ? 'Unlimited' : `${hours} hrs`}
                                    </span>
                                  </div>
                                  <div className="font-medium text-sm text-[var(--text-primary)]">
                                    {product?.priceString || '...'}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
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
              {/* Try free session link - only for first-time users */}
              {isFirstTime && onTryFree && (
                <div className="mb-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Or try a free session first
                  </p>
                  <button
                    onClick={onTryFree}
                    className="text-sm text-[var(--accent)] hover:underline transition-colors"
                  >
                    Start a free trial session
                  </button>
                </div>
              )}
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
