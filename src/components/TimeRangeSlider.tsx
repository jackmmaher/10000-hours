/**
 * TimeRangeSlider - Visual time range selector with presets
 *
 * Features:
 * - Quick presets (7d, 30d, 90d, Year, All)
 * - Visual slider for custom range
 * - Shows date range being viewed
 */

import { useMemo, useCallback } from 'react'
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
}

export function TimeRangeSlider({
  value,
  onChange,
  maxDays = 3650 // ~10 years default max
}: TimeRangeSliderProps) {
  // Convert days to slider position (0-100)
  // Uses log scale for better distribution
  const daysToPosition = useCallback((days: number | null): number => {
    if (days === null) return 100
    const cappedDays = Math.min(days, maxDays)
    // Log scale: 7 days = ~0%, maxDays = 100%
    const minLog = Math.log(7)
    const maxLog = Math.log(maxDays)
    const dayLog = Math.log(Math.max(7, cappedDays))
    return ((dayLog - minLog) / (maxLog - minLog)) * 100
  }, [maxDays])

  // Convert slider position to days
  const positionToDays = useCallback((position: number): number | null => {
    if (position >= 99) return null
    const minLog = Math.log(7)
    const maxLog = Math.log(maxDays)
    const dayLog = minLog + (position / 100) * (maxLog - minLog)
    return Math.round(Math.exp(dayLog))
  }, [maxDays])

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

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseFloat(e.target.value)
    const days = positionToDays(position)
    onChange(days)
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
          const active = isPresetActive(preset.days)

          return (
            <button
              key={preset.label}
              onClick={() => onChange(preset.days)}
              className={`
                flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all
                ${active
                  ? 'bg-indigo-deep text-cream'
                  : 'bg-cream-warm text-indigo-deep/60 hover:bg-cream-deep'
                }
              `}
            >
              {preset.label}
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
            background: `linear-gradient(to right, var(--text-primary) 0%, var(--text-primary) ${sliderPosition}%, rgba(45, 52, 54, 0.1) ${sliderPosition}%, rgba(45, 52, 54, 0.1) 100%)`
          }}
        />
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
