import { motion, AnimatePresence } from 'framer-motion'

/**
 * UnifiedTime - Single unified time display
 *
 * Typography hierarchy:
 * - Hours: text-display, font-semibold, opacity-100
 * - Minutes (with hours): 0.85em, font-light, opacity-60
 * - Minutes (no hours): text-display, font-semibold, opacity-100
 * - Seconds: 0.72em, font-light, opacity-25
 *
 * CRITICAL LAYOUT RULES:
 * - NO `layout` props (causes animation fighting)
 * - Tabular lining figures (font-variant-numeric: tabular-nums lining-nums)
 * - Fixed-width segments using `min-width: Xch`
 * - Right-aligned text so 9→10 doesn't shift
 * - Breathing animation on OUTER wrapper only
 */

interface UnifiedTimeProps {
  totalSeconds: number
  sessionSeconds?: number
  showSeconds: boolean
  secondsOpacity: number
  breathing: boolean
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
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = sessionSeconds % 60

  return (
    // OUTER: Breathing animation wrapper (scale doesn't affect inner layout)
    <div className={breathing ? 'animate-box-breathe' : ''}>
      {/* INNER: Static layout - no layout props, fixed widths, tabular lining figures */}
      <div
        className={`
          flex items-baseline justify-center
          font-serif
          gap-[0.8em] sm:gap-[1em]
          ${className}
        `}
        style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
      >
        {/* Hours - fixed width, right-aligned */}
        <AnimatePresence mode="wait">
          {hours > 0 && (
            <motion.span
              key="hours"
              className="text-display font-semibold text-right"
              style={{ minWidth: '1.5ch' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {hours}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Minutes - fixed width, right-aligned */}
        <span
          className={`text-right ${hours > 0 ? 'font-light opacity-60' : 'text-display font-semibold opacity-100'}`}
          style={{
            minWidth: '2ch',
            fontSize: hours > 0 ? 'calc(var(--text-display-size) * 0.85)' : undefined,
          }}
        >
          {minutes}
        </span>

        {/* Seconds - fixed width, fade only (no position animation) */}
        <AnimatePresence mode="wait">
          {showSeconds && (
            <motion.span
              key="seconds"
              className="font-light text-right"
              style={{
                minWidth: '2ch',
                fontSize: 'calc(var(--text-display-size) * 0.72)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: secondsOpacity * 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4, ease: 'easeInOut' }}
            >
              {seconds}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
