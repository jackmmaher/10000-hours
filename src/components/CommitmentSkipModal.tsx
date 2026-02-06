/**
 * CommitmentSkipModal - Skip confirmation with reflective question
 *
 * Simple confirmation with optional reflection text and a nudge
 * toward doing a short fallback session instead of skipping entirely.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { consumeGracePeriod } from '../lib/commitment/middleware'
import type { TodayCommitmentState } from '../hooks/useTodayCommitment'

interface CommitmentSkipModalProps {
  isOpen: boolean
  onClose: () => void
  onSkipComplete: (reflection?: string) => void
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
  const [reflectionText, setReflectionText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const haptic = useTapFeedback()

  const handleSkip = useCallback(async () => {
    if (isProcessing) return

    setIsProcessing(true)
    haptic.warning()

    try {
      const success = await consumeGracePeriod()

      if (success) {
        await commitment.refresh()
        const reflection = reflectionText.trim() || undefined
        setReflectionText('')
        onSkipComplete(reflection)
      }
    } catch (err) {
      console.error('[CommitmentSkipModal] Failed to use grace period:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, haptic, commitment, reflectionText, onSkipComplete])

  const handleDoFallback = useCallback(() => {
    haptic.medium()
    setReflectionText('')
    onClose()
    // Parent (CommitmentShield) will handle navigating to timer
    // since closing the skip modal returns to the shield's flexibility view
  }, [haptic, onClose])

  const handleClose = useCallback(() => {
    setReflectionText('')
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
            className="rounded-2xl w-full max-w-sm shadow-xl p-6"
            style={{ backgroundColor: 'var(--bg-base)' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heading */}
            <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Skip today's session?
            </h2>

            {/* Grace periods remaining */}
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {gracePeriodsRemaining} grace period{gracePeriodsRemaining !== 1 ? 's' : ''} remaining
            </p>

            {/* Reflection input */}
            <div className="mb-6">
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                What's making today hard?
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Optional -- a few words is fine"
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            </div>

            {/* Primary CTA: do the fallback session instead */}
            <Button variant="primary" size="lg" fullWidth onClick={handleDoFallback}>
              I'll do {commitment.minimumFallbackMinutes} minutes instead
            </Button>

            {/* Secondary CTA: actually skip */}
            <button
              onClick={handleSkip}
              disabled={isProcessing}
              className="w-full mt-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {isProcessing ? 'Skipping...' : 'Skip Today'}
            </button>

            {/* Cancel */}
            <button
              onClick={handleClose}
              className="w-full mt-3 text-sm transition-opacity hover:opacity-80"
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
