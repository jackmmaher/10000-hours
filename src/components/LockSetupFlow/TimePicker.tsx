/**
 * TimePicker - Custom styled time picker for setup flow
 *
 * Replaces native select elements with pill-based hour selection
 * and styled minute selector that matches the app's design system.
 */

import { useState, useRef, useEffect } from 'react'
import { useTapFeedback } from '../../hooks/useTapFeedback'

interface TimePickerProps {
  hour: number
  minute: number
  onHourChange: (hour: number) => void
  onMinuteChange: (minute: number) => void
}

// Common time presets for quick selection
const TIME_PRESETS = [
  { label: '6 AM', hour: 6 },
  { label: '7 AM', hour: 7 },
  { label: '8 AM', hour: 8 },
  { label: '9 AM', hour: 9 },
  { label: '12 PM', hour: 12 },
  { label: '6 PM', hour: 18 },
  { label: '8 PM', hour: 20 },
  { label: '9 PM', hour: 21 },
]

const MINUTE_OPTIONS = [0, 15, 30, 45]

export function TimePicker({ hour, minute, onHourChange, onMinuteChange }: TimePickerProps) {
  const haptic = useTapFeedback()
  const [showCustomHour, setShowCustomHour] = useState(false)
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false)
  const minuteRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (minuteRef.current && !minuteRef.current.contains(event.target as Node)) {
        setShowMinuteDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatHour = (h: number) => {
    if (h === 0) return '12 AM'
    if (h < 12) return `${h} AM`
    if (h === 12) return '12 PM'
    return `${h - 12} PM`
  }

  const isPresetHour = TIME_PRESETS.some((p) => p.hour === hour)

  return (
    <div className="space-y-3">
      {/* Hour pills */}
      <div className="flex flex-wrap gap-2">
        {TIME_PRESETS.map((preset) => (
          <button
            key={preset.hour}
            onClick={() => {
              haptic.light()
              setShowCustomHour(false)
              onHourChange(preset.hour)
            }}
            className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] touch-manipulation"
            style={{
              background:
                hour === preset.hour && !showCustomHour
                  ? 'color-mix(in oklab, var(--accent) 15%, transparent)'
                  : 'var(--bg-elevated)',
              border: `1px solid ${hour === preset.hour && !showCustomHour ? 'var(--accent)' : 'var(--border-subtle)'}`,
              color: 'var(--text-primary)',
            }}
          >
            {preset.label}
          </button>
        ))}
        {/* Other hour pill */}
        <button
          onClick={() => {
            haptic.light()
            setShowCustomHour(true)
          }}
          className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] touch-manipulation"
          style={{
            background:
              showCustomHour || (!isPresetHour && hour !== 7)
                ? 'color-mix(in oklab, var(--accent) 15%, transparent)'
                : 'var(--bg-elevated)',
            border: `1px solid ${showCustomHour || (!isPresetHour && hour !== 7) ? 'var(--accent)' : 'var(--border-subtle)'}`,
            color: 'var(--text-primary)',
          }}
        >
          {showCustomHour || !isPresetHour ? formatHour(hour) : 'Other...'}
        </button>
      </div>

      {/* Custom hour selector (shows when "Other" selected) */}
      {(showCustomHour || !isPresetHour) && (
        <div className="flex gap-2 items-center">
          <select
            value={hour}
            onChange={(e) => onHourChange(parseInt(e.target.value))}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium appearance-none cursor-pointer"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent)',
              color: 'var(--text-primary)',
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {formatHour(i)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Minute selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          at
        </span>
        <div className="relative" ref={minuteRef}>
          <button
            onClick={() => {
              haptic.light()
              setShowMinuteDropdown(!showMinuteDropdown)
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] touch-manipulation flex items-center gap-2"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            :{minute.toString().padStart(2, '0')}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ opacity: 0.5 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Minute dropdown */}
          {showMinuteDropdown && (
            <div
              className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-10 min-w-[80px]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {MINUTE_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    haptic.light()
                    onMinuteChange(m)
                    setShowMinuteDropdown(false)
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-black/5 transition-colors"
                  style={{
                    color: minute === m ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: minute === m ? 600 : 400,
                  }}
                >
                  :{m.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
