/**
 * TrialCompleteModal - Post-trial CTA modal
 *
 * Shows after completing a free trial session.
 * Encourages user to start tracking their practice.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { Paywall } from './Paywall'

interface TrialCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  durationMinutes?: number
}

export function TrialCompleteModal({ isOpen, onClose, durationMinutes }: TrialCompleteModalProps) {
  const [showPaywall, setShowPaywall] = useState(false)
  const haptic = useTapFeedback()

  const handleStartTracking = () => {
    haptic.medium()
    setShowPaywall(true)
  }

  const handlePaywallClose = () => {
    setShowPaywall(false)
    onClose()
  }

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && !showPaywall && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ backgroundColor: 'color-mix(in oklab, var(--bg-deep) 60%, transparent)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchStart={handleTouchEvent}
            onTouchMove={handleTouchEvent}
            onTouchEnd={handleTouchEvent}
          >
            <motion.div
              className="rounded-2xl w-full max-w-sm shadow-xl p-6 text-center"
              style={{ backgroundColor: 'var(--bg-base)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative element */}
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'color-mix(in oklab, var(--accent) 15%, transparent)' }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: 'var(--accent)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Content */}
              <h2 className="font-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
                {durationMinutes
                  ? `You stayed present for ${durationMinutes} minutes.`
                  : 'You stayed present.'}
              </h2>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                Most people never make it this far. Start building your meditation streak
                today—every session brings you closer to lasting calm.
              </p>

              {/* CTA */}
              <button
                onClick={handleStartTracking}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-base)',
                }}
              >
                Begin Your Journey
              </button>

              {/* Secondary action */}
              <button
                onClick={onClose}
                className="mt-4 text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Not yet
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paywall modal */}
      <Paywall isOpen={showPaywall} onClose={handlePaywallClose} />
    </>
  )
}
