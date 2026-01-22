/**
 * DurationPicker - Shared duration selection modal
 *
 * Two modes:
 * - trial: 5, 10, 15 minutes for free trial sessions
 * - full: Extended options (5-60 min) for paying users
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'

interface DurationPickerProps {
  isOpen: boolean
  mode: 'trial' | 'full'
  onSelect: (minutes: number) => void
  onClose: () => void
}

const TRIAL_DURATIONS = [5, 10, 15]
const FULL_DURATIONS = [5, 10, 15, 20, 25, 30, 45, 60]

export function DurationPicker({ isOpen, mode, onSelect, onClose }: DurationPickerProps) {
  const haptic = useTapFeedback()
  const durations = mode === 'trial' ? TRIAL_DURATIONS : FULL_DURATIONS

  const handleSelect = (minutes: number) => {
    haptic.medium()
    onSelect(minutes)
  }

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'color-mix(in oklab, var(--bg-deep) 40%, transparent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onTouchStart={handleTouchEvent}
          onTouchMove={handleTouchEvent}
          onTouchEnd={handleTouchEvent}
        >
          <motion.div
            className="rounded-t-3xl w-full max-w-lg shadow-xl"
            style={{ backgroundColor: 'var(--bg-base)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: 'var(--text-tertiary)' }}
              />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 text-center">
              <h2 className="font-serif text-xl" style={{ color: 'var(--text-primary)' }}>
                {mode === 'trial' ? 'Choose Your Session' : 'Select Duration'}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {mode === 'trial'
                  ? 'Experience the full meditation timer'
                  : 'How long would you like to meditate?'}
              </p>
            </div>

            {/* Duration options */}
            <div className="px-6 pb-6">
              <div className="flex flex-wrap justify-center gap-3">
                {durations.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSelect(mins)}
                    className="px-6 py-4 rounded-xl text-lg font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--bg-deep)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Footer - pb-4 since safe-area adds its own padding */}
            <div
              className="px-6 pb-4 pt-4 safe-area-bottom"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-deep)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
