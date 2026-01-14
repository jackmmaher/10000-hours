import { motion, AnimatePresence } from 'framer-motion'

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
 * - Stable layout (no position jumping during transitions)
 */

interface UnifiedTimeProps {
  /** Total seconds to display (live cumulative during session) */
  totalSeconds: number
  /** Session elapsed seconds (0, 1, 2... for current session only) */
  sessionSeconds?: number
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
  sessionSeconds = 0,
  showSeconds,
  secondsOpacity,
  breathing,
  className = '',
}: UnifiedTimeProps) {
  // Calculate display values - NO ZERO PADDING
  // Hours and minutes show cumulative total
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  // Seconds show SESSION time (0, 1, 2...) not cumulative
  const seconds = sessionSeconds % 60

  // Base container with layout animation for smooth repositioning
  const containerClasses = `
    flex items-baseline justify-center
    tabular-nums font-serif
    ${breathing ? 'animate-box-breathe' : ''}
    ${className}
  `.trim()

  // Spacing between segments - responsive using em units
  const segmentGap = 'gap-[0.8em] sm:gap-[1em]'

  return (
    <motion.div
      className={`${containerClasses} ${segmentGap}`}
      layout
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Hours segment - only visible when > 0 */}
      <AnimatePresence mode="popLayout">
        {hours > 0 && (
          <motion.span
            key="hours"
            className="text-display font-semibold opacity-100"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {hours}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Minutes segment - styling depends on whether hours are present */}
      <motion.span
        layout
        className={hours > 0 ? 'font-light opacity-60' : 'text-display font-semibold opacity-100'}
        style={hours > 0 ? { fontSize: 'calc(var(--text-display-size) * 0.85)' } : undefined}
        transition={{ duration: 0.3 }}
      >
        {minutes}
      </motion.span>

      {/* Seconds segment - fade in/out synced with breathing */}
      <AnimatePresence mode="popLayout">
        {showSeconds && (
          <motion.span
            key="seconds"
            className="font-light"
            layout
            style={{
              fontSize: 'calc(var(--text-display-size) * 0.72)',
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: secondsOpacity * 0.25,
              x: 0,
            }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            {seconds}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
