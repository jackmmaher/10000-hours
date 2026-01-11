/**
 * TabButton - Sub-tab navigation button
 */

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      onTouchEnd={(e) => {
        // Stop propagation to prevent parent swipe handlers from interfering
        e.stopPropagation()
      }}
      className={`
        flex-1 py-2 px-3 text-sm rounded-md transition-all touch-manipulation
        ${active ? 'bg-cream text-ink shadow-sm' : 'text-ink/40 hover:text-ink/60'}
      `}
    >
      {children}
    </button>
  )
}
