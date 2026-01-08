/**
 * WellbeingCard - Wellbeing tracking card for Profile
 *
 * Shows tracked dimensions with scores, improvement indicators,
 * and check-in controls. Allows adding new dimensions and
 * triggering check-in flow.
 */

import { useState } from 'react'
import {
  WellbeingDimension,
  WellbeingCheckIn,
  WellbeingSettings,
  addWellbeingDimension,
  updateWellbeingSettings,
  getImprovementForDimension
} from '../lib/db'
import { WellbeingCheckInModal } from './WellbeingCheckInModal'

// Suggested dimensions with accessible language
const SUGGESTED_DIMENSIONS = [
  { name: 'anxiety', label: 'Anxiety', description: 'Racing thoughts, worry, unease' },
  { name: 'stress', label: 'Stress', description: 'Feeling overwhelmed, pressure' },
  { name: 'low-mood', label: 'Low Mood', description: 'Heaviness, lack of joy' },
  { name: 'sleep', label: 'Sleep', description: 'Quality of rest' },
  { name: 'focus', label: 'Focus', description: 'Clarity, concentration' },
  { name: 'energy', label: 'Energy', description: 'Vitality, motivation' },
  { name: 'inner-calm', label: 'Inner Calm', description: 'Peace, groundedness' }
]

interface WellbeingCardProps {
  dimensions: WellbeingDimension[]
  latestCheckIns: Map<string, WellbeingCheckIn>
  settings: WellbeingSettings | null
  onRefresh: () => void
}

