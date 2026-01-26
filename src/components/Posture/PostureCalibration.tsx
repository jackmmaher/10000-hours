/**
 * PostureCalibration - "Sit up straight" calibration flow
 *
 * Features:
 * - Instructions to assume good posture
 * - 3-second countdown with progress ring
 * - Captures baseline, shows success animation
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CalibrationStep = 'instructions' | 'countdown' | 'success'

interface PostureCalibrationProps {
  onCalibrate: () => Promise<boolean>
  onComplete: () => void
  onSkip: () => void
  isTracking: boolean
  startTracking: () => Promise<boolean>
  stopTracking: () => Promise<void>
}

const COUNTDOWN_SECONDS = 3

export function PostureCalibration({
  onCalibrate,
  onComplete,
  onSkip,
  isTracking,
  startTracking,
  stopTracking,
}: PostureCalibrationProps) {
  const [step, setStep] = useState<CalibrationStep>('instructions')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [progress, setProgress] = useState(0)

  // Start tracking when entering calibration
  useEffect(() => {
    if (!isTracking) {
      startTracking()
    }

    return () => {
      stopTracking()
    }
  }, [isTracking, startTracking, stopTracking])

  // Handle countdown
  useEffect(() => {
    if (step !== 'countdown') return

    const startTime = Date.now()
    const totalMs = COUNTDOWN_SECONDS * 1000

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.ceil((totalMs - elapsed) / 1000)
      const prog = Math.min(elapsed / totalMs, 1)

      setCountdown(Math.max(remaining, 0))
      setProgress(prog)

      // Countdown complete
      if (elapsed >= totalMs) {
        clearInterval(interval)
        handleCalibrate()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [step])

  // Perform calibration
  const handleCalibrate = useCallback(async () => {
    const success = await onCalibrate()
    if (success) {
      setStep('success')
      // Auto-complete after showing success
      setTimeout(() => {
        onComplete()
      }, 1500)
    } else {
      // If calibration failed, go back to instructions
      setStep('instructions')
    }
  }, [onCalibrate, onComplete])

  // Start countdown
  const handleStartCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS)
    setProgress(0)
    setStep('countdown')
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#1A1410] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Skip button */}
      {step === 'instructions' && (
        <button
          onClick={onSkip}
          className="absolute left-4 px-3 py-1.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all z-10"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          Skip
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {step === 'instructions' && (
            <motion.div
              key="instructions"
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Posture icon */}
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#F97316]/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#F97316]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.5c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 13.5c-2.21 0-4-1.79-4-4v-1h8v1c0 2.21-1.79 4-4 4z"
                  />
                </svg>
              </div>

              <h1 className="font-serif text-2xl text-white mb-4">Sit Up Straight</h1>

              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xs mx-auto">
                Find your ideal meditation posture. Spine tall, shoulders relaxed, chin slightly
                tucked.
              </p>

              <p className="text-white/50 text-sm mb-8">
                When you're ready, we'll capture this as your baseline.
              </p>

              <button
                onClick={handleStartCountdown}
                className="px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium rounded-xl transition-colors"
              >
                I'm Ready
              </button>
            </motion.div>
          )}

          {step === 'countdown' && (
            <motion.div
              key="countdown"
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress ring */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="rgba(249, 115, 22, 0.2)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 * (1 - progress)}
                    className="transition-all duration-100"
                  />
                </svg>

                {/* Countdown number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-6xl text-white">{countdown}</span>
                </div>
              </div>

              <p className="text-white/70 text-lg">Hold still...</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Success checkmark */}
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, type: 'spring' }}
              >
                <motion.svg
                  className="w-12 h-12 text-[#22C55E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>

              <h1 className="font-serif text-2xl text-white mb-2">Calibrated</h1>

              <p className="text-white/60">Your good posture is saved</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
