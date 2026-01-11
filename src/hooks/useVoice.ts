/**
 * useVoice - Hook to calculate Voice score from local and remote data
 *
 * Gathers inputs from:
 * - Local IndexedDB: sessions (practice data)
 * - Supabase profile: karma/saves received, karma/saves given, pearls created
 * - Supabase templates: meditations created, completions received
 *
 * Two-way validation: rewards both giving AND receiving community engagement
 *
 * Voice growth is recognized quietly via notifications, not celebrations.
 * The way a teacher might leave a note - acknowledgment without fanfare.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useAuthStore } from '../stores/useAuthStore'
import { getMyTemplates } from '../lib/templates'
import { calculateVoice, VoiceScore, VoiceInputs } from '../lib/voice'
import { updateVoiceScore } from '../lib/supabase'
import { addNotification } from '../lib/db'
import { InAppNotification } from '../lib/notifications'

// Voice thresholds and their quiet recognition messages
// Written as a teacher might observe, not celebrate
const VOICE_THRESHOLDS = [
  { score: 20, message: 'Your voice carries further now.' },
  { score: 45, message: 'A steady presence. Your practice speaks.' },
  { score: 70, message: 'Wisdom recognized. Continue.' },
  { score: 85, message: 'Your path guides others now.' },
] as const

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
  // Track previous score for threshold crossing detection
  const previousScore = useRef<number | null>(null)
  // Track if initial hydration is complete (prevents false notifications on app load)
  const hasHydrated = useRef(false)
  // Track which thresholds have been notified (persisted in ref to avoid duplicates in session)
  const notifiedThresholds = useRef<Set<number>>(new Set())

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
      const avgSessionMinutes = totalSessions > 0
        ? (totalSeconds / totalSessions) / 60
        : 0

      // Sessions per week (rolling 4-week average)
      const fourWeeksAgo = Date.now() - (28 * 24 * 60 * 60 * 1000)
      const recentSessions = sessions.filter(s => s.startTime >= fourWeeksAgo)
      const sessionsPerWeekAvg = recentSessions.length / 4

      // ============================================
      // CONTRIBUTION SIGNALS (from Supabase)
      // ============================================

      // Pearls shared - now from Supabase profile (accurate, not stale local data)
      const pearlsShared = profile?.pearlsCreated || 0

      // Meditations created (from Supabase if authenticated)
      let meditationsCreated = 0
      let meditationCompletions = 0

      if (isAuthenticated && user) {
        try {
          const myTemplates = await getMyTemplates(user.id)
          meditationsCreated = myTemplates.length
          // Sum completions from all user's templates
          meditationCompletions = myTemplates.reduce((sum, t) => sum + (t.completions || 0), 0)
        } catch (err) {
          console.warn('Failed to fetch user templates:', err)
        }
      }

      // ============================================
      // VALIDATION RECEIVED (from Supabase profile)
      // ============================================

      const karmaReceived = profile?.totalKarma || 0
      const contentSavedByOthers = profile?.totalSaves || 0

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
        completionsPerformed
      }

      const voiceScore = calculateVoice(voiceInputs)

      setInputs(voiceInputs)
      setVoice(voiceScore)

      // Check for voice growth - but only AFTER initial hydration is complete
      // This prevents false notifications when app loads and score jumps from 0 to actual
      if (!sessionsLoading) {
        if (!hasHydrated.current) {
          // First calculation after sessions have loaded - record baseline, mark existing thresholds as notified
          hasHydrated.current = true
          previousScore.current = voiceScore.total
          // Don't notify for thresholds already passed
          VOICE_THRESHOLDS.forEach(t => {
            if (voiceScore.total >= t.score) {
              notifiedThresholds.current.add(t.score)
            }
          })
        } else if (previousScore.current !== null) {
          // Subsequent calculations - check for threshold crossings
          for (const threshold of VOICE_THRESHOLDS) {
            // Crossed this threshold AND haven't notified yet
            if (
              previousScore.current < threshold.score &&
              voiceScore.total >= threshold.score &&
              !notifiedThresholds.current.has(threshold.score)
            ) {
              notifiedThresholds.current.add(threshold.score)
              // Create quiet notification - no fanfare, just acknowledgment
              const notification: InAppNotification = {
                id: crypto.randomUUID(),
                type: 'milestone', // Reuse milestone type for voice growth
                title: `Voice: ${Math.round(voiceScore.total)}`,
                body: threshold.message,
                createdAt: Date.now()
              }
              addNotification(notification).catch(err => {
                console.warn('Failed to create voice growth notification:', err)
              })
            }
          }
          previousScore.current = voiceScore.total
        }
      }

      // Sync to Supabase if authenticated and score changed
      if (isAuthenticated && user && voiceScore.total !== lastSyncedScore.current) {
        lastSyncedScore.current = voiceScore.total
        // Fire and forget - don't block on this
        updateVoiceScore(user.id, voiceScore.total).catch(err => {
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
    refresh: calculateVoiceData
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
  const avgSessionMinutes = (totalSeconds / sessions.length) / 60

  const fourWeeksAgo = Date.now() - (28 * 24 * 60 * 60 * 1000)
  const recentSessions = sessions.filter(s => s.startTime >= fourWeeksAgo)
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
    completionsPerformed: 0
  }

  return calculateVoice(inputs)
}
