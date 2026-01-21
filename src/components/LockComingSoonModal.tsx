/**
 * LockComingSoonModal - Explains Focus Lock is awaiting activation
 *
 * Shows when:
 * - User is in browser/dev mode
 * - Screen Time API authorization is not available yet
 *
 * Allows users to complete setup in advance - when Apple approval
 * comes through, the lock will automatically activate.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'

interface LockComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueSetup: () => void
}

export function LockComingSoonModal({
  isOpen,
  onClose,
  onContinueSetup,
}: LockComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{
              background: 'var(--bg-base)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Badge */}
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{
                background: 'color-mix(in oklab, var(--accent) 15%, transparent)',
                color: 'var(--accent)',
              }}
            >
              Coming Soon
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Focus Lock is almost ready
            </h2>

            {/* Description */}
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              This feature requires Apple's Screen Time API approval, which is in progress.
            </p>

            {/* What you can do now */}
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Complete setup now
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Define your identity, anchor routine, and commitment. When approval comes through,
                your Focus Lock will automatically activate with your saved settings.
              </p>
            </div>

            {/* Timeline note */}
            <p className="text-xs mb-6 italic" style={{ color: 'var(--text-muted)' }}>
              We'll notify you when Focus Lock is ready to enforce.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>
                Maybe Later
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  onClose()
                  onContinueSetup()
                }}
              >
                Set Up Now
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
