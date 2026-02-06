/**
 * Practice Feature Config - Metadata for practice tools in Journey tab
 *
 * Defines visual configuration and metadata for practice features displayed
 * in the Practice section (hero cards at bottom of Journey tab):
 * - Aum Coach (active) - Navigates to om-coach view
 * - Racing Mind (active)
 * - Perfect Posture (active)
 * - Commitment (active)
 */

import { ORB_COLORS } from '../../lib/animations'

export type FeatureId =
  | 'aum-coach'
  | 'racing-mind'
  | 'breath-pacer'
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
    | 'navigate-om-coach'
    | 'navigate-racing-mind'
    | 'navigate-breath-pacer'
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
 * - Aum Coach: Moss/Sand - organic, voice, growth
 * - Racing Mind: Cyan/Teal - mental clarity, calming electric energy
 * - Perfect Posture: Coral/Terracotta - body, earth, physical grounding
 */
export const FEATURE_ORB_COLORS: Record<FeatureId, OrbColors> = {
  'aum-coach': {
    primary: ORB_COLORS.moss, // Growth, life
    secondary: '#D4A574', // Warm sand - voice/sound
  },
  'racing-mind': {
    primary: '#22D3EE', // Cyan - electric clarity
    secondary: '#0891B2', // Deep teal - settling into calm
  },
  'breath-pacer': {
    primary: '#00CED1', // Turquoise - rhythm, flow
    secondary: '#20B2AA', // Sea green - calm, natural
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
    id: 'breath-pacer',
    title: 'Breath Pacer',
    description: 'Follow the ball. Guided visual breathing with haptic rhythm.',
    status: 'active',
    action: 'navigate-breath-pacer',
    orbColors: FEATURE_ORB_COLORS['breath-pacer'],
    ctaText: 'Begin Practice',
    categoryLabel: 'PRACTICE TOOL',
    teaserFeatures: ['5 breath patterns', 'Visual terrain animation', 'Haptic phase cues'],
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
      'Build a 30-90 day meditation habit with consistency tracking and gentle accountability.',
    status: 'active',
    action: 'open-commitment-modal',
    orbColors: FEATURE_ORB_COLORS['commitment'],
    ctaText: 'Start Commitment',
    categoryLabel: 'HABIT FORMATION',
    teaserFeatures: ['Consistency scoring', 'Grace periods built-in', 'Pause & adjust anytime'],
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
