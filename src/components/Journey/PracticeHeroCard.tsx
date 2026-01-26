/**
 * PracticeHeroCard - Premium hero card for practice tools
 *
 * Design philosophy: These are INSTRUMENTS for transformation.
 * Each card should feel like picking up a precision tool.
 *
 * Visual signature:
 * - Dramatic gradient backgrounds with feature-specific coloring
 * - Large, expressive orb that breathes and pulses
 * - Icon integrated INTO the orb, not separate from it
 * - Strong visual hierarchy with clear focal points
 * - Coming Soon cards are aspirational, not disabled
 */

import { ANIMATION_BREATHE_DURATION } from '../../lib/animations'
import { useTapFeedback } from '../../hooks/useTapFeedback'
import type { PracticeFeatureConfig } from './practiceFeatureConfig'
import type { MeditationLockSettings } from '../../lib/db/types'

interface PracticeHeroCardProps {
  feature: PracticeFeatureConfig
  lockSettings?: MeditationLockSettings | null
  onPress: () => void
}

function formatLockSchedule(settings: MeditationLockSettings): {
  timeRange: string
  activeDays: string
} {
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const window = settings.scheduleWindows[0]
  const timeRange = window
    ? `${formatTime(window.startHour, window.startMinute)} - ${formatTime(window.endHour, window.endMinute)}`
    : ''
  const activeDays = settings.activeDays
    .map((active, i) => (active ? DAY_NAMES[i] : null))
    .filter(Boolean)
    .join(' \u00B7 ')

  return { timeRange, activeDays }
}

/**
 * Shield icon - Focus Mode
 */
function ShieldIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  )
}

/**
 * Sound wave icon - Aum Coach
 */
function SoundWaveIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  )
}

/**
 * Settling mind icon - Racing Mind (thoughts converging to stillness)
 * Represents scattered mental energy calming to a centered state
 */
