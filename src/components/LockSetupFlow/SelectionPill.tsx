/**
 * SelectionPill - Selectable pill button for setup flow
 *
 * Follows the design spec:
 * - Default: bg-elevated, border-subtle
 * - Selected: accent tinted background, accent border
 * - Press: scale(0.98) + haptic
 */

import { useTapFeedback } from '../../hooks/useTapFeedback'

interface SelectionPillProps {
  label: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

export function SelectionPill({ label, selected, onSelect, disabled }: SelectionPillProps) {
  const haptic = useTapFeedback()

  return (
    <button
      onClick={() => {
        if (!disabled) {
          haptic.light()
          onSelect()
        }
      }}
      disabled={disabled}
      className={`
        px-4 py-3 rounded-xl text-sm font-medium
        transition-all duration-150 ease-out
        active:scale-[0.98] touch-manipulation
        disabled:opacity-50
      `}
      style={{
        background: selected
          ? 'color-mix(in oklab, var(--accent) 12%, transparent)'
          : 'var(--bg-elevated)',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border-subtle)'}`,
        color: 'var(--text-primary)',
        boxShadow: selected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

// Multi-select version
interface MultiSelectPillProps {
  label: string
  selected: boolean
  onToggle: () => void
  disabled?: boolean
}

export function MultiSelectPill({ label, selected, onToggle, disabled }: MultiSelectPillProps) {
  const haptic = useTapFeedback()

  return (
    <button
      onClick={() => {
        if (!disabled) {
          haptic.light()
          onToggle()
        }
      }}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-xl text-sm
        transition-all duration-150 ease-out
        active:scale-[0.98] touch-manipulation
        disabled:opacity-50
      `}
      style={{
        background: selected
          ? 'color-mix(in oklab, var(--accent) 12%, transparent)'
          : 'var(--bg-elevated)',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border-subtle)'}`,
        color: 'var(--text-primary)',
        boxShadow: selected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Checkbox indicator */}
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
        style={{
          background: selected ? 'var(--accent)' : 'transparent',
          border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border-subtle)'}`,
        }}
      >
        {selected && (
          <svg
            className="w-3 h-3"
            style={{ color: 'var(--text-on-accent)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-left">{label}</span>
    </button>
  )
}
