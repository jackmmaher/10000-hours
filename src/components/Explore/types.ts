/**
 * Explore Tab - Shared Types
 *
 * Types used across Explore components for content discovery.
 */

import type { Pearl } from '../../lib/pearls'
import type { SessionTemplate } from '../SessionDetailModal'

// ============================================================================
// FEED TYPES
// ============================================================================

export type FeedItemType = 'pearl' | 'session'

export interface FeedItem {
  type: FeedItemType
  id: string
  data: Pearl | SessionTemplate
}

// Extended session template with user interaction flags
export interface SessionWithStatus extends SessionTemplate {
  hasVoted?: boolean
  hasSaved?: boolean
  hasCompleted?: boolean
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export type FilterType = 'all' | 'pearls' | 'meditations'
export type SortType = 'rising' | 'new' | 'top' | 'saved'

// Intent filter options - Pareto-aligned: 8 filters covering ~80% of user intent
export const INTENT_OPTIONS = [
  'anxiety',
  'stress',
  'sleep',
  'focus',
  'beginners',
  'body-awareness',
  'self-compassion',
  'letting-go',
] as const

export type IntentType = (typeof INTENT_OPTIONS)[number] | null

// ============================================================================
// SECTION TYPES
// ============================================================================

export interface SectionContent {
  /** Featured item for hero card (top session or pearl) */
  featured: FeedItem | null
  /** Pearls for horizontal carousel */
  carouselPearls: Pearl[]
  /** Sessions for vertical feed */
  feedSessions: SessionWithStatus[]
  /** Remaining pearls for vertical feed */
  feedPearls: Pearl[]
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ExploreInteractionProps {
  isAuthenticated: boolean
  currentUserId?: string
  onRequireAuth: () => void
}
