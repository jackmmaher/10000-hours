/**
 * CycleCelebration - Subtle haptic feedback for locked cycles
 *
 * Replaces the previous modal overlay approach with non-intrusive feedback
 * that doesn't break meditative immersion:
 * - Gentle haptic pulse for "locked" cycles (≥70%)
 * - No visual overlay, no modal, no text interruption
 * - Auto-dismiss after brief duration
 * - Practice continues uninterrupted
 */

import { useEffect } from 'react'
import type { CycleQuality } from '../../hooks/useGuidedOmCycle'

interface CycleCelebrationProps {
  cycleNumber: number
  quality: CycleQuality
  onDismiss: () => void
}

const CELEBRATION_DURATION_MS = 300

export function CycleCelebration({
  cycleNumber: _cycleNumber,
  quality,
  onDismiss,
}: CycleCelebrationProps) {
  void _cycleNumber

  // Auto-dismiss quickly — no visual to linger
  useEffect(() => {
    const timer = setTimeout(onDismiss, CELEBRATION_DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  // Haptic feedback only — no visual disruption during meditation
  useEffect(() => {
    if (quality.isLocked && 'vibrate' in navigator) {
      // Two gentle pulses for locked cycle
      navigator.vibrate([40, 60, 40])
    }
  }, [quality.isLocked])

  // No visual rendering — the celebration is felt, not seen
  return null
}
