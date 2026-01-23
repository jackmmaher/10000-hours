/**
 * ValidationCheck - Calibration accuracy verification screen
 *
 * Shows results of calibration validation and lets user proceed or retry.
 */

import { motion } from 'framer-motion'
import type { ValidationResult } from '../useEyeCalibration'

interface ValidationCheckProps {
  result: ValidationResult | null
  isValidating: boolean
  onAccept: () => void
  onRetry: () => void
  onSkip: () => void
}

export function ValidationCheck({
  result,
  isValidating,
  onAccept,
  onRetry,
  onSkip,
}: ValidationCheckProps) {
  if (isValidating) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-base px-6">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-sm text-ink/60 mt-6">Checking accuracy...</p>
        <p className="text-xs text-ink/40 mt-2">Look at the center of the screen</p>
      </div>
    )
  }

  if (!result) {
    return null
  }

  const isGood = result.averageError < 100
  const isAcceptable = result.averageError < 150

  return (
    <div className="h-full flex flex-col bg-base">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Result icon */}
        <motion.div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isGood ? 'bg-green-500/10' : isAcceptable ? 'bg-accent/10' : 'bg-ink/10'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {isGood && (
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isAcceptable && !isGood && (
            <svg
              className="w-10 h-10 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
          )}
          {!isAcceptable && (
            <svg
              className="w-10 h-10 text-ink/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
        </motion.div>

        {/* Result text */}
        <motion.h2
          className="font-serif text-xl text-ink mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isGood && 'Excellent Calibration'}
          {isAcceptable && !isGood && 'Good Enough'}
          {!isAcceptable && 'Calibration Needs Work'}
        </motion.h2>

        <motion.p
          className="text-sm text-ink/60 mt-2 text-center max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isGood && 'Your eye tracking is well-calibrated for accurate measurements.'}
          {isAcceptable &&
            !isGood &&
            'Eye tracking should work, but recalibrating may improve accuracy.'}
          {!isAcceptable && 'Try again with your phone propped at eye level in good lighting.'}
        </motion.p>

        {/* Accuracy indicator */}
        <motion.div
          className="mt-8 bg-elevated rounded-xl p-4 w-full max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs text-ink/50">Accuracy</span>
            <span
              className={`text-sm font-medium ${
                isGood ? 'text-green-500' : isAcceptable ? 'text-accent' : 'text-ink/50'
              }`}
            >
              {isGood && 'High'}
              {isAcceptable && !isGood && 'Medium'}
              {!isAcceptable && 'Low'}
            </span>
          </div>
          <div className="mt-2 h-2 bg-ink/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isGood ? 'bg-green-500' : isAcceptable ? 'bg-accent' : 'bg-ink/30'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(10, Math.min(100, 100 - result.averageError / 2))}%` }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="p-6 safe-area-inset-bottom">
        {isAcceptable ? (
          <>
            <button
              onClick={onAccept}
              className="w-full h-14 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors mb-3"
            >
              Continue
            </button>
            <button
              onClick={onRetry}
              className="w-full py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors"
            >
              Recalibrate for better accuracy
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onRetry}
              className="w-full h-14 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors mb-3"
            >
              Try Again
            </button>
            <button
              onClick={onSkip}
              className="w-full py-3 text-sm text-ink/50 hover:text-ink/70 transition-colors"
            >
              Skip calibration
            </button>
          </>
        )}
      </div>
    </div>
  )
}
