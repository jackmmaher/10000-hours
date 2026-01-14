import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { springs } from '../lib/motion'

/**
 * GooeyOrb - Organic, liquid meditation orb
 *
 * Uses SVG gooey filter to create a bioluminescent, living organism effect.
 * Three overlapping circles merge and morph like a lava lamp.
 *
 * Accepts the new 4-phase timer system:
 * - resting:  16s box breathing cycle, slow morphing
 * - pending:  waiting for breath alignment (visually same as resting)
 * - active:   faster, more energetic morphing
 * - settling: fading out (visually transitioning back to resting)
 */

type OrbPhase = 'resting' | 'pending' | 'active' | 'settling'

interface GooeyOrbProps {
  phase: OrbPhase
  className?: string
}

export function GooeyOrb({ phase, className = '' }: GooeyOrbProps) {
  // Map phase to visual states
  const isActive = phase === 'active' || phase === 'settling'
  const isResting = phase === 'resting' || phase === 'pending'

  // Size varies by phase
  const { width, height, orbSize } = useMemo(() => {
    if (isActive) {
      return { width: 200, height: 200, orbSize: 80 }
    }
    return { width: 140, height: 140, orbSize: 50 }
  }, [isActive])

  // Animation class based on phase
  const getBlobAnimation = (blobNum: 1 | 2 | 3) => {
    if (isActive) {
      return `gooeyBlob${blobNum}Active`
    }
    return `gooeyBlob${blobNum}Idle`
  }

  const getBlobDuration = (blobNum: 1 | 2 | 3) => {
    if (isActive) {
      return blobNum === 1 ? '8s' : blobNum === 2 ? '7s' : '6s'
    }
    return blobNum === 1 ? '12s' : blobNum === 2 ? '10s' : '14s'
  }

  return (
    <motion.div className={`relative flex items-center justify-center ${className}`}>
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
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        transition={springs.settle}
        style={{
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
            animation: `${getBlobAnimation(1)} ${getBlobDuration(1)} ease-in-out infinite`,
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
            animation: `${getBlobAnimation(2)} ${getBlobDuration(2)} ease-in-out infinite`,
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
            animation: `${getBlobAnimation(3)} ${getBlobDuration(3)} ease-in-out infinite`,
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
              : isResting
                ? 'gooeyCoreIdle 16s ease-in-out infinite'
                : 'none',
          }}
        />
      </motion.div>

      {/* Outer atmosphere glow (not affected by gooey filter) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{
          width: `${width * 1.2}px`,
          height: `${height * 1.2}px`,
        }}
        transition={springs.settle}
        style={{
          background: `radial-gradient(circle, var(--orb-atmosphere) 0%, transparent 70%)`,
          animation: isActive
            ? 'atmosphereActive 6s ease-in-out infinite'
            : isResting
              ? 'atmosphereIdle 16s ease-in-out infinite'
              : 'none',
        }}
      />
    </motion.div>
  )
}
