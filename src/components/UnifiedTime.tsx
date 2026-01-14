import { motion } from 'framer-motion'

/**
 * UnifiedTime - Digital Swiss timer display
 *
 * Format: HH MM SS (always zero-padded)
 * Example: 00 16 00 → 00 16 01 → 00 16 02 ...
 *
 * Typography hierarchy:
 * - Hours: text-display, font-semibold, opacity-100
 * - Minutes: 0.85em, font-light, opacity-60
 * - Seconds: 0.72em, font-light, opacity-25 (when visible)
 *
 * CRITICAL LAYOUT RULES:
 * - Zero-padding on all values (00, 01, 02...)
 * - All segments ALWAYS rendered (hours, minutes, seconds)
 * - Tabular lining figures (fixed-width digits)
 * - Seconds space always reserved, just invisible until active
 * - Breathing animation on OUTER wrapper only
 * - NO layout props (prevents animation fighting)
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

  // Zero-pad all values for fixed-width display
  const hoursDisplay = String(hours).padStart(2, '0')
  const minutesDisplay = String(minutes).padStart(2, '0')
  const secondsDisplay = String(seconds).padStart(2, '0')

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
        {/* Hours - always visible with zero-padding */}
        <span className="text-display font-semibold text-right" style={{ minWidth: '2ch' }}>
          {hoursDisplay}
        </span>

        {/* Minutes - always visible with zero-padding */}
        <span
          className="text-right font-light opacity-60"
          style={{
            minWidth: '2ch',
            fontSize: 'calc(var(--text-display-size) * 0.85)',
          }}
        >
          {minutesDisplay}
        </span>

        {/* Seconds - ALWAYS rendered, space always reserved, just invisible until active */}
        <motion.span
          className="font-light text-right"
          style={{
            minWidth: '2ch',
            fontSize: 'calc(var(--text-display-size) * 0.72)',
          }}
          initial={false}
          animate={{ opacity: showSeconds ? secondsOpacity * 0.25 : 0 }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        >
          {secondsDisplay}
        </motion.span>
      </div>
    </div>
  )
}
