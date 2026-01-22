/**
 * CycleCelebration - Brief celebration overlay for cycle completion
 *
 * Displays:
 * - Green checkmark animation for "locked" cycles (≥70%)
 * - "Cycle X locked!" text
 * - Auto-dismiss after 1.5s
 * - Non-blocking (practice continues)
 *
 * Uses CSS variables for theme-aware styling.
 */

import { useEffect } from 'react'
import type { CycleQuality } from '../../hooks/useGuidedOmCycle'

interface CycleCelebrationProps {
  cycleNumber: number
  quality: CycleQuality
  onDismiss: () => void
}

const CELEBRATION_DURATION_MS = 1500

export function CycleCelebration({ cycleNumber, quality, onDismiss }: CycleCelebrationProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(onDismiss, CELEBRATION_DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  // Haptic feedback if available
  useEffect(() => {
    if (quality.isLocked && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [quality.isLocked])

  // Only show celebration for locked cycles
  if (!quality.isLocked) {
    return null
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-overlay/30"
        style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
      />

      {/* Celebration card */}
      <div
        className="relative bg-elevated rounded-2xl px-8 py-6 shadow-xl"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        {/* Checkmark */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-success-bg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-success-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
              style={{
                strokeDasharray: '0 100',
                animation: 'checkDraw 0.4s ease-out 0.2s forwards',
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">Cycle {cycleNumber} locked!</div>
          <div className="text-sm text-success-text mt-1">{quality.overallScore}% alignment</div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes checkDraw {
          to {
            stroke-dasharray: 100 100;
          }
        }
      `}</style>
    </div>
  )
}
