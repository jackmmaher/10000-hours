/**
 * PostureSummary - Session results screen
 *
 * Shows:
 * - Session duration
 * - Time in good posture (%)
 * - Number of corrections (haptic alerts)
 * - Encouragement message
 * - Source badge (AirPods/Camera)
 * - Shoulder symmetry card (camera only)
 * - Posture timeline sparkline (camera only)
 * - "Start Meditation" bridge CTA
 */

import { motion } from 'framer-motion'
import type { PostureSessionStats } from '../../hooks/usePosture'
import type { PostureTimelineEntry } from '../../hooks/useCameraPosture'

interface PostureSummaryProps {
  stats: PostureSessionStats
  source?: 'airpods' | 'camera'
  shoulderSymmetryScore?: number
  postureTimeline?: PostureTimelineEntry[]
  onClose: () => void
  onPracticeAgain: () => void
  onStartMeditation?: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) {
    return `${secs}s`
  }
  return `${mins}m ${secs}s`
}

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
  return 'Posture takes practice. You showed up\u2014that matters.'
}

const STATUS_COLORS: Record<string, string> = {
  good: '#22C55E',
  warning: '#F59E0B',
  poor: '#EF4444',
}

function PostureTimelineBar({ timeline }: { timeline: PostureTimelineEntry[] }) {
  if (timeline.length < 2) return null

  const startTime = timeline[0].timestamp
  const endTime = timeline[timeline.length - 1].timestamp
  const totalDuration = endTime - startTime
  if (totalDuration <= 0) return null

  // Build segments
  const segments: { start: number; end: number; status: string }[] = []
  for (let i = 0; i < timeline.length; i++) {
    const start = (timeline[i].timestamp - startTime) / totalDuration
    const end =
      i < timeline.length - 1 ? (timeline[i + 1].timestamp - startTime) / totalDuration : 1
    segments.push({ start, end, status: timeline[i].status })
  }

  return (
    <div className="bg-elevated rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-ink">Posture Timeline</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex bg-ink/10">
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              width: `${(seg.end - seg.start) * 100}%`,
              backgroundColor: STATUS_COLORS[seg.status] || STATUS_COLORS.good,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-ink/40">Start</span>
        <span className="text-[10px] text-ink/40">End</span>
      </div>
    </div>
  )
}

export function PostureSummary({
  stats,
  source,
  shoulderSymmetryScore,
  postureTimeline,
  onClose,
  onPracticeAgain,
  onStartMeditation,
}: PostureSummaryProps) {
  const encouragement = getEncouragementMessage(stats)

  return (
    <div className="h-full flex flex-col">
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

          {/* Source badge */}
          {source && (
            <motion.div
              className="mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-ink/5 text-ink/50">
                {source === 'camera' ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h.5v4a1.5 1.5 0 0 0 3 0v-4H10a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6zm12 0a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h.5v4a1.5 1.5 0 0 0 3 0v-4H22a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-4z" />
                  </svg>
                )}
                {source === 'camera' ? 'Camera' : 'AirPods'}
              </span>
            </motion.div>
          )}

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

            {/* Shoulder symmetry (camera only) */}
            {shoulderSymmetryScore !== undefined && (
              <div className="bg-elevated rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-ink">Shoulder Balance</span>
                  <span className="text-lg font-serif text-ink">{shoulderSymmetryScore}%</span>
                </div>
                <p className="text-[11px] text-ink/50 leading-snug">
                  Symmetry between left and right shoulders
                </p>
              </div>
            )}

            {/* Timeline sparkline (camera only) */}
            {postureTimeline && postureTimeline.length >= 2 && (
              <PostureTimelineBar timeline={postureTimeline} />
            )}
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
            {onStartMeditation && (
              <button
                onClick={onStartMeditation}
                className="w-full h-12 bg-accent/10 hover:bg-accent/20 text-accent font-medium rounded-xl transition-colors"
              >
                Start Meditation
              </button>
            )}
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
