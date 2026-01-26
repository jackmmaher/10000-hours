/**
 * CommitmentOutcomeModal - Casino-style outcome reveal
 *
 * Shows after a commitment session with suspenseful reveal:
 * - Spinning/building anticipation phase
 * - Dramatic reveal of bonus, mystery, near-miss, or standard completion
 * - Confetti for bonus outcomes
 * - "So close!" messaging for near-miss
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'
import type { CommitmentSessionResult } from '../lib/commitment/middleware'
import { formatOutcomeForDisplay } from '../lib/commitment/outcomes'

interface CommitmentOutcomeModalProps {
  isOpen: boolean
  onClose: () => void
  result: CommitmentSessionResult | null
}

// Confetti particle component
function ConfettiParticle({ color }: { color: string }) {
  const randomX = Math.random() * 100
  const randomDelay = Math.random() * 0.5
  const randomDuration = 2 + Math.random() * 1
  const randomRotation = Math.random() * 720 - 360

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{
        left: `${randomX}%`,
        top: -10,
        backgroundColor: color,
      }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: [0, 400],
        opacity: [1, 1, 0],
        rotate: randomRotation,
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeOut',
      }}
    />
  )
}

// Confetti burst component
function ConfettiBurst({ color }: { color: 'gold' | 'purple' }) {
  const colors =
    color === 'gold'
      ? ['#FFD700', '#FFA500', '#FF8C00', '#FFDF00', '#F5DEB3']
      : ['#9B59B6', '#8E44AD', '#E91E63', '#BA68C8', '#D4A5FF']

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiParticle key={i} color={colors[i % colors.length]} />
      ))}
    </div>
  )
}

// Slot machine-style reveal animation
function SlotReveal({
  phase,
  outcomeColor,
}: {
  phase: 'spinning' | 'slowing' | 'revealed'
  outcomeColor: 'gold' | 'purple' | 'gray' | 'green'
}) {
  const symbols = ['?', '!', '+', '*']

  const colorMap = {
    gold: 'var(--warning, #eab308)',
    purple: '#9B59B6',
    gray: 'var(--text-muted)',
    green: 'var(--success, #22c55e)',
  }

  if (phase === 'revealed') {
    const icon =
      outcomeColor === 'gold' || outcomeColor === 'purple'
        ? '+'
        : outcomeColor === 'gray'
          ? '~'
          : '✓'

    return (
      <motion.div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold"
        style={{
          background: `color-mix(in oklab, ${colorMap[outcomeColor]} 15%, transparent)`,
          color: colorMap[outcomeColor],
        }}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 400 }}
      >
        {icon}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold overflow-hidden"
      style={{
        background: 'var(--bg-elevated)',
        color: 'var(--text-muted)',
      }}
    >
      <motion.div
        animate={{
          y: phase === 'spinning' ? [0, -160] : [0, -40],
        }}
        transition={{
          duration: phase === 'spinning' ? 0.3 : 0.6,
          repeat: phase === 'spinning' ? Infinity : 0,
          ease: phase === 'spinning' ? 'linear' : 'easeOut',
        }}
      >
        {symbols.map((s, i) => (
          <div key={i} className="h-20 flex items-center justify-center">
            {s}
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export function CommitmentOutcomeModal({ isOpen, onClose, result }: CommitmentOutcomeModalProps) {
  const haptic = useTapFeedback()
  const [phase, setPhase] = useState<'spinning' | 'slowing' | 'revealed'>('spinning')

  // Reset phase when modal opens
  useEffect(() => {
    if (isOpen && result?.sessionCounted && result.outcome) {
      setPhase('spinning')

      // Suspense timing: spin for 1s, slow for 0.5s, then reveal
      const spinTimer = setTimeout(() => setPhase('slowing'), 1000)
      const revealTimer = setTimeout(() => {
        setPhase('revealed')

        // Haptic feedback based on outcome
        if (result.outcome?.type === 'bonus' || result.outcome?.type === 'mystery') {
          haptic.success()
        } else if (result.outcome?.type === 'near-miss') {
          haptic.medium()
        } else {
          haptic.light()
        }
      }, 1500)

      return () => {
        clearTimeout(spinTimer)
        clearTimeout(revealTimer)
      }
    }
  }, [isOpen, result, haptic])

  const handleContinue = useCallback(() => {
    haptic.light()
    onClose()
  }, [haptic, onClose])

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  // Don't render if no result or session didn't count
  if (!result || !result.sessionCounted || !result.outcome) {
    return null
  }

  const displayInfo = formatOutcomeForDisplay(result.outcome)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'color-mix(in oklab, var(--bg-deep) 80%, transparent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={handleTouchEvent}
          onTouchMove={handleTouchEvent}
          onTouchEnd={handleTouchEvent}
        >
          {/* Confetti for bonus outcomes */}
          {phase === 'revealed' && displayInfo.showConfetti && (
            <ConfettiBurst color={displayInfo.color as 'gold' | 'purple'} />
          )}

          <motion.div
            className="rounded-2xl w-full max-w-sm shadow-xl p-6 text-center relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-base)' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Slot machine reveal */}
            <div className="flex justify-center mb-6">
              <SlotReveal phase={phase} outcomeColor={displayInfo.color} />
            </div>

            {/* Title - shows after reveal */}
            <AnimatePresence mode="wait">
              {phase === 'revealed' ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="font-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                    {displayInfo.title}
                  </h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {displayInfo.subtitle}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--text-muted)' }}>
                    Rolling...
                  </h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                    Session complete!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minutes change display for bonus */}
            {phase === 'revealed' && result.outcome.minutesChange > 0 && (
              <motion.div
                className="p-3 rounded-xl mb-6"
                style={{
                  background:
                    displayInfo.color === 'purple'
                      ? 'color-mix(in oklab, #9B59B6 10%, transparent)'
                      : 'color-mix(in oklab, var(--warning, #eab308) 10%, transparent)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: displayInfo.color === 'purple' ? '#9B59B6' : 'var(--warning, #eab308)',
                  }}
                >
                  +{result.outcome.minutesChange} min
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  added to your hour bank
                </p>
              </motion.div>
            )}

            {/* Near-miss encouragement */}
            {phase === 'revealed' && result.outcome.type === 'near-miss' && (
              <motion.div
                className="p-3 rounded-xl mb-6"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px dashed var(--border-subtle)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  You were so close to a bonus!
                  <br />
                  <span style={{ color: 'var(--text-muted)' }}>Keep showing up.</span>
                </p>
              </motion.div>
            )}

            {/* Continue button - only clickable after reveal */}
            <button
              onClick={handleContinue}
              disabled={phase !== 'revealed'}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-base)',
              }}
            >
              {phase === 'revealed' ? 'Continue' : 'Wait...'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
