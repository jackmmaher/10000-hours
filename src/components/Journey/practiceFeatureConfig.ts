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

export type FeatureId = 'meditation-lock' | 'aum-coach' | 'racing-mind' | 'perfect-posture'
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
  action?: 'open-lock-modal' | 'navigate-om-coach'
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
    status: 'coming-soon',
    orbColors: FEATURE_ORB_COLORS['racing-mind'],
    ctaText: 'Coming Soon',
    categoryLabel: 'PRACTICE TOOL',
    teaserFeatures: ['Hypnotic visual focus', 'Blue light calming', 'Pre-meditation primer'],
  },
  {
    id: 'perfect-posture',
    title: 'Perfect Posture',
    description: 'Sore knees? Dead legs? Align once, sit pain-free for hours.',
    status: 'coming-soon',
    orbColors: FEATURE_ORB_COLORS['perfect-posture'],
    ctaText: 'Coming Soon',
    categoryLabel: 'PRACTICE TOOL',
    teaserFeatures: ['Camera-guided alignment', 'Two-view calibration', 'Haptic posture training'],
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
