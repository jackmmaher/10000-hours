/**
 * PostureSummary - Session results screen
 *
 * Shows:
 * - Session duration
 * - Time in good posture (%)
 * - Number of corrections (haptic alerts)
 * - Encouragement message
 */

import { motion } from 'framer-motion'
import type { PostureSessionStats } from '../../hooks/usePosture'

interface PostureSummaryProps {
  stats: PostureSessionStats
  onClose: () => void
  onPracticeAgain: () => void
}

/**
 * Format seconds as "Xm Ys" (e.g., 522 seconds = "8m 42s")
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) {
    return `${secs}s`
  }
  return `${mins}m ${secs}s`
}

/**
 * Get encouragement message based on stats
 */
function getEncouragementMessage(stats: PostureSessionStats): string {
  const { goodPosturePercent, correctionCount } = stats

  if (goodPosturePercent >= 90) {
    return 'Excellent posture! Your spine thanks you.'
  }
  if (goodPosturePercent >= 75) {
    return 'Great session. Your awareness is building.'
  }
  if (goodPosturePercent >= 50) {
    return 'Good effort. Each reminder strengthens the habit.'
  }
  if (correctionCount <= 3) {
    return 'Every session builds awareness. Keep practicing.'
  }
  return 'Posture takes practice. You showed up—that matters.'
}

export function PostureSummary({ stats, onClose, onPracticeAgain }: PostureSummaryProps) {
  const encouragement = getEncouragementMessage(stats)

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center px-6 py-6">
          {/* Header */}
          <motion.div
            className="w-16 h-16 rounded-full bg-[#F97316]/10 flex items-center justify-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <svg
              className="w-8 h-8 text-[#F97316]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <motion.h1
            className="font-serif text-2xl text-ink mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Session Complete
          </motion.h1>

          <motion.p
            className="text-ink/60 text-center mb-8 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {encouragement}
          </motion.p>

          {/* Stats cards */}
          <motion.div
            className="w-full max-w-sm space-y-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Duration */}
            <div className="bg-elevated rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-ink">Duration</span>
                <span className="text-lg font-serif text-ink">
                  {formatDuration(stats.totalSeconds)}
                </span>
              </div>
              <p className="text-[11px] text-ink/50 leading-snug">
                Total time with posture tracking active
              </p>
            </div>

            {/* Good Posture Percentage */}
            <div className="bg-elevated rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-ink">Good Posture</span>
                <span className="text-lg font-serif text-ink">{stats.goodPosturePercent}%</span>
              </div>
              <div className="mb-2">
                {/* Progress bar */}
                <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        stats.goodPosturePercent >= 75
                          ? '#22C55E'
                          : stats.goodPosturePercent >= 50
                            ? '#F59E0B'
                            : '#EF4444',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.goodPosturePercent}%` }}
                    transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-ink/50 leading-snug">
                Time spent within good posture range
              </p>
            </div>

            {/* Corrections */}
            <div className="bg-elevated rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-ink">Corrections</span>
                <span className="text-lg font-serif text-ink">{stats.correctionCount}</span>
              </div>
              <p className="text-[11px] text-ink/50 leading-snug">
                {stats.correctionCount === 0
                  ? 'No haptic reminders needed'
                  : stats.correctionCount === 1
                    ? 'Gentle reminder to sit up straight'
                    : 'Gentle reminders to sit up straight'}
              </p>
            </div>
          </motion.div>

          {/* Good Posture Time */}
          <motion.div
            className="w-full max-w-sm bg-[#F97316]/5 border border-[#F97316]/20 rounded-xl p-5 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="text-center">
              <p className="text-3xl font-serif text-ink mb-1">
                {formatDuration(stats.goodPostureSeconds)}
              </p>
              <p className="text-sm text-ink/60">of aligned, mindful sitting</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="w-full max-w-sm space-y-3 pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <button
              onClick={onPracticeAgain}
              className="w-full h-12 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium rounded-xl transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={onClose}
              className="w-full h-12 text-ink/70 hover:text-ink font-medium transition-colors"
            >
              Done
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
