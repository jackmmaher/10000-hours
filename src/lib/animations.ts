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

// Hero gradients for session cards (Tailwind classes)
export const SESSION_HERO_GRADIENTS = [
  'from-emerald-400 to-teal-600',     // Calm, nature
  'from-indigo-400 to-violet-600',    // Focus, depth
  'from-amber-400 to-orange-600',     // Energy, warmth
  'from-rose-400 to-pink-600',        // Compassion, love
  'from-sky-400 to-blue-600',         // Clarity, openness
  'from-stone-400 to-slate-600',      // Grounding, stability
  'from-lime-400 to-green-600',       // Growth, renewal
  'from-purple-400 to-fuchsia-600'    // Transcendence, mystery
]

// Map intentions to gradients
export const INTENTION_TO_GRADIENT: Record<string, string> = {
  'Cultivating calm': 'from-emerald-400 to-teal-600',
  'Building focus': 'from-indigo-400 to-violet-600',
  'Finding energy': 'from-amber-400 to-orange-600',
  'Developing compassion': 'from-rose-400 to-pink-600',
  'Cultivating clarity': 'from-sky-400 to-blue-600',
  'Grounding': 'from-stone-400 to-slate-600',
  'Growth': 'from-lime-400 to-green-600',
  'Letting go': 'from-purple-400 to-fuchsia-600'
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
