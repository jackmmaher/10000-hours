/**
 * SharePearl - Share an insight as a pearl
 *
 * Modal for selecting text from an insight and sharing it
 * as a pearl to the community. Premium feature.
 */

import { useState, useCallback } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { createPearl } from '../lib/pearls'
import { AuthModal } from './AuthModal'

interface SharePearlProps {
  insightText: string
  onClose: () => void
  onSuccess: () => void
}

const MAX_PEARL_LENGTH = 280

export function SharePearl({ insightText, onClose, onSuccess }: SharePearlProps) {
  const { user, isAuthenticated } = useAuthStore()
  const { isPremium } = usePremiumStore()
  const [text, setText] = useState('') // Start empty - user extracts the pearl
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const charCount = text.length
  const isOverLimit = charCount > MAX_PEARL_LENGTH
  const isEmpty = text.trim().length === 0

  // Handle text selection from original insight (Kindle-style)
  const handleTextSelect = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selected = selection.toString().trim()
      // Append to existing text (allows building up the pearl)
      setText(prev => {
        const newText = prev ? `${prev} ${selected}` : selected
        return newText.slice(0, MAX_PEARL_LENGTH)
      })
      selection.removeAllRanges() // Clear selection after extracting
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true)
      return
    }

    if (!isPremium) {
      setError('Premium required to share pearls')
      return
    }

    if (isEmpty || isOverLimit) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createPearl(text.trim(), user.id)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share pearl')
    } finally {
      setIsSubmitting(false)
    }
  }, [isAuthenticated, user, isPremium, text, isEmpty, isOverLimit, onSuccess])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-t-2xl p-6 w-full max-w-lg shadow-xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-serif text-xl text-ink">Share as Pearl</p>
          <button
            onClick={onClose}
            className="p-2 text-ink/40 hover:text-ink/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Premium gate */}
        {!isPremium && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-800">
              Sharing pearls is a Premium feature. Upgrade to share your wisdom with the community.
            </p>
          </div>
        )}

        {/* Original insight - tap to highlight and extract */}
        <div className="mb-4">
          <p className="text-xs text-ink/40 mb-2">Highlight to extract:</p>
          <div
            className="p-4 bg-cream-dark/30 rounded-xl select-text cursor-text max-h-32 overflow-y-auto"
            onMouseUp={handleTextSelect}
            onTouchEnd={handleTextSelect}
          >
            <p className="text-ink/70 leading-relaxed text-sm">
              {insightText}
            </p>
          </div>
        </div>

        {/* Pearl text input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-ink/40">Your pearl:</p>
            {text && (
              <button
                onClick={() => setText('')}
                className="text-xs text-ink/30 hover:text-ink/50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Highlight above or type your pearl..."
            className={`
              w-full h-24 p-4 bg-cream-dark/50 rounded-xl resize-none
              text-ink placeholder:text-ink/30
              focus:outline-none focus:ring-2 focus:ring-indigo-deep/20
              ${isOverLimit ? 'ring-2 ring-rose-400' : ''}
            `}
            disabled={!isPremium}
          />

          {/* Character count */}
          <div className="flex justify-end mt-2">
            <span className={`text-xs tabular-nums ${isOverLimit ? 'text-rose-500' : 'text-ink/40'}`}>
              {charCount}/{MAX_PEARL_LENGTH}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 rounded-lg">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-ink/60 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isEmpty || isOverLimit || !isPremium}
            className={`
              flex-1 py-3 rounded-xl font-medium transition-all
              ${isSubmitting || isEmpty || isOverLimit || !isPremium
                ? 'bg-ink/20 text-ink/40'
                : 'bg-ink text-cream active:scale-[0.98]'
              }
            `}
          >
            {isSubmitting ? 'Sharing...' : 'Share Pearl'}
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-ink/30 text-center mt-4">
          Pearls are shared anonymously with the community
        </p>
      </div>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to share"
        subtitle="Create an account to share pearls"
      />
    </div>
  )
}
