/**
 * Shared animation constants
 *
 * Ensures consistent animations across the app:
 * - Timer orb (hidden time mode)
 * - Week stones (breathing effect)
 * - Loading states
 */

// Breathing animation timing (matches CSS animate-breathe)
export const ANIMATION_BREATHE_DURATION = 4000 // 4 seconds full cycle

// Orb colors - Ghibli-inspired organic tones
export const ORB_COLORS = {
  moss: '#87A878',      // Primary green - growth, life
  slate: '#5D6D7E',     // Secondary - stability, grounding
  indigo: '#2C3E50',    // Deep indigo - depth, wisdom
  cream: '#FAF8F5',     // Background cream
  creamDeep: '#F5F0E8'  // Deeper cream for contrast
}

// Gradient presets for orbs
export const ORB_GRADIENTS = {
  // Active/breathing orb - moss to slate
  active: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}, ${ORB_COLORS.slate})`,

  // Completed state - slate to indigo
  completed: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.slate}, ${ORB_COLORS.indigo})`,

  // Planned/upcoming - lighter version
  planned: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}40, ${ORB_COLORS.slate}40)`,

  // Empty/future - cream tones
  empty: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.creamDeep}, ${ORB_COLORS.cream})`
}

// Hero gradients for session cards - refined, muted palette
// Designed to feel natural and sophisticated on cream backgrounds
export const SESSION_HERO_GRADIENTS = [
  'from-[#9DB4A0] to-[#5C7C5E]',     // Calm - soft sage to deep moss
  'from-[#7C8A98] to-[#3D4A5C]',     // Focus - cool steel to deep slate
  'from-[#D4A574] to-[#A67B5B]',     // Energy - warm sand to terracotta
  'from-[#C4A4A8] to-[#8C6B70]',     // Compassion - dusty rose to mauve
  'from-[#8BA4B4] to-[#4A6B7C]',     // Clarity - soft sky to ocean
  'from-[#A69B8C] to-[#5C544A]',     // Grounding - warm stone to charcoal
  'from-[#8CB08C] to-[#4A6B4A]',     // Growth - fresh sage to forest
  'from-[#A8A0B8] to-[#5C5470]'      // Release - soft lavender to dusk
]

// Intention options with their gradient mappings
// Used by TemplateEditor for visual color picker
export const INTENTIONS = [
  { label: 'Calm', gradient: 'from-[#9DB4A0] to-[#5C7C5E]' },
  { label: 'Focus', gradient: 'from-[#7C8A98] to-[#3D4A5C]' },
  { label: 'Energy', gradient: 'from-[#D4A574] to-[#A67B5B]' },
  { label: 'Compassion', gradient: 'from-[#C4A4A8] to-[#8C6B70]' },
  { label: 'Clarity', gradient: 'from-[#8BA4B4] to-[#4A6B7C]' },
  { label: 'Grounding', gradient: 'from-[#A69B8C] to-[#5C544A]' },
  { label: 'Growth', gradient: 'from-[#8CB08C] to-[#4A6B4A]' },
  { label: 'Release', gradient: 'from-[#A8A0B8] to-[#5C5470]' }
] as const

// Map intentions to gradients (for lookup by label)
// Supports both simple labels and full phrases via keyword matching
export const INTENTION_TO_GRADIENT: Record<string, string> = {
  // Simple labels (used by TemplateEditor)
  'Calm': 'from-[#9DB4A0] to-[#5C7C5E]',
  'Focus': 'from-[#7C8A98] to-[#3D4A5C]',
  'Energy': 'from-[#D4A574] to-[#A67B5B]',
  'Compassion': 'from-[#C4A4A8] to-[#8C6B70]',
  'Clarity': 'from-[#8BA4B4] to-[#4A6B7C]',
  'Grounding': 'from-[#A69B8C] to-[#5C544A]',
  'Growth': 'from-[#8CB08C] to-[#4A6B4A]',
  'Release': 'from-[#A8A0B8] to-[#5C5470]'
}

// Keyword patterns for fuzzy intention matching
const INTENTION_KEYWORDS: Array<{ keywords: string[], gradient: string }> = [
  { keywords: ['calm', 'peace', 'still', 'quiet', 'tranquil', 'serene'], gradient: INTENTION_TO_GRADIENT['Calm'] },
  { keywords: ['focus', 'concentrat', 'attention', 'insight', 'aware'], gradient: INTENTION_TO_GRADIENT['Focus'] },
  { keywords: ['energy', 'refresh', 'vital', 'awaken', 'morning'], gradient: INTENTION_TO_GRADIENT['Energy'] },
  { keywords: ['compass', 'love', 'kind', 'heart', 'gratitude', 'self-'], gradient: INTENTION_TO_GRADIENT['Compassion'] },
  { keywords: ['clar', 'open', 'expand', 'presence', 'embodi'], gradient: INTENTION_TO_GRADIENT['Clarity'] },
  { keywords: ['ground', 'stabil', 'root', 'earth', 'resilien'], gradient: INTENTION_TO_GRADIENT['Grounding'] },
  { keywords: ['grow', 'develop', 'build', 'deepen', 'cultivat'], gradient: INTENTION_TO_GRADIENT['Growth'] },
  { keywords: ['release', 'let', 'sleep', 'evening', 'relax', 'anxiet'], gradient: INTENTION_TO_GRADIENT['Release'] }
]

/**
 * Get gradient for an intention string
 * First tries exact match, then keyword matching, then falls back to default
 */
export function getIntentionGradient(intention: string): string {
  // Try exact match first
  if (INTENTION_TO_GRADIENT[intention]) {
    return INTENTION_TO_GRADIENT[intention]
  }

  // Try keyword matching
  const lower = intention.toLowerCase()
  for (const { keywords, gradient } of INTENTION_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) {
      return gradient
    }
  }

  // Default to Calm (sage/moss - fits meditation context)
  return INTENTION_TO_GRADIENT['Calm']
}

// Transition durations
export const TRANSITIONS = {
  fast: 150,      // Quick interactions
  normal: 300,    // Standard transitions
  slow: 500,      // Deliberate animations
  theme: 1800000  // 30 minutes for theme transitions (dawn/dusk)
}

// Easing functions
export const EASINGS = {
  breathe: 'cubic-bezier(0.4, 0, 0.6, 1)',  // Smooth in-out for breathing
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Playful bounce
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)'  // Standard smooth
}
