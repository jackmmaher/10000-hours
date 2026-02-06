/**
 * CommitmentEmergencyExit - Reflective exit flow for active commitments
 *
 * Offers three paths: pause, adjust schedule, or end commitment.
 * No penalties or hour bank deductions. Archives commitment with stats.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'
import {
  getCommitmentSettings,
  updateCommitmentSettings,
  archiveCommitment,
  resetCommitmentSettings,
} from '../lib/db/commitmentSettings'
import type { CommitmentSettings } from '../lib/db/types'

interface CommitmentEmergencyExitProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  onAdjustSchedule?: () => void
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

export function CommitmentEmergencyExit({
  isOpen,
  onClose,
  onComplete,
  onAdjustSchedule,
}: CommitmentEmergencyExitProps) {
  const haptic = useTapFeedback()
  const [settings, setSettings] = useState<CommitmentSettings | null>(null)
  const [reflectionText, setReflectionText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowEndConfirm(false)
      setReflectionText('')
      const loadSettings = async () => {
        const s = await getCommitmentSettings()
        setSettings(s)
      }
      loadSettings()
    }
  }, [isOpen])

  const handlePause = useCallback(async () => {
    if (!settings || isProcessing) return

    setIsProcessing(true)
    haptic.medium()

    try {
      const now = Date.now()
      const pauseEnd = now + 7 * 24 * 60 * 60 * 1000 // 7 days from now

      await updateCommitmentSettings({
        isPaused: true,
        pauseStartDate: now,
        pauseEndDate: pauseEnd,
        totalPauseDays: settings.totalPauseDays + 7,
        // Extend commitment end date by 7 days
        commitmentEndDate: settings.commitmentEndDate + 7 * 24 * 60 * 60 * 1000,
      })

      haptic.success()
      onComplete()
    } catch (error) {
      console.error('Failed to pause commitment:', error)
      haptic.error()
    } finally {
      setIsProcessing(false)
    }
  }, [settings, isProcessing, haptic, onComplete])

  const handleAdjustSchedule = useCallback(() => {
    haptic.light()
    onClose()
    onAdjustSchedule?.()
  }, [haptic, onClose, onAdjustSchedule])

  const handleEndCommitment = useCallback(async () => {
    if (!settings || isProcessing) return

    setIsProcessing(true)
    haptic.warning()

    try {
      const totalRequired = settings.commitmentDuration
      const completed = settings.totalSessionsCompleted
      const completionRate = totalRequired > 0 ? completed / totalRequired : 0

      // Archive without any hour deduction
      await archiveCommitment({
        startDate: settings.commitmentStartDate,
        endDate: Date.now(),
        duration: settings.commitmentDuration,
        completionRate,
        netMinutesChange: 0,
        endReason: 'ended-early',
      })

      // Reset commitment settings to defaults
      await resetCommitmentSettings()

      haptic.success()
      onComplete()
    } catch (error) {
      console.error('Failed to end commitment:', error)
      haptic.error()
    } finally {
      setIsProcessing(false)
    }
  }, [settings, isProcessing, haptic, onComplete])

  // Block touch propagation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  if (!settings?.isActive) {
    return null
  }

  const currentDay = getCurrentDayNumber(settings)
  const completionPercent = Math.round((currentDay / settings.commitmentDuration) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'color-mix(in oklab, var(--bg-deep) 80%, transparent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={handleTouchEvent}
          onTouchMove={handleTouchEvent}
          onTouchEnd={handleTouchEvent}
        >
          <motion.div
            className="rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-base)' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <AnimatePresence mode="wait">
                {!showEndConfirm ? (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Progress summary */}
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                      You've completed {currentDay} of {settings.commitmentDuration} days (
                      {completionPercent}%).
                    </p>
                    <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                      That's real progress.
                    </p>

                    {/* Reflection input */}
                    <div className="mb-5">
                      <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        What would help you continue?
                      </label>
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="Optional"
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      />
                    </div>

                    {/* Option 1: Pause */}
                    <button
                      onClick={handlePause}
                      disabled={isProcessing}
                      className="w-full p-4 rounded-xl text-left mb-3 transition-all active:scale-[0.99] disabled:opacity-50"
                      style={{
                        background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
                        border: '1px solid var(--accent)',
                      }}
                    >
                      <p
                        className="text-sm font-medium mb-0.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Pause for a week
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Freeze all requirements. Your commitment resumes where you left off.
                      </p>
                    </button>

                    {/* Option 2: Adjust schedule */}
                    {onAdjustSchedule && (
                      <button
                        onClick={handleAdjustSchedule}
                        disabled={isProcessing}
                        className="w-full p-4 rounded-xl text-left mb-3 transition-all active:scale-[0.99] disabled:opacity-50"
                        style={{
                          background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
                          border: '1px solid var(--accent)',
                        }}
                      >
                        <p
                          className="text-sm font-medium mb-0.5"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Adjust my schedule
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Change your schedule type or practice window. All progress is preserved.
                        </p>
                      </button>
                    )}

                    {/* Option 3: End commitment */}
                    <button
                      onClick={() => {
                        haptic.light()
                        setShowEndConfirm(true)
                      }}
                      disabled={isProcessing}
                      className="w-full p-4 rounded-xl text-left mb-4 transition-all active:scale-[0.99] disabled:opacity-50"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <p
                        className="text-sm font-medium mb-0.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        End commitment
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Archive this commitment with your progress. No penalties.
                      </p>
                    </button>

                    {/* Cancel */}
                    <button
                      onClick={onClose}
                      className="w-full text-sm transition-opacity hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm-end"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* End commitment confirmation */}
                    <h3
                      className="font-serif text-lg mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      End this commitment?
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Your progress will be saved in your history.
                    </p>

                    {/* Quick stats */}
                    <div
                      className="p-3 rounded-xl mb-5"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Sessions
                          </p>
                          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {settings.totalSessionsCompleted}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Days
                          </p>
                          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {currentDay}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          haptic.light()
                          setShowEndConfirm(false)
                        }}
                        disabled={isProcessing}
                        className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
                        style={{
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleEndCommitment}
                        disabled={isProcessing}
                        className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
                        style={{
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {isProcessing ? 'Ending...' : 'End commitment'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
