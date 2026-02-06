/**
 * CameraCalibration - Camera baseline capture screen
 *
 * Reuses PostureCalibration's visual patterns (countdown ring, success animation).
 * Minimal: instructions → 3-second countdown → capture baseline → auto-advance.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CameraCalibrationStep = 'instructions' | 'countdown' | 'success'

interface CameraCalibrationProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  landmarks: unknown // Just need to know they exist
  onCalibrate: () => boolean
  onComplete: () => void
  onCancel: () => void
}

const COUNTDOWN_SECONDS = 3

export function CameraCalibration({
  videoRef,
  landmarks,
  onCalibrate,
  onComplete,
  onCancel,
}: CameraCalibrationProps) {
  const [step, setStep] = useState<CameraCalibrationStep>('instructions')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [progress, setProgress] = useState(0)

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

      if (elapsed >= totalMs) {
        clearInterval(interval)
        handleCalibrate()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [step])

  const handleCalibrate = useCallback(() => {
    const success = onCalibrate()
    if (success) {
      setStep('success')
      setTimeout(() => onComplete(), 1500)
    } else {
      setStep('instructions')
    }
  }, [onCalibrate, onComplete])

  const handleStartCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS)
    setProgress(0)
    setStep('countdown')
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0A0A0F] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Camera feed (dimmed background) */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          className="w-full h-full object-cover opacity-20"
          style={{ transform: 'scaleX(-1)' }}
          autoPlay
          playsInline
          muted
        />
      </div>

      {/* Cancel button */}
      {step === 'instructions' && (
        <button
          onClick={onCancel}
          className="absolute left-4 px-3 py-1.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all z-10"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          Cancel
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h1 className="font-serif text-2xl text-white mb-4">Sit Up Tall</h1>

              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xs mx-auto">
                Shoulders relaxed. This is your baseline.
              </p>

              <p className="text-white/50 text-sm mb-8">
                {landmarks
                  ? 'We can see you. Ready when you are.'
                  : 'Make sure your upper body is visible.'}
              </p>

              <button
                onClick={handleStartCountdown}
                disabled={!landmarks}
                className="px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              {/* Progress ring -- matches PostureCalibration pattern */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="rgba(249, 115, 22, 0.2)"
                    strokeWidth="8"
                  />
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
              <p className="text-white/60">Your baseline posture is saved</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
