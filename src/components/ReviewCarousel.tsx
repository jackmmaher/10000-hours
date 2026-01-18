/**
 * ReviewCarousel - Auto-scrolling testimonial carousel
 *
 * Displays social proof through user reviews on paywall screens.
 * Features a continuous horizontal scroll animation with review cards.
 */

import { motion } from 'framer-motion'
import { reviews, type Review } from '../data/reviews'

// Star display component
function Stars({ rating }: { rating: Review['rating'] }) {
  const fullStars = Math.floor(rating)
  const hasPartial = rating % 1 !== 0

  return (
    <div className="flex gap-0.5">
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
            <linearGradient id={`partial-${rating}`}>
              <stop offset={`${(rating % 1) * 100}%`} stopColor="var(--accent)" />
              <stop offset={`${(rating % 1) * 100}%`} stopColor="var(--text-tertiary)" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#partial-${rating})`}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
    </div>
  )
}

// Single review card
function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex-shrink-0 w-64 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
      style={{ boxShadow: 'var(--shadow-elevation-1)' }}
    >
      <Stars rating={review.rating} />
      <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
        "{review.text}"
      </p>
      <p className="mt-2 text-xs text-[var(--text-tertiary)]">— {review.author}</p>
    </div>
  )
}

export function ReviewCarousel() {
  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews]

  // Calculate total width for animation (card width + gap)
  const cardWidth = 256 // w-64 = 16rem = 256px
  const gap = 12 // gap-3 = 0.75rem = 12px
  const totalWidth = reviews.length * (cardWidth + gap)

  return (
    <div className="overflow-hidden mt-4 -mx-6 px-6">
      <motion.div
        className="flex gap-3"
        animate={{
          x: [0, -totalWidth],
        }}
        transition={{
          x: {
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {duplicatedReviews.map((review, index) => (
          <ReviewCard key={`${review.id}-${index}`} review={review} />
        ))}
      </motion.div>
    </div>
  )
}
