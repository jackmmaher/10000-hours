/**
 * useVoice - Hook to calculate Voice score from local and remote data
 *
 * Gathers inputs from:
 * - Local IndexedDB: sessions (practice data)
 * - Supabase profile: all validation metrics (karma, saves, completions - both given and received)
 * - Supabase templates: meditations created count
 *
 * Two-way validation: rewards both giving AND receiving community engagement
 *
 * NOTE: Voice growth notifications are handled centrally in App.tsx via
 * checkVoiceGrowthNotification() to prevent race conditions from multiple
 * useVoice instances. This hook only calculates the score.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useAuthStore } from '../stores/useAuthStore'
import { getMyTemplates } from '../lib/templates'
import { calculateVoice, VoiceScore, VoiceInputs } from '../lib/voice'
import { updateVoiceScore } from '../lib/supabase'

export interface UseVoiceResult {
  voice: VoiceScore | null
  inputs: VoiceInputs | null
  isLoading: boolean
  refresh: () => Promise<void>
}

export function useVoice(): UseVoiceResult {
  const { sessions, totalSeconds, isLoading: sessionsLoading } = useSessionStore()
  const { user, profile, isAuthenticated } = useAuthStore()

  const [voice, setVoice] = useState<VoiceScore | null>(null)
  const [inputs, setInputs] = useState<VoiceInputs | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Track last synced score to avoid unnecessary updates
  const lastSyncedScore = useRef<number | null>(null)

  const calculateVoiceData = useCallback(async () => {
    setIsLoading(true)

    try {
      // ============================================
      // PRACTICE SIGNALS (from local data)
      // ============================================

      // Total hours from sessions
      const totalHours = totalSeconds / 3600

      // Total sessions
      const totalSessions = sessions.length

      // Average session length in minutes
      const avgSessionMinutes = totalSessions > 0 ? totalSeconds / totalSessions / 60 : 0

      // Sessions per week (rolling 4-week average)
      const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000
      const recentSessions = sessions.filter((s) => s.startTime >= fourWeeksAgo)
      const sessionsPerWeekAvg = recentSessions.length / 4

      // ============================================
      // CONTRIBUTION SIGNALS (from Supabase)
      // ============================================

      // Pearls shared - from Supabase profile
      const pearlsShared = profile?.pearlsCreated || 0

      // Meditations created (count only - from Supabase if authenticated)
      let meditationsCreated = 0

      if (isAuthenticated && user) {
        try {
          const myTemplates = await getMyTemplates(user.id)
          meditationsCreated = myTemplates.length
        } catch (err) {
          console.warn('Failed to fetch user templates:', err)
        }
      }

      // ============================================
      // VALIDATION RECEIVED (from Supabase profile)
      // ============================================

      const karmaReceived = profile?.totalKarma || 0
      const contentSavedByOthers = profile?.totalSaves || 0
      // Completions of your meditations by others - now denormalized on profile
      const meditationCompletions = profile?.totalCompletionsReceived || 0

      // ============================================
      // VALIDATION GIVEN (from Supabase profile - two-way)
      // ============================================

      const karmaGiven = profile?.karmaGiven || 0
      const savesMade = profile?.savesMade || 0
      const completionsPerformed = profile?.completionsPerformed || 0

      // ============================================
      // BUILD INPUTS AND CALCULATE
      // ============================================

      const voiceInputs: VoiceInputs = {
        totalHours,
        totalSessions,
        avgSessionMinutes,
        sessionsPerWeekAvg,
        pearlsShared,
        meditationsCreated,
        karmaReceived,
        contentSavedByOthers,
        meditationCompletions,
        karmaGiven,
        savesMade,
        completionsPerformed,
      }

      const voiceScore = calculateVoice(voiceInputs)

      setInputs(voiceInputs)
      setVoice(voiceScore)

      // Sync to Supabase if authenticated and score changed
      if (isAuthenticated && user && voiceScore.total !== lastSyncedScore.current) {
        lastSyncedScore.current = voiceScore.total
        // Fire and forget - don't block on this
        updateVoiceScore(user.id, voiceScore.total).catch((err) => {
          console.warn('Failed to sync Voice score to Supabase:', err)
        })
      }
    } catch (err) {
      console.error('Failed to calculate Voice:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sessions, totalSeconds, sessionsLoading, isAuthenticated, user, profile])

  // Calculate on mount and when dependencies change
  useEffect(() => {
    calculateVoiceData()
  }, [calculateVoiceData])

  return {
    voice,
    inputs,
    isLoading,
    refresh: calculateVoiceData,
  }
}

/**
 * Lightweight version that only uses local data (no async)
 * For use in components that don't need full accuracy
 */
export function useVoiceLocal(): VoiceScore | null {
  const { sessions, totalSeconds } = useSessionStore()

  if (sessions.length === 0) return null

  const totalHours = totalSeconds / 3600
  const avgSessionMinutes = totalSeconds / sessions.length / 60

  const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000
  const recentSessions = sessions.filter((s) => s.startTime >= fourWeeksAgo)
  const sessionsPerWeekAvg = recentSessions.length / 4

  // Simplified inputs (without async data - practice only)
  const inputs: VoiceInputs = {
    totalHours,
    totalSessions: sessions.length,
    avgSessionMinutes,
    sessionsPerWeekAvg,
    pearlsShared: 0,
    meditationsCreated: 0,
    karmaReceived: 0,
    contentSavedByOthers: 0,
    meditationCompletions: 0,
    karmaGiven: 0,
    savesMade: 0,
    completionsPerformed: 0,
  }

  return calculateVoice(inputs)
}
