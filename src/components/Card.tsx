/**
 * Unified Card System
 *
 * Glassmorphic cards that respect the Living Theme.
 * Research-backed design for engagement:
 * - Social proof prominent (voice badges, upvotes visible)
 * - Minimal cognitive load (max 3 metadata items)
 * - Consistent visual hierarchy across all card types
 */

import { ReactNode } from 'react'
import { VoiceBadgeWithHours } from './VoiceBadge'

// ============================================================================
// BASE CARD
// ============================================================================

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'subtle'
}

/**
 * Base card with glassmorphism effect.
 * Uses --card-bg from Living Theme with backdrop blur.
 */
export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-card/90 backdrop-blur-md border border-ink/5 shadow-sm',
    elevated: 'bg-card/95 backdrop-blur-lg border border-ink/10 shadow-md',
    subtle: 'bg-card/70 backdrop-blur-sm border border-ink/5',
  }

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        transition-all duration-200
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Shimmer highlight - the polished look */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {children}
    </div>
  )
}

// ============================================================================
// CARD HEADER
// ============================================================================

interface CardHeaderProps {
  /** Left indicator - orb, gradient bar, or icon */
  indicator?: ReactNode
  /** Meta label - "Community wisdom", "Breath Awareness", date, etc. */
  label?: string
  /** Secondary label - duration, technique, etc. */
  sublabel?: string
  /** Voice score (0-100) - shown as badge on right */
  voiceScore?: number
  /** Right action slot - edit button, menu, etc. */
  action?: ReactNode
  /** Compact mode for tighter spacing */
  compact?: boolean
}

export function CardHeader({
  indicator,
  label,
  sublabel,
  voiceScore,
  action,
  compact = false
}: CardHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'px-4 pt-3 pb-2' : 'px-5 pt-4 pb-2'}`}>
      {/* Left indicator */}
      {indicator && (
        <div className="flex-shrink-0">
          {indicator}
        </div>
      )}

      {/* Labels */}
      <div className="flex-1 min-w-0">
        {label && (
          <span className="text-xs text-ink-soft font-medium">
            {label}
            {sublabel && (
              <span className="text-ink/40 mx-1.5">·</span>
            )}
            {sublabel && (
              <span className="text-ink/50">{sublabel}</span>
            )}
          </span>
        )}
      </div>

      {/* Right side: Voice badge or action */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {voiceScore !== undefined && voiceScore > 0 && (
          <VoiceBadgeWithHours score={voiceScore} />
        )}
        {action}
      </div>
    </div>
  )
}

// ============================================================================
// CARD BODY
// ============================================================================

interface CardBodyProps {
  children: ReactNode
  className?: string
  compact?: boolean
}

export function CardBody({ children, className = '', compact = false }: CardBodyProps) {
  return (
    <div className={`${compact ? 'px-4 py-2' : 'px-5 py-3'} ${className}`}>
      {children}
    </div>
  )
}

// ============================================================================
// CARD FOOTER
// ============================================================================

interface CardFooterProps {
  children: ReactNode
  className?: string
  compact?: boolean
}

export function CardFooter({ children, className = '', compact = false }: CardFooterProps) {
  return (
    <div className={`
      flex items-center gap-4
      ${compact ? 'px-4 pt-2 pb-3' : 'px-5 pt-2 pb-4'}
      ${className}
    `}>
      {children}
    </div>
  )
}

// ============================================================================
// CARD INDICATORS (Left side visual markers)
// ============================================================================

/** Pearl orb indicator - for wisdom content */
export function PearlOrb({ variant = 'personal' }: { variant?: 'personal' | 'community' | 'collected' }) {
  const styles = {
    personal: 'bg-gradient-to-br from-cream-warm to-cream-deep shadow-sm',
    community: 'bg-gradient-to-br from-white/80 to-cream-warm shadow-sm ring-1 ring-white/20',
    collected: 'bg-gradient-to-br from-[#D8D4CF] to-[#B8B4AF] shadow-sm',
  }

  return (
    <div className={`w-5 h-5 rounded-full ${styles[variant]}`} />
  )
}

/** Accent bar indicator - for insights and meditations */
export function AccentBar({ gradient }: { gradient?: string }) {
  return (
    <div
      className={`w-1 h-8 rounded-full ${gradient || 'bg-gradient-to-b from-accent to-accent-muted'}`}
    />
  )
}

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

interface EngagementProps {
  upvotes?: number
  hasVoted?: boolean
  onVote?: () => void
  saves?: number
  hasSaved?: boolean
  onSave?: () => void
  practiced?: number
  timestamp?: string
  compact?: boolean
}

export function CardEngagement({
  upvotes,
  hasVoted,
  onVote,
  saves,
  hasSaved,
  onSave,
  practiced,
  timestamp,
  compact = false,
}: EngagementProps) {
  return (
    <CardFooter compact={compact}>
      {/* Upvotes */}
      {upvotes !== undefined && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onVote?.()
          }}
          className={`
            flex items-center gap-1.5 text-sm transition-colors
            ${hasVoted
              ? 'text-accent font-medium'
              : 'text-ink-soft hover:text-accent'
            }
          `}
          aria-label={hasVoted ? 'Remove upvote' : 'Upvote'}
          aria-pressed={hasVoted}
        >
          <svg
            className="w-4 h-4"
            fill={hasVoted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <span>{upvotes}</span>
        </button>
      )}

      {/* Saves */}
      {saves !== undefined && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSave?.()
          }}
          className={`
            flex items-center gap-1.5 text-sm transition-colors
            ${hasSaved
              ? 'text-accent font-medium'
              : 'text-ink-soft hover:text-accent'
            }
          `}
          aria-label={hasSaved ? 'Unsave' : 'Save'}
          aria-pressed={hasSaved}
        >
          <svg
            className="w-4 h-4"
            fill={hasSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          {hasSaved && <span>Saved</span>}
        </button>
      )}

      {/* Practiced count */}
      {practiced !== undefined && practiced > 0 && (
        <span className="flex items-center gap-1.5 text-sm text-ink-soft">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{practiced.toLocaleString()}</span>
        </span>
      )}

      {/* Spacer + Timestamp */}
      {timestamp && (
        <>
          <div className="flex-1" />
          <span className="text-xs text-ink/40">{timestamp}</span>
        </>
      )}
    </CardFooter>
  )
}

// ============================================================================
// CARD CONTENT HELPERS
// ============================================================================

/** Primary text - for quotes, titles, insights */
export function CardTitle({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <p className={`font-serif text-ink text-base leading-relaxed ${className}`}>
      {children}
    </p>
  )
}

/** Secondary text - for taglines, descriptions */
export function CardDescription({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <p className={`text-sm text-ink-soft italic line-clamp-2 mt-1 ${className}`}>
      {children}
    </p>
  )
}

/** Metadata line - for technique, duration, etc. */
export function CardMeta({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs text-ink-soft ${className}`}>
      {children}
    </div>
  )
}
