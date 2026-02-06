/**
 * CommitmentOutcomeModal - Session completion acknowledgment
 *
 * Warm, simple card shown after a commitment session:
 * - Day X of Y (prominent, centered)
 * - Optional 5-dot presence rating
 * - Consistency score + streak
 * - Contextual message (milestone or simple affirmation)
 * - For milestones: expanded card with glow animation + gentle haptic
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'
import type { CommitmentSessionResult } from '../lib/commitment/middleware'

interface CommitmentOutcomeModalProps {
  isOpen: boolean
  onClose: () => void
  result: CommitmentSessionResult | null
  celebrationRitual?: string | null
  onPresenceRating?: (rating: number) => void
}

const WARM_MESSAGES = [
  'You showed up.',
  'Your seat was waiting. You showed up.',
  'Another day of practice.',
  'Present.',
]

function getWarmMessage(dayNumber: number): string {
  return WARM_MESSAGES[dayNumber % WARM_MESSAGES.length]
}

function PresenceRating({ onRate }: { onRate: (rating: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const haptic = useTapFeedback()

  const handleSelect = (rating: number) => {
    haptic.light()
    setSelected(rating)
    onRate(rating)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        How present were you?
      </p>
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => handleSelect(n)}
            className="w-8 h-8 rounded-full transition-all active:scale-90"
            style={{
              background:
                selected !== null && n <= selected ? 'var(--accent)' : 'var(--bg-elevated)',
              border:
                selected !== null && n <= selected
                  ? '1.5px solid var(--accent)'
                  : '1.5px solid var(--border-subtle)',
              opacity: selected !== null && n > selected ? 0.4 : 1,
            }}
            aria-label={`${n} of 5`}
          />
        ))}
      </div>
    </div>
  )
}

export function CommitmentOutcomeModal({
  isOpen,
  onClose,
  result,
  celebrationRitual,
  onPresenceRating,
}: CommitmentOutcomeModalProps) {
  const haptic = useTapFeedback()

  // Haptic on open
  useEffect(() => {
    if (isOpen && result?.sessionCounted && result.completionResult) {
      if (result.completionResult.milestone) {
        haptic.light()
      } else {
        haptic.light()
      }
    }
  }, [isOpen, result, haptic])

  const handlePresenceRating = useCallback(
    (rating: number) => {
      onPresenceRating?.(rating)
    },
    [onPresenceRating]
  )

  const handleDone = useCallback(() => {
    haptic.light()
    onClose()
  }, [haptic, onClose])

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  // Don't render if no result or session didn't count
  if (!result || !result.sessionCounted || !result.completionResult) {
    return null
  }

  const { dayNumber, totalDays, consistencyScore, streakDays, milestone } = result.completionResult
  const consistencyPercent = Math.round(consistencyScore * 100)
  const isMilestone = milestone !== null

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
          <motion.div
            className="rounded-2xl w-full max-w-sm shadow-xl p-6 text-center relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-base)',
              ...(isMilestone
                ? {
                    boxShadow: '0 0 40px color-mix(in oklab, var(--accent) 20%, transparent)',
                  }
                : {}),
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              ...(isMilestone
                ? {
                    boxShadow: [
                      '0 0 20px color-mix(in oklab, var(--accent) 10%, transparent)',
                      '0 0 40px color-mix(in oklab, var(--accent) 25%, transparent)',
                      '0 0 20px color-mix(in oklab, var(--accent) 10%, transparent)',
                    ],
                  }
                : {}),
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              ...(isMilestone
                ? { boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
                : {}),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Day counter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2
                className="font-serif text-3xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Day {dayNumber} of {totalDays}
              </h2>
            </motion.div>

            {/* Milestone message */}
            {isMilestone && (
              <motion.div
                className="mt-4 mb-2 p-4 rounded-xl"
                style={{
                  background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--accent) 15%, transparent)',
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p
                  className="font-serif text-base leading-relaxed"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {milestone.message}
                </p>
              </motion.div>
            )}

            {/* Warm message (non-milestone) */}
            {!isMilestone && (
              <motion.p
                className="text-sm mt-2 mb-4"
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {getWarmMessage(dayNumber)}
              </motion.p>
            )}

            {/* Presence rating */}
            <motion.div
              className="my-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <PresenceRating onRate={handlePresenceRating} />
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="flex justify-center gap-6 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-center">
                <p
                  className="text-xl font-bold tabular-nums"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {consistencyPercent}%
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  consistent
                </p>
              </div>
              {streakDays > 0 && (
                <div className="text-center">
                  <p
                    className="text-xl font-bold tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {streakDays}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    day streak
                  </p>
                </div>
              )}
            </motion.div>

            {/* Celebration ritual */}
            {celebrationRitual && (
              <motion.div
                className="p-3 rounded-xl mb-5"
                style={{
                  background: 'color-mix(in oklab, var(--accent) 6%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--accent) 12%, transparent)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Your celebration ritual:
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  {celebrationRitual}
                </p>
              </motion.div>
            )}

            {/* Done button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleDone}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-base)',
                }}
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
