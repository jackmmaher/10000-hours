/**
 * CommitmentEmergencyExit - Early exit flow for active commitments
 *
 * Safety valve that allows users to exit a commitment early, with a cost.
 * Cost formula: (days_remaining / total_days) * base_fee
 * Base fees: 30-day = 1h, 60-day = 2h, 90-day = 3h
 *
 * Requires 3 confirmations before executing to prevent accidents.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'
import {
  getCommitmentSettings,
  updateCommitmentSettings,
  archiveCommitment,
} from '../lib/db/commitmentSettings'
import { consumeCommitmentPenalty } from '../lib/hourBank'
import type { CommitmentSettings } from '../lib/db/types'

interface CommitmentEmergencyExitProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

/**
 * Get base exit cost in hours based on commitment duration
 */
function getBaseCostHours(duration: 30 | 60 | 90): number {
  switch (duration) {
    case 30:
      return 1
    case 60:
      return 2
    case 90:
      return 3
    default:
      return 1
  }
}

/**
 * Calculate pro-rated exit cost
 * Cost decreases as you progress through the commitment
 */
function calculateExitCost(settings: CommitmentSettings): number {
  const now = Date.now()
  const start = settings.commitmentStartDate
  const end = settings.commitmentEndDate
  const total = end - start
  const elapsed = Math.max(0, now - start)
  const remaining = Math.max(0, total - elapsed)

  const baseCostHours = getBaseCostHours(settings.commitmentDuration)
  const proportionRemaining = remaining / total

  // Cost in minutes, rounded to nearest 5
  const costMinutes = Math.round((baseCostHours * 60 * proportionRemaining) / 5) * 5

  return Math.max(5, costMinutes) // Minimum 5 minutes
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

const CONFIRMATION_STEPS = [
  {
    title: 'Are you sure?',
    message: "Exiting early means you'll lose time from your hour bank.",
    buttonText: 'Yes, show me the cost',
  },
  {
    title: 'This will cost you',
    message: '', // Filled dynamically
    buttonText: 'I understand the cost',
  },
  {
    title: 'Final confirmation',
    message: 'This cannot be undone. Your commitment will end immediately.',
    buttonText: 'Exit commitment now',
  },
]

export function CommitmentEmergencyExit({
  isOpen,
  onClose,
  onComplete,
}: CommitmentEmergencyExitProps) {
  const haptic = useTapFeedback()
  const [settings, setSettings] = useState<CommitmentSettings | null>(null)
  const [step, setStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [exitCostMinutes, setExitCostMinutes] = useState(0)

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(0)
      const loadSettings = async () => {
        const s = await getCommitmentSettings()
        setSettings(s)
        if (s.isActive) {
          setExitCostMinutes(calculateExitCost(s))
        }
      }
      loadSettings()
    }
  }, [isOpen])

  const handleBack = useCallback(() => {
    haptic.light()
    if (step > 0) {
      setStep(step - 1)
    } else {
      onClose()
    }
  }, [step, haptic, onClose])

  const handleNext = useCallback(async () => {
    haptic.medium()

    if (step < CONFIRMATION_STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    // Final step - execute exit
    if (!settings) return

    setIsProcessing(true)

    try {
      // Calculate completion rate
      const totalRequired = settings.commitmentDuration // Simplified - actual calculation would account for schedule
      const completed = settings.totalSessionsCompleted
      const completionRate = completed / totalRequired

      // Deduct exit cost from hour bank
      const costHours = exitCostMinutes / 60
      await consumeCommitmentPenalty(costHours)

      // Archive the commitment
      await archiveCommitment({
        startDate: settings.commitmentStartDate,
        endDate: Date.now(),
        duration: settings.commitmentDuration,
        completionRate,
        netMinutesChange:
          settings.totalBonusMinutesEarned - settings.totalPenaltyMinutesDeducted - exitCostMinutes,
        endReason: 'emergency-exit',
      })

      // Deactivate commitment
      await updateCommitmentSettings({
        isActive: false,
      })

      haptic.success()
      onComplete()
    } catch (error) {
      console.error('Failed to process emergency exit:', error)
      haptic.error()
    } finally {
      setIsProcessing(false)
    }
  }, [step, settings, exitCostMinutes, haptic, onComplete])

  // Block touch propagation to prevent swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  if (!settings?.isActive) {
    return null
  }

  const currentDay = getCurrentDayNumber(settings)
  const daysRemaining = getDaysRemaining(settings)
  const currentStepConfig = CONFIRMATION_STEPS[step]

  // Dynamic message for step 2 (cost display)
  const stepMessage =
    step === 1
      ? `You're on day ${currentDay} of ${settings.commitmentDuration} with ${daysRemaining} days remaining.`
      : currentStepConfig.message

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
            {/* Header */}
            <div
              className="p-5 border-b"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'color-mix(in oklab, var(--danger, #ef4444) 5%, transparent)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: 'color-mix(in oklab, var(--danger, #ef4444) 15%, transparent)',
                  }}
                >
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>
                </div>
                <div>
                  <h2 className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>
                    Emergency Exit
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Step {step + 1} of {CONFIRMATION_STEPS.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3
                    className="text-xl font-serif font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentStepConfig.title}
                  </h3>

                  {/* Cost display for step 2 */}
                  {step === 1 && (
                    <div
                      className="p-4 rounded-xl mb-4"
                      style={{
                        background: 'color-mix(in oklab, var(--danger, #ef4444) 10%, transparent)',
                        border:
                          '1px solid color-mix(in oklab, var(--danger, #ef4444) 30%, transparent)',
                      }}
                    >
                      <p
                        className="text-3xl font-bold text-center"
                        style={{ color: 'var(--danger, #ef4444)' }}
                      >
                        -{exitCostMinutes} min
                      </p>
                      <p
                        className="text-xs text-center mt-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        from your hour bank
                      </p>
                    </div>
                  )}

                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {stepMessage}
                  </p>

                  {/* Progress summary (shown on final step) */}
                  {step === 2 && (
                    <div
                      className="p-3 rounded-xl mb-4"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Sessions completed
                          </p>
                          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {settings.totalSessionsCompleted}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Days completed
                          </p>
                          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {currentDay - 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer buttons */}
            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={handleNext}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  background:
                    step === CONFIRMATION_STEPS.length - 1
                      ? 'var(--danger, #ef4444)'
                      : 'var(--accent)',
                  color: 'var(--text-on-accent)',
                }}
              >
                {isProcessing ? 'Processing...' : currentStepConfig.buttonText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
