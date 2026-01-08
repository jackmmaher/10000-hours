/**
 * PracticeShape - Visual pattern recognition for meditation practice
 *
 * Displays identified patterns (time of day, discipline, pose, day of week)
 * using 5-dot strength indicators instead of raw numbers.
 *
 * Design: Pattern recognition, not data dump
 */

import { PracticeShape as PracticeShapeType, PatternStrength } from '../lib/progressInsights'

interface PracticeShapeProps {
  shape: PracticeShapeType
}

export function PracticeShape({ shape }: PracticeShapeProps) {
  const patterns = [
    shape.timeOfDay,
    shape.discipline,
    shape.pose,
    shape.dayOfWeek
  ].filter((p): p is PatternStrength => p !== null)

  if (patterns.length === 0) {
    return null
  }

  return (
    <div className="mb-10">
      <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
        Your Practice
      </p>

      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <PatternRow key={index} pattern={pattern} />
        ))}
      </div>
    </div>
  )
}

function PatternRow({ pattern }: { pattern: PatternStrength }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">
          {pattern.label}
        </p>
        {pattern.detail && (
          <p className="text-xs text-ink/40 mt-0.5">
            {pattern.detail}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 ml-4">
        <StrengthDots strength={pattern.strength} />
      </div>
    </div>
  )
}

function StrengthDots({ strength }: { strength: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`
            w-2 h-2 rounded-full transition-colors
            ${dot <= strength
              ? 'bg-moss'
              : 'bg-ink/10'
            }
          `}
        />
      ))}
    </div>
  )
}
