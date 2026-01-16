/**
 * SuggestedForYou - Weekly personalized content recommendation
 *
 * Surfaces one meditation based on user's practice patterns.
 * Refreshes weekly to avoid overwhelm.
 *
 * Uses recommendations.ts algorithm:
 * - Matches discipline preferences
 * - Respects experience level
 * - Excludes already-saved content
 * - Considers intent tag overlap
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getRecommendedMeditation,
  SessionRecommendation,
  shouldRefreshRecommendation,
} from '../lib/recommendations'
import { updateAffinitiesForDismissal, updateAffinitiesForFollow } from '../lib/affinities'
import { getIntentionGradient } from '../lib/animations'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { Card, CardHeader, CardBody, CardTitle, CardDescription, AccentBar } from './Card'
import { SessionDetailModal, SessionTemplate } from './SessionDetailModal'
import { useNavigationStore } from '../stores/useNavigationStore'

// Local storage key for tracking recommendation state
const RECOMMENDATION_KEY = 'suggestedForYou'

interface StoredRecommendation {
  sessionId: string
  recommendedAt: number
  dismissed: boolean
}

export function SuggestedForYou() {
  const [recommendation, setRecommendation] = useState<SessionRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionTemplate | null>(null)
  const { setView } = useNavigationStore()
  const haptic = useTapFeedback()

  useEffect(() => {
    async function loadRecommendation() {
      try {
        // Check stored state
        const stored = localStorage.getItem(RECOMMENDATION_KEY)
        let storedData: StoredRecommendation | null = null

        if (stored) {
          const parsed: StoredRecommendation = JSON.parse(stored)
          storedData = parsed

          // If dismissed and not time to refresh, don't show
          if (parsed.dismissed && !shouldRefreshRecommendation(parsed.recommendedAt)) {
            setIsDismissed(true)
            setIsLoading(false)
            return
          }
        }

        // Get fresh recommendation if needed
        if (!storedData || shouldRefreshRecommendation(storedData.recommendedAt)) {
          const rec = await getRecommendedMeditation()
          setRecommendation(rec)

          if (rec) {
            // Store new recommendation
            localStorage.setItem(
              RECOMMENDATION_KEY,
              JSON.stringify({
                sessionId: rec.session.id,
                recommendedAt: Date.now(),
                dismissed: false,
              })
            )
          }
        } else if (storedData && !storedData.dismissed) {
          // Load existing recommendation
          const rec = await getRecommendedMeditation()
          // Find the stored session if it still matches
          if (rec && rec.session.id === storedData.sessionId) {
            setRecommendation(rec)
          } else if (rec) {
            // Algorithm changed, use new recommendation
            setRecommendation(rec)
            localStorage.setItem(
              RECOMMENDATION_KEY,
              JSON.stringify({
                sessionId: rec.session.id,
                recommendedAt: storedData.recommendedAt,
                dismissed: false,
              })
            )
          }
        }
      } catch (err) {
        console.error('Failed to load recommendation:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecommendation()
  }, [])

  const handleDismiss = useCallback(async () => {
    haptic.light()
    setIsDismissed(true)

    // Update affinities for dismissal (negative feedback)
    if (recommendation) {
      await updateAffinitiesForDismissal(recommendation.session)
    }

    const stored = localStorage.getItem(RECOMMENDATION_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      localStorage.setItem(
        RECOMMENDATION_KEY,
        JSON.stringify({
          ...data,
          dismissed: true,
        })
      )
    }
  }, [haptic, recommendation])

  const handleCardClick = useCallback(async () => {
    if (recommendation) {
      haptic.light()
      setSelectedSession(recommendation.session)
      // Update affinities for following recommendation (positive feedback)
      await updateAffinitiesForFollow(recommendation.session)
    }
  }, [recommendation, haptic])

  // Don't render if loading, dismissed, or no recommendation
  if (isLoading || isDismissed || !recommendation) {
    return null
  }

  const gradient = getIntentionGradient(recommendation.session.intention)

  return (
    <>
      <div className="mb-6">
        {/* Section header with dismiss */}
        <div className="flex items-center justify-between mb-3">
          <p className="font-serif text-sm text-ink/50">Suggested for you</p>
          <button
            onClick={handleDismiss}
            className="text-xs text-ink/30 hover:text-ink/50 transition-colors"
            aria-label="Dismiss suggestion"
          >
            Dismiss
          </button>
        </div>

        {/* Recommendation card */}
        <Card variant="default" onClick={handleCardClick} className="group">
          <CardHeader
            indicator={<AccentBar gradient={`bg-gradient-to-b ${gradient}`} />}
            label={recommendation.session.discipline}
            sublabel={recommendation.session.durationGuidance}
          />
          <CardBody compact>
            <CardTitle>{recommendation.session.title}</CardTitle>
            <CardDescription>"{recommendation.session.tagline}"</CardDescription>
            {recommendation.reason && (
              <p className="text-xs text-moss mt-2">{recommendation.reason}</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onAdopt={() => {
            setSelectedSession(null)
            setView('journey')
          }}
        />
      )}
    </>
  )
}
