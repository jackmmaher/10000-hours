/**
 * Screen 8: Accountability
 *
 * "Want someone in your corner?"
 * - Just me / Text someone choice
 * - If text: Phone number input, SMS/WhatsApp choice, notification prefs
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

type AccountabilityChoice = 'just-me' | 'text-someone'

export function AccountabilityScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()
  const [choice, setChoice] = useState<AccountabilityChoice>(
    formState.accountabilityEnabled ? 'text-someone' : 'just-me'
  )

  const handleChoiceChange = (newChoice: AccountabilityChoice) => {
    haptic.light()
    setChoice(newChoice)
    if (newChoice === 'just-me') {
      updateForm({
        accountabilityEnabled: false,
        accountabilityPhone: '',
      })
    } else {
      updateForm({ accountabilityEnabled: true })
    }
  }

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    updateForm({ accountabilityPhone: digits })
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
        Want someone in your corner?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Accountability partners increase success rates from 65% to 95%
      </motion.p>

      {/* Main choice cards */}
      <motion.div
        className="space-y-3 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Just me option */}
        <button
          onClick={() => handleChoiceChange('just-me')}
          className="w-full p-4 rounded-xl text-left transition-all duration-150 ease-out active:scale-[0.99] touch-manipulation"
          style={{
            background:
              choice === 'just-me'
                ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                : 'var(--bg-elevated)',
            border: `1.5px solid ${choice === 'just-me' ? 'var(--accent)' : 'var(--border-subtle)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                border: `2px solid ${choice === 'just-me' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: choice === 'just-me' ? 'var(--accent)' : 'transparent',
              }}
            >
              {choice === 'just-me' && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--text-on-accent)' }}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Just me — I've got this
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Build the habit on your own terms
              </p>
            </div>
          </div>
        </button>

        {/* Text someone option */}
        <button
          onClick={() => handleChoiceChange('text-someone')}
          className="w-full p-4 rounded-xl text-left transition-all duration-150 ease-out active:scale-[0.99] touch-manipulation"
          style={{
            background:
              choice === 'text-someone'
                ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                : 'var(--bg-elevated)',
            border: `1.5px solid ${choice === 'text-someone' ? 'var(--accent)' : 'var(--border-subtle)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                border: `2px solid ${choice === 'text-someone' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: choice === 'text-someone' ? 'var(--accent)' : 'transparent',
              }}
            >
              {choice === 'text-someone' && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--text-on-accent)' }}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Text someone when I complete
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Share your wins with someone who cares
              </p>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Expanded options when "text someone" is selected */}
      {choice === 'text-someone' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Phone number */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Their phone number
            </p>
            <input
              type="tel"
              inputMode="numeric"
              value={formatPhoneDisplay(formState.accountabilityPhone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Send via */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Send via
            </p>
            <div className="flex gap-2">
              <SelectionPill
                label="SMS"
                selected={formState.accountabilityMethod === 'sms'}
                onSelect={() => updateForm({ accountabilityMethod: 'sms' })}
              />
              <SelectionPill
                label="WhatsApp"
                selected={formState.accountabilityMethod === 'whatsapp'}
                onSelect={() => updateForm({ accountabilityMethod: 'whatsapp' })}
              />
              <SelectionPill
                label="Ask each time"
                selected={formState.accountabilityMethod === 'choose'}
                onSelect={() => updateForm({ accountabilityMethod: 'choose' })}
              />
            </div>
          </div>

          {/* What to notify */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Notify them about
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  haptic.light()
                  updateForm({ notifyOnCompletion: true, notifyOnSkip: false })
                }}
                className="w-full p-3 rounded-xl text-left transition-all duration-150 flex items-center gap-3"
                style={{
                  background:
                    formState.notifyOnCompletion && !formState.notifyOnSkip
                      ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                      : 'var(--bg-elevated)',
                  border: `1px solid ${formState.notifyOnCompletion && !formState.notifyOnSkip ? 'var(--accent)' : 'var(--border-subtle)'}`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    border: `2px solid ${formState.notifyOnCompletion && !formState.notifyOnSkip ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    background:
                      formState.notifyOnCompletion && !formState.notifyOnSkip
                        ? 'var(--accent)'
                        : 'transparent',
                  }}
                >
                  {formState.notifyOnCompletion && !formState.notifyOnSkip && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--text-on-accent)' }}
                    />
                  )}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Completions only
                </span>
              </button>

              <button
                onClick={() => {
                  haptic.light()
                  updateForm({ notifyOnCompletion: true, notifyOnSkip: true })
                }}
                className="w-full p-3 rounded-xl text-left transition-all duration-150 flex items-center gap-3"
                style={{
                  background:
                    formState.notifyOnCompletion && formState.notifyOnSkip
                      ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                      : 'var(--bg-elevated)',
                  border: `1px solid ${formState.notifyOnCompletion && formState.notifyOnSkip ? 'var(--accent)' : 'var(--border-subtle)'}`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    border: `2px solid ${formState.notifyOnCompletion && formState.notifyOnSkip ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    background:
                      formState.notifyOnCompletion && formState.notifyOnSkip
                        ? 'var(--accent)'
                        : 'transparent',
                  }}
                >
                  {formState.notifyOnCompletion && formState.notifyOnSkip && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--text-on-accent)' }}
                    />
                  )}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Completions + misses
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper text */}
      <motion.p
        className="text-sm italic mt-6"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {choice === 'just-me'
          ? '(You can always add an accountability partner later in Settings)'
          : '(Messages open in your preferred app — you tap send)'}
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
            disabled={choice === 'text-someone' && formState.accountabilityPhone.length < 10}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
