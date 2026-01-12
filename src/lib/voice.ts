/**
 * Voice - Meditation credibility algorithm
 *
 * A PageRank-inspired composite score that weighs multiple signals
 * of practice depth, contribution quality, and community validation.
 *
 * Design principles:
 * - Rewards depth over gaming (diminishing returns on quantity)
 * - Community validation carries significant weight (others vouch for you)
 * - Quality contributions matter more than volume
 * - New users can build credibility through genuine contribution
 * - No gamified labels - just a continuous score with visual treatment
 */

// ============================================
// ALGORITHM FORMULA (Two-Way Validation)
// ============================================
//
// Voice = Practice(30%) + Contribution(20%) + Received(25%) + Given(25%)
//
// Where each component uses diminishing returns (log/sqrt scaling)
// to prevent gaming any single factor.
//
// PRACTICE COMPONENT (30%):
//   Measures depth and consistency of personal practice
//   - Hours: log10(hours + 1) × 10 [caps around 40 at 10,000 hrs]
//   - Depth: avg_session_minutes / 20 [20min = 1.0, 40min = 2.0]
//   - Consistency: sessions_per_week_avg × 1.5 [daily = 10.5]
//   Practice = normalized to 0-30
//
// CONTRIBUTION COMPONENT (20%):
//   Measures willingness to share wisdom with community
//   - Pearls shared: sqrt(count) × 3 [from Supabase, not local]
//   - Meditations created: sqrt(count) × 5 [harder, worth more]
//   Contribution = normalized to 0-20
//
// VALIDATION RECEIVED (25%):
//   Measures how community receives your contributions
//   This is the "PageRank" - others vouching for your wisdom
//   - Karma received: sqrt(total_karma) × 2
//   - Content saved by others: sqrt(saves) × 3
//   - Your meditations completed: sqrt(completions) × 1.5
//   ValidationReceived = normalized to 0-25
//
// VALIDATION GIVEN (25%):
//   Measures your engagement with community content
//   Rewards active participation and reciprocity
//   - Karma given: sqrt(votes) × 2
//   - Saves made: sqrt(saves) × 3
//   - Meditations completed: sqrt(completions) × 2
//   ValidationGiven = normalized to 0-25
//
// Final score is 0-100 scale for easy comprehension.
// ============================================

export interface VoiceInputs {
  // Practice signals
  totalHours: number
  totalSessions: number
  avgSessionMinutes: number
  sessionsPerWeekAvg: number // Rolling 4-week average

  // Contribution signals
  pearlsShared: number
  meditationsCreated: number

  // Validation RECEIVED (others vouch for you)
  karmaReceived: number // Total upvotes on your content
  contentSavedByOthers: number // Your pearls + meditations saved
  meditationCompletions: number // Times others completed your meditations

  // Validation GIVEN (you vouch for others - reciprocity)
  karmaGiven: number // Upvotes you've given to others
  savesMade: number // Content you've bookmarked
  completionsPerformed: number // Meditations you've practiced
}

export interface VoiceScore {
  total: number // 0-100 composite score

  // Component scores (for breakdown display)
  practice: number // 0-30
  contribution: number // 0-20
  validationReceived: number // 0-25
  validationGiven: number // 0-25

  // Individual factors (for detailed breakdown)
  factors: {
    // Practice
    hours: { value: number; score: number; max: number }
    depth: { value: number; score: number; max: number }
    consistency: { value: number; score: number; max: number }
    // Contribution
    pearlsShared: { value: number; score: number; max: number }
    meditationsCreated: { value: number; score: number; max: number }
    // Validation Received
    karmaReceived: { value: number; score: number; max: number }
    contentSaved: { value: number; score: number; max: number }
    completionsReceived: { value: number; score: number; max: number }
    // Validation Given
    karmaGiven: { value: number; score: number; max: number }
    savesMade: { value: number; score: number; max: number }
    completionsPerformed: { value: number; score: number; max: number }
  }
}

/**
 * Calculate Voice score from user activity signals
 */
