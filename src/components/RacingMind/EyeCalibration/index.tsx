/**
 * EyeCalibration - Main calibration flow orchestrator
 *
 * Flow:
 * 1. Phone Positioning - Setup instructions
 * 2. Calibration Grid - 9-point tap calibration
 * 3. Validation Check - Accuracy verification
 * 4. Complete or retry
 */

import { useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEyeCalibration, type CalibrationPhase } from '../useEyeCalibration'
import { PhonePositioning } from './PhonePositioning'
import { CalibrationGrid } from './CalibrationGrid'
import { ValidationCheck } from './ValidationCheck'

interface EyeCalibrationProps {
  onComplete: () => void
  onSkip: () => void
}

export function EyeCalibration({ onComplete, onSkip }: EyeCalibrationProps) {
  const {
    phase,
    calibrationPoints,
    currentPointIndex,
    validationResult,
    error,
    startCalibration,
    handlePointTap,
    runValidation,
    completeCalibration,
    resetCalibration,
    skipCalibration,
    setPhase,
  } = useEyeCalibration()

  // Start in positioning phase
  useEffect(() => {
    if (phase === 'idle') {
      setPhase('positioning')
    }
  }, [phase, setPhase])

  // Auto-run validation when entering validating phase
  useEffect(() => {
    if (phase === 'validating') {
      runValidation()
    }
  }, [phase, runValidation])

  // Handle completion
  useEffect(() => {
    if (phase === 'complete') {
      onComplete()
    }
  }, [phase, onComplete])

  const handlePositioningReady = useCallback(async () => {
    const started = await startCalibration()
    if (!started) {
      // Camera permission denied or other error
      // Error state is handled by the hook
    }
  }, [startCalibration])

  const handleSkip = useCallback(() => {
    skipCalibration()
    onSkip()
  }, [skipCalibration, onSkip])

  const handleValidationAccept = useCallback(() => {
    completeCalibration()
  }, [completeCalibration])

  const handleValidationRetry = useCallback(() => {
    resetCalibration()
  }, [resetCalibration])

  // Render based on phase
  const renderPhase = (currentPhase: CalibrationPhase) => {
    switch (currentPhase) {
      case 'positioning':
        return <PhonePositioning onReady={handlePositioningReady} onSkip={handleSkip} />

      case 'calibrating':
        return (
          <CalibrationGrid
            points={calibrationPoints}
            currentIndex={currentPointIndex}
            onPointTap={handlePointTap}
          />
        )

      case 'validating':
        return (
          <ValidationCheck
            result={validationResult}
            isValidating={!validationResult}
            onAccept={handleValidationAccept}
            onRetry={handleValidationRetry}
            onSkip={handleSkip}
          />
        )

      case 'failed':
        return (
          <div className="h-full flex flex-col items-center justify-center bg-base px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-serif text-xl text-ink mb-2">Camera Required</h2>
            <p className="text-sm text-ink/60 text-center mb-8 max-w-xs">
              {error || 'Camera access is needed for eye tracking calibration.'}
            </p>
            <button
              onClick={handlePositioningReady}
              className="w-full max-w-xs h-14 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors mb-3"
            >
              Try Again
            </button>
            <button
              onClick={handleSkip}
              className="py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors"
            >
              Continue without eye tracking
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          className="h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderPhase(phase)}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export { useEyeCalibration } from '../useEyeCalibration'
export type { CalibrationPhase, CalibrationProfile, ValidationResult } from '../useEyeCalibration'
