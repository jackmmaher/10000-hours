/**
 * CommitmentShield - Full-screen soft lock overlay
 *
 * Blocks app access during the commitment window until the user
 * starts a meditation session. Three states:
 *
 * 1. Locked: Shows anchor routine, required minutes, and Start Session CTA
 * 2. Flexibility: Shows fallback minimum, first obstacle, and emergency skip
 * 3. In Progress: Shows "Session in progress" with return CTA
 *
 * No close button -- only exits are session start, emergency skip, or window expiry.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { CommitmentSkipModal } from './CommitmentSkipModal'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useTapFeedback } from '../hooks/useTapFeedback'
import type { TodayCommitmentState } from '../hooks/useTodayCommitment'

type ShieldView = 'locked' | 'flexibility'

interface CommitmentShieldProps {
  commitment: TodayCommitmentState
}

export function CommitmentShield({ commitment }: CommitmentShieldProps) {
  const [shieldView, setShieldView] = useState<ShieldView>('locked')
  const [showSkipModal, setShowSkipModal] = useState(false)
  const setView = useNavigationStore((s) => s.setView)
  const haptic = useTapFeedback()

  const handleStartSession = useCallback(() => {
    haptic.medium()
    setView('timer')
  }, [haptic, setView])

  const handleShowFlexibility = useCallback(() => {
    haptic.light()
    setShieldView('flexibility')
  }, [haptic])

  const handleBackToLocked = useCallback(() => {
    haptic.light()
    setShieldView('locked')
  }, [haptic])

  const handleOpenSkip = useCallback(() => {
    haptic.warning()
    setShowSkipModal(true)
  }, [haptic])

  const handleSkipComplete = useCallback(() => {
    setShowSkipModal(false)
    // Shield will hide automatically because commitment.isCompleted will
    // be updated via grace period logging (outcome = 'grace')
  }, [])

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  const firstObstacle = commitment.obstacles.length > 0 ? commitment.obstacles[0] : null

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center px-8"
        style={{ backgroundColor: 'var(--bg-base)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onTouchStart={handleTouchEvent}
        onTouchMove={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
      >
        <AnimatePresence mode="wait">
          {shieldView === 'locked' ? (
            <motion.div
              key="locked"
              className="w-full max-w-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Day indicator */}
              <p
                className="text-xs mb-6 tracking-widest uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                Day {commitment.currentDay} of {commitment.totalDays}
              </p>

              {/* Anchor routine heading */}
              {commitment.anchorRoutine ? (
                <h1 className="font-serif text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  After {commitment.anchorRoutine}
                </h1>
              ) : (
                <h1 className="font-serif text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  Time to practice
                </h1>
              )}

              {/* Duration requirement */}
              <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
                {commitment.minimumMinutes} minutes to unlock your day
              </p>

              {/* Window info */}
              <p className="text-xs mb-10" style={{ color: 'var(--text-muted)' }}>
                {commitment.windowDescription}
              </p>

              {/* Identity statement if available */}
              {commitment.identityStatement && (
                <p className="text-sm italic mb-8 px-4" style={{ color: 'var(--text-muted)' }}>
                  "{commitment.identityStatement}"
                </p>
              )}

              {/* Primary CTA */}
              <Button variant="primary" size="lg" fullWidth onClick={handleStartSession}>
                Start Session
              </Button>

              {/* Flexibility link */}
              <button
                onClick={handleShowFlexibility}
                className="mt-6 text-sm transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                Need flexibility today?
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="flexibility"
              className="w-full max-w-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Back link */}
              <button
                onClick={handleBackToLocked}
                className="text-xs mb-8 transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                &larr; Back
              </button>

              {/* Fallback heading */}
              <h1 className="font-serif text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Your minimum today
              </h1>

              <p className="text-3xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
                {commitment.minimumFallbackMinutes} minutes
              </p>

              {/* First obstacle + coping response */}
              {firstObstacle && (
                <div
                  className="p-4 rounded-xl mb-8 text-left"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    If: {firstObstacle.obstacle}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Then: {firstObstacle.copingResponse}
                  </p>
                </div>
              )}

              {/* Start fallback session CTA */}
              <Button variant="primary" size="lg" fullWidth onClick={handleStartSession}>
                Start {commitment.minimumFallbackMinutes} min session
              </Button>

              {/* Emergency skip */}
              {commitment.gracePeriodsRemaining > 0 && (
                <button
                  onClick={handleOpenSkip}
                  className="mt-6 text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Use emergency skip ({commitment.gracePeriodsRemaining} left)
                </button>
              )}

              {commitment.gracePeriodsRemaining <= 0 && (
                <p className="mt-6 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  No emergency skips remaining
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Skip modal */}
      <CommitmentSkipModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onSkipComplete={handleSkipComplete}
        gracePeriodsRemaining={commitment.gracePeriodsRemaining}
        commitment={commitment}
      />
    </>
  )
}