export function calculateVoice(inputs: VoiceInputs): VoiceScore {
  // ============================================
  // PRACTICE COMPONENT (30% max)
  // ============================================

  // Hours: logarithmic scaling
  // log10(1) = 0, log10(10) = 1, log10(100) = 2, log10(1000) = 3, log10(10000) = 4
  // Multiply by 10, cap at 40 (reached at 10,000 hours)
  const hoursRaw = Math.log10(inputs.totalHours + 1) * 10
  const hoursScore = Math.min(hoursRaw, 40)
  const hoursMax = 40

  // Depth: average session length bonus
  // 20 minutes = 1.0 (baseline), 40 min = 2.0, 60 min = 3.0
  // Cap at 20 (reached at 400 min / 6.6 hours avg - extremely deep)
  const depthRaw = (inputs.avgSessionMinutes / 20) * 5
  const depthScore = Math.min(depthRaw, 20)
  const depthMax = 20

  // Consistency: regularity of practice
  // Daily practice (7/week) = 10.5, cap at 15
  const consistencyRaw = inputs.sessionsPerWeekAvg * 1.5
  const consistencyScore = Math.min(consistencyRaw, 15)
  const consistencyMax = 15

  // Combine practice factors (normalize to 0-30)
  const practiceTotal = hoursScore + depthScore + consistencyScore
  const practiceMax = hoursMax + depthMax + consistencyMax // 75
  const practice = (practiceTotal / practiceMax) * 30

  // ============================================
  // CONTRIBUTION COMPONENT (20% max)
  // ============================================

  // Pearls shared: sqrt scaling rewards early shares, diminishes later
  // Now uses actual Supabase count, not stale local data
  const pearlsRaw = Math.sqrt(inputs.pearlsShared) * 3
  const pearlsScore = Math.min(pearlsRaw, 12)
  const pearlsMax = 12

  // Meditations created: harder to do, worth more
  const meditationsRaw = Math.sqrt(inputs.meditationsCreated) * 5
  const meditationsScore = Math.min(meditationsRaw, 12)
  const meditationsMax = 12

  // Combine contribution factors (normalize to 0-20)
  const contributionTotal = pearlsScore + meditationsScore
  const contributionMax = pearlsMax + meditationsMax // 24
  const contribution = (contributionTotal / contributionMax) * 20

  // ============================================
  // VALIDATION RECEIVED (25% max)
  // Others vouching for your wisdom
  // ============================================

  // Karma received: community upvotes on your content
  const karmaReceivedRaw = Math.sqrt(inputs.karmaReceived) * 2
  const karmaReceivedScore = Math.min(karmaReceivedRaw, 20)
  const karmaReceivedMax = 20

  // Content saved by others: lasting value indicator
  const contentSavedRaw = Math.sqrt(inputs.contentSavedByOthers) * 3
  const contentSavedScore = Math.min(contentSavedRaw, 15)
  const contentSavedMax = 15

  // Your meditations completed by others
  const completionsReceivedRaw = Math.sqrt(inputs.meditationCompletions) * 1.5
  const completionsReceivedScore = Math.min(completionsReceivedRaw, 12)
  const completionsReceivedMax = 12

  // Combine received factors (normalize to 0-25)
  const receivedTotal = karmaReceivedScore + contentSavedScore + completionsReceivedScore
  const receivedMax = karmaReceivedMax + contentSavedMax + completionsReceivedMax // 47
  const validationReceived = (receivedTotal / receivedMax) * 25

  // ============================================
  // VALIDATION GIVEN (25% max)
  // You engaging with community content - reciprocity
  // ============================================

  // Karma given: upvotes you've given to others
  const karmaGivenRaw = Math.sqrt(inputs.karmaGiven) * 2
  const karmaGivenScore = Math.min(karmaGivenRaw, 15)
  const karmaGivenMax = 15

  // Saves made: content you've bookmarked
  const savesMadeRaw = Math.sqrt(inputs.savesMade) * 3
  const savesMadeScore = Math.min(savesMadeRaw, 15)
  const savesMadeMax = 15

  // Completions performed: meditations you've practiced
  // Higher weight - actually practicing is more meaningful than just saving
  const completionsPerformedRaw = Math.sqrt(inputs.completionsPerformed) * 2.5
  const completionsPerformedScore = Math.min(completionsPerformedRaw, 18)
  const completionsPerformedMax = 18

  // Combine given factors (normalize to 0-25)
  const givenTotal = karmaGivenScore + savesMadeScore + completionsPerformedScore
  const givenMax = karmaGivenMax + savesMadeMax + completionsPerformedMax // 48
  const validationGiven = (givenTotal / givenMax) * 25

  // ============================================
  // FINAL COMPOSITE SCORE
  // ============================================
  const total = Math.round(practice + contribution + validationReceived + validationGiven)

  return {
    total: Math.min(total, 100),
    practice: Math.round(practice * 10) / 10,
    contribution: Math.round(contribution * 10) / 10,
    validationReceived: Math.round(validationReceived * 10) / 10,
    validationGiven: Math.round(validationGiven * 10) / 10,
    factors: {
      // Practice
      hours: {
        value: inputs.totalHours,
        score: Math.round(hoursScore * 10) / 10,
        max: hoursMax,
      },
      depth: {
        value: inputs.avgSessionMinutes,
        score: Math.round(depthScore * 10) / 10,
        max: depthMax,
      },
      consistency: {
        value: inputs.sessionsPerWeekAvg,
        score: Math.round(consistencyScore * 10) / 10,
        max: consistencyMax,
      },
      // Contribution
      pearlsShared: {
        value: inputs.pearlsShared,
        score: Math.round(pearlsScore * 10) / 10,
        max: pearlsMax,
      },
      meditationsCreated: {
        value: inputs.meditationsCreated,
        score: Math.round(meditationsScore * 10) / 10,
        max: meditationsMax,
      },
      // Validation Received
      karmaReceived: {
        value: inputs.karmaReceived,
        score: Math.round(karmaReceivedScore * 10) / 10,
        max: karmaReceivedMax,
      },
      contentSaved: {
        value: inputs.contentSavedByOthers,
        score: Math.round(contentSavedScore * 10) / 10,
        max: contentSavedMax,
      },
      completionsReceived: {
        value: inputs.meditationCompletions,
        score: Math.round(completionsReceivedScore * 10) / 10,
        max: completionsReceivedMax,
      },
      // Validation Given
      karmaGiven: {
        value: inputs.karmaGiven,
        score: Math.round(karmaGivenScore * 10) / 10,
        max: karmaGivenMax,
      },
      savesMade: {
        value: inputs.savesMade,
        score: Math.round(savesMadeScore * 10) / 10,
        max: savesMadeMax,
      },
      completionsPerformed: {
        value: inputs.completionsPerformed,
        score: Math.round(completionsPerformedScore * 10) / 10,
        max: completionsPerformedMax,
      },
    },
  }
}

