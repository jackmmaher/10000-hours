/**
 * CommitmentSkipModal - Emergency skip confirmation
 *
 * Requires the user to type "I choose to skip" to confirm.
 * Uses a grace period and sends an accountability message if enabled.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { consumeGracePeriod } from '../lib/commitment/middleware'
import { sendAccountabilityMessage } from '../lib/accountability'
import { getUserPreferences } from '../lib/db/preferences'
import { getCommitmentSettings } from '../lib/db/commitmentSettings'
import type { TodayCommitmentState } from '../hooks/useTodayCommitment'

const CONFIRMATION_TEXT = 'I choose to skip'

interface CommitmentSkipModalProps {
  isOpen: boolean
  onClose: () => void
  onSkipComplete: () => void
  gracePeriodsRemaining: number
  commitment: TodayCommitmentState
}

export function CommitmentSkipModal({
  isOpen,
  onClose,
  onSkipComplete,
  gracePeriodsRemaining,
  commitment,
}: CommitmentSkipModalProps) {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const haptic = useTapFeedback()

  const isConfirmed = inputText.trim().toLowerCase() === CONFIRMATION_TEXT.toLowerCase()

  const handleConfirm = useCallback(async () => {
    if (!isConfirmed || isProcessing) return

    setIsProcessing(true)
    haptic.warning()

    try {
      const success = await consumeGracePeriod()

      if (success) {
        // Send accountability message if enabled
        const settings = await getCommitmentSettings()
        if (
          settings.accountabilityEnabled &&
          settings.notifyOnSkip &&
          settings.accountabilityPhone
        ) {
          try {
            const userPrefs = await getUserPreferences()
            const userName = userPrefs.displayName || 'User'
            await sendAccountabilityMessage({
              type: 'skip',
              phone: settings.accountabilityPhone,
              method: settings.accountabilityMethod || 'sms',
              userName,
            })
          } catch (err) {
            console.warn('[CommitmentSkipModal] Failed to send accountability message:', err)
          }
        }

        // Refresh commitment state and close
        await commitment.refresh()
        setInputText('')
        onSkipComplete()
      }
    } catch (err) {
      console.error('[CommitmentSkipModal] Failed to use grace period:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [isConfirmed, isProcessing, haptic, commitment, onSkipComplete])

  const handleClose = useCallback(() => {
    setInputText('')
    onClose()
  }, [onClose])

  // Block touch propagation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'color-mix(in oklab, var(--bg-deep) 80%, transparent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
            {/* Heading */}
            <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Use Emergency Skip
            </h2>

            {/* Remaining count */}
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {gracePeriodsRemaining} skip{gracePeriodsRemaining !== 1 ? 's' : ''} remaining
            </p>

            {/* Warning text */}
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              This will use one of your emergency skips for today. Your streak will be preserved but
              no bonus will be earned.
            </p>

            {/* Confirmation input */}
            <div className="mb-6">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type "${CONFIRMATION_TEXT}" to confirm`}
                className="w-full px-4 py-3 rounded-xl text-sm text-center outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: `1px solid ${isConfirmed ? 'var(--accent)' : 'var(--border-subtle)'}`,
                }}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
              />
            </div>

            {/* Confirm button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isConfirmed}
              loading={isProcessing}
              onClick={handleConfirm}
            >
              Confirm Skip
            </Button>

            {/* Cancel */}
            <button
              onClick={handleClose}
              className="mt-4 text-sm transition-opacity hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
