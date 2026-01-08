/**
 * WellbeingCheckInModal - Check-in flow for wellbeing tracking
 *
 * Allows users to update their scores for each tracked dimension,
 * add optional notes, and see their progress over time.
 */

import { useState } from 'react'
import {
  WellbeingDimension,
  addWellbeingCheckIn,
  updateWellbeingSettings,
  getCheckInHistory
} from '../lib/db'

interface WellbeingCheckInModalProps {
  dimensions: WellbeingDimension[]
  onClose: () => void
  onComplete: () => void
}

interface DimensionCheckIn {
  dimensionId: string
  score: number
  note: string
  previousScore?: number
}

export function WellbeingCheckInModal({
  dimensions,
  onClose,
  onComplete
}: WellbeingCheckInModalProps) {
  const [checkIns, setCheckIns] = useState<DimensionCheckIn[]>(
    dimensions.map(d => ({
      dimensionId: d.id,
      score: 5,
      note: ''
    }))
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // Load previous scores
  useState(() => {
    const loadPreviousScores = async () => {
      const updated = [...checkIns]
      for (let i = 0; i < dimensions.length; i++) {
        const history = await getCheckInHistory(dimensions[i].id, 1)
        if (history.length > 0) {
          updated[i].previousScore = history[0].score
          updated[i].score = history[0].score // Default to previous score
        }
      }
      setCheckIns(updated)
    }
    loadPreviousScores()
  })

  const currentDimension = dimensions[currentIndex]
  const currentCheckIn = checkIns[currentIndex]

  // Update score for current dimension
  const handleScoreChange = (score: number) => {
    const updated = [...checkIns]
    updated[currentIndex].score = score
    setCheckIns(updated)
  }

  // Update note for current dimension
  const handleNoteChange = (note: string) => {
    const updated = [...checkIns]
    updated[currentIndex].note = note
    setCheckIns(updated)
  }

  // Move to next dimension or summary
  const handleNext = () => {
    if (currentIndex < dimensions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setShowSummary(true)
    }
  }

  // Move to previous dimension
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Save all check-ins
  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const checkIn of checkIns) {
        await addWellbeingCheckIn({
          dimensionId: checkIn.dimensionId,
          score: checkIn.score,
          note: checkIn.note || undefined
        })
      }

      // Update next check-in date
      const settings = await import('../lib/db').then(m => m.getWellbeingSettings())
      await updateWellbeingSettings({
        lastCheckInPrompt: Date.now(),
        nextCheckInDue: Date.now() + settings.checkInFrequencyDays * 24 * 60 * 60 * 1000
      })

      onComplete()
    } catch (err) {
      console.error('Failed to save check-ins:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Get score label
  const getScoreLabel = (score: number): string => {
    if (score <= 2) return 'Very low'
    if (score <= 4) return 'Low'
    if (score <= 6) return 'Moderate'
    if (score <= 8) return 'High'
    return 'Very high'
  }

  // Get change indicator
  const getChangeIndicator = (current: number, previous?: number) => {
    if (previous === undefined) return null
    const diff = previous - current // Lower is better
    if (diff === 0) return null
    if (diff > 0) {
      return (
        <span className="text-moss text-sm">
          ↓ {diff} from last time
        </span>
      )
    }
    return (
      <span className="text-amber-600 text-sm">
        ↑ {Math.abs(diff)} from last time
      </span>
    )
  }

  // Summary view
  if (showSummary) {
    return (
      <div className="fixed inset-0 z-50 bg-ink/50 flex items-end justify-center sm:items-center">
        <div className="w-full max-w-lg bg-cream rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="font-serif text-xl text-ink mb-6">Check-in Summary</h2>

            <div className="space-y-4 mb-6">
              {dimensions.map((dim, i) => {
                const checkIn = checkIns[i]
                return (
                  <div key={dim.id} className="flex items-center justify-between p-3 bg-cream-warm rounded-lg">
                    <div>
                      <p className="text-sm text-ink font-medium">{dim.label}</p>
                      {checkIn.note && (
                        <p className="text-xs text-ink/40 mt-0.5 line-clamp-1">
                          "{checkIn.note}"
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-serif text-ink">{checkIn.score}/10</p>
                      {getChangeIndicator(checkIn.score, checkIn.previousScore)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 py-3 text-ink/60 text-sm rounded-lg hover:bg-cream-warm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-moss text-cream text-sm rounded-lg hover:bg-moss/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Check-in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Individual dimension check-in
  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-end justify-center sm:items-center">
      <div className="w-full max-w-lg bg-cream rounded-t-2xl sm:rounded-2xl">
        <div className="p-6">
          {/* Header with progress */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="text-ink/40 hover:text-ink/60 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex gap-1">
              {dimensions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= currentIndex ? 'bg-moss' : 'bg-ink/10'
                  }`}
                />
              ))}
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>

          {/* Current dimension */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl text-ink mb-2">
              {currentDimension.label}
            </h2>
            {currentDimension.description && (
              <p className="text-sm text-ink/50">
                {currentDimension.description}
              </p>
            )}
          </div>

          {/* Score slider */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="text-5xl font-serif text-ink">
                {currentCheckIn.score}
              </span>
              <p className="text-sm text-ink/50 mt-1">
                {getScoreLabel(currentCheckIn.score)}
              </p>
              {currentCheckIn.previousScore !== undefined && (
                <div className="mt-2">
                  {getChangeIndicator(currentCheckIn.score, currentCheckIn.previousScore)}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={currentCheckIn.score}
                onChange={e => handleScoreChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-moss via-amber-400 to-rose-400 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #7C9A6E, #FBBF24, #F87171)`
                }}
              />
              <div className="flex justify-between text-xs text-ink/30 mt-2">
                <span>Better</span>
                <span>Worse</span>
              </div>
            </div>
          </div>

          {/* Optional note */}
          <div className="mb-6">
            <textarea
              value={currentCheckIn.note}
              onChange={e => handleNoteChange(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full px-4 py-3 text-sm bg-cream-warm border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-moss/30 resize-none"
              rows={2}
            />
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 text-ink/60 text-sm rounded-lg hover:bg-cream-warm transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-moss text-cream text-sm rounded-lg hover:bg-moss/90 transition-colors"
            >
              {currentIndex < dimensions.length - 1 ? 'Next' : 'Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
