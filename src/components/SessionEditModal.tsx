/**
 * SessionEditModal - Edit or delete a completed meditation session
 *
 * Allows users to:
 * - Edit session date/time
 * - Edit duration
 * - Edit metadata (pose, discipline, notes)
 * - Delete the session entirely
 */

import { useState, useCallback } from 'react'
import { Session, updateSessionFull, deleteSession } from '../lib/db'
import { formatDuration } from '../lib/format'

interface SessionEditModalProps {
  session: Session
  onClose: () => void
  onSave: () => void
  onDelete: () => void
}

function formatDateForInput(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toISOString().split('T')[0]
}

function formatTimeForInput(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function SessionEditModal({ session, onClose, onSave, onDelete }: SessionEditModalProps) {
  // Parse initial values
  const [date, setDate] = useState(formatDateForInput(session.startTime))
  const [startTime, setStartTime] = useState(formatTimeForInput(session.startTime))
  const [durationMinutes, setDurationMinutes] = useState(
    Math.round(session.durationSeconds / 60)
  )
  const [pose, setPose] = useState(session.pose || '')
  const [discipline, setDiscipline] = useState(session.discipline || '')
  const [notes, setNotes] = useState(session.notes || '')

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // Parse date and time into timestamps
      const [year, month, day] = date.split('-').map(Number)
      const [hours, minutes] = startTime.split(':').map(Number)

      const newStartTime = new Date(year, month - 1, day, hours, minutes).getTime()
      const durationSeconds = durationMinutes * 60
      const newEndTime = newStartTime + (durationSeconds * 1000)

      await updateSessionFull(session.uuid, {
        startTime: newStartTime,
        endTime: newEndTime,
        durationSeconds,
        pose: pose || undefined,
        discipline: discipline || undefined,
        notes: notes || undefined
      })

      onSave()
    } catch (err) {
      console.error('Failed to update session:', err)
    } finally {
      setIsSaving(false)
    }
  }, [session.uuid, date, startTime, durationMinutes, pose, discipline, notes, onSave])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      await deleteSession(session.uuid)
      onDelete()
    } catch (err) {
      console.error('Failed to delete session:', err)
    } finally {
      setIsDeleting(false)
    }
  }, [session.uuid, onDelete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)] backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-xl"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="text-lg font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Edit Session
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Original duration display */}
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Original: {formatDuration(session.durationSeconds)} on{' '}
            {new Date(session.startTime).toLocaleDateString()}
          </p>

          {/* Date */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-deep)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          {/* Start time */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-deep)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          {/* Duration */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="720"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-deep)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          {/* Pose */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Pose (optional)
            </label>
            <input
              type="text"
              value={pose}
              onChange={(e) => setPose(e.target.value)}
              placeholder="e.g., Full lotus, Half lotus, Chair"
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-deep)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          {/* Discipline */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Discipline (optional)
            </label>
            <input
              type="text"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              placeholder="e.g., Vipassana, Zen, Breath focus"
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-deep)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes or intention..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: 'var(--bg-deep)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {/* Delete button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444'
            }}
          >
            Delete
          </button>

          <div className="flex-1" />

          {/* Cancel */}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-deep)',
              color: 'var(--text-secondary)'
            }}
          >
            Cancel
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--text-on-accent)'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[var(--bg-overlay)]">
          <div
            className="mx-6 p-6 rounded-2xl max-w-sm w-full shadow-xl"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Delete this session?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-muted)' }}
            >
              This will remove {formatDuration(session.durationSeconds)} from your total meditation time. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-deep)',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#EF4444',
                  color: 'white'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
