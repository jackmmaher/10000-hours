/**
 * Screen 2: Anchor Activity
 *
 * "I will meditate immediately after I..."
 * "Where will you do this?"
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const ANCHOR_OPTIONS = [
  'wake up',
  'pour my coffee',
  'brush my teeth',
  'finish my workout',
  'get home from work',
]

const LOCATION_OPTIONS = ['bedroom', 'living room', 'office', 'car']

export function AnchorActivityScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()
  const [customAnchor, setCustomAnchor] = useState('')
  const [showCustomAnchor, setShowCustomAnchor] = useState(false)
  const [customLocation, setCustomLocation] = useState('')
  const [showCustomLocation, setShowCustomLocation] = useState(false)

  const handleAnchorSelect = (anchor: string) => {
    haptic.light()
    setShowCustomAnchor(false)
    updateForm({ anchorRoutine: anchor })
  }

  const handleCustomAnchorSelect = () => {
    setShowCustomAnchor(true)
    if (customAnchor) {
      updateForm({ anchorRoutine: customAnchor })
    }
  }

  const handleCustomAnchorChange = (value: string) => {
    setCustomAnchor(value)
    updateForm({ anchorRoutine: value })
  }

  const handleLocationSelect = (location: string) => {
    haptic.light()
    setShowCustomLocation(false)
    updateForm({ anchorLocation: location })
  }

  const handleCustomLocationSelect = () => {
    setShowCustomLocation(true)
    if (customLocation) {
      updateForm({ anchorLocation: customLocation })
    }
  }

  const handleCustomLocationChange = (value: string) => {
    setCustomLocation(value)
    updateForm({ anchorLocation: value })
  }

  const canProceed = formState.anchorRoutine && formState.anchorLocation

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
        Build your trigger
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Attach meditation to an existing habit
      </motion.p>

      {/* Anchor routine */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          "I will meditate immediately after I..."
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {ANCHOR_OPTIONS.map((option) => (
            <SelectionPill
              key={option}
              label={option}
              selected={formState.anchorRoutine === option && !showCustomAnchor}
              onSelect={() => handleAnchorSelect(option)}
            />
          ))}
          <SelectionPill
            label={showCustomAnchor && customAnchor ? customAnchor : 'Custom...'}
            selected={showCustomAnchor}
            onSelect={handleCustomAnchorSelect}
          />
        </div>

        {showCustomAnchor && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            type="text"
            value={customAnchor}
            onChange={(e) => handleCustomAnchorChange(e.target.value)}
            placeholder="enter your anchor..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent)',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          "Where will you do this?"
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {LOCATION_OPTIONS.map((option) => (
            <SelectionPill
              key={option}
              label={option}
              selected={formState.anchorLocation === option && !showCustomLocation}
              onSelect={() => handleLocationSelect(option)}
            />
          ))}
          <SelectionPill
            label={showCustomLocation && customLocation ? customLocation : 'Custom...'}
            selected={showCustomLocation}
            onSelect={handleCustomLocationSelect}
          />
        </div>

        {showCustomLocation && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            type="text"
            value={customLocation}
            onChange={(e) => handleCustomLocationChange(e.target.value)}
            placeholder="enter your location..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent)',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </motion.div>

      {/* Helper text */}
      <motion.p
        className="text-sm italic mt-6"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        (Habits anchored to routines stick 3x better)
      </motion.p>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={onNext} disabled={!canProceed}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