/**
 * Voice level type for semantic styling
 */
export type VoiceLevel = 'high' | 'established' | 'growing' | 'new'

// ============================================
// VOICE TIERS (Serotonin Identity Labels)
// ============================================
// Named tiers give narrative meaning to Voice scores.
// Labels are zen-flavored, not gamified (no Bronze/Silver/Gold).

export type VoiceTier = 'newcomer' | 'practitioner' | 'established' | 'respected' | 'mentor'

export interface VoiceTierInfo {
  tier: VoiceTier
  label: string
  description: string
  minScore: number
  maxScore: number
}

const VOICE_TIERS: VoiceTierInfo[] = [
  {
    tier: 'newcomer',
    label: 'Newcomer',
    description: 'Beginning the path',
    minScore: 0,
    maxScore: 19,
  },
  {
    tier: 'practitioner',
    label: 'Practitioner',
    description: 'Developing a practice',
    minScore: 20,
    maxScore: 44,
  },
  {
    tier: 'established',
    label: 'Established',
    description: 'A steady presence',
    minScore: 45,
    maxScore: 69,
  },
  {
    tier: 'respected',
    label: 'Respected',
    description: 'Wisdom recognized',
    minScore: 70,
    maxScore: 84,
  },
  {
    tier: 'mentor',
    label: 'Mentor',
    description: 'Guiding others on the path',
    minScore: 85,
    maxScore: 100,
  },
]

/**
 * Get the Voice tier info for a given score
 */
export function getVoiceTier(score: number): VoiceTierInfo {
  return VOICE_TIERS.find((t) => score >= t.minScore && score <= t.maxScore) || VOICE_TIERS[0]
}

/**
 * Get the next tier (for showing progress toward upgrade)
 */
export function getNextTier(currentTier: VoiceTier): VoiceTierInfo | null {
  const currentIndex = VOICE_TIERS.findIndex((t) => t.tier === currentTier)
  return currentIndex < VOICE_TIERS.length - 1 ? VOICE_TIERS[currentIndex + 1] : null
}

/**
 * Check if a score change triggers a tier transition
 */
export function checkTierTransition(
  previousScore: number,
  newScore: number
): { upgraded: boolean; newTier: VoiceTierInfo } | null {
  const previousTier = getVoiceTier(previousScore)
  const currentTier = getVoiceTier(newScore)

  // Only celebrate upgrades, not downgrades
  if (currentTier.tier !== previousTier.tier && newScore > previousScore) {
    return { upgraded: true, newTier: currentTier }
  }

  return null
}

/**
 * Get visual treatment based on Voice score
 * Returns styling info for the VoiceBadge component
 *
 * Colors now use CSS variables from the Living Theme system:
 * - --voice-{level}-bg: Background color
 * - --voice-{level}-text: Text color
 * - --voice-{level}-dot: Dot fill color
 */
