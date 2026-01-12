import { motion, AnimatePresence } from 'framer-motion'
import { transitions } from '../lib/motion'

interface AnimatedDigitProps {
  /** The digit/number value to display */
  value: string
  /** Shared layout ID for FLIP animations across states */
  layoutId: string
  /** Additional CSS classes */
  className?: string
  /** Inline styles for sizing */
  style?: React.CSSProperties
}

/**
 * AnimatedDigit - Single digit/number with rolling animation
 *
 * Uses AnimatePresence to animate digit changes with a vertical slide,
 * creating a "rolling counter" effect like airport departure boards.
 *
 * The layoutId allows this digit to morph position when switching
 * between cumulative and active timer modes.
 */
export function AnimatedDigit({ value, layoutId, className = '', style }: AnimatedDigitProps) {
  return (
    <motion.span
      layoutId={layoutId}
      className={`inline-block overflow-hidden ${className}`.trim()}
      style={style}
      layout
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={transitions.digitRoll}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}
