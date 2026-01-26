/**
 * Screen 11: Celebration Ritual
 *
 * "After meditating, I will..."
 * Options: smile, take a deep breath, say 'yes' to myself, Custom
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const CELEBRATION_OPTIONS = ['smile', 'take a deep breath', "say 'yes' to myself"]

export function CelebrationScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const [customCelebration, setCustomCelebration] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const haptic = useTapFeedback()

  const handleSelect = (celebration: string) => {
    haptic.light()
    setShowCustomInput(false)
    updateForm({ celebrationRitual: celebration })
  }

  const handleCustomSelect = () => {
    haptic.light()
    setShowCustomInput(true)
    updateForm({ celebrationRitual: customCelebration })
  }

  const handleCustomChange = (value: string) => {
    setCustomCelebration(value)
    updateForm({ celebrationRitual: value })
  }

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
        Your celebration ritual
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        A tiny celebration wires the habit into your brain
      </motion.p>

      {/* Prompt */}
      <motion.p
        className="text-base mb-4"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        "After meditating, I will..."
      </motion.p>

      {/* Options */}
      <motion.div
        className="flex flex-wrap gap-2 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {CELEBRATION_OPTIONS.map((option) => (
          <SelectionPill
            key={option}
            label={option}
            selected={formState.celebrationRitual === option && !showCustomInput}
            onSelect={() => handleSelect(option)}
          />
        ))}
        <SelectionPill
          label={showCustomInput && customCelebration ? customCelebration : 'Custom...'}
          selected={showCustomInput}
          onSelect={handleCustomSelect}
        />
      </motion.div>

      {/* Custom input */}
      {showCustomInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="text"
            value={customCelebration}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="enter your celebration..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-sm mb-6"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </motion.div>
      )}

      {/* Helper text */}
      <motion.p
        className="text-sm italic mt-2"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        (Even a small smile releases dopamine)
      </motion.p>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
