/**
 * LowHoursWarning - Warning modal for critically low hours
 *
 * Shows when user taps to start a session with < 30 minutes remaining.
 * Offers option to top up now or continue with current balance.
 * Conversion moment to prevent deficit accumulation.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { formatHours } from '../lib/hourBank'
import { Button } from './Button'

interface LowHoursWarningProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  onTopUp: () => void
  availableHours: number
}

export function LowHoursWarning({
  isOpen,
  onClose,
  onContinue,
  onTopUp,
  availableHours,
}: LowHoursWarningProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[var(--bg-base)] rounded-2xl w-full max-w-sm p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2 className="font-serif text-xl text-[var(--text-primary)] text-center">
              Running Low
            </h2>

            {/* Message */}
            <p className="mt-3 text-sm text-[var(--text-secondary)] text-center">
              You have {formatHours(availableHours)} remaining.
            </p>
            <p className="mt-2 text-sm text-[var(--text-tertiary)] text-center">
              Top up now to keep your practice uninterrupted.
            </p>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" fullWidth onClick={onContinue}>
                Continue
              </Button>
              <Button variant="primary" fullWidth onClick={onTopUp}>
                Top Up
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
