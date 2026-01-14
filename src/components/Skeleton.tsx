/**
 * Skeleton - Loading placeholder components
 *
 * Provides smooth, animated placeholder shapes while content loads.
 * More visually appealing than spinners and gives users a sense
 * of what content structure to expect.
 */

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-ink/10'

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  }

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

/**
 * SkeletonCard - Pearl/Insight card placeholder
 */
export function SkeletonCard() {
  return (
    <div className="bg-cream rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton width="40%" height={12} />
      </div>

      {/* Content lines */}
      <div className="space-y-2 mb-4">
        <Skeleton width="100%" height={16} />
        <Skeleton width="85%" height={16} />
        <Skeleton width="70%" height={16} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Skeleton width={50} height={20} />
        <Skeleton width={40} height={20} />
      </div>
    </div>
  )
}

/**
 * SkeletonSessionCard - Session template card placeholder
 */
export function SkeletonSessionCard() {
  return (
    <div className="bg-cream rounded-2xl overflow-hidden shadow-sm">
      {/* Gradient header */}
      <div className="h-20 bg-ink/5 animate-pulse" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <Skeleton width="70%" height={18} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="60%" height={14} />

        {/* Stats */}
        <div className="flex gap-4 pt-2">
          <Skeleton width={60} height={12} />
          <Skeleton width={60} height={12} />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonList - Multiple skeleton cards
 */
export function SkeletonList({
  count = 3,
  type = 'card',
}: {
  count?: number
  type?: 'card' | 'session'
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) =>
        type === 'session' ? <SkeletonSessionCard key={i} /> : <SkeletonCard key={i} />
      )}
    </div>
  )
}

/**
 * SkeletonStats - Stats/numbers placeholder
 */
export function SkeletonStats() {
  return (
    <div className="text-center space-y-2">
      <Skeleton width={120} height={48} className="mx-auto rounded-lg" />
      <Skeleton width={80} height={14} className="mx-auto" />
    </div>
  )
}