export function WellbeingCard({
  dimensions,
  latestCheckIns,
  settings,
  onRefresh
}: WellbeingCardProps) {
  const [showSetup, setShowSetup] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const [frequency, setFrequency] = useState(settings?.checkInFrequencyDays || 14)
  const [improvements, setImprovements] = useState<Map<string, number>>(new Map())

  // Load improvement data
  const loadImprovements = async () => {
    const improvementMap = new Map<string, number>()
    for (const dim of dimensions) {
      const improvement = await getImprovementForDimension(dim.id)
      if (improvement) {
        improvementMap.set(dim.id, improvement.percentChange)
      }
    }
    setImprovements(improvementMap)
  }

  // Add a suggested dimension
  const handleAddDimension = async (name: string, label: string, description: string) => {
    await addWellbeingDimension({
      name,
      label,
      description,
      isCustom: false
    })
    onRefresh()
  }

  // Add custom dimension
  const handleAddCustom = async () => {
    if (!customLabel.trim()) return
    await addWellbeingDimension({
      name: customLabel.toLowerCase().replace(/\s+/g, '-'),
      label: customLabel.trim(),
      isCustom: true
    })
    setCustomLabel('')
    onRefresh()
  }

  // Update frequency
  const handleFrequencyChange = async (days: number) => {
    setFrequency(days)
    await updateWellbeingSettings({
      checkInFrequencyDays: days,
      isEnabled: true,
      nextCheckInDue: Date.now() + days * 24 * 60 * 60 * 1000
    })
  }

  // Check if check-in is due
  const isCheckInDue = settings?.nextCheckInDue && Date.now() >= settings.nextCheckInDue

  // Format next check-in date
  const formatNextCheckIn = (): string => {
    if (!settings?.nextCheckInDue) return 'Not scheduled'
    const date = new Date(settings.nextCheckInDue)
    const today = new Date()
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Due now'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get dimensions not yet added
  const availableDimensions = SUGGESTED_DIMENSIONS.filter(
    s => !dimensions.some(d => d.name === s.name)
  )

  // No dimensions yet - show setup prompt
  if (dimensions.length === 0 && !showSetup) {
    return (
      <div className="p-5 bg-cream-warm rounded-xl">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-moss/20 to-amber-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-moss/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg text-ink mb-2">Track Your Wellbeing</h3>
          <p className="text-sm text-ink/50 mb-4 leading-relaxed">
            Monitor how meditation affects your mental health over time.
            Choose what matters to you and check in at your own pace.
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="px-4 py-2 bg-moss text-cream text-sm rounded-lg hover:bg-moss/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }

  // Setup mode - selecting dimensions
  if (showSetup) {
    return (
      <div className="p-5 bg-cream-warm rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-ink">What would you like to track?</h3>
          {dimensions.length > 0 && (
            <button
              onClick={() => setShowSetup(false)}
              className="text-sm text-ink/40 hover:text-ink/60"
            >
              Done
            </button>
          )}
        </div>

        {/* Suggested dimensions */}
        <div className="space-y-2 mb-4">
          {availableDimensions.map(dim => (
            <button
              key={dim.name}
              onClick={() => handleAddDimension(dim.name, dim.label, dim.description)}
              className="w-full flex items-center justify-between p-3 bg-cream rounded-lg hover:bg-cream-deep transition-colors text-left"
            >
              <div>
                <p className="text-sm text-ink font-medium">{dim.label}</p>
                <p className="text-xs text-ink/40">{dim.description}</p>
              </div>
              <svg className="w-5 h-5 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ))}
        </div>

        {/* Added dimensions */}
        {dimensions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-ink/40 mb-2">Tracking:</p>
            <div className="flex flex-wrap gap-2">
              {dimensions.map(dim => (
                <span
                  key={dim.id}
                  className="px-3 py-1 bg-moss/10 text-moss text-xs rounded-full"
                >
                  {dim.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Custom dimension */}
        <div className="pt-4 border-t border-ink/5">
          <p className="text-xs text-ink/40 mb-2">Add your own:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              placeholder="e.g., Work stress, Grief..."
              className="flex-1 px-3 py-2 text-sm bg-cream border border-ink/10 rounded-lg focus:outline-none focus:border-moss/50"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customLabel.trim()}
              className="px-3 py-2 bg-ink text-cream text-sm rounded-lg disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Check-in frequency */}
        {dimensions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-ink/5">
            <p className="text-xs text-ink/40 mb-3">Check-in frequency</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink/40">7 days</span>
              <input
                type="range"
                min="7"
                max="30"
                value={frequency}
                onChange={e => handleFrequencyChange(parseInt(e.target.value))}
                className="flex-1 h-1 bg-ink/10 rounded-full appearance-none cursor-pointer accent-moss"
              />
              <span className="text-xs text-ink/40">30 days</span>
            </div>
            <p className="text-center text-sm text-ink/60 mt-2">
              Every {frequency} days
            </p>
          </div>
        )}

        {dimensions.length > 0 && (
          <button
            onClick={() => {
              setShowSetup(false)
              setShowCheckIn(true)
            }}
            className="w-full mt-4 py-2.5 bg-moss text-cream text-sm rounded-lg hover:bg-moss/90 transition-colors"
          >
            Start First Check-in
          </button>
        )}
      </div>
    )
  }

  // Main view - showing tracked dimensions
  return (
    <>
      <div className="p-5 bg-cream-warm rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-ink">Wellbeing</h3>
          <button
            onClick={() => setShowSetup(true)}
            className="text-xs text-ink/40 hover:text-ink/60"
          >
            Edit
          </button>
        </div>

        {/* Tracked dimensions with scores */}
        <div className="space-y-3 mb-4">
          {dimensions.map(dim => {
            const checkIn = latestCheckIns.get(dim.id)
            const improvement = improvements.get(dim.id)

            return (
              <div key={dim.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-ink">{dim.label}</p>
                  {checkIn && (
                    <div className="flex items-center gap-2 mt-1">
                      {/* Score visualization */}
                      <div className="flex-1 h-1.5 bg-ink/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-moss to-amber-500 rounded-full transition-all"
                          style={{ width: `${(checkIn.score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink/40 tabular-nums w-6">
                        {checkIn.score}/10
                      </span>
                    </div>
                  )}
                </div>

                {/* Improvement indicator */}
                {improvement !== undefined && improvement !== 0 && (
                  <div className={`ml-3 text-xs ${improvement > 0 ? 'text-moss' : 'text-amber-600'}`}>
                    {improvement > 0 ? '↓' : '↑'} {Math.abs(improvement)}%
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Next check-in indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-ink/5">
          <div>
            <p className="text-xs text-ink/40">Next check-in</p>
            <p className={`text-sm ${isCheckInDue ? 'text-moss font-medium' : 'text-ink/60'}`}>
              {formatNextCheckIn()}
            </p>
          </div>

          <button
            onClick={() => {
              loadImprovements()
              setShowCheckIn(true)
            }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              isCheckInDue
                ? 'bg-moss text-cream hover:bg-moss/90'
                : 'bg-cream text-ink/60 hover:bg-cream-deep'
            }`}
          >
            Check In
          </button>
        </div>
      </div>

      {/* Check-in modal */}
      {showCheckIn && (
        <WellbeingCheckInModal
          dimensions={dimensions}
          onClose={() => setShowCheckIn(false)}
          onComplete={() => {
            setShowCheckIn(false)
            onRefresh()
          }}
        />
      )}
    </>
  )
}
