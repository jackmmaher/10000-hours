/**
 * Practice Feature Config - Metadata for practice tools in Journey tab
 *
 * Defines visual configuration and metadata for practice features displayed
 * in the Practice section (hero cards at bottom of Journey tab):
 * - Meditation Lock (active) - Opens LockSetupFlow modal
 * - Aum Coach (active) - Navigates to om-coach view
 * - Racing Mind (coming soon)
 * - Perfect Posture (coming soon)
 */

import { ORB_COLORS } from '../../lib/animations'

export type FeatureId =
  | 'meditation-lock'
  | 'aum-coach'
  | 'racing-mind'
  | 'perfect-posture'
  | 'commitment'
export type FeatureStatus = 'active' | 'coming-soon'

export interface OrbColors {
  primary: string
  secondary: string
}

export interface PracticeFeatureConfig {
  id: FeatureId
  title: string
  description: string
  status: FeatureStatus
  /** For active features, defines what action to take on press */
  action?:
    | 'open-lock-modal'
    | 'navigate-om-coach'
    | 'navigate-racing-mind'
    | 'navigate-posture'
    | 'open-commitment-modal'
  /** Orb color configuration */
  orbColors: OrbColors
  /** CTA button text (for active features) */
  ctaText: string
  /** Category label (uppercase) */
  categoryLabel: string
  /** Teaser features list (for coming soon items) */
  teaserFeatures?: string[]
}

/**
 * Feature-specific orb colors
 * Designed to evoke the essence of each practice
 *
 * Each feature has a unique color identity:
 * - Focus Mode: Slate/Indigo - discipline, stability
 * - Aum Coach: Moss/Sand - organic, voice, growth
 * - Racing Mind: Cyan/Teal - mental clarity, calming electric energy
 * - Perfect Posture: Coral/Terracotta - body, earth, physical grounding
 */
export const FEATURE_ORB_COLORS: Record<FeatureId, OrbColors> = {
  'meditation-lock': {
    primary: ORB_COLORS.slate, // Stability, focus
    secondary: ORB_COLORS.indigo, // Depth, discipline
  },
  'aum-coach': {
    primary: ORB_COLORS.moss, // Growth, life
    secondary: '#D4A574', // Warm sand - voice/sound
  },
  'racing-mind': {
    primary: '#22D3EE', // Cyan - electric clarity
    secondary: '#0891B2', // Deep teal - settling into calm
  },
  'perfect-posture': {
    primary: '#F97316', // Coral/orange - body warmth
    secondary: '#C2410C', // Terracotta - earthy grounding
  },
  commitment: {
    primary: '#8B5CF6', // Violet - stakes, accountability
    secondary: '#6D28D9', // Deep purple - commitment, intention
  },
}

export const PRACTICE_FEATURES: PracticeFeatureConfig[] = [
  {
    id: 'meditation-lock',
    title: 'Focus Mode',
    description: 'Block distracting apps until you meditate',
    status: 'active',
    action: 'open-lock-modal',
    orbColors: FEATURE_ORB_COLORS['meditation-lock'],
    ctaText: 'Configure',
    categoryLabel: 'PRACTICE TOOL',
    teaserFeatures: [
      'Blocks distracting apps',
      'Behavioral science-backed',
      'Emergency skips built-in',
    ],
  },
  {
    id: 'aum-coach',
    title: 'Aum Coach',
    description: 'Real-time vocal biofeedback for Aum chanting',
    status: 'active',
    action: 'navigate-om-coach',
    orbColors: FEATURE_ORB_COLORS['aum-coach'],
    ctaText: 'Begin Practice',
    categoryLabel: 'PRACTICE TOOL',
    teaserFeatures: [
      'Real-time pitch feedback',
      'A-U-M phoneme detection',
      'HRV-optimized breathing',
    ],
  },
  {
    id: 'racing-mind',
    title: 'Racing Mind',
    description: 'Not ready to sit still? Start here.',
    status: 'active',
    action: 'navigate-racing-mind',
    orbColors: FEATURE_ORB_COLORS['racing-mind'],
    ctaText: 'Begin Practice',
    categoryLabel: 'PRACTICE TOOL',
    teaserFeatures: ['Hypnotic visual focus', 'Blue light calming', 'Pre-meditation primer'],
  },
  {
    id: 'perfect-posture',
    title: 'Perfect Posture',
    description: 'AirPods detect when you slouch. Gentle haptic reminders keep you aligned.',
    status: 'active',
    action: 'navigate-posture',
    orbColors: FEATURE_ORB_COLORS['perfect-posture'],
    ctaText: 'Begin Practice',
    categoryLabel: 'PRACTICE TOOL',
    teaserFeatures: ['AirPods motion tracking', 'Haptic posture reminders', 'Session statistics'],
  },
  {
    id: 'commitment',
    title: 'Commitment',
    description:
      'Lock into 30-90 day meditation commitments with financial stakes from your hour bank.',
    status: 'active',
    action: 'open-commitment-modal',
    orbColors: FEATURE_ORB_COLORS['commitment'],
    ctaText: 'Start Commitment',
    categoryLabel: 'HABIT FORMATION',
    teaserFeatures: ['Casino-style rewards', 'Grace periods built-in', 'Emergency exit available'],
  },
]

/**
 * Get active features (can be clicked)
 */
export function getActiveFeatures(): PracticeFeatureConfig[] {
  return PRACTICE_FEATURES.filter((f) => f.status === 'active')
}

/**
 * Get coming soon features
 */
export function getComingSoonFeatures(): PracticeFeatureConfig[] {
  return PRACTICE_FEATURES.filter((f) => f.status === 'coming-soon')
}
