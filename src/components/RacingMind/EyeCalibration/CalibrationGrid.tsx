/**
 * CalibrationGrid - 9-point calibration screen
 *
 * Displays all calibration points and guides user through tapping each one.
 * WebGazer learns the correlation between eye position and screen location.
 */

import { motion } from 'framer-motion'
import { CalibrationDot, type DotStatus } from './CalibrationDot'

interface CalibrationPoint {
  id: number
  x: number
  y: number
  status: DotStatus
}

interface CalibrationGridProps {
  points: CalibrationPoint[]
  currentIndex: number
  onPointTap: (pointId: number) => void
}

export function CalibrationGrid({
  points,
  currentIndex: _currentIndex,
  onPointTap,
}: CalibrationGridProps) {
  const completedCount = points.filter((p) => p.status === 'completed').length
  const totalPoints = points.length

  return (
    <div className="fixed inset-0 bg-base">
      {/* Progress indicator */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-area-inset-top">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink/50">Calibrating</span>
            <span className="text-xs text-ink/50">
              {completedCount}/{totalPoints}
            </span>
          </div>
          <div className="h-1 bg-ink/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalPoints) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <motion.div
        className="absolute top-20 left-0 right-0 z-10 text-center px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-ink/70">
          {completedCount === 0 && 'Look at the pulsing dot, then tap it'}
          {completedCount > 0 &&
            completedCount < totalPoints &&
            'Keep looking at each dot as you tap'}
          {completedCount === totalPoints && 'Calibration complete!'}
        </p>
      </motion.div>

      {/* Calibration dots */}
      {points.map((point) => (
        <CalibrationDot
          key={point.id}
          x={point.x}
          y={point.y}
          status={point.status}
          onTap={() => onPointTap(point.id)}
          className="z-20"
        />
      ))}

      {/* Subtle grid lines to help with positioning (very faint) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-5">
        {/* Vertical lines */}
        <line x1="15%" y1="0" x2="15%" y2="100%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="1" />
        <line x1="85%" y1="0" x2="85%" y2="100%" stroke="currentColor" strokeWidth="1" />
        {/* Horizontal lines */}
        <line x1="0" y1="15%" x2="100%" y2="15%" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="85%" x2="100%" y2="85%" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}
