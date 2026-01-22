/**
 * EyeTrackingOverlay - Debug visualization for eye tracking
 *
 * Shows a crosshair at the gaze point position.
 * Only used in development mode for debugging.
 */

import type { GazePoint } from '../../hooks/useEyeTracking'

interface EyeTrackingOverlayProps {
  gazePoint: GazePoint | null
  trackingQuality: number
  isEnabled?: boolean
}

export function EyeTrackingOverlay({
  gazePoint,
  trackingQuality,
  isEnabled = false,
}: EyeTrackingOverlayProps) {
  // Only show in development mode and when enabled
  if (!isEnabled || process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!gazePoint) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white text-xs px-2 py-1 rounded z-50">
        Eye tracking: No gaze data
      </div>
    )
  }

  return (
    <>
      {/* Gaze point crosshair */}
      <div
        className="absolute pointer-events-none z-50"
        style={{
          left: gazePoint.x - 15,
          top: gazePoint.y - 15,
          width: 30,
          height: 30,
        }}
      >
        {/* Horizontal line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${trackingQuality})`,
          }}
        />
        {/* Vertical line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${trackingQuality})`,
          }}
        />
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            backgroundColor: trackingQuality > 0.5 ? '#10b981' : '#ef4444',
          }}
        />
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-20 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded z-50 font-mono">
        <div>
          Gaze: ({Math.round(gazePoint.x)}, {Math.round(gazePoint.y)})
        </div>
        <div>Quality: {Math.round(trackingQuality * 100)}%</div>
      </div>
    </>
  )
}
