/**
 * LockCelebrationModal - Post-meditation lock celebration
 *
 * Displays after completing a meditation session that unlocks apps.
 * Shows:
 * - Streak days (dynamic)
 * - Session duration (dynamic)
 * - Celebration ritual (dynamic, from user setup)
 * - Next unlock window time (dynamic)
 *
 * Two modes:
 * - Normal completion: Shows ritual and positive reinforcement
 * - Fallback completion: Emphasizes "showing up" over duration
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'

interface LockCelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  streakDays: number
  sessionDuration: number // in seconds
  celebrationRitual: string | null
  nextUnlockWindow: Date | null
  isFallback: boolean
}

/**
 * Format duration in seconds to human-readable minutes
 */
function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

/**
 * Format the next unlock window as a readable string
 * e.g., "7:00 AM tomorrow" or "Monday 7:00 AM"
 */
function formatNextWindow(date: Date): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  // Check if it's today
  const targetDay = new Date(date)
  targetDay.setHours(0, 0, 0, 0)
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  if (targetDay.getTime() === todayStart.getTime()) {
    return `${timeStr} today`
  }

  // Check if it's tomorrow
  if (targetDay.getTime() === tomorrow.getTime()) {
    return `${timeStr} tomorrow`
  }

  // Otherwise show day name
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  return `${dayName} ${timeStr}`
}

export function LockCelebrationModal({
  isOpen,
  onClose,
  streakDays,
  sessionDuration,
  celebrationRitual,
  nextUnlockWindow,
  isFallback,
}: LockCelebrationModalProps) {
  const haptic = useTapFeedback()

  const handleContinue = () => {
    haptic.success()
    onClose()
  }

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  const streakText = `${streakDays} day${streakDays === 1 ? '' : 's'} straight`
  const durationText = formatDuration(sessionDuration)
  const nextWindowText = nextUnlockWindow ? formatNextWindow(nextUnlockWindow) : null

  return (
    <AnimatePresence>
      {isOpen && (
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
            {/* Checkmark animation */}
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'color-mix(in oklab, var(--accent) 15%, transparent)' }}
            >
              <motion.svg
                className="w-8 h-8"
                style={{ color: 'var(--accent)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </motion.svg>
            </div>

            {/* Title - different for normal vs fallback */}
            <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
              {isFallback ? 'You showed up anyway' : 'You showed up'}
            </h2>

            {/* Streak */}
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              {streakText}
            </p>

            {/* Duration */}
            <p className="text-2xl font-light mb-4" style={{ color: 'var(--text-primary)' }}>
              {durationText}
            </p>

            {/* Celebration ritual or fallback message */}
            {isFallback ? (
              <p className="text-sm italic mb-4" style={{ color: 'var(--text-muted)' }}>
                That's what builds the habit.
              </p>
            ) : celebrationRitual ? (
              <p className="text-sm italic mb-4" style={{ color: 'var(--text-muted)' }}>
                "{celebrationRitual}"
              </p>
            ) : null}

            {/* Next unlock window */}
            {nextWindowText && (
              <p className="text-xs mb-6" style={{ color: 'var(--text-tertiary)' }}>
                Apps unlocked until {nextWindowText}
              </p>
            )}

            {/* Continue button */}
            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-base)',
              }}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
