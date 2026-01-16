/**
 * SuggestionForm - In-app idea solicitation
 *
 * "We Need You" poster-style form for collecting app ideas.
 * Captures ideas, comments, and email to Supabase.
 * Rewards users with bonus hours for quality submissions.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useHourBankStore } from '../stores/useHourBankStore'
import { Button } from './Button'

interface SuggestionFormProps {
  isOpen: boolean
  onClose: () => void
}

// Future: Reward users for submitting suggestions
// const BONUS_HOURS = 3

export function SuggestionForm({ isOpen, onClose }: SuggestionFormProps) {
  const [ideas, setIdeas] = useState(['', '', ''])
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { refreshBalance } = useHourBankStore()

  // Reset form state
  const resetForm = () => {
    setIdeas(['', '', ''])
    setComment('')
    setEmail('')
    setError(null)
    setSubmitted(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleIdeaChange = (index: number, value: string) => {
    const newIdeas = [...ideas]
    newIdeas[index] = value
    setIdeas(newIdeas)
  }

  const handleSubmit = async () => {
    // Validate at least one idea
    const filledIdeas = ideas.filter((i) => i.trim().length > 0)
    if (filledIdeas.length === 0) {
      setError('Please share at least one app idea')
      return
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (isSupabaseConfigured() && supabase) {
        // Submit to Supabase
        const { error: submitError } = await supabase.from('app_suggestions').insert({
          idea_1: ideas[0] || null,
          idea_2: ideas[1] || null,
          idea_3: ideas[2] || null,
          comment: comment || null,
          email: email || null,
          created_at: new Date().toISOString(),
        })

        if (submitError) {
          console.error('Failed to submit suggestion:', submitError)
          setError('Something went wrong. Please try again.')
          setIsSubmitting(false)
          return
        }

        // Grant bonus hours (TODO: implement when hour bank supports dev grants)
        // For now, just show success

        setSubmitted(true)
        await refreshBalance()
      } else {
        // Fallback: log to console in development
        console.log('Suggestion submitted:', { ideas, comment, email })
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Submission error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'var(--bg-overlay)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl rounded-t-3xl overflow-hidden"
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
                style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }}
              />
            </div>

            {submitted ? (
              // Success state
              <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'var(--accent-muted)' }}
                >
                  <span className="text-4xl">🙏</span>
                </motion.div>
                <h2 className="font-serif text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  Thank You
                </h2>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Your ideas help shape what we build next.
                  <br />
                  We truly appreciate your input.
                </p>
                <Button variant="primary" onClick={handleClose}>
                  Done
                </Button>
              </div>
            ) : (
              // Form state
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* Poster header */}
                <div className="px-6 pt-4 pb-6 text-center">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase mb-3"
                    style={{
                      backgroundColor: 'var(--accent-muted)',
                      color: 'var(--accent)',
                    }}
                  >
                    Help Us Build
                  </div>
                  <h1 className="font-serif text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                    We Need You
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Help us pick the next app for <strong>$0.99</strong>
                    <br />
                    What would genuinely improve your life?
                  </p>
                </div>

                {/* Form content */}
                <div className="px-6 pb-4 space-y-4">
                  {/* Idea inputs */}
                  <div>
                    <label
                      className="block text-xs font-medium tracking-wide uppercase mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Your App Ideas
                    </label>
                    {ideas.map((idea, index) => (
                      <input
                        key={index}
                        type="text"
                        value={idea}
                        onChange={(e) => handleIdeaChange(index, e.target.value)}
                        placeholder={
                          index === 0
                            ? 'e.g., A simple habit tracker'
                            : index === 1
                              ? 'e.g., A gratitude journal'
                              : 'e.g., A focus timer'
                        }
                        className="w-full px-4 py-3 rounded-xl mb-2 text-sm transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-deep)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <div>
                    <label
                      className="block text-xs font-medium tracking-wide uppercase mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Additional Thoughts (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us more about what you'd find valuable..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-deep)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block text-xs font-medium tracking-wide uppercase mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="To notify you when your idea ships"
                      className="w-full px-4 py-3 rounded-xl text-sm transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-deep)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <p className="text-sm px-1" style={{ color: 'var(--error-text)' }}>
                      {error}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="px-6 pb-8 pt-4 flex gap-3"
                  style={{ borderTop: '1px solid var(--divider)' }}
                >
                  <Button variant="secondary" fullWidth onClick={handleClose}>
                    Maybe Later
                  </Button>
                  <Button variant="primary" fullWidth onClick={handleSubmit} loading={isSubmitting}>
                    Submit Ideas
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
