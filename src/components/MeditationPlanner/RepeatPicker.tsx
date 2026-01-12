/**
 * RepeatPicker - Select repeat frequency for planned sessions
 */

import { RepeatFrequency } from '../../lib/db'

interface RepeatPickerProps {
  frequency: RepeatFrequency | null
  customDays: number[]
  onChange: (frequency: RepeatFrequency | null, customDays?: number[]) => void
}

const FREQUENCY_OPTIONS: { value: RepeatFrequency | null; label: string }[] = [
  { value: null, label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'custom', label: 'Custom' },
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function RepeatPicker({ frequency, customDays, onChange }: RepeatPickerProps) {
  const handleFrequencyChange = (newFreq: RepeatFrequency | null) => {
    if (newFreq === 'custom') {
      // Default to current day when switching to custom
      const today = new Date().getDay()
      onChange(newFreq, [today])
    } else {
      onChange(newFreq)
    }
  }

  const toggleDay = (day: number) => {
    const newDays = customDays.includes(day)
      ? customDays.filter((d) => d !== day)
      : [...customDays, day].sort()

    // Don't allow empty selection
    if (newDays.length > 0) {
      onChange('custom', newDays)
    }
  }

  return (
    <div>
      <label className="text-xs text-ink-soft block mb-2">Repeat</label>

      {/* Frequency options */}
      <div className="flex flex-wrap gap-2 mb-3">
        {FREQUENCY_OPTIONS.map((opt) => (
          <button
            key={opt.value ?? 'never'}
            type="button"
            onClick={() => handleFrequencyChange(opt.value)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
              frequency === opt.value
                ? 'bg-accent text-on-accent'
                : 'bg-deep/50 text-ink-soft hover:bg-deep'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom day selector */}
      {frequency === 'custom' && (
        <div className="flex gap-2 animate-fade-in">
          {DAY_LABELS.map((label, dayIndex) => (
            <button
              key={dayIndex}
              type="button"
              onClick={() => toggleDay(dayIndex)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                customDays.includes(dayIndex)
                  ? 'bg-accent text-on-accent'
                  : 'bg-deep/30 text-ink-soft hover:bg-deep/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      {frequency && frequency !== 'custom' && (
        <p className="text-xs text-ink/40 mt-2">
          {frequency === 'daily' && 'Every day'}
          {frequency === 'weekly' && 'Same day each week'}
          {frequency === 'weekdays' && 'Monday through Friday'}
        </p>
      )}
    </div>
  )
}
