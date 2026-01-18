/**
 * ReviewPrompt - Star rating and review capture modal
 *
 * Shows at moments of peak satisfaction (goal completion, milestones).
 * Two-step flow: star rating → text review with presets.
 * Theme-aware design matching app aesthetic.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { requestNativeReview } from '../lib/nativeReview'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAuthStore } from '../stores/useAuthStore'
import { saveReview } from '../lib/reviews'

interface ReviewPromptProps {
  isOpen: boolean
  onClose: () => void
  milestoneText?: string // e.g., "You've just completed your practice goal"
}

const PRESET_REVIEWS = [
  {
    label: 'Finally found my practice',
    text: 'Still Hours has helped me build a consistent meditation practice. The simple design keeps me focused on what matters - just showing up.',
  },
  {
    label: 'This is what I needed',
    text: "Still Hours is exactly what I've been looking for. No distractions, no subscriptions - just a beautiful space to track my journey to 10,000 hours.",
  },
  {
    label: 'Life-changing habit',
    text: 'Still Hours has transformed my daily routine. Watching my hours grow motivates me to keep practicing. This app gets meditation right.',
  },
]

// Star icon components
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex justify-center gap-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          onClick={() => onChange(star)}
          whileTap={{ scale: 0.85 }}
          className="transition-colors duration-150"
          style={{
            color: star <= value ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          <StarIcon filled={star <= value} />
        </motion.button>
      ))}
    </div>
  )
}

/**
 * Extract display name from Supabase user for review attribution
 * Returns "First L." format (e.g., "Sarah M.")
 */
function getDisplayName(
  user: { user_metadata?: Record<string, unknown>; email?: string } | null
): string {
  if (!user) return 'Anonymous'

  // Try to get name from OAuth metadata
  const metadata = user.user_metadata || {}
  const fullName = (metadata.full_name || metadata.name || '') as string

  if (fullName) {
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) {
      // "First L." format
      return `${parts[0]} ${parts[parts.length - 1][0]}.`
    }
    return parts[0]
  }

  // Fallback to email prefix
  if (user.email) {
    const prefix = user.email.split('@')[0]
    // Capitalize first letter
    return prefix.charAt(0).toUpperCase() + prefix.slice(1, 8)
  }

  return 'Anonymous'
}

export function ReviewPrompt({ isOpen, onClose, milestoneText }: ReviewPromptProps) {
  const [step, setStep] = useState<'rating' | 'review'>('rating')
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const haptic = useTapFeedback()
  const { user } = useAuthStore()

  // Reset state when closed
  const handleClose = () => {
    haptic.light()
    setStep('rating')
    setRating(5)
    setReviewText('')
    onClose()
  }

  // Handle continue from rating step
  const handleContinue = () => {
    haptic.medium()
    setStep('review')
  }

  // Handle preset selection - fills the text input
  const handlePresetSelect = (text: string) => {
    haptic.light()
    setReviewText(text)
  }

  // Handle review submission
  const handleSubmit = async () => {
    haptic.success()

    // Save review to Supabase (fire-and-forget, don't block UX)
    if (user && reviewText.trim().length >= 10) {
      const authorName = getDisplayName(user)
      saveReview(user.id, rating, reviewText.trim(), authorName).catch((err) =>
        console.warn('Failed to save review (non-critical):', err)
      )
    }

    // Trigger native App Store review
    await requestNativeReview()
    handleClose()
  }

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          onTouchStart={handleTouchEvent}
          onTouchMove={handleTouchEvent}
          onTouchEnd={handleTouchEvent}
        >
          <motion.div
            className="w-full max-w-lg max-h-[calc(90vh-env(safe-area-inset-top,0px))] flex flex-col shadow-xl rounded-t-3xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)' }}
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-ink/20" />
            </div>

            <AnimatePresence mode="wait">
              {step === 'rating' && (
                <motion.div
                  key="rating"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6 pb-safe"
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h2
                      className="font-serif text-xl mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      How do you feel right now?
                    </h2>
                    {milestoneText && (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {milestoneText}
                      </p>
                    )}
                  </div>

                  {/* Star rating */}
                  <div className="mb-8">
                    <StarRating value={rating} onChange={setRating} />
                  </div>

                  {/* Continue button */}
                  <button
                    onClick={handleContinue}
                    className="w-full py-3 px-6 rounded-xl font-medium bg-ink text-cream hover:bg-ink/90 active:scale-[0.98] transition-all duration-150"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 pb-safe"
                >
                  {/* Text input */}
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Still Hours has helped me..."
                    className="w-full min-h-[100px] p-4 rounded-xl resize-none transition-colors duration-150 focus:outline-none"
                    style={{
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)'
                    }}
                  />

                  {/* Preset buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 mb-6">
                    {PRESET_REVIEWS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => handlePresetSelect(preset.text)}
                        className="px-4 py-2 text-sm rounded-full transition-all duration-150 active:scale-[0.97]"
                        style={{
                          background: 'var(--bg-deep)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)'
                          e.currentTarget.style.color = 'var(--accent)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = 'var(--text-muted)'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleSubmit}
                      className="w-full py-3 px-6 rounded-xl font-medium bg-ink text-cream hover:bg-ink/90 active:scale-[0.98] transition-all duration-150"
                    >
                      Share this feeling
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full py-3 px-6 rounded-xl font-medium transition-colors duration-150"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                    >
                      Not right now
                    </button>
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
