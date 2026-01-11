/**
 * TierCelebration - Shown when user upgrades to a new Voice tier
 *
 * Serotonin trigger: Identity recognition through named status.
 * Zen styling - simple, elegant, not flashy.
 *
 * Tier names:
 * - Newcomer: Beginning the path
 * - Practitioner: Developing a practice
 * - Established: A steady presence
 * - Respected: Wisdom recognized
 * - Mentor: Guiding others on the path
 */

import { useEffect, useState } from 'react'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import type { VoiceTierInfo } from '../lib/voice'

interface TierCelebrationProps {
  tier: VoiceTierInfo
  onDismiss: () => void
}

export function TierCelebration({ tier, onDismiss }: TierCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()

  useEffect(() => {
    // Trigger feedback
    haptic.success()
    audio.milestone()

    // Fade in
    requestAnimationFrame(() => setIsVisible(true))

    // Auto-dismiss after 3.5 seconds (slightly longer than regular milestone)
    const timeout = setTimeout(() => {
      setIsVisible(false)
      // Allow fade out animation before dismissing
      setTimeout(onDismiss, 300)
    }, 3500)

    return () => clearTimeout(timeout)
  }, [haptic, audio, onDismiss])

  const handleTap = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        backdrop-blur-sm
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ background: 'var(--bg-overlay)' }}
      onClick={handleTap}
    >
      <div
        className="text-center p-8 rounded-2xl mx-4"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {/* Subtle accent dot */}
        <div
          className="w-2 h-2 rounded-full mx-auto mb-6"
          style={{ background: 'var(--accent)' }}
        />

        {/* Tier name - the main event */}
        <p
          className="text-4xl font-serif mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {tier.label}
        </p>

        {/* Tier description */}
        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          {tier.description}
        </p>

        {/* Context line */}
        <p
          className="text-xs mt-8"
          style={{ color: 'var(--text-muted)' }}
        >
          Your voice in the community
        </p>
      </div>
    </div>
  )
}
