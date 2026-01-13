/**
 * SectionHeader - Section title with optional "See All" action
 *
 * Creates visual rhythm breaks in the Explore feed.
 * Typography matches Journey tab section headers.
 */

import { useTapFeedback } from '../../hooks/useTapFeedback'

interface SectionHeaderProps {
  /** Section title */
  title: string
  /** Optional "See All" click handler */
  onSeeAll?: () => void
  /** Additional className */
  className?: string
}

export function SectionHeader({ title, onSeeAll, className = '' }: SectionHeaderProps) {
  const haptic = useTapFeedback()

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h2 className="font-serif text-sm text-ink/50 tracking-wide">{title}</h2>
      {onSeeAll && (
        <button
          onClick={() => {
            haptic.light()
            onSeeAll()
          }}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          See All
        </button>
      )}
    </div>
  )
}
