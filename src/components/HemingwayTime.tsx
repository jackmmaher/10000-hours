import { formatHemingwayCumulative, formatHemingwayActive } from '../lib/format'

interface HemingwayTimeProps {
  seconds: number
  mode: 'cumulative' | 'active'
  breathing?: boolean // Apply box breathing animation
  className?: string
}

/**
 * HemingwayTime - Typographic time display with visual hierarchy
 *
 * No labels (h, m, s), no colons - spacing is the only delimiter.
 * Size and opacity create natural hierarchy.
 *
 * Cumulative mode: hours (primary) + minutes (secondary)
 * Active mode: expanding stream with opacity hierarchy
 */
export function HemingwayTime({
  seconds,
  mode,
  breathing = false,
  className = '',
}: HemingwayTimeProps) {
  const baseClasses = `flex items-baseline justify-center gap-[0.5em] tabular-nums font-serif ${
    breathing ? 'animate-box-breathe' : ''
  } ${className}`.trim()

  if (mode === 'cumulative') {
    return <CumulativeDisplay seconds={seconds} className={baseClasses} />
  }

  return <ActiveDisplay seconds={seconds} className={baseClasses} />
}

/**
 * Cumulative mode display
 * - Hours (if present): full size, font-semibold, opacity-100
 * - Minutes: 0.85em size, font-light, opacity-60
 * - If no hours, show only minutes styled as primary
 */
function CumulativeDisplay({ seconds, className }: { seconds: number; className: string }) {
  const { hours, minutes } = formatHemingwayCumulative(seconds)

  // No hours - show minutes as primary
  if (hours === null) {
    return (
      <div className={className}>
        <span className="text-display font-semibold opacity-100">{minutes}</span>
      </div>
    )
  }

  // Hours present - hours primary, minutes secondary
  return (
    <div className={className}>
      <span className="text-display font-semibold opacity-100">{hours}</span>
      <span
        className="font-light opacity-60"
        style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
      >
        {minutes}
      </span>
    </div>
  )
}

/**
 * Active mode display - expanding stream with opacity hierarchy
 * - Primary (largest unit): opacity-100, text-display, font-semibold
 * - Secondary: opacity-50, 0.85em
 * - Tertiary (seconds): opacity-25, 0.72em (0.85²)
 */
function ActiveDisplay({
  seconds: totalSeconds,
  className,
}: {
  seconds: number
  className: string
}) {
  const { hours, minutes, seconds } = formatHemingwayActive(totalSeconds)

  // Under 1 minute: just seconds (primary)
  if (hours === null && minutes === null) {
    return (
      <div className={className}>
        <span className="text-display font-semibold opacity-100">{seconds}</span>
      </div>
    )
  }

  // Under 1 hour: minutes (primary) + seconds (secondary)
  if (hours === null) {
    return (
      <div className={className}>
        <span className="text-display font-semibold opacity-100">{minutes}</span>
        <span
          className="font-light opacity-50"
          style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
        >
          {seconds}
        </span>
      </div>
    )
  }

  // 1 hour or more: hours (primary) + minutes (secondary) + seconds (tertiary)
  return (
    <div className={className}>
      <span className="text-display font-semibold opacity-100">{hours}</span>
      <span
        className="font-light opacity-50"
        style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
      >
        {minutes}
      </span>
      <span
        className="font-light opacity-25"
        style={{ fontSize: 'calc(var(--text-display-size) * 0.72)' }}
      >
        {seconds}
      </span>
    </div>
  )
}
