/**
 * IntentGrid - Category navigation for content discovery
 *
 * 2x4 grid of intent buttons providing quick filtering.
 * Replaces the inline horizontal filter for better visual hierarchy.
 */

import { useTapFeedback } from '../../hooks/useTapFeedback'
import { INTENT_OPTIONS, IntentType } from './types'

interface IntentGridProps {
  /** Currently selected intent (null = none) */
  selectedIntent: IntentType
  /** Callback when intent is selected/deselected */
  onIntentSelect: (intent: IntentType) => void
}

// Human-readable labels for intents
const INTENT_LABELS: Record<(typeof INTENT_OPTIONS)[number], string> = {
  anxiety: 'Anxiety',
  stress: 'Stress',
  sleep: 'Sleep',
  focus: 'Focus',
  beginners: 'Beginners',
  'body-awareness': 'Body',
  'self-compassion': 'Self',
  'letting-go': 'Letting Go',
}

export function IntentGrid({ selectedIntent, onIntentSelect }: IntentGridProps) {
  const haptic = useTapFeedback()

  return (
    <div className="grid grid-cols-4 gap-2">
      {INTENT_OPTIONS.map((intent) => {
        const isSelected = selectedIntent === intent
        return (
          <button
            key={intent}
            onClick={() => {
              haptic.light()
              onIntentSelect(isSelected ? null : intent)
            }}
            className={`
              px-3 py-2.5 text-xs rounded-xl transition-all
              touch-manipulation active:scale-[0.97]
              ${
                isSelected
                  ? 'bg-ink text-cream font-medium shadow-sm'
                  : 'bg-cream-deep text-ink/60 hover:text-ink/80 hover:bg-cream-deep/80'
              }
            `}
          >
            {INTENT_LABELS[intent]}
          </button>
        )
      })}
    </div>
  )
}
