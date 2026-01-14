/**
 * WellbeingCard - Inline wellbeing tracking
 *
 * Fully inline UX:
 * - Tap "+ Add" to see dimension chips
 * - Tap a chip → inline slider to set initial value
 * - Tap tracked item → inline slider to update value
 * - Swipe left to delete
 * - Shows progress: baseline vs current with % change
 */

import { useState, useRef, TouchEvent } from 'react'
import {
  WellbeingDimension,
  WellbeingCheckIn,
  WellbeingSettings,
  addWellbeingDimension,
  addWellbeingCheckIn,
  archiveWellbeingDimension,
  getCheckInHistory,
} from '../lib/db'
import { useTapFeedback } from '../hooks/useTapFeedback'

// Suggested dimensions - framed as "how much is this affecting you"
const SUGGESTED_DIMENSIONS = [
  { name: 'anxiety', label: 'Anxiety' },
  { name: 'stress', label: 'Stress' },
  { name: 'low-mood', label: 'Low Mood' },
  { name: 'sleep', label: 'Sleep Issues' },
  { name: 'focus', label: 'Focus Issues' },
  { name: 'energy', label: 'Low Energy' },
  { name: 'restlessness', label: 'Restlessness' },
]

interface WellbeingCardProps {
  dimensions: WellbeingDimension[]
  latestCheckIns: Map<string, WellbeingCheckIn>
  settings: WellbeingSettings | null
  onRefresh: () => void
}

interface DimensionProgress {
  baseline: number
  current: number
  percentChange: number
}

