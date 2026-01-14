import type { Transition, Variants } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

/**
 * Timer animation phases - 4-phase unified model
 *
 * resting  → idle state, breathing animation active
 * pending  → waiting for breath alignment to start
 * active   → timer running, counting up
 * settling → waiting for breath alignment to end, fading seconds
 */
export type TimerPhase = 'resting' | 'pending' | 'active' | 'settling'

/**
 * Spring physics presets for organic, meditative animations
 *
 * These replace the linear CSS transitions with physics-based motion
 * that feels more natural and embodied.
 */
export const springs = {
  // Primary morph - used for layout transitions between states
  morph: {
    type: 'spring' as const,
    stiffness: 280,
    damping: 30,
    mass: 1,
  },

  // Gentle settle - for post-transition calm with micro-overshoot
  settle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 22, // slightly underdamped for subtle overshoot
    mass: 0.8,
  },

  // Quick response - for immediate feedback
  quick: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 35,
  },

  // Breathing - slow, meditative pulse
  breathe: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },
}

/**
 * Layout IDs for shared element transitions (FLIP animations)
 *
 * These allow Framer Motion to understand that elements in different
 * render states are actually the "same" element that should morph
 * rather than disappear and reappear.
 */
export const layoutIds = {
  hoursDigit: 'timer-hours',
  minutesDigit: 'timer-minutes',
  secondsDigit: 'timer-seconds',
  timerContainer: 'timer-container',
}

/**
 * Transition presets for different animation contexts
 */
export const transitions = {
  // Digit rolling - smooth number changes
  digitRoll: {
    duration: 0.15,
    ease: 'easeOut' as const,
  },

  // Layout morph - for position/size changes
  layoutMorph: {
    layout: springs.morph,
    opacity: { duration: 0.3, ease: 'easeOut' as const },
  },

  // Merge animation - session flying to cumulative
  merge: {
    duration: 1.4,
    ease: [0.34, 1.56, 0.64, 1], // Organic overshoot ease
  },

  // Cumulative appear - emerging during merge
  cumulativeAppear: {
    delay: 0.6,
    ...springs.settle,
  },
} satisfies Record<string, Transition>

/**
 * Box breathing animation variants (4-4-4-4 pattern)
 * 16-second cycle matching meditation breathing
 */
export const breatheVariants: Variants = {
  idle: {
    scale: 1,
  },
  breathe: {
    scale: [1, 1.03, 1.03, 1],
    transition: {
      duration: 16,
      repeat: Infinity,
      times: [0, 0.25, 0.5, 0.75],
      ease: 'easeInOut',
    },
  },
}

/**
 * Hook for reduced-motion-aware animation configuration
 *
 * When the user prefers reduced motion, all animations become instant.
 * This respects accessibility preferences set at the OS level.
 */
export function useMotionConfig() {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    // Return instant transitions for reduced motion preference
    return {
      springs: {
        morph: { duration: 0 },
        settle: { duration: 0 },
        quick: { duration: 0 },
        breathe: { duration: 0 },
      },
      transitions: {
        digitRoll: { duration: 0 },
        layoutMorph: { duration: 0 },
        merge: { duration: 0 },
        cumulativeAppear: { duration: 0 },
      },
      breatheVariants: {
        idle: { scale: 1 },
        breathe: { scale: 1 }, // No animation
      } as Variants,
      prefersReduced: true,
    }
  }

  return {
    springs,
    transitions,
    breatheVariants,
    prefersReduced: false,
  }
}
