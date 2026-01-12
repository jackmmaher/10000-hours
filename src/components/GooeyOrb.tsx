import { motion } from 'framer-motion'
import { springs, transitions } from '../lib/motion'

/**
 * GooeyOrb - Organic, liquid meditation orb
 *
 * Uses SVG gooey filter to create a bioluminescent, living organism effect.
 * Three overlapping circles merge and morph like a lava lamp.
 *
 * Follows the same transition states as HemingwayTime:
 * - idle: 4-4-4-4 box breathing (16s cycle)
 * - exhaling: scales down, fades
 * - inhaling: scales up, fades in
 * - running: active breathing, more luminous
 * - merging: rises and dissolves
 * - settling: gentle pulse
 */

type TransitionState = 'idle' | 'exhaling' | 'inhaling' | 'running' | 'merging' | 'settling'

interface GooeyOrbProps {
  transitionState: TransitionState
  className?: string
}

export function GooeyOrb({ transitionState, className = '' }: GooeyOrbProps) {
  // Animation props based on state
  const getAnimationProps = () => {
    switch (transitionState) {
      case 'exhaling':
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: 0.95, opacity: 0 },
          transition: { duration: 0.8 },
        }
      case 'inhaling':
        return {
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.6 },
        }
      case 'merging':
        return {
          initial: { y: 0, scale: 1, opacity: 1 },
          animate: { y: -30, scale: 0.6, opacity: 0 },
          transition: transitions.merge,
        }
      case 'settling':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: springs.settle,
        }
      case 'idle':
        return {
          initial: { scale: 1, opacity: 1 },
          animate: {
            scale: [1, 1.03, 1.03, 1],
            opacity: 1,
          },
          transition: {
            duration: 16,
            repeat: Infinity,
            times: [0, 0.25, 0.5, 0.75],
            ease: 'easeInOut' as const,
          },
        }
      case 'running':
      default:
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: 1, opacity: 1 },
          transition: springs.quick,
        }
    }
  }

  // Size varies by state
  const getSize = () => {
    switch (transitionState) {
      case 'idle':
      case 'exhaling':
        return { width: 140, height: 140, orbSize: 50 }
      case 'inhaling':
      case 'running':
        return { width: 200, height: 200, orbSize: 80 }
      case 'merging':
      case 'settling':
        return { width: 160, height: 160, orbSize: 60 }
      default:
        return { width: 140, height: 140, orbSize: 50 }
    }
  }

  const { width, height, orbSize } = getSize()
  const isActive = transitionState === 'running'
  const animationProps = getAnimationProps()

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      {...animationProps}
    >
      {/* SVG Filter Definition - The "Gooey" effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey-filter">
            {/* Blur to merge shapes */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            {/* Increase contrast to snap edges */}
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -10"
              result="gooey"
            />
            {/* Composite original on top for sharp details */}
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main orb container with gooey filter */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          filter: 'url(#gooey-filter)',
        }}
      >
        {/* Blob 1 - Primary (uses orb-edge color) */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${orbSize}px`,
            height: `${orbSize}px`,
            background: 'var(--orb-edge)',
            opacity: 0.8,
            animation: isActive
              ? 'gooeyBlob1Active 8s ease-in-out infinite'
              : 'gooeyBlob1Idle 12s ease-in-out infinite',
          }}
        />

        {/* Blob 2 - Secondary (uses orb-mid color) */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${orbSize * 0.85}px`,
            height: `${orbSize * 0.85}px`,
            background: 'var(--orb-mid)',
            opacity: 0.7,
            animation: isActive
              ? 'gooeyBlob2Active 7s ease-in-out infinite'
              : 'gooeyBlob2Idle 10s ease-in-out infinite',
            animationDelay: '-2s',
          }}
        />

        {/* Blob 3 - Tertiary (uses orb-glow color, more transparent) */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${orbSize * 0.7}px`,
            height: `${orbSize * 0.7}px`,
            background: 'var(--orb-glow)',
            opacity: 0.6,
            animation: isActive
              ? 'gooeyBlob3Active 6s ease-in-out infinite'
              : 'gooeyBlob3Idle 14s ease-in-out infinite',
            animationDelay: '-4s',
          }}
        />

        {/* Core - bright center (uses orb-core) */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${orbSize * 0.4}px`,
            height: `${orbSize * 0.4}px`,
            background: `radial-gradient(circle at 35% 35%, var(--orb-core) 0%, var(--orb-mid) 100%)`,
            boxShadow: `
              inset 0 0 ${orbSize * 0.2}px rgba(255, 255, 255, 0.6),
              0 0 ${orbSize * 0.5}px var(--orb-glow)
            `,
            animation: isActive
              ? 'gooeyCore 4s ease-in-out infinite'
              : 'gooeyCoreIdle 16s ease-in-out infinite', // Matches box breathing
          }}
        />
      </div>

      {/* Outer atmosphere glow (not affected by gooey filter) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: `${width * 1.2}px`,
          height: `${height * 1.2}px`,
          background: `radial-gradient(circle, var(--orb-atmosphere) 0%, transparent 70%)`,
          animation: isActive
            ? 'atmosphereActive 6s ease-in-out infinite'
            : 'atmosphereIdle 16s ease-in-out infinite', // Matches box breathing
        }}
      />
    </motion.div>
  )
}