export function getVoiceVisual(score: number): {
  // Dot pattern: filled dots out of 5
  dots: number
  // Glow intensity for high scores
  glow: 'none' | 'subtle' | 'medium' | 'strong'
  // Voice level for CSS variable selection
  level: VoiceLevel
} {
  // Score ranges for dot display
  // 0-10: 1 dot, 11-25: 2 dots, 26-45: 3 dots, 46-70: 4 dots, 71+: 5 dots
  let dots: number
  if (score <= 10) dots = 1
  else if (score <= 25) dots = 2
  else if (score <= 45) dots = 3
  else if (score <= 70) dots = 4
  else dots = 5

  // Glow for high scorers (rare, earned)
  let glow: 'none' | 'subtle' | 'medium' | 'strong'
  if (score >= 80) glow = 'strong'
  else if (score >= 60) glow = 'medium'
  else if (score >= 40) glow = 'subtle'
  else glow = 'none'

  // Voice level determines which CSS variables to use
  let level: VoiceLevel
  if (score >= 70) {
    level = 'high'
  } else if (score >= 45) {
    level = 'established'
  } else if (score >= 20) {
    level = 'growing'
  } else {
    level = 'new'
  }

  return { dots, glow, level }
}

/**
 * Example scores for reference:
 *
 * NEW USER (just started):
 * - 5 hours, 2 sessions, 15 min avg, 1/week
 * - 0 pearls, 0 meditations
 * - 0 karma, 0 saves, 0 completions
 * Score: ~3 (almost entirely from minimal practice)
 *
 * CASUAL PRACTITIONER (3 months in):
 * - 30 hours, 60 sessions, 25 min avg, 4/week
 * - 2 pearls shared, 0 meditations
 * - 5 karma, 1 save, 0 completions
 * Score: ~18
 *
 * DEDICATED PRACTITIONER (1 year):
 * - 200 hours, 300 sessions, 35 min avg, 5/week
 * - 8 pearls, 1 meditation
 * - 40 karma, 12 saves, 5 completions
 * Score: ~42
 *
 * CONTRIBUTING VOICE (2+ years, active contributor):
 * - 500 hours, 600 sessions, 45 min avg, 6/week
 * - 25 pearls, 5 meditations
 * - 200 karma, 60 saves, 50 completions
 * Score: ~65
 *
 * RESPECTED VOICE (5+ years, highly validated):
 * - 2000 hours, 2000 sessions, 50 min avg, 7/week
 * - 50 pearls, 15 meditations
 * - 800 karma, 200 saves, 300 completions
 * Score: ~85
 *
 * Note: Even at 10,000 hours (the goal), without contribution
 * and community validation, max score would be ~30.
 * The algorithm rewards the full picture, not just sitting.
 */

// ============================================
// VOICE GROWTH NOTIFICATIONS
// ============================================
// Centralized notification logic - called ONCE from App.tsx
// to prevent race conditions from multiple useVoice instances.

import { getSettings, addNotification, hasNotificationWithTitle } from './db'
import type { InAppNotification } from './notifications'

// Voice thresholds and their quiet recognition messages
// Written as a teacher might observe, not celebrate
const VOICE_THRESHOLDS = [
  { score: 20, message: 'Your voice carries further now.' },
  { score: 45, message: 'A steady presence. Your practice speaks.' },
  { score: 70, message: 'Wisdom recognized. Continue.' },
  { score: 85, message: 'Your path guides others now.' },
] as const

interface CheckVoiceGrowthParams {
  previousScore: number
  currentScore: number
}

/**
 * Check for voice growth and create notifications if thresholds crossed.
 *
 * This function should be called ONCE when voice score changes, not from
 * every useVoice instance. This prevents the race condition where multiple
 * hook instances all try to create the same notification.
 *
 * @returns Array of thresholds that triggered notifications
 */
export async function checkVoiceGrowthNotification({
  previousScore,
  currentScore,
}: CheckVoiceGrowthParams): Promise<number[]> {
  // Check settings - respect milestoneEnabled preference
  const settings = await getSettings()
  if (!settings.notificationPreferences?.milestoneEnabled) {
    return []
  }

  const notifiedThresholds: number[] = []

  // Check each threshold
  for (const threshold of VOICE_THRESHOLDS) {
    // Only notify if we crossed this threshold (previous < threshold <= current)
    if (previousScore < threshold.score && currentScore >= threshold.score) {
      // Check if notification already exists in DB
      const notificationTitle = `Voice: ${threshold.score}`
      const exists = await hasNotificationWithTitle(notificationTitle)

      if (!exists) {
        // Create notification with distinct voice_growth type
        const notification: InAppNotification = {
          id: crypto.randomUUID(),
          type: 'voice_growth',
          title: notificationTitle,
          body: threshold.message,
          createdAt: Date.now(),
        }
        await addNotification(notification)
        notifiedThresholds.push(threshold.score)
      }
    }
  }

  return notifiedThresholds
}
