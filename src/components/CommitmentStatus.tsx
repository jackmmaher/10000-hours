/**
 * CommitmentStatus - Progress widget for active commitments
 *
 * Shows commitment progress in Journey or Settings:
 * - "Day X of Y" (progress, NOT streak)
 * - Grace periods remaining
 * - Net minutes earned/lost
 * - End date
 *
 * Designed to be embedded in cards or sections.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getCommitmentSettings } from '../lib/db/commitmentSettings'
import type { CommitmentSettings } from '../lib/db/types'

interface CommitmentStatusProps {
  /** Compact mode hides some details */
  compact?: boolean
  /** Called when user taps to view details */
  onViewDetails?: () => void
}

/**
 * Calculate current day number (1-indexed)
 */
function getCurrentDayNumber(settings: CommitmentSettings): number {
  const startOfDay = (timestamp: number) => {
    const d = new Date(timestamp)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  const today = startOfDay(Date.now())
  const start = startOfDay(settings.commitmentStartDate)
  const daysSinceStart = Math.floor((today - start) / (24 * 60 * 60 * 1000))

  return Math.max(1, Math.min(daysSinceStart + 1, settings.commitmentDuration))
}

/**
 * Format end date as "Mar 15, 2024"
 */
function formatEndDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Calculate days remaining
 */
function getDaysRemaining(settings: CommitmentSettings): number {
  const startOfDay = (timestamp: number) => {
    const d = new Date(timestamp)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  const today = startOfDay(Date.now())
  const end = startOfDay(settings.commitmentEndDate)
  const remaining = Math.ceil((end - today) / (24 * 60 * 60 * 1000))

  return Math.max(0, remaining)
}

export function CommitmentStatus({ compact = false, onViewDetails }: CommitmentStatusProps) {
  const [settings, setSettings] = useState<CommitmentSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await getCommitmentSettings()
        setSettings(s)
      } catch {
        // Silently handle - not active
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  // Don't render if not active or loading
  if (loading || !settings?.isActive) {
    return null
  }

  const currentDay = getCurrentDayNumber(settings)
  const daysRemaining = getDaysRemaining(settings)
  const gracePeriodRemaining = settings.gracePeriodCount - settings.gracePeriodUsed
  const netMinutes = settings.totalBonusMinutesEarned - settings.totalPenaltyMinutesDeducted
  const progressPercent = (currentDay / settings.commitmentDuration) * 100

  const handlePress = () => {
    if (onViewDetails) {
      onViewDetails()
    }
  }

  // Compact mode: single-line display
  if (compact) {
    return (
      <motion.button
        onClick={handlePress}
        className="w-full p-3 rounded-xl text-left transition-all active:scale-[0.99]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Progress circle */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{ color: 'var(--accent)' }}
              >
                {currentDay}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Day {currentDay} of {settings.commitmentDuration}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {daysRemaining} days remaining
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2">
            {gracePeriodRemaining > 0 && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
                  color: 'var(--accent)',
                }}
              >
                {gracePeriodRemaining} grace
              </span>
            )}
            {netMinutes !== 0 && (
              <span
                className="text-xs font-medium"
                style={{
                  color: netMinutes > 0 ? 'var(--success, #22c55e)' : 'var(--danger, #ef4444)',
                }}
              >
                {netMinutes > 0 ? '+' : ''}
                {netMinutes}m
              </span>
            )}
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </motion.button>
    )
  }

  // Full mode: detailed card
  return (
    <motion.div
      className="p-5 rounded-2xl"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Active Commitment
        </h3>
        <span
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
          style={{
            background: 'color-mix(in oklab, var(--success, #22c55e) 10%, transparent)',
            color: 'var(--success, #22c55e)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Active
        </span>
      </div>

      {/* Progress */}
      <div className="text-center mb-4">
        <p className="text-3xl font-serif font-bold" style={{ color: 'var(--accent)' }}>
          Day {currentDay}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          of {settings.commitmentDuration} days
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full mb-4 overflow-hidden"
        style={{ background: 'var(--border-subtle)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--accent)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Grace periods */}
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-base)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {gracePeriodRemaining}
          </p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Grace Left
          </p>
        </div>

        {/* Net minutes */}
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-base)' }}>
          <p
            className="text-lg font-bold"
            style={{
              color:
                netMinutes > 0
                  ? 'var(--success, #22c55e)'
                  : netMinutes < 0
                    ? 'var(--danger, #ef4444)'
                    : 'var(--text-primary)',
            }}
          >
            {netMinutes > 0 ? '+' : ''}
            {netMinutes}
          </p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Net Mins
          </p>
        </div>

        {/* Days remaining */}
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-base)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {daysRemaining}
          </p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Days Left
          </p>
        </div>
      </div>

      {/* End date footer */}
      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Commitment ends
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          {formatEndDate(settings.commitmentEndDate)}
        </span>
      </div>

      {/* View details button */}
      {onViewDetails && (
        <button
          onClick={handlePress}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}
        >
          View Details
        </button>
      )}
    </motion.div>
  )
}
