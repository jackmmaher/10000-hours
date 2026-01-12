import type { Transition, Variants } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

/**
 * Timer animation phases - the continuous timeline
 *
 * resting    → idle state, breathing animation active
 * departing  → exhaling away from cumulative display
 * arriving   → inhaling into active display, timer starts
 * active     → timer running, counting up
 * completing → session ending, dissolving upward
 * resolving  → cumulative emerging, settling into rest
 */
export type TimerPhase =
  | 'resting'
  | 'departing'
  | 'arriving'
  | 'active'
  | 'completing'
  | 'resolving'

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
 * Transition state animation presets (legacy - kept for reference)
 */
export const stateAnimations = {
  exhaling: {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 0.95, opacity: 0 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.8 },
  },
  inhaling: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1, opacity: 1 },
    transition: { duration: 0.6 },
  },
  merging: {
    initial: { y: 0, scale: 1, opacity: 1 },
    animate: { y: -30, scale: 0.6, opacity: 0 },
    transition: transitions.merge,
  },
  settling: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: springs.settle,
  },
}

/**
 * Stage variants for the persistent timer container
 *
 * The container never unmounts. These variants control its scale and position
 * as the animation flows through phases. The crossfade between display layers
 * is handled separately via opacity.
 */
export const stageVariants: Variants = {
  resting: {
    scale: 1,
    y: 0,
  },
  departing: {
    scale: 0.96,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1], // ease-out
    },
  },
  arriving: {
    scale: 1,
    transition: springs.settle,
  },
  active: {
    scale: 1,
    transition: springs.quick,
  },
  completing: {
    scale: 0.92,
    y: -12,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  resolving: {
    scale: 1,
    y: 0,
    transition: springs.settle,
  },
}

/**
 * Layer opacity transitions - smooth crossfade between cumulative and active
 */
export const layerTransition: Transition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1],
}

/**
 * Get layer opacity values for a given phase
 * Both layers always exist; visibility controlled by opacity
 */
export function getLayerOpacity(phase: TimerPhase): { cumulative: number; active: number } {
  switch (phase) {
    case 'resting':
      return { cumulative: 1, active: 0 }
    case 'departing':
      return { cumulative: 0, active: 0 } // cumulative fading out
    case 'arriving':
      return { cumulative: 0, active: 1 } // active fading in
    case 'active':
      return { cumulative: 0, active: 1 }
    case 'completing':
      return { cumulative: 0, active: 0 } // active fading out
    case 'resolving':
      return { cumulative: 1, active: 0 } // cumulative fading in
  }
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
    const instantStageVariants: Variants = {
      resting: { scale: 1, y: 0 },
      departing: { scale: 1, transition: { duration: 0 } },
      arriving: { scale: 1, transition: { duration: 0 } },
      active: { scale: 1, transition: { duration: 0 } },
      completing: { scale: 1, y: 0, transition: { duration: 0 } },
      resolving: { scale: 1, y: 0, transition: { duration: 0 } },
    }

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
      stageVariants: instantStageVariants,
      layerTransition: { duration: 0 },
      prefersReduced: true,
    }
  }

  return {
    springs,
    transitions,
    breatheVariants,
    stageVariants,
    layerTransition,
    prefersReduced: false,
  }
}
