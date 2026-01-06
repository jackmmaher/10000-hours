/**
 * PaywallPremium - Premium upgrade prompt
 *
 * Value-add model features:
 * - Whisper API transcription (better accuracy)
 * - AI text formatting
 * - Share insights as pearls
 * - Impact stats (karma, saves)
 * - Cloud backup & sync
 *
 * Design: Soft messaging, focus on enhanced features
 */

import { useEffect, useState } from 'react'
import { getAchievements } from '../lib/db'
import {
  trackPaywallDismissed,
  trackPaywallConverted
} from '../lib/analytics'

type PaywallSource = 'settings' | 'stats' | 'calendar'

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
  const [achievementCount, setAchievementCount] = useState(0)

  // Load achievements count
  useEffect(() => {
    getAchievements().then(achievements => {
      setAchievementCount(achievements.length)
    })
  }, [])

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

  const content = getContent(source, achievementCount)

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

        {/* Premium Features list */}
        <div className="space-y-3 mb-8">
          <FeatureItem text="Better transcription with Whisper AI" />
          <FeatureItem text="AI-formatted insights" />
          <FeatureItem text="Share wisdom pearls with community" />
          <FeatureItem text="See your impact (karma & saves)" />
          <FeatureItem text="Cloud backup & sync" />
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
            Upgrade to Premium
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

function getContent(source: PaywallSource, achievements: number) {
  switch (source) {
    case 'settings':
      return {
        title: 'Premium Features',
        subtitle: achievements >= 1
          ? `${achievements} milestone${achievements > 1 ? 's' : ''} achieved. Enhance your practice.`
          : 'Take your practice to the next level.',
        dismissText: 'Maybe later',
      }
    case 'stats':
      return {
        title: 'Premium Features',
        subtitle: 'Share insights and track your impact.',
        dismissText: 'Maybe later',
      }
    case 'calendar':
      return {
        title: 'Premium Features',
        subtitle: 'Backup your journey and sync across devices.',
        dismissText: 'Maybe later',
      }
    default:
      return {
        title: 'Premium Features',
        subtitle: 'Enhanced tools for serious practitioners.',
        dismissText: 'Maybe later',
      }
  }
}
