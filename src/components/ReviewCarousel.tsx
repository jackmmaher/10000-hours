/**
 * ReviewCarousel - Auto-scrolling testimonial carousel
 *
 * Displays social proof through user reviews on paywall screens.
 * Fetches approved reviews from Supabase, falls back to hardcoded data.
 * Features a continuous horizontal scroll animation with review cards.
 *
 * Design: Uses semantic spacing and typography from the design system.
 * Accessibility: Respects prefers-reduced-motion.
 */

import { useState, useEffect, useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { fetchApprovedReviews, type Review } from '../lib/reviews'
import { reviews as fallbackReviews } from '../data/reviews'

// Star display component
function Stars({ rating, instanceId }: { rating: number; instanceId: string }) {
  const fullStars = Math.floor(rating)
  const hasPartial = rating % 1 !== 0
  // Unique gradient ID to avoid SVG ID collisions
  const gradientId = `star-partial-${instanceId}-${rating}`

  return (
    <div className="flex" style={{ gap: 'var(--space-1)' }}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg key={i} className="w-3 h-3" fill="var(--accent)" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {/* Partial star (for 4.5 and 4.75 ratings) */}
      {hasPartial && (
        <svg className="w-3 h-3" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={gradientId}>
              <stop offset={`${(rating % 1) * 100}%`} stopColor="var(--accent)" />
              <stop offset={`${(rating % 1) * 100}%`} stopColor="var(--text-tertiary)" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#${gradientId})`}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
    </div>
  )
}

// Single review card
interface ReviewCardProps {
  rating: number
  text: string
  author: string
  id: string | number
  instanceId: string
}

function ReviewCard({ rating, text, author, id, instanceId }: ReviewCardProps) {
  return (
    <div
      className="flex-shrink-0 w-64 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
      style={{
        padding: 'var(--space-3)',
        boxShadow: 'var(--shadow-elevation-1)',
      }}
    >
      <Stars rating={rating} instanceId={`${instanceId}-${id}`} />
      <p
        className="line-clamp-3"
        style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-caption-size)',
          lineHeight: 'var(--text-caption-line)',
          letterSpacing: 'var(--text-caption-tracking)',
          color: 'var(--text-secondary)',
        }}
      >
        "{text}"
      </p>
      <p
        style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-caption-size)',
          lineHeight: 'var(--text-caption-line)',
          letterSpacing: 'var(--text-caption-tracking)',
          color: 'var(--text-tertiary)',
        }}
      >
        — {author}
      </p>
    </div>
  )
}

export function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const shouldReduceMotion = useReducedMotion()
  const instanceId = useId()

  // Fetch reviews on mount
  useEffect(() => {
    let mounted = true

    async function loadReviews() {
      try {
        const data = await fetchApprovedReviews(25)
        if (mounted) {
          setReviews(data)
        }
      } catch (err) {
        console.warn('Failed to load reviews, using fallback:', err)
        if (mounted) {
          // Convert fallback reviews to API format
          setReviews(
            fallbackReviews.map((r) => ({
              id: String(r.id),
              rating: r.rating,
              text: r.text,
              authorName: r.author,
              createdAt: new Date().toISOString(),
            }))
          )
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      mounted = false
    }
  }, [])

  // Don't render until we have reviews
  if (isLoading || reviews.length === 0) {
    return null
  }

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews]

  // Calculate total width for animation (card width + gap)
  const cardWidth = 256 // w-64 = 16rem = 256px
  const gap = 12 // --space-3 = 12px
  const totalWidth = reviews.length * (cardWidth + gap)

  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      {/* Section header with brand context */}
      <p
        style={{
          marginBottom: 'var(--space-3)',
          fontSize: 'var(--text-caption-size)',
          lineHeight: 'var(--text-caption-line)',
          letterSpacing: 'var(--text-caption-tracking)',
          color: 'var(--text-tertiary)',
          textAlign: 'center',
        }}
      >
        What Still Hours users say
      </p>

      {/* Carousel container - bleeds to edges */}
      <div className="overflow-hidden -mx-6 px-6">
        <motion.div
          className="flex"
          style={{ gap: 'var(--space-3)' }}
          animate={
            shouldReduceMotion
              ? {} // No animation for reduced motion preference
              : { x: [0, -totalWidth] }
          }
          transition={
            shouldReduceMotion
              ? {}
              : {
                  x: {
                    duration: 60,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }
          }
        >
          {duplicatedReviews.map((review, index) => (
            <ReviewCard
              key={`${review.id}-${index}`}
              id={review.id}
              rating={review.rating}
              text={review.text}
              author={review.authorName}
              instanceId={instanceId}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
