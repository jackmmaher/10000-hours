/**
 * CalibrationGrid - 9-point calibration screen
 *
 * Displays all calibration points and guides user through tapping each one.
 * WebGazer learns the correlation between eye position and screen location.
 *
 * Uses Racing Mind visual style (dark background, blue orb) to match session experience.
 * Respects iOS safe areas to prevent content from appearing behind notch/Dynamic Island.
 */

import { motion } from 'framer-motion'
import { CalibrationDot, type DotStatus } from './CalibrationDot'
import { RACING_MIND_COLORS } from '../../../lib/racingMindAnimation'

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
    <div className="fixed inset-0" style={{ backgroundColor: RACING_MIND_COLORS.background }}>
      {/* Safe area container - dots are positioned within this safe content area */}
      <div
        className="absolute inset-0"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* Inner container for dot positioning - this is the "safe" area */}
        <div className="relative w-full h-full">
          {/* Calibration dots - positioned within safe area */}
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
        </div>
      </div>

      {/* Progress indicator - positioned with safe area padding */}
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Calibrating</span>
            <span className="text-xs text-white/50">
              {completedCount}/{totalPoints}
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: RACING_MIND_COLORS.orb }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalPoints) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <motion.div
        className="absolute left-0 right-0 z-10 text-center px-6"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 5rem)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-white/70">
          {completedCount === 0 && 'Look at the pulsing dot, then tap it'}
          {completedCount > 0 &&
            completedCount < totalPoints &&
            'Keep looking at each dot as you tap'}
          {completedCount === totalPoints && 'Calibration complete!'}
        </p>
      </motion.div>

      {/* Subtle grid lines removed - cleaner look matching session experience */}
    </div>
  )
}
