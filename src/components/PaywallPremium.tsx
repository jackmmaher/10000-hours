/**
 * PaywallPremium - Day 31 paywall and upgrade prompts
 *
 * Variants:
 * - day31: Shown on first Day 31 session (primary trigger)
 * - settings: Shown from settings "Unlock" button
 * - stats: Shown when tapping locked stats
 * - calendar: Shown when tapping faded calendar
 *
 * Design: Soft messaging, no guilt, no lock icons
 */

import { usePremiumStore } from '../stores/usePremiumStore'
import {
  trackDay31Trigger,
  trackPaywallDismissed,
  trackPaywallConverted
} from '../lib/analytics'

type PaywallSource = 'day31' | 'settings' | 'stats' | 'calendar'

interface PaywallPremiumProps {
  source: PaywallSource
  onDismiss: () => void
  onPurchase: () => Promise<void>
  onRestore: () => Promise<void>
}

export function PaywallPremium({
  source,
  onDismiss,
  onPurchase,
  onRestore
}: PaywallPremiumProps) {
  const { daysSinceFirstSession } = usePremiumStore()

  // Track that paywall was shown
  if (source === 'day31') {
    trackDay31Trigger(daysSinceFirstSession)
  }

  const handleDismiss = () => {
    trackPaywallDismissed(source)
    onDismiss()
  }

  const handlePurchase = async () => {
    try {
      await onPurchase()
      trackPaywallConverted(source)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  // Different messaging based on source
  const content = getContent(source, daysSinceFirstSession)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-deep/20 backdrop-blur-sm">
      <div className="bg-cream mx-6 p-8 rounded-2xl max-w-sm w-full shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl text-indigo-deep mb-2">
            {content.title}
          </h2>
          <p className="text-sm text-indigo-deep/60">
            {content.subtitle}
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-8">
          <FeatureItem text="Full cumulative hours tracking" />
          <FeatureItem text="All-time stats and projections" />
          <FeatureItem text="Complete calendar history" />
          <FeatureItem text="Milestone progression" />
          <FeatureItem text="Hide time display option" />
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <p className="text-3xl font-serif text-indigo-deep">$4.99</p>
          <p className="text-sm text-indigo-deep/50">per year</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            className="w-full py-3 bg-indigo-deep text-cream rounded-lg font-medium hover:bg-indigo-deep/90 transition-colors"
          >
            See full journey
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-3 text-indigo-deep/50 hover:text-indigo-deep/70 transition-colors text-sm"
          >
            {content.dismissText}
          </button>
        </div>

        {/* Restore */}
        <button
          onClick={onRestore}
          className="w-full mt-4 text-xs text-indigo-deep/30 hover:text-indigo-deep/50 transition-colors"
        >
          Restore Purchase
        </button>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        className="w-4 h-4 text-indigo-deep/60 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-sm text-indigo-deep/70">{text}</span>
    </div>
  )
}

function getContent(source: PaywallSource, days: number) {
  switch (source) {
    case 'day31':
      return {
        title: 'Your first 30 days are complete',
        subtitle: `You've built a real practice. Your history is still here — it's just starting to fade.`,
        dismissText: 'Keep practicing',
      }
    case 'settings':
      return {
        title: 'Unlock your full journey',
        subtitle: `${days} days of meditation, always accessible.`,
        dismissText: 'Maybe later',
      }
    case 'stats':
      return {
        title: 'See your complete history',
        subtitle: 'All your stats, from day one to today.',
        dismissText: 'Maybe later',
      }
    case 'calendar':
      return {
        title: 'Your history is fading',
        subtitle: 'Keep your full calendar visible.',
        dismissText: 'Maybe later',
      }
    default:
      return {
        title: 'Unlock Premium',
        subtitle: 'Get the complete experience.',
        dismissText: 'Maybe later',
      }
  }
}
