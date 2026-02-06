/**
 * IntegrationSilence - Post-chant silence phase
 *
 * The most important missing piece from the Aum Coach: a period of
 * stillness after the final Mm where the meditative state can deepen.
 *
 * Traditional Aum practice includes Turiya (the "fourth state") —
 * silence after the M sound. This is where meditation actually happens.
 *
 * Flow:
 * 1. Screen fades to near-dark over 2 seconds
 * 2. Subtle text: "Let the resonance settle..." fades in
 * 3. 45 seconds of stillness (no scores, no numbers, no ring)
 * 4. Gentle text: "When you're ready, tap anywhere"
 * 5. User taps → transition to results (or continues sitting)
 *
 * If user doesn't tap for 5+ minutes, auto-transition to results.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IntegrationSilenceProps {
  onComplete: () => void
  durationMs?: number
}

const DEFAULT_DURATION_MS = 45_000 // 45 seconds of silence
const AUTO_END_MS = 300_000 // 5 minutes auto-transition
const PROMPT_DELAY_MS = 30_000 // Show "tap when ready" after 30s
const FADE_IN_DELAY_MS = 2000 // Text appears after 2s

export function IntegrationSilence({
  onComplete,
  durationMs = DEFAULT_DURATION_MS,
}: IntegrationSilenceProps) {
  const [showText, setShowText] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [canTap, setCanTap] = useState(false)

  // Fade in the main text after initial darkness
  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), FADE_IN_DELAY_MS)
    return () => clearTimeout(textTimer)
  }, [])

  // Enable tapping after minimum silence duration
  useEffect(() => {
    const tapTimer = setTimeout(() => setCanTap(true), Math.min(durationMs, 10_000))
    return () => clearTimeout(tapTimer)
  }, [durationMs])

  // Show "tap when ready" prompt after longer silence
  useEffect(() => {
    const promptTimer = setTimeout(() => setShowPrompt(true), PROMPT_DELAY_MS)
    return () => clearTimeout(promptTimer)
  }, [])

  // Auto-end safety valve (5 minutes)
  useEffect(() => {
    const autoTimer = setTimeout(onComplete, AUTO_END_MS)
    return () => clearTimeout(autoTimer)
  }, [onComplete])

  const handleTap = useCallback(() => {
    if (canTap) {
      onComplete()
    }
  }, [canTap, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ backgroundColor: 'var(--bg-base, #000)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: 'easeIn' }}
      onClick={handleTap}
    >
      {/* Main text — appears after 2s fade */}
      <AnimatePresence>
        {showText && (
          <motion.p
            className="font-serif text-xl text-center px-8"
            style={{ color: 'var(--text-primary)', opacity: 0.4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 3, ease: 'easeOut' }}
          >
            Let the resonance settle...
          </motion.p>
        )}
      </AnimatePresence>

      {/* "Tap when ready" prompt — appears after 30s */}
      <AnimatePresence>
        {showPrompt && (
          <motion.p
            className="absolute bottom-16 text-sm text-center px-8 safe-area-bottom"
            style={{ color: 'var(--text-tertiary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            Tap anywhere when you're ready
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
