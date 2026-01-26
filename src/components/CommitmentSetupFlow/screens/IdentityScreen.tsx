/**
 * Screen 1: Identity Framing
 *
 * "Who are you becoming?"
 * Complete: "I am becoming someone who ___________"
 * Optional: "Why does this matter to you?"
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const IDENTITY_OPTIONS = ['meditates daily', 'trains mentally', 'handles pressure well']

export function IdentityScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const [customIdentity, setCustomIdentity] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const haptic = useTapFeedback()

  const handleSelect = (identity: string) => {
    haptic.light()
    setShowCustomInput(false)
    updateForm({ identityStatement: identity })
  }

  const handleCustomSelect = () => {
    haptic.light()
    setShowCustomInput(true)
    updateForm({ identityStatement: customIdentity })
  }

  const handleCustomChange = (value: string) => {
    setCustomIdentity(value)
    updateForm({ identityStatement: value })
  }

  const canContinue = formState.identityStatement.trim().length > 0

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
        Who are you becoming?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Complete this sentence to define your identity
      </motion.p>

      {/* Prompt */}
      <motion.p
        className="text-base mb-4"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        "I am becoming someone who..."
      </motion.p>

      {/* Options */}
      <motion.div
        className="flex flex-wrap gap-2 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {IDENTITY_OPTIONS.map((option) => (
          <SelectionPill
            key={option}
            label={option}
            selected={formState.identityStatement === option && !showCustomInput}
            onSelect={() => handleSelect(option)}
          />
        ))}
        <SelectionPill
          label={showCustomInput && customIdentity ? customIdentity : 'Custom...'}
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
            value={customIdentity}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="enter your own..."
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

      {/* Optional: Why it matters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
          Optional: Why does this matter to you?
        </p>
        <textarea
          value={formState.whyItMatters}
          onChange={(e) => updateForm({ whyItMatters: e.target.value })}
          placeholder="This helps reinforce your commitment..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      </motion.div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={onNext} disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
