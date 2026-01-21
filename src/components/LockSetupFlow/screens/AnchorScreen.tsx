/**
 * Screen 2: Anchor Routine (Implementation Intentions)
 *
 * "When will you meditate?"
 * "I will meditate immediately after I..."
 * "Where will you do this?"
 * "What time is that usually?"
 * "If I miss my anchor, I will meditate after..."
 */

import { useState } from 'react'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { TimePicker } from '../TimePicker'
import { Button } from '../../Button'

const ANCHOR_OPTIONS = [
  'wake up',
  'pour my coffee',
  'brush my teeth',
  'finish my workout',
  'get home from work',
]

const LOCATION_OPTIONS = ['bedroom', 'living room', 'office', 'car']

const BACKUP_OPTIONS = ['lunch', 'dinner']

export function AnchorScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const [customAnchor, setCustomAnchor] = useState('')
  const [showCustomAnchor, setShowCustomAnchor] = useState(false)
  const [customLocation, setCustomLocation] = useState('')
  const [showCustomLocation, setShowCustomLocation] = useState(false)
  const [customBackup, setCustomBackup] = useState('')
  const [showCustomBackup, setShowCustomBackup] = useState(false)

  const canContinue =
    formState.anchorRoutine.trim().length > 0 && formState.anchorLocation.trim().length > 0

  return (
    <div className="pt-8">
      {/* Title */}
      <h1 className="font-serif text-2xl mb-8" style={{ color: 'var(--text-primary)' }}>
        When will you meditate?
      </h1>

      {/* Anchor routine */}
      <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
        "I will meditate immediately after I..."
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {ANCHOR_OPTIONS.map((option) => (
          <SelectionPill
            key={option}
            label={option}
            selected={formState.anchorRoutine === option && !showCustomAnchor}
            onSelect={() => {
              setShowCustomAnchor(false)
              updateForm({ anchorRoutine: option })
            }}
          />
        ))}
        <SelectionPill
          label={showCustomAnchor && customAnchor ? customAnchor : 'Custom...'}
          selected={showCustomAnchor}
          onSelect={() => {
            setShowCustomAnchor(true)
            updateForm({ anchorRoutine: customAnchor })
          }}
        />
      </div>
      {showCustomAnchor && (
        <input
          type="text"
          value={customAnchor}
          onChange={(e) => {
            setCustomAnchor(e.target.value)
            updateForm({ anchorRoutine: e.target.value })
          }}
          placeholder="enter your anchor routine..."
          autoFocus
          className="w-full px-4 py-3 rounded-xl text-sm mb-6"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      )}

      {/* Location */}
      <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
        "Where will you do this?"
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {LOCATION_OPTIONS.map((option) => (
          <SelectionPill
            key={option}
            label={option}
            selected={formState.anchorLocation === option && !showCustomLocation}
            onSelect={() => {
              setShowCustomLocation(false)
              updateForm({ anchorLocation: option })
            }}
          />
        ))}
        <SelectionPill
          label={showCustomLocation && customLocation ? customLocation : 'Custom...'}
          selected={showCustomLocation}
          onSelect={() => {
            setShowCustomLocation(true)
            updateForm({ anchorLocation: customLocation })
          }}
        />
      </div>
      {showCustomLocation && (
        <input
          type="text"
          value={customLocation}
          onChange={(e) => {
            setCustomLocation(e.target.value)
            updateForm({ anchorLocation: e.target.value })
          }}
          placeholder="enter your location..."
          className="w-full px-4 py-3 rounded-xl text-sm mb-6"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      )}

      {/* Time picker - dynamic question based on anchor */}
      <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
        "When do you usually{' '}
        <span style={{ color: 'var(--accent)' }}>{formState.anchorRoutine || 'do this'}</span>
        ?"
      </p>
      <div className="mb-6">
        <TimePicker
          hour={formState.anchorTimeHour}
          minute={formState.anchorTimeMinute}
          onHourChange={(hour) => updateForm({ anchorTimeHour: hour })}
          onMinuteChange={(minute) => updateForm({ anchorTimeMinute: minute })}
        />
      </div>

      {/* Backup anchor */}
      <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
        "If I miss my anchor, I will meditate after..."
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {BACKUP_OPTIONS.map((option) => (
          <SelectionPill
            key={option}
            label={option}
            selected={formState.backupAnchor === option && !showCustomBackup}
            onSelect={() => {
              setShowCustomBackup(false)
              updateForm({ backupAnchor: option })
            }}
          />
        ))}
        <SelectionPill
          label={showCustomBackup && customBackup ? customBackup : 'Custom...'}
          selected={showCustomBackup}
          onSelect={() => {
            setShowCustomBackup(true)
            updateForm({ backupAnchor: customBackup })
          }}
        />
        <SelectionPill
          label="Skip backup"
          selected={formState.backupAnchor === null && !showCustomBackup}
          onSelect={() => {
            setShowCustomBackup(false)
            updateForm({ backupAnchor: null })
          }}
        />
      </div>
      {showCustomBackup && (
        <input
          type="text"
          value={customBackup}
          onChange={(e) => {
            setCustomBackup(e.target.value)
            updateForm({ backupAnchor: e.target.value })
          }}
          placeholder="enter your backup..."
          className="w-full px-4 py-3 rounded-xl text-sm mb-6"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      )}

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={onNext} disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