function SettlingMindIcon({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* Outer scattered thoughts - motion lines converging */}
      <path strokeLinecap="round" strokeWidth={1.2} opacity={0.4} d="M4 4l3 3" />
      <path strokeLinecap="round" strokeWidth={1.2} opacity={0.4} d="M20 4l-3 3" />
      <path strokeLinecap="round" strokeWidth={1.2} opacity={0.4} d="M4 20l3-3" />
      <path strokeLinecap="round" strokeWidth={1.2} opacity={0.4} d="M20 20l-3-3" />
      {/* Mid-level settling */}
      <circle cx="7" cy="12" r="1" strokeWidth={1.2} opacity={0.5} />
      <circle cx="17" cy="12" r="1" strokeWidth={1.2} opacity={0.5} />
      <circle cx="12" cy="7" r="1" strokeWidth={1.2} opacity={0.5} />
      <circle cx="12" cy="17" r="1" strokeWidth={1.2} opacity={0.5} />
      {/* Center stillness - the calm core */}
      <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Lotus meditation pose icon - Perfect Posture
 * Simple silhouette of seated meditation posture
 */
function LotusPostureIcon({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* Head */}
      <circle cx="12" cy="5" r="2.5" strokeWidth={1.5} />
      {/* Body/torso - straight spine */}
      <path strokeLinecap="round" strokeWidth={1.5} d="M12 7.5v6" />
      {/* Arms in meditation mudra position */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 10.5c-2 0-4 1.5-5 3M12 10.5c2 0 4 1.5 5 3"
      />
      {/* Hands resting on knees */}
      <circle cx="7" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="17" cy="14" r="0.8" fill="currentColor" stroke="none" />
      {/* Lotus legs - crossed position */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 14c0 2 1.5 4 5 5c3.5-1 5-3 5-5"
      />
      {/* Feet visible at sides */}
      <ellipse cx="6" cy="17.5" rx="1.5" ry="1" strokeWidth={1.2} />
      <ellipse cx="18" cy="17.5" rx="1.5" ry="1" strokeWidth={1.2} />
    </svg>
  )
}

function FeatureIcon({
  featureId,
  className,
  style,
}: {
  featureId: string
  className?: string
  style?: React.CSSProperties
}) {
  switch (featureId) {
    case 'meditation-lock':
      return <ShieldIcon className={className} style={style} />
    case 'aum-coach':
      return <SoundWaveIcon className={className} style={style} />
    case 'racing-mind':
      return <SettlingMindIcon className={className} style={style} />
    case 'perfect-posture':
      return <LotusPostureIcon className={className} style={style} />
    default:
      return null
  }
}

export function PracticeHeroCard({ feature, lockSettings, onPress }: PracticeHeroCardProps) {
  const haptic = useTapFeedback()
  const isActive = feature.status === 'active'
  const isLockFeature = feature.id === 'meditation-lock'
  const isLockConfigured =
    isLockFeature && lockSettings?.enabled && lockSettings.scheduleWindows.length > 0

  const handlePress = () => {
    if (isActive) {
      haptic.medium()
    } else {
      haptic.light()
    }
    onPress()
  }

  const lockSchedule = isLockConfigured ? formatLockSchedule(lockSettings!) : null

  // Feature-specific gradient backgrounds
  const getCardGradient = () => {
    const { primary, secondary } = feature.orbColors
    if (isActive) {
      return `linear-gradient(135deg, ${primary}08 0%, ${secondary}05 50%, transparent 100%)`
    }
    return `linear-gradient(135deg, ${primary}04 0%, ${secondary}03 50%, transparent 100%)`
  }

  return (
    <button
      onClick={handlePress}
      disabled={!isActive}
      className={`
        relative w-full rounded-2xl overflow-hidden text-left
        transition-all duration-300 touch-manipulation cursor-pointer
        ${
          isActive
            ? 'hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg'
            : 'hover:scale-[1.005]'
        }
      `}
      style={{
        background: 'var(--bg-elevated)',
        boxShadow: isActive
          ? 'var(--shadow-elevation-2), 0 0 0 1px var(--border-subtle)'
          : 'var(--shadow-elevation-1), 0 0 0 1px var(--border-subtle)',
      }}
    >
      {/* Gradient overlay for feature-specific coloring */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: getCardGradient() }}
      />

      {/* Large breathing orb - THE focal point */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      >
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full ${isActive ? 'animate-pulse-soft' : ''}`}
          style={{
            width: isActive ? 180 : 140,
            height: isActive ? 180 : 140,
            marginLeft: isActive ? -90 : -70,
            marginTop: isActive ? -90 : -70,
            background: `radial-gradient(circle, ${feature.orbColors.primary}${isActive ? '15' : '08'} 0%, transparent 70%)`,
          }}
        />
        {/* Core orb */}
        <div
          className={`rounded-full ${isActive ? 'animate-breathe' : ''}`}
          style={{
            width: isActive ? 120 : 90,
            height: isActive ? 120 : 90,
            marginLeft: isActive ? -60 : -45,
            marginTop: isActive ? -60 : -45,
            background: `radial-gradient(circle at 35% 35%,
              ${feature.orbColors.primary}${isActive ? '30' : '15'} 0%,
              ${feature.orbColors.secondary}${isActive ? '20' : '10'} 50%,
              transparent 80%)`,
            animationDuration: `${ANIMATION_BREATHE_DURATION}ms`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-10 text-center">
        {/* Icon - integrated with orb energy */}
        <div className="relative mx-auto mb-5 w-16 h-16">
          {/* Icon background glow */}
          <div
            className={`absolute inset-0 rounded-2xl ${isActive ? 'animate-pulse-soft' : ''}`}
            style={{
              background: `radial-gradient(circle, ${feature.orbColors.primary}${isActive ? '25' : '12'} 0%, transparent 70%)`,
              transform: 'scale(1.5)',
            }}
          />
          {/* Icon container */}
          <div
            className={`
              relative w-16 h-16 rounded-2xl flex items-center justify-center
              backdrop-blur-sm transition-all duration-300
            `}
            style={{
              background: `linear-gradient(135deg, ${feature.orbColors.primary}${isActive ? '15' : '10'}, ${feature.orbColors.secondary}${isActive ? '10' : '08'})`,
              border: `1px solid ${feature.orbColors.primary}${isActive ? '25' : '15'}`,
            }}
          >
            <FeatureIcon
              featureId={feature.id}
              className="w-8 h-8 transition-colors duration-300"
              style={{
                color: feature.orbColors.primary,
                opacity: isActive ? 1 : 0.7,
              }}
            />
          </div>
        </div>

        {/* Category label */}
        <p
          className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3 transition-colors duration-300"
          style={{
            color: feature.orbColors.primary,
            opacity: isActive ? 1 : 0.7,
          }}
        >
          {feature.categoryLabel}
        </p>

        {/* Feature title */}
        <h3
          className={`font-serif text-2xl mb-2 transition-colors duration-300 ${isActive ? 'text-ink' : 'text-ink/70'}`}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm leading-relaxed mb-5 max-w-[280px] mx-auto transition-colors duration-300 ${isActive ? 'text-ink/60' : 'text-ink/45'}`}
        >
          {feature.description}
        </p>

        {/* Dynamic status for Lock (when configured) */}
        {isLockConfigured && lockSchedule && (
          <div
            className="mb-5 py-3 px-4 rounded-xl mx-auto max-w-[240px]"
            style={{
              background: `${feature.orbColors.primary}08`,
              border: `1px solid ${feature.orbColors.primary}15`,
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--success-icon)' }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--success-text)' }}>
                Active
              </span>
            </div>
            <p className="text-sm text-ink/70 font-medium">{lockSchedule.timeRange}</p>
            <p className="text-xs text-ink/50 mt-0.5">{lockSchedule.activeDays}</p>
            {lockSettings!.streakDays > 0 && (
              <p
                className="text-xs font-semibold mt-2"
                style={{ color: feature.orbColors.primary }}
              >
                {lockSettings!.streakDays} day streak
              </p>
            )}
          </div>
        )}

        {/* Feature pills - shown for ALL cards in tiered layout */}
        {feature.teaserFeatures && feature.teaserFeatures.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-5 max-w-[260px] mx-auto">
            {feature.teaserFeatures.slice(0, 3).map((teaser, i) => (
              <span
                key={i}
                className="text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: `${feature.orbColors.primary}10`,
                  color: feature.orbColors.primary,
                  opacity: isActive ? 1 : 0.8,
                }}
              >
                {teaser}
              </span>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {isActive ? (
          <div
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${feature.orbColors.primary}, ${feature.orbColors.secondary})`,
              color: 'var(--text-on-accent)',
              boxShadow: `0 4px 14px -3px ${feature.orbColors.primary}50`,
            }}
          >
            {isLockConfigured ? 'Edit Focus Mode' : feature.ctaText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide"
            style={{
              background: `linear-gradient(135deg, ${feature.orbColors.primary}12, ${feature.orbColors.secondary}08)`,
              color: feature.orbColors.primary,
              border: `1px solid ${feature.orbColors.primary}20`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: feature.orbColors.primary }}
            />
            Coming Soon
          </div>
        )}
      </div>
    </button>
  )
}
