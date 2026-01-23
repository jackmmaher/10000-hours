/**
 * CalibrationStatus - Shows calibration state on the setup screen
 *
 * Displays whether eye tracking is calibrated and provides quick actions.
 */

import { isProfileStale, type CalibrationProfile } from '../useEyeCalibration'

interface CalibrationStatusProps {
  profile: CalibrationProfile | null
  onCalibrate: () => void
  onRecalibrate: () => void
}

export function CalibrationStatus({ profile, onCalibrate, onRecalibrate }: CalibrationStatusProps) {
  const isStale = isProfileStale(profile)
  const hasProfile = profile !== null

  if (!hasProfile) {
    return (
      <div className="bg-elevated rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-ink/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink mb-0.5">Eye Tracking</p>
            <p className="text-xs text-ink/60 mb-3">Not calibrated yet</p>
            <button
              onClick={onCalibrate}
              className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Calibrate now
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isStale) {
    return (
      <div className="bg-elevated rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink mb-0.5">Calibration Stale</p>
            <p className="text-xs text-ink/60 mb-3">Last calibrated over 7 days ago</p>
            <button
              onClick={onRecalibrate}
              className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Recalibrate
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Good calibration
  const accuracyLabel = profile.accuracy < 100 ? 'High' : profile.accuracy < 150 ? 'Medium' : 'Low'
  const daysAgo = Math.floor((Date.now() - profile.lastUsedAt) / (24 * 60 * 60 * 1000))
  const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`

  return (
    <div className="bg-elevated rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-medium text-ink">Eye Tracking Ready</p>
            <span className="text-xs text-green-500 font-medium">{accuracyLabel} accuracy</span>
          </div>
          <p className="text-xs text-ink/60 mb-2">Calibrated {timeLabel}</p>
          <button
            onClick={onRecalibrate}
            className="text-xs text-ink/40 hover:text-ink/60 transition-colors"
          >
            Recalibrate
          </button>
        </div>
      </div>
    </div>
  )
}
