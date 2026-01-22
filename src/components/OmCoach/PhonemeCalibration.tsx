/**
 * PhonemeCalibration - Guided voice calibration UI for phoneme detection
 *
 * A simple 3-step flow (~15 seconds total):
 * 1. "Say 'Ahhh' at your comfortable pitch" (5 seconds)
 * 2. "Now round to 'Oooo'" (5 seconds)
 * 3. "Close to 'Mmmm'" (5 seconds)
 *
 * Shows progress bar and large phoneme label for each phase.
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  type CalibrationState,
  type CalibrationPhase,
  getCalibrationInstruction,
} from '../../hooks/usePhonemeCalibration'

interface PhonemeCalibrationProps {
  state: CalibrationState
  onCancel: () => void
  onComplete: () => void
}

/**
 * Get the large display character for each phase
 */
function getPhaseSymbol(phase: CalibrationPhase): string {
  switch (phase) {
    case 'noise':
      return '...'
    case 'ah':
      return 'Ah'
    case 'oo':
      return 'Oo'
    case 'mm':
      return 'Mm'
    case 'complete':
      return '✓'
    default:
      return ''
  }
}

/**
 * Get accent color for phase
 */
function getPhaseColor(phase: CalibrationPhase): string {
  switch (phase) {
    case 'ah':
      return 'var(--accent)'
    case 'oo':
      return 'var(--color-amber-500, #f59e0b)'
    case 'mm':
      return 'var(--color-emerald-500, #10b981)'
    case 'complete':
      return 'var(--color-emerald-500, #10b981)'
    default:
      return 'var(--text-muted)'
  }
}

export function PhonemeCalibration({ state, onCancel, onComplete }: PhonemeCalibrationProps) {
  const { phase, progress, isCalibrating, error, currentRms, samplesCollected, isVoiceDetected } =
    state
  const instruction = getCalibrationInstruction(phase)

  // Normalize RMS for display (0-1 range, amplified for visibility)
  // Typical RMS: silence ~0.001, quiet voice ~0.005, normal voice ~0.02, loud ~0.05+
  const audioLevel = Math.min(1, currentRms * 20)

  // Handle completion
  if (phase === 'complete' && !isCalibrating) {
    // Auto-dismiss after a moment
    setTimeout(onComplete, 1500)
  }

  return (
    <div className="flex flex-col h-full bg-base">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <button
          onClick={onCancel}
          className="text-sm text-ink/70 hover:text-ink"
          disabled={phase === 'complete'}
        >
          Cancel
        </button>
        <h2 className="text-sm font-medium text-ink">Voice Calibration</h2>
        <div className="w-12" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-sm text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={onCancel} className="mt-3 text-sm text-accent hover:underline">
              Try Again
            </button>
          </div>
        )}

        {/* Large phoneme display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `color-mix(in srgb, ${getPhaseColor(phase)} 15%, transparent)`,
                border: `3px solid ${getPhaseColor(phase)}`,
              }}
            >
              <span
                className="font-serif text-4xl font-medium"
                style={{ color: getPhaseColor(phase) }}
              >
                {getPhaseSymbol(phase)}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Instructions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-8"
          >
            <h3 className="text-xl font-medium text-ink mb-2">{instruction.title}</h3>
            <p className="text-sm text-ink/60">{instruction.instruction}</p>
          </motion.div>
        </AnimatePresence>

        {/* Real-time audio feedback */}
        {isCalibrating && phase !== 'complete' && phase !== 'noise' && (
          <div className="w-full max-w-xs mb-6">
            {/* Voice detection status */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-150 ${
                  isVoiceDetected
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'bg-ink/20'
                }`}
              />
              <span
                className={`text-sm font-medium ${isVoiceDetected ? 'text-emerald-600' : 'text-ink/40'}`}
              >
                {isVoiceDetected ? 'Voice detected' : 'Waiting for voice...'}
              </span>
            </div>

            {/* Audio level meter */}
            <div className="w-full h-4 bg-ink/10 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: isVoiceDetected
                    ? 'var(--color-emerald-500, #10b981)'
                    : 'var(--text-muted)',
                }}
                animate={{ width: `${audioLevel * 100}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
              />
              {/* Threshold indicator - shows minimum level for voice detection */}
              <div className="absolute top-0 bottom-0 w-px bg-ink/30" style={{ left: '6%' }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-ink/40">
              <span>Quiet</span>
              <span>Samples: {samplesCollected}</span>
              <span>Loud</span>
            </div>
          </div>
        )}

        {/* Noise phase feedback */}
        {isCalibrating && phase === 'noise' && (
          <div className="w-full max-w-xs mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm font-medium text-amber-600">
                Measuring background noise...
              </span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {isCalibrating && phase !== 'complete' && (
          <div className="w-full max-w-xs">
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--progress-track)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getPhaseColor(phase) }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* Phase indicators */}
            <div className="flex justify-between mt-4">
              {['ah', 'oo', 'mm'].map((p, i) => {
                const phaseOrder = ['noise', 'ah', 'oo', 'mm']
                const currentIndex = phaseOrder.indexOf(phase)
                const thisIndex = phaseOrder.indexOf(p)
                const isComplete = thisIndex < currentIndex
                const isCurrent = p === phase

                return (
                  <div key={p} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                        isComplete
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'ring-2 ring-offset-2'
                            : 'bg-ink/10 text-ink/40'
                      }`}
                      style={{
                        ...(isCurrent && {
                          backgroundColor: `color-mix(in srgb, ${getPhaseColor(p as CalibrationPhase)} 20%, transparent)`,
                          color: getPhaseColor(p as CalibrationPhase),
                          ringColor: getPhaseColor(p as CalibrationPhase),
                        }),
                      }}
                    >
                      {isComplete ? '✓' : isCurrent ? samplesCollected : i + 1}
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent ? 'text-ink' : 'text-ink/40'}`}>
                      {p === 'ah' ? 'Ah' : p === 'oo' ? 'Oo' : 'Mm'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Complete state */}
        {phase === 'complete' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-sm text-emerald-600">Ready for practice!</p>
          </motion.div>
        )}
      </div>

      {/* Footer info */}
      <div className="flex-none px-6 pb-6 safe-area-bottom">
        <p className="text-xs text-ink/40 text-center">
          This calibration takes ~15 seconds and helps detect your unique voice.
          {'\n'}You can recalibrate anytime from settings.
        </p>
      </div>
    </div>
  )
}