export function WellbeingCard({ dimensions, latestCheckIns, onRefresh }: WellbeingCardProps) {
  const haptic = useTapFeedback()
  const [showAddPicker, setShowAddPicker] = useState(false)
  const [expandedAdd, setExpandedAdd] = useState<string | null>(null)
  const [expandedEdit, setExpandedEdit] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = useState(5)
  const [customLabel, setCustomLabel] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [progress, setProgress] = useState<Map<string, DimensionProgress>>(new Map())
  const [swipingId, setSwipingId] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const swipeActivated = useRef(false) // Only true after threshold crossed
  const swipeLocked = useRef(false) // Locks swipe when direction determined

  // Load progress data for a dimension
  const loadProgress = async (dimensionId: string): Promise<DimensionProgress | null> => {
    const history = await getCheckInHistory(dimensionId, 100)
    if (history.length === 0) return null

    const baseline = history[history.length - 1].score // First check-in
    const current = history[0].score // Latest check-in
    const percentChange = baseline > 0 ? Math.round(((baseline - current) / baseline) * 100) : 0

    return { baseline, current, percentChange }
  }

  // Load all progress on mount and when dimensions change
  const loadAllProgress = async () => {
    const progressMap = new Map<string, DimensionProgress>()
    for (const dim of dimensions) {
      const p = await loadProgress(dim.id)
      if (p) progressMap.set(dim.id, p)
    }
    setProgress(progressMap)
  }

  // Add a new dimension with initial score
  const handleAddWithScore = async (name: string, label: string) => {
    const dim = await addWellbeingDimension({
      name,
      label,
      isCustom: !SUGGESTED_DIMENSIONS.some((s) => s.name === name),
    })

    // Add initial check-in
    await addWellbeingCheckIn({
      dimensionId: dim.id,
      score: sliderValue,
    })

    // Reset state
    setExpandedAdd(null)
    setShowAddPicker(false)
    setSliderValue(5)
    setCustomLabel('')
    setShowCustomInput(false)
    onRefresh()
  }

  // Update score for existing dimension
  const handleUpdateScore = async (dimensionId: string) => {
    await addWellbeingCheckIn({
      dimensionId,
      score: sliderValue,
    })

    setExpandedEdit(null)
    await loadAllProgress()
    onRefresh()
  }

  // Archive (delete) a dimension
  const handleDelete = async (dimensionId: string) => {
    await archiveWellbeingDimension(dimensionId)
    setSwipingId(null)
    setSwipeOffset(0)
    onRefresh()
  }

  // Swipe handlers with proper gesture detection
  const SWIPE_THRESHOLD = 10 // Minimum horizontal movement to start swipe

  const handleTouchStart = (e: TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    swipeActivated.current = false
    swipeLocked.current = false
    setSwipingId(id)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!swipingId || swipeLocked.current) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = touchStartX.current - currentX
    const diffY = Math.abs(currentY - touchStartY.current)

    // If not yet activated, check if we should activate or lock out
    if (!swipeActivated.current) {
      // If vertical movement exceeds horizontal, this is a scroll - lock out swipe
      if (diffY > Math.abs(diffX) && diffY > 5) {
        swipeLocked.current = true
        setSwipingId(null)
        return
      }

      // Only activate swipe after crossing threshold with horizontal intent
      if (Math.abs(diffX) < SWIPE_THRESHOLD) {
        return
      }

      swipeActivated.current = true
    }

    // Only allow left swipe, max 80px
    setSwipeOffset(Math.min(Math.max(0, diffX), 80))
  }

  const handleTouchEnd = () => {
    // Only process if swipe was actually activated
    if (swipeActivated.current && swipeOffset > 60) {
      // Keep showing delete button
      setSwipeOffset(80)
    } else {
      setSwipeOffset(0)
      setSwipingId(null)
    }
    swipeActivated.current = false
    swipeLocked.current = false
  }

  // Reset swipe state when opening another item
  const resetSwipeState = () => {
    setSwipeOffset(0)
    setSwipingId(null)
    swipeActivated.current = false
    swipeLocked.current = false
  }

  // Get available dimensions (not yet added)
  const availableDimensions = SUGGESTED_DIMENSIONS.filter(
    (s) => !dimensions.some((d) => d.name === s.name)
  )

  // Expand an item for editing
  const handleExpandEdit = async (dim: WellbeingDimension) => {
    // Reset any swipe state first
    resetSwipeState()

    const checkIn = latestCheckIns.get(dim.id)
    setSliderValue(checkIn?.score || 5)
    setExpandedEdit(dim.id)

    // Load fresh progress
    const p = await loadProgress(dim.id)
    if (p) {
      setProgress((prev) => new Map(prev).set(dim.id, p))
    }
  }

  return (
    <div className="bg-card/90 backdrop-blur-md shadow-sm rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="font-serif text-lg text-ink">Wellbeing</h3>
        <button
          onClick={() => {
            haptic.light()
            setShowAddPicker(!showAddPicker)
            setExpandedAdd(null)
            setShowCustomInput(false)
          }}
          className="flex items-center gap-1 text-xs text-moss hover:text-moss/80 transition-colors touch-manipulation active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {/* Add Picker */}
      {showAddPicker && (
        <div className="px-5 pb-4">
          <p className="text-xs text-ink/50 mb-3">What would you like to track?</p>

          {/* Dimension chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {availableDimensions.map((dim) => (
              <button
                key={dim.name}
                onClick={() => {
                  haptic.light()
                  setExpandedAdd(dim.name)
                  setSliderValue(5)
                }}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors touch-manipulation active:scale-[0.97] ${
                  expandedAdd === dim.name
                    ? 'bg-moss text-cream'
                    : 'bg-cream text-ink/70 hover:bg-cream-deep'
                }`}
              >
                {dim.label}
              </button>
            ))}
            <button
              onClick={() => {
                haptic.light()
                setShowCustomInput(true)
                setExpandedAdd(null)
              }}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors touch-manipulation active:scale-[0.97] ${
                showCustomInput ? 'bg-moss text-cream' : 'bg-cream text-ink/70 hover:bg-cream-deep'
              }`}
            >
              + Custom
            </button>
          </div>

          {/* Custom input */}
          {showCustomInput && !expandedAdd && (
            <div className="mb-3">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customLabel.trim()) {
                    haptic.light()
                    setExpandedAdd(`custom:${customLabel.trim()}`)
                  }
                }}
                placeholder="Enter custom issue..."
                autoFocus
                className="w-full px-3 py-2 text-sm bg-cream border border-ink/10 rounded-lg focus:outline-none focus:border-moss/50"
              />
              {customLabel.trim() && (
                <button
                  onClick={() => {
                    haptic.light()
                    setExpandedAdd(`custom:${customLabel.trim()}`)
                  }}
                  className="mt-2 text-xs text-moss touch-manipulation"
                >
                  Set initial value for "{customLabel.trim()}"
                </button>
              )}
            </div>
          )}

          {/* Inline slider for new dimension */}
          {expandedAdd && (
            <div className="p-4 bg-cream rounded-xl">
              <p className="text-sm text-ink font-medium mb-1">
                {expandedAdd.startsWith('custom:')
                  ? expandedAdd.replace('custom:', '')
                  : SUGGESTED_DIMENSIONS.find((d) => d.name === expandedAdd)?.label}
              </p>
              <p className="text-xs text-ink/50 mb-4">How much is this affecting you?</p>

              <div className="mb-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-ink/10 rounded-full appearance-none cursor-pointer accent-moss"
                />
                <div className="flex justify-between text-xs text-ink/40 mt-1">
                  <span>Barely</span>
                  <span className="text-ink font-medium">{sliderValue}/10</span>
                  <span>Severely</span>
                </div>
              </div>

              <button
                onClick={() => {
                  haptic.success()
                  if (expandedAdd.startsWith('custom:')) {
                    const label = expandedAdd.replace('custom:', '')
                    handleAddWithScore(label.toLowerCase().replace(/\s+/g, '-'), label)
                  } else {
                    const dim = SUGGESTED_DIMENSIONS.find((d) => d.name === expandedAdd)
                    if (dim) handleAddWithScore(dim.name, dim.label)
                  }
                }}
                className="w-full py-2 bg-moss text-cream text-sm rounded-lg hover:bg-moss/90 transition-colors touch-manipulation active:scale-[0.98]"
              >
                Add to tracking
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tracked Dimensions */}
      {dimensions.length > 0 && (
        <div className="px-5 pb-5">
          {!showAddPicker && dimensions.length > 0 && (
            <p className="text-xs text-ink/40 mb-3">Tap to update, swipe to remove</p>
          )}

          <div className="space-y-2">
            {dimensions.map((dim) => {
              const checkIn = latestCheckIns.get(dim.id)
              const prog = progress.get(dim.id)
              const isExpanded = expandedEdit === dim.id
              const isSwiping = swipingId === dim.id

              return (
                <div key={dim.id} className="relative overflow-hidden rounded-xl">
                  {/* Delete button (revealed on swipe) */}
                  <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
                    <button
                      onClick={() => {
                        haptic.medium()
                        handleDelete(dim.id)
                      }}
                      className="text-white text-xs font-medium touch-manipulation"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Main content - swipe handlers only when collapsed */}
                  <div
                    className="relative bg-cream rounded-xl transition-transform"
                    style={{
                      transform: `translateX(-${isSwiping && !isExpanded ? swipeOffset : 0}px)`,
                    }}
                    {...(!isExpanded
                      ? {
                          onTouchStart: (e: TouchEvent<HTMLDivElement>) =>
                            handleTouchStart(e, dim.id),
                          onTouchMove: handleTouchMove,
                          onTouchEnd: handleTouchEnd,
                        }
                      : {})}
                  >
                    {isExpanded ? (
                      /* Expanded edit view */
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-ink font-medium">{dim.label}</p>
                          <button
                            onClick={() => {
                              haptic.light()
                              setExpandedEdit(null)
                            }}
                            className="text-ink/40 hover:text-ink/60 touch-manipulation"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <p className="text-xs text-ink/50 mb-3">
                          How much is this affecting you now?
                        </p>

                        <div className="mb-4">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(parseInt(e.target.value))}
                            className="w-full h-2 bg-ink/10 rounded-full appearance-none cursor-pointer accent-moss"
                          />
                          <div className="flex justify-between text-xs text-ink/40 mt-1">
                            <span>Barely</span>
                            <span className="text-ink font-medium">{sliderValue}/10</span>
                            <span>Severely</span>
                          </div>
                        </div>

                        {prog && prog.baseline !== sliderValue && (
                          <p className="text-xs text-ink/50 mb-3">
                            Started at {prog.baseline}/10
                            {sliderValue < prog.baseline && (
                              <span className="text-moss ml-1">
                                ({Math.round(((prog.baseline - sliderValue) / prog.baseline) * 100)}
                                % improvement)
                              </span>
                            )}
                          </p>
                        )}

                        <button
                          onClick={() => {
                            haptic.success()
                            handleUpdateScore(dim.id)
                          }}
                          className="w-full py-2 bg-moss text-cream text-sm rounded-lg hover:bg-moss/90 transition-colors touch-manipulation active:scale-[0.98]"
                        >
                          Update
                        </button>
                      </div>
                    ) : (
                      /* Collapsed view */
                      <button
                        onClick={() => {
                          haptic.light()
                          handleExpandEdit(dim)
                        }}
                        className="w-full p-4 text-left touch-manipulation"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-ink">{dim.label}</p>
                          <div className="flex items-center gap-2">
                            {prog && prog.percentChange > 0 && (
                              <span className="text-xs text-moss">↓{prog.percentChange}%</span>
                            )}
                            {prog && prog.percentChange < 0 && (
                              <span className="text-xs text-amber-600">
                                ↑{Math.abs(prog.percentChange)}%
                              </span>
                            )}
                            <span className="text-xs text-ink/50 tabular-nums">
                              {checkIn?.score || '—'}/10
                            </span>
                          </div>
                        </div>

                        {checkIn && (
                          <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-moss to-moss/60 rounded-full transition-all"
                              style={{ width: `${(checkIn.score / 10) * 100}%` }}
                            />
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {dimensions.length === 0 && !showAddPicker && (
        <div className="px-5 pb-5 text-center">
          <p className="text-sm text-ink/50 mb-3">
            Track how meditation affects your wellbeing over time
          </p>
          <button
            onClick={() => {
              haptic.light()
              setShowAddPicker(true)
            }}
            className="px-4 py-2 bg-moss text-cream text-sm rounded-lg hover:bg-moss/90 transition-colors touch-manipulation active:scale-[0.98]"
          >
            Start Tracking
          </button>
        </div>
      )}
    </div>
  )
}
