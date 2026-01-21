/**
 * Screen 7: Apps, Schedule & Reminders
 *
 * "Which apps should require meditation?"
 * - App selection with placeholder icons for browser preview
 * - User-configurable lock window with start/end time pickers
 * - Day-of-week pills (M T W T F S S) + All week option
 * - Reminder toggles with CALCULATED times based on anchor time from Screen 2
 *
 * Per plan spec: "Block window 1: [7:00 AM] to [9:00 AM] + Add another window"
 */

import type { ScreenProps } from '../types'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'
import { isNativePlatform } from '../../../lib/meditationLock'

// Placeholder app data for browser preview
const PLACEHOLDER_APPS = [
  { name: 'Instagram', icon: '📷', color: '#E4405F' },
  { name: 'TikTok', icon: '🎵', color: '#000000' },
  { name: 'X', icon: '𝕏', color: '#1DA1F2' },
  { name: 'YouTube', icon: '▶️', color: '#FF0000' },
  { name: 'Reddit', icon: '🤖', color: '#FF4500' },
  { name: 'Facebook', icon: '👤', color: '#1877F2' },
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Time options for dropdowns
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

export function ScheduleScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()
  const isNative = isNativePlatform()

  // Format time for display
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const formatHour = (h: number) => {
    if (h === 0) return '12 AM'
    if (h < 12) return `${h} AM`
    if (h === 12) return '12 PM'
    return `${h - 12} PM`
  }

  // Calculate reminder times based on anchor time from Screen 2
  const anchorTimeStr = formatTime(formState.anchorTimeHour, formState.anchorTimeMinute)

  // 10 minutes before anchor time
  let reminderHour = formState.anchorTimeHour
  let reminderMinute = formState.anchorTimeMinute - 10
  if (reminderMinute < 0) {
    reminderMinute += 60
    reminderHour -= 1
    if (reminderHour < 0) reminderHour = 23
  }
  const tenMinBeforeStr = formatTime(reminderHour, reminderMinute)

  // Get current window (always at least one)
  const currentWindow = formState.scheduleWindows[0] || {
    startHour: 7,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
  }

  // Update lock window time
  const updateWindowTime = (
    field: 'startHour' | 'startMinute' | 'endHour' | 'endMinute',
    value: number
  ) => {
    const newWindow = { ...currentWindow, [field]: value }
    updateForm({
      scheduleWindows: [newWindow, ...formState.scheduleWindows.slice(1)],
    })
  }

  // Toggle individual day
  const toggleDay = (dayIndex: number) => {
    haptic.light()
    const newDays = [...formState.activeDays]
    newDays[dayIndex] = !newDays[dayIndex]
    updateForm({ activeDays: newDays })
  }

  // All days active check
  const allDaysActive = formState.activeDays.every((d) => d)
  const weekdaysActive =
    formState.activeDays.slice(1, 6).every((d) => d) &&
    !formState.activeDays[0] &&
    !formState.activeDays[6]

  // Set all days
  const setAllDays = () => {
    haptic.light()
    updateForm({ activeDays: [true, true, true, true, true, true, true] })
  }

  // Set weekdays only
  const setWeekdays = () => {
    haptic.light()
    updateForm({ activeDays: [false, true, true, true, true, true, false] })
  }

  // Toggle app selection (for placeholder preview)
  const togglePlaceholderApp = (appName: string) => {
    haptic.light()
    const currentApps = formState.appsToBlock
    if (currentApps.includes(appName)) {
      updateForm({ appsToBlock: currentApps.filter((a) => a !== appName) })
    } else {
      updateForm({ appsToBlock: [...currentApps, appName] })
    }
  }

  return (
    <div className="pt-8 pb-32">
      {/* Title */}
      <h1 className="font-serif text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>
        What apps distract you most?
      </h1>

      {/* Subtitle */}
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Block them until you meditate
      </p>

      {/* App Selection */}
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
        Which apps should require meditation?
      </p>

      {isNative ? (
        // Native: Show button to launch picker
        <button
          onClick={() => {
            // This will launch the native FamilyActivityPicker when connected
            haptic.medium()
          }}
          className="w-full px-4 py-4 rounded-xl text-sm mb-8 text-left"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          {formState.blockedAppTokens.length > 0
            ? `${formState.blockedAppTokens.length} app(s) selected`
            : 'Tap to select apps...'}
        </button>
      ) : (
        // Browser: Show placeholder app grid
        <div className="mb-8">
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Preview only — app selection requires iOS
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PLACEHOLDER_APPS.map((app) => {
              const isSelected = formState.appsToBlock.includes(app.name)
              return (
                <button
                  key={app.name}
                  onClick={() => togglePlaceholderApp(app.name)}
                  className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: isSelected
                      ? 'color-mix(in oklab, var(--accent) 12%, transparent)'
                      : 'var(--bg-elevated)',
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  }}
                >
                  <span className="text-2xl">{app.icon}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {app.name}
                  </span>
                </button>
              )
            })}
          </div>
          {formState.appsToBlock.length > 0 && (
            <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>
              {formState.appsToBlock.length} app
              {formState.appsToBlock.length === 1 ? '' : 's'} selected
            </p>
          )}
        </div>
      )}

      {/* Lock Window - User Configurable */}
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
        When are you most tempted to reach for them?
      </p>

      <div
        className="p-4 rounded-xl mb-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Block window
        </p>
        <div className="flex items-center gap-3">
          {/* Start time */}
          <div className="flex-1">
            <select
              value={currentWindow.startHour}
              onChange={(e) => updateWindowTime('startHour', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <select
              value={currentWindow.startMinute}
              onChange={(e) => updateWindowTime('startMinute', parseInt(e.target.value))}
              className="w-16 px-2 py-2 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  :{m.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            to
          </span>

          {/* End time */}
          <div className="flex-1">
            <select
              value={currentWindow.endHour}
              onChange={(e) => updateWindowTime('endHour', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <select
              value={currentWindow.endMinute}
              onChange={(e) => updateWindowTime('endMinute', parseInt(e.target.value))}
              className="w-16 px-2 py-2 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  :{m.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Helpful context */}
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Your {anchorTimeStr} meditation anchor falls{' '}
          {currentWindow.startHour <= formState.anchorTimeHour &&
          formState.anchorTimeHour < currentWindow.endHour
            ? 'within'
            : 'outside'}{' '}
          this window
        </p>
      </div>

      {/* Schedule - Day Pills */}
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
        Active days
      </p>

      {/* Quick select pills */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={setWeekdays}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: weekdaysActive
              ? 'color-mix(in oklab, var(--accent) 15%, transparent)'
              : 'var(--bg-elevated)',
            border: `1px solid ${weekdaysActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
            color: 'var(--text-primary)',
          }}
        >
          Weekdays
        </button>
        <button
          onClick={setAllDays}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: allDaysActive
              ? 'color-mix(in oklab, var(--accent) 15%, transparent)'
              : 'var(--bg-elevated)',
            border: `1px solid ${allDaysActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
            color: 'var(--text-primary)',
          }}
        >
          Every day
        </button>
      </div>

      {/* Individual day pills */}
      <div className="flex gap-1.5 mb-8">
        {DAY_LABELS.map((label, index) => (
          <button
            key={index}
            onClick={() => toggleDay(index)}
            className="flex-1 aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150 active:scale-[0.95]"
            style={{
              background: formState.activeDays[index] ? 'var(--accent)' : 'var(--bg-elevated)',
              border: `1px solid ${formState.activeDays[index] ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{
                color: formState.activeDays[index]
                  ? 'var(--text-on-accent)'
                  : 'var(--text-primary)',
              }}
            >
              {label}
            </span>
            <span
              className="text-[10px] mt-0.5"
              style={{
                color: formState.activeDays[index]
                  ? 'color-mix(in oklab, var(--text-on-accent) 70%, transparent)'
                  : 'var(--text-muted)',
              }}
            >
              {DAY_NAMES[index]}
            </span>
          </button>
        ))}
      </div>

      {/* Reminders */}
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
        Reminders
      </p>

      {/* Morning reminder - calculated from anchor time */}
      <div
        className="flex items-center justify-between p-4 rounded-xl mb-3"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            10 min before anchor
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {tenMinBeforeStr} (based on your {anchorTimeStr} anchor)
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formState.reminderEnabled}
            onChange={(e) => updateForm({ reminderEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div
            className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
            style={{
              background: formState.reminderEnabled ? 'var(--accent)' : 'var(--border-subtle)',
            }}
          />
        </label>
      </div>

      {/* Evening reminder */}
      <div
        className="flex items-center justify-between p-4 rounded-xl mb-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Evening check-in
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            8:00 PM – Did you meditate today?
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formState.eveningReminderEnabled}
            onChange={(e) => updateForm({ eveningReminderEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div
            className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
            style={{
              background: formState.eveningReminderEnabled
                ? 'var(--accent)'
                : 'var(--border-subtle)',
            }}
          />
        </label>
      </div>

      {/* Helper text */}
      <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
        (You can change these settings anytime)
      </p>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
