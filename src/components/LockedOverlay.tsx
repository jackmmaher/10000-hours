/**
 * LockedOverlay - Reusable blur + CTA component
 * Used for locked features in FREE tier after Day 31
 *
 * Soft messaging, no lock icons - follows design principles
 */

interface LockedOverlayProps {
  message?: string
  onTap?: () => void
  children?: React.ReactNode
}

export function LockedOverlay({
  message = 'Unlock your full journey',
  onTap,
  children
}: LockedOverlayProps) {
  return (
    <button
      onClick={onTap}
      className="relative w-full text-left group"
    >
      {/* Blurred content behind */}
      <div className="blur-sm opacity-40 pointer-events-none">
        {children}
      </div>

      {/* Overlay with message */}
      <div className="absolute inset-0 flex items-center justify-center bg-cream/60">
        <div className="text-center px-4">
          <p className="text-sm text-indigo-deep/70 group-hover:text-indigo-deep transition-colors">
            {message}
          </p>
          <p className="text-xs text-indigo-deep/40 mt-1">
            $4.99/year
          </p>
        </div>
      </div>
    </button>
  )
}

/**
 * GrayedStatWindow - For locked stat time windows
 * Shows the label but grayed out, tappable to show paywall
 */
interface GrayedStatWindowProps {
  label: string
  onTap?: () => void
  isSelected?: boolean
}

export function GrayedStatWindow({ label, onTap, isSelected }: GrayedStatWindowProps) {
  return (
    <button
      onClick={onTap}
      className={`
        text-sm transition-colors
        ${isSelected
          ? 'text-indigo-deep/30'
          : 'text-indigo-deep/20 hover:text-indigo-deep/30'
        }
      `}
    >
      {label}
    </button>
  )
}
