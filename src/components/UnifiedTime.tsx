import { motion } from 'framer-motion'

/**
 * UnifiedTime - Single unified time display
 *
 * Replaces the dual-layer HemingwayTime architecture.
 * One component that extends (shows seconds) when active
 * and contracts (hides seconds) when resting.
 *
 * Typography hierarchy (preserved from original):
 * - Hours: text-display, font-semibold, opacity-100
 * - Minutes (with hours): 0.85em, font-light, opacity-60
 * - Minutes (no hours): text-display, font-semibold, opacity-100
 * - Seconds: 0.72em, font-light, opacity-25
 *
 * Constraints:
 * - No zero-padding (show 8 not 08)
 * - No colons, no labels
 * - Show 0 at minute boundaries
 */

interface UnifiedTimeProps {
  /** Total seconds to display (live cumulative during session) */
  totalSeconds: number
  /** Whether to show the seconds segment */
  showSeconds: boolean
  /** Opacity of seconds segment (0-1), animated by breath sync */
  secondsOpacity: number
  /** Whether to apply breathing animation */
  breathing: boolean
  /** Additional className for the container */
  className?: string
}

export function UnifiedTime({
  totalSeconds,
  showSeconds,
  secondsOpacity,
  breathing,
  className = '',
}: UnifiedTimeProps) {
  // Calculate display values - NO ZERO PADDING
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  // Base container classes - preserved from HemingwayTime
  const containerClasses = `
    flex items-baseline justify-center gap-[0.5em]
    tabular-nums font-serif
    ${breathing ? 'animate-box-breathe' : ''}
    ${className}
  `.trim()

  return (
    <div className={containerClasses}>
      {/* Hours segment - only visible when > 0 */}
      {hours > 0 && <span className="text-display font-semibold opacity-100">{hours}</span>}

      {/* Minutes segment - styling depends on whether hours are present */}
      <span
        className={hours > 0 ? 'font-light opacity-60' : 'text-display font-semibold opacity-100'}
        style={hours > 0 ? { fontSize: 'calc(var(--text-display-size) * 0.85)' } : undefined}
      >
        {minutes}
      </span>

      {/* Seconds segment - only when active, opacity controlled externally */}
      {showSeconds && (
        <motion.span
          className="font-light"
          style={{
            fontSize: 'calc(var(--text-display-size) * 0.72)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: secondsOpacity * 0.25 }}
          transition={{ duration: 4, ease: 'linear' }}
        >
          {seconds}
        </motion.span>
      )}
    </div>
  )
}
