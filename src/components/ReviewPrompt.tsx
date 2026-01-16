/**
 * ReviewPrompt - "How do you feel?" modal leading to App Store review
 *
 * Shows at moments of pride (milestone achievements, cycle completion).
 * Frames rating as a feeling check-in, then prompts positive responders
 * to share their experience via App Store review.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { requestNativeReview, isNativePlatform } from '../lib/nativeReview'
import { Button } from './Button'

interface ReviewPromptProps {
  isOpen: boolean
  onClose: () => void
  milestoneText?: string // e.g., "You just reached 10 hours"
}

type FeelingOption = 'peaceful' | 'focused' | 'grateful' | 'other'

const FEELING_OPTIONS: { value: FeelingOption; label: string; emoji: string }[] = [
  { value: 'peaceful', label: 'Peaceful', emoji: '🧘' },
  { value: 'focused', label: 'Focused', emoji: '🎯' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'other', label: 'Something else', emoji: '💭' },
]

const REVIEW_TEMPLATES = [
  'Still Hours helps me build a consistent meditation practice. The simple design and hour tracking keep me motivated.',
  'Finally, a meditation app that respects my time. No subscriptions, no distractions - just pure practice.',
  'Beautiful, minimal design. I love tracking my progress toward 10,000 hours of meditation.',
]

export function ReviewPrompt({ isOpen, onClose, milestoneText }: ReviewPromptProps) {
  const [step, setStep] = useState<'feeling' | 'review'>('feeling')
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingOption | null>(null)

  // Reset state when closed
  const handleClose = () => {
    setStep('feeling')
    setSelectedFeeling(null)
    onClose()
  }

  // Handle feeling selection
  const handleFeelingSelect = async (feeling: FeelingOption) => {
    setSelectedFeeling(feeling)

    // For positive feelings, show review step
    if (feeling !== 'other') {
      setTimeout(() => setStep('review'), 300)
    } else {
      // For "other", just close
      setTimeout(handleClose, 500)
    }
  }

  // Handle review request
  const handleReview = async () => {
    await requestNativeReview()
    handleClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-[var(--bg-base)] rounded-2xl w-full max-w-sm mx-6 shadow-xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {step === 'feeling' && (
                <motion.div
                  key="feeling"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6"
                >
                  {/* Milestone celebration */}
                  {milestoneText && (
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 mx-auto mb-2 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <p className="text-sm font-medium text-[var(--accent)]">{milestoneText}</p>
                    </div>
                  )}

                  {/* Question */}
                  <h2 className="font-serif text-xl text-[var(--text-primary)] text-center mb-6">
                    How do you feel?
                  </h2>

                  {/* Feeling options */}
                  <div className="grid grid-cols-2 gap-3">
                    {FEELING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFeelingSelect(option.value)}
                        className={`
                          p-4 rounded-xl text-center transition-all duration-150
                          ${
                            selectedFeeling === option.value
                              ? 'bg-[var(--accent)] text-white scale-95'
                              : 'bg-[var(--bg-deep)] hover:bg-[var(--bg-deep)] active:scale-95'
                          }
                        `}
                      >
                        <span className="text-2xl block mb-1">{option.emoji}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* Gratitude message */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🙏</span>
                    </div>
                    <h2 className="font-serif text-xl text-[var(--text-primary)] mb-2">
                      That's wonderful
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Would you share your experience with others? A review helps fellow
                      practitioners find their path.
                    </p>
                  </div>

                  {/* Review template preview (on native only) */}
                  {isNativePlatform() && (
                    <div className="mb-6 p-3 bg-[var(--bg-deep)] rounded-lg">
                      <p className="text-xs text-[var(--text-tertiary)] mb-2">Something like:</p>
                      <p className="text-sm text-[var(--text-secondary)] italic">
                        "{REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)]}"
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <Button variant="primary" size="lg" fullWidth onClick={handleReview}>
                      Share My Experience
                    </Button>
                    <Button variant="ghost" fullWidth onClick={handleClose}>
                      Maybe later
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
