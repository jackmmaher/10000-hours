/**
 * TimeRangeSlider - Visual time range selector with presets
 *
 * Features:
 * - Quick presets (7d, 30d, 90d, Year, All)
 * - Visual slider for custom range
 * - FREE tier: max 90 days
 * - Shows date range being viewed
 */

import { useMemo, useCallback } from 'react'
import { usePremiumStore } from '../stores/usePremiumStore'
import { formatShortDate } from '../lib/format'

// Preset definitions
const PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'Year', days: 365 },
  { label: 'All', days: null },
] as const

interface TimeRangeSliderProps {
  value: number | null // null = all time
  onChange: (days: number | null) => void
  maxDays?: number // For capping based on first session
  onLockedTap?: () => void
}

export function TimeRangeSlider({
  value,
  onChange,
  maxDays = 3650, // ~10 years default max
  onLockedTap
}: TimeRangeSliderProps) {
  const { isPremiumOrTrial } = usePremiumStore()

  // FREE tier max is 90 days
  const effectiveMax = isPremiumOrTrial ? maxDays : 90

  // Convert days to slider position (0-100)
  // Uses log scale for better distribution
  const daysToPosition = useCallback((days: number | null): number => {
    if (days === null) return 100
    const cappedDays = Math.min(days, effectiveMax)
    // Log scale: 7 days = ~0%, effectiveMax = 100%
    const minLog = Math.log(7)
    const maxLog = Math.log(effectiveMax)
    const dayLog = Math.log(Math.max(7, cappedDays))
    return ((dayLog - minLog) / (maxLog - minLog)) * 100
  }, [effectiveMax])

  // Convert slider position to days
  const positionToDays = useCallback((position: number): number | null => {
    if (position >= 99) return isPremiumOrTrial ? null : effectiveMax
    const minLog = Math.log(7)
    const maxLog = Math.log(effectiveMax)
    const dayLog = minLog + (position / 100) * (maxLog - minLog)
    return Math.round(Math.exp(dayLog))
  }, [effectiveMax, isPremiumOrTrial])

  // Current slider position
  const sliderPosition = useMemo(
    () => daysToPosition(value),
    [value, daysToPosition]
  )

  // Date range text
  const rangeText = useMemo(() => {
    const endDate = new Date()
    if (value === null) {
      return 'All time'
    }
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - value)
    return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`
  }, [value])

  // Handle preset click
  const handlePresetClick = (days: number | null) => {
    if (!isPremiumOrTrial && (days === null || days > 90)) {
      onLockedTap?.()
      return
    }
    onChange(days)
  }

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseFloat(e.target.value)
    const days = positionToDays(position)
    onChange(days)
  }

  // Check if a preset is locked
  const isPresetLocked = (days: number | null) => {
    if (isPremiumOrTrial) return false
    return days === null || days > 90
  }

  // Check if a preset is active
  const isPresetActive = (days: number | null) => {
    if (days === null) return value === null
    if (value === null) return false
    // Allow some tolerance for slider rounding
    return Math.abs(value - days) < 2
  }

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      <div className="flex justify-between gap-1">
        {PRESETS.map((preset) => {
          const locked = isPresetLocked(preset.days)
          const active = isPresetActive(preset.days)

          return (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset.days)}
              className={`
                flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all
                ${active
                  ? 'bg-indigo-deep text-cream'
                  : locked
                    ? 'bg-cream-warm text-indigo-deep/30'
                    : 'bg-cream-warm text-indigo-deep/60 hover:bg-cream-deep'
                }
              `}
            >
              <span className="flex items-center justify-center gap-1">
                {locked && (
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
                {preset.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Slider */}
      <div className="relative py-2">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-indigo-deep/10 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, var(--color-ink) 0%, var(--color-ink) ${sliderPosition}%, rgba(45, 52, 54, 0.1) ${sliderPosition}%, rgba(45, 52, 54, 0.1) 100%)`
          }}
        />

        {/* FREE tier limit marker */}
        {!isPremiumOrTrial && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-deep/30"
            style={{ left: `${daysToPosition(90)}%` }}
            title="Premium unlocks full history"
          />
        )}
      </div>

      {/* Range label */}
      <p className="text-xs text-indigo-deep/40 text-center">
        {rangeText}
        {value !== null && (
          <span className="text-indigo-deep/30 ml-1">
            ({value} day{value !== 1 ? 's' : ''})
          </span>
        )}
      </p>
    </div>
  )
}
