import { motion, LayoutGroup } from 'framer-motion'
import { formatHemingwayCumulative, formatHemingwayActive } from '../lib/format'
import { AnimatedDigit } from './AnimatedDigit'
import { layoutIds, breatheVariants, springs } from '../lib/motion'

interface HemingwayTimeProps {
  seconds: number
  mode: 'cumulative' | 'active'
  breathing?: boolean // Apply box breathing animation
  className?: string
  /** Unique layout group ID for FLIP animations */
  layoutGroup?: string
}

/**
 * HemingwayTime - Typographic time display with visual hierarchy
 *
 * No labels (h, m, s), no colons - spacing is the only delimiter.
 * Size and opacity create natural hierarchy.
 *
 * Uses Framer Motion's layoutId so digits can morph between
 * cumulative and active modes without jarring state swaps.
 *
 * Cumulative mode: hours (primary) + minutes (secondary)
 * Active mode: expanding stream with opacity hierarchy
 */
export function HemingwayTime({
  seconds,
  mode,
  breathing = false,
  className = '',
  layoutGroup = 'timer',
}: HemingwayTimeProps) {
  return (
    <LayoutGroup id={layoutGroup}>
      <motion.div
        className={`flex items-baseline justify-center gap-[0.5em] tabular-nums font-serif ${className}`.trim()}
        variants={breatheVariants}
        animate={breathing ? 'breathe' : 'idle'}
        layout
        transition={springs.morph}
      >
        {mode === 'cumulative' ? (
          <CumulativeDisplay seconds={seconds} />
        ) : (
          <ActiveDisplay seconds={seconds} />
        )}
      </motion.div>
    </LayoutGroup>
  )
}

/**
 * Cumulative mode display
 * - Hours (if present): full size, font-semibold, opacity-100
 * - Minutes: 0.85em size, font-light, opacity-60
 * - If no hours, show only minutes styled as primary
 */
function CumulativeDisplay({ seconds }: { seconds: number }) {
  const { hours, minutes } = formatHemingwayCumulative(seconds)

  // No hours - show minutes as primary
  if (hours === null) {
    return (
      <AnimatedDigit
        value={minutes}
        layoutId={layoutIds.minutesDigit}
        className="text-display font-semibold opacity-100"
      />
    )
  }

  // Hours present - hours primary, minutes secondary
  return (
    <>
      <AnimatedDigit
        value={hours}
        layoutId={layoutIds.hoursDigit}
        className="text-display font-semibold opacity-100"
      />
      <AnimatedDigit
        value={minutes}
        layoutId={layoutIds.minutesDigit}
        className="font-light opacity-60"
        style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
      />
    </>
  )
}

/**
 * Active mode display - expanding stream with opacity hierarchy
 * - Primary (largest unit): opacity-100, text-display, font-semibold
 * - Secondary: opacity-50, 0.85em
 * - Tertiary (seconds): opacity-25, 0.72em (0.85^2)
 */
function ActiveDisplay({ seconds: totalSeconds }: { seconds: number }) {
  const { hours, minutes, seconds } = formatHemingwayActive(totalSeconds)

  // Under 1 minute: just seconds (primary)
  if (hours === null && minutes === null) {
    return (
      <AnimatedDigit
        value={seconds}
        layoutId={layoutIds.secondsDigit}
        className="text-display font-semibold opacity-100"
      />
    )
  }

  // Under 1 hour: minutes (primary) + seconds (secondary)
  if (hours === null) {
    return (
      <>
        <AnimatedDigit
          value={minutes!}
          layoutId={layoutIds.minutesDigit}
          className="text-display font-semibold opacity-100"
        />
        <AnimatedDigit
          value={seconds}
          layoutId={layoutIds.secondsDigit}
          className="font-light opacity-50"
          style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
        />
      </>
    )
  }

  // 1 hour or more: hours (primary) + minutes (secondary) + seconds (tertiary)
  return (
    <>
      <AnimatedDigit
        value={hours}
        layoutId={layoutIds.hoursDigit}
        className="text-display font-semibold opacity-100"
      />
      <AnimatedDigit
        value={minutes!}
        layoutId={layoutIds.minutesDigit}
        className="font-light opacity-50"
        style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
      />
      <AnimatedDigit
        value={seconds}
        layoutId={layoutIds.secondsDigit}
        className="font-light opacity-25"
        style={{ fontSize: 'calc(var(--text-display-size) * 0.72)' }}
      />
    </>
  )
}
