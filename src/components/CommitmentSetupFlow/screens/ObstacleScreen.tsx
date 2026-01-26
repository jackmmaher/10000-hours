/**
 * Screen 7: Obstacle Anticipation
 *
 * "What might get in the way?"
 * Multi-select obstacles with per-obstacle coping responses (implementation intentions)
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

// Predefined obstacles
const OBSTACLE_OPTIONS = [
  { id: 'running-late', label: 'Running late' },
  { id: 'too-tired', label: 'Too tired' },
  { id: 'interrupted', label: 'Interrupted' },
  { id: 'dont-feel-like-it', label: "Don't feel like it" },
  { id: 'forgot', label: 'Forgot' },
]

export function ObstacleScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()
  const [customObstacle, setCustomObstacle] = useState('')
  const [showCustomObstacleInput, setShowCustomObstacleInput] = useState(false)
  const [customCopingInputs, setCustomCopingInputs] = useState<Record<string, string>>({})

  // Dynamic coping options - minimum uses actual value from form
  const getCopingOptions = () => [
    `do my ${formState.minimumFallbackMinutes}-min minimum`,
    'meditate during lunch',
    'meditate after dinner',
    'take 3 deep breaths first',
  ]

  // Check if an obstacle is selected
  const isObstacleSelected = (obstacleId: string) => {
    return formState.selectedObstacles.includes(obstacleId)
  }

  // Get coping response for an obstacle
  const getCopingResponse = (obstacleId: string) => {
    const found = formState.obstacles.find((o) => o.obstacle === obstacleId)
    return found?.copingResponse || ''
  }

  // Toggle obstacle selection
  const toggleObstacle = (obstacleId: string) => {
    haptic.light()
    const currentSelected = formState.selectedObstacles
    const currentObstacles = formState.obstacles

    if (currentSelected.includes(obstacleId)) {
      // Remove obstacle
      updateForm({
        selectedObstacles: currentSelected.filter((id) => id !== obstacleId),
        obstacles: currentObstacles.filter((o) => o.obstacle !== obstacleId),
      })
    } else {
      // Add obstacle with empty coping response
      updateForm({
        selectedObstacles: [...currentSelected, obstacleId],
        obstacles: [...currentObstacles, { obstacle: obstacleId, copingResponse: '' }],
      })
    }
  }

  // Set coping response for an obstacle
  const setCopingResponse = (obstacleId: string, response: string) => {
    haptic.light()
    const currentObstacles = formState.obstacles.map((o) =>
      o.obstacle === obstacleId ? { ...o, copingResponse: response } : o
    )
    updateForm({ obstacles: currentObstacles })
  }

  // Handle custom obstacle
  const handleAddCustomObstacle = () => {
    if (customObstacle.trim()) {
      const customId = `custom-${customObstacle.trim().toLowerCase().replace(/\s+/g, '-')}`
      if (!formState.selectedObstacles.includes(customId)) {
        updateForm({
          selectedObstacles: [...formState.selectedObstacles, customId],
          obstacles: [...formState.obstacles, { obstacle: customId, copingResponse: '' }],
        })
      }
      setCustomObstacle('')
      setShowCustomObstacleInput(false)
    }
  }

  // Handle custom coping response input
  const handleCustomCopingChange = (obstacleId: string, value: string) => {
    setCustomCopingInputs((prev) => ({ ...prev, [obstacleId]: value }))
    setCopingResponse(obstacleId, value)
  }

  // Get obstacle label (handle custom obstacles)
  const getObstacleLabel = (obstacleId: string) => {
    const predefined = OBSTACLE_OPTIONS.find((o) => o.id === obstacleId)
    if (predefined) return predefined.label
    // Custom obstacle - extract from ID
    if (obstacleId.startsWith('custom-')) {
      return obstacleId.replace('custom-', '').replace(/-/g, ' ')
    }
    return obstacleId
  }

  // Check if all selected obstacles have coping responses
  const allObstaclesHaveCoping = formState.obstacles.every(
    (o) => o.copingResponse && o.copingResponse.trim() !== ''
  )

  return (
    <div className="pt-8 pb-32">
      {/* Title */}
      <motion.h1
        className="font-serif text-2xl mb-2"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        What might get in the way?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-6"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Select what applies to you, then plan your response
      </motion.p>

      {/* Obstacle checkboxes */}
      <motion.div
        className="space-y-2 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {OBSTACLE_OPTIONS.map((obstacle) => (
          <button
            key={obstacle.id}
            onClick={() => toggleObstacle(obstacle.id)}
            className="w-full p-3 rounded-xl text-left transition-all duration-150 flex items-center gap-3 active:scale-[0.99] touch-manipulation"
            style={{
              background: isObstacleSelected(obstacle.id)
                ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                : 'var(--bg-elevated)',
              border: `1.5px solid ${isObstacleSelected(obstacle.id) ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                border: `2px solid ${isObstacleSelected(obstacle.id) ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: isObstacleSelected(obstacle.id) ? 'var(--accent)' : 'transparent',
              }}
            >
              {isObstacleSelected(obstacle.id) && (
                <svg
                  className="w-3 h-3"
                  style={{ color: 'var(--text-on-accent)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {obstacle.label}
            </span>
          </button>
        ))}

        {/* Custom obstacle pill */}
        {!showCustomObstacleInput ? (
          <button
            onClick={() => setShowCustomObstacleInput(true)}
            className="w-full p-3 rounded-xl text-left transition-all duration-150 flex items-center gap-3 active:scale-[0.99] touch-manipulation"
            style={{
              background: 'var(--bg-elevated)',
              border: '1.5px dashed var(--border-subtle)',
            }}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ border: '2px dashed var(--border-subtle)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                +
              </span>
            </div>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Other...
            </span>
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={customObstacle}
              onChange={(e) => setCustomObstacle(e.target.value)}
              placeholder="Describe your obstacle..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomObstacle()}
              className="flex-1 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--accent)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleAddCustomObstacle}
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: 'var(--accent)',
                color: 'var(--text-on-accent)',
              }}
            >
              Add
            </button>
          </div>
        )}
      </motion.div>

      {/* Per-obstacle coping responses */}
      {formState.selectedObstacles.length > 0 && (
        <div className="space-y-4 mb-6">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Your if-then responses:
          </p>

          {formState.selectedObstacles.map((obstacleId) => {
            const currentResponse = getCopingResponse(obstacleId)
            const isCustomResponse =
              !getCopingOptions().includes(currentResponse) && currentResponse !== ''

            return (
              <div
                key={obstacleId}
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                  If I'm{' '}
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                    {getObstacleLabel(obstacleId).toLowerCase()}
                  </span>
                  , I will...
                </p>

                <div className="flex flex-wrap gap-2">
                  {getCopingOptions().map((option) => (
                    <SelectionPill
                      key={option}
                      label={option}
                      selected={currentResponse === option}
                      onSelect={() => setCopingResponse(obstacleId, option)}
                    />
                  ))}
                  <SelectionPill
                    label={isCustomResponse ? currentResponse : 'Custom...'}
                    selected={isCustomResponse}
                    onSelect={() => {
                      if (!isCustomResponse) {
                        setCustomCopingInputs((prev) => ({ ...prev, [obstacleId]: '' }))
                        setCopingResponse(obstacleId, '')
                      }
                    }}
                  />
                </div>

                {/* Custom coping input */}
                {(isCustomResponse ||
                  (customCopingInputs[obstacleId] !== undefined && currentResponse === '')) && (
                  <input
                    type="text"
                    value={customCopingInputs[obstacleId] || currentResponse}
                    onChange={(e) => handleCustomCopingChange(obstacleId, e.target.value)}
                    placeholder="Enter your coping strategy..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl text-sm mt-3"
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Helper text */}
      <motion.p
        className="text-sm italic mt-4"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        (Having a plan for obstacles increases follow-through by 2-3x)
      </motion.p>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onNext}
            disabled={formState.selectedObstacles.length > 0 && !allObstaclesHaveCoping}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
