/**
 * BreathingCanvas - The UI that breathes
 *
 * Wraps content in a container that subtly expands and contracts
 * following the 4-4-4-4 box breathing pattern:
 * - 4 seconds inhale (scale up)
 * - 4 seconds hold (stay expanded)
 * - 4 seconds exhale (scale down)
 * - 4 seconds rest (stay at base)
 *
 * The effect is so subtle you don't consciously notice it,
 * but your nervous system entrains to the rhythm.
 *
 * Behavioral science: Respiratory sinus arrhythmia research shows
 * that visual breathing cues can influence actual breathing patterns
 * and activate the parasympathetic nervous system.
 */

import { ReactNode } from 'react'

interface BreathingCanvasProps {
  children: ReactNode
  /** Enable/disable the breathing effect */
  enabled?: boolean
  /** Intensity: how much the canvas scales (default 0.008 = 0.8%) */
  intensity?: number
}

export function BreathingCanvas({
  children,
  enabled = true,
  intensity = 0.008
}: BreathingCanvasProps) {
  if (!enabled) {
    return <>{children}</>
  }

  return (
    <div
      className="breathing-canvas h-full"
      style={{
        // Use CSS custom property for intensity so it can be adjusted
        ['--breath-intensity' as string]: intensity,
      }}
    >
      {children}

      <style>{`
        @keyframes breathe {
          /* Rest phase (0-25%): Stay at base scale */
          0%, 25% {
            transform: scale(1);
          }
          /* Inhale phase (25-50%): Expand gently */
          50% {
            transform: scale(calc(1 + var(--breath-intensity, 0.008)));
          }
          /* Hold phase (50-75%): Stay expanded */
          75% {
            transform: scale(calc(1 + var(--breath-intensity, 0.008)));
          }
          /* Exhale phase (75-100%): Contract back */
          100% {
            transform: scale(1);
          }
        }

        .breathing-canvas {
          animation: breathe 16s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .breathing-canvas {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Hook to get breathing phase for components that want to sync
 * (e.g., the meditation orb could pulse in sync with the canvas breath)
 */
export function useBreathingPhase(): 'rest' | 'inhale' | 'hold' | 'exhale' {
  // For now, return a static value
  // In future, this could track the actual animation phase
  // using requestAnimationFrame and return the current phase
  return 'rest'
}
