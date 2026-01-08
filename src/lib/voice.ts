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
// ALGORITHM FORMULA
// ============================================
//
// Voice = (Practice × 0.30) + (Contribution × 0.25) + (Validation × 0.45)
//
// Where each component uses diminishing returns (log/sqrt scaling)
// to prevent gaming any single factor.
//
// PRACTICE COMPONENT (30%):
//   Measures depth and consistency of personal practice
//   - Hours: log10(hours + 1) × 10 [caps around 40 at 10,000 hrs]
//   - Depth: avg_session_minutes / 20 [20min = 1.0, 40min = 2.0]
//   - Consistency: sessions_per_week_avg × 0.5 [daily = 3.5]
//   Practice = (hours_score + depth_bonus + consistency_bonus) / 3
//
// CONTRIBUTION COMPONENT (25%):
//   Measures willingness to share wisdom with community
//   - Pearls shared: sqrt(count) × 3
//   - Meditations created: sqrt(count) × 5 [harder, worth more]
//   Contribution = min(pearls_score + meditations_score, 25)
//
// VALIDATION COMPONENT (45%):
//   Measures how community receives your contributions
//   This is the "PageRank" - others vouching for your wisdom
//   - Karma received: sqrt(total_karma) × 2
//   - Content saved: sqrt(saves) × 3 [saves = lasting value]
//   - Meditation completions: sqrt(completions) × 1.5
//   Validation = karma_score + saves_score + completions_score
//
// Final score is 0-100 scale for easy comprehension.
// ============================================

export interface VoiceInputs {
  // Practice signals
  totalHours: number
  totalSessions: number
  avgSessionMinutes: number
  sessionsPerWeekAvg: number  // Rolling 4-week average

  // Contribution signals
  pearlsShared: number
  meditationsCreated: number

  // Validation signals (PageRank - others vouch for you)
  karmaReceived: number       // Total upvotes on your pearls
  contentSavedByOthers: number // Your pearls + meditations saved
  meditationCompletions: number // Times others completed your meditations
}

export interface VoiceScore {
  total: number              // 0-100 composite score

  // Component scores (for breakdown display)
  practice: number           // 0-30
  contribution: number       // 0-25
  validation: number         // 0-45

  // Individual factors (for detailed breakdown)
  factors: {
    hours: { value: number; score: number; max: number }
    depth: { value: number; score: number; max: number }
    consistency: { value: number; score: number; max: number }
    pearlsShared: { value: number; score: number; max: number }
    meditationsCreated: { value: number; score: number; max: number }
    karmaReceived: { value: number; score: number; max: number }
    contentSaved: { value: number; score: number; max: number }
    completions: { value: number; score: number; max: number }
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
  // Daily practice (7/week) = 3.5 × 3 = 10.5, cap at 15
  const consistencyRaw = inputs.sessionsPerWeekAvg * 1.5
  const consistencyScore = Math.min(consistencyRaw, 15)
  const consistencyMax = 15

  // Combine practice factors (normalize to 0-30)
  const practiceTotal = hoursScore + depthScore + consistencyScore
  const practiceMax = hoursMax + depthMax + consistencyMax // 75
  const practice = (practiceTotal / practiceMax) * 30

  // ============================================
  // CONTRIBUTION COMPONENT (25% max)
  // ============================================

  // Pearls shared: sqrt scaling rewards early shares, diminishes later
  // sqrt(1) = 1, sqrt(4) = 2, sqrt(9) = 3, sqrt(25) = 5, sqrt(100) = 10
  const pearlsRaw = Math.sqrt(inputs.pearlsShared) * 3
  const pearlsScore = Math.min(pearlsRaw, 15)
  const pearlsMax = 15

  // Meditations created: harder to do, worth more
  // sqrt(1) = 1, sqrt(4) = 2, sqrt(9) = 3
  const meditationsRaw = Math.sqrt(inputs.meditationsCreated) * 5
  const meditationsScore = Math.min(meditationsRaw, 15)
  const meditationsMax = 15

  // Combine contribution factors (normalize to 0-25)
  const contributionTotal = pearlsScore + meditationsScore
  const contributionMax = pearlsMax + meditationsMax // 30
  const contribution = (contributionTotal / contributionMax) * 25

  // ============================================
  // VALIDATION COMPONENT (45% max)
  // This is the "PageRank" - community vouches for quality
  // ============================================

  // Karma received: community upvotes on your wisdom
  // sqrt(10) = 3.2, sqrt(100) = 10, sqrt(1000) = 31.6
  const karmaRaw = Math.sqrt(inputs.karmaReceived) * 2
  const karmaScore = Math.min(karmaRaw, 25)
  const karmaMax = 25

  // Content saved by others: lasting value indicator
  // Someone bookmarking your content = strong signal
  const savesRaw = Math.sqrt(inputs.contentSavedByOthers) * 3
  const savesScore = Math.min(savesRaw, 20)
  const savesMax = 20

  // Meditation completions: your teachings helped others practice
  const completionsRaw = Math.sqrt(inputs.meditationCompletions) * 1.5
  const completionsScore = Math.min(completionsRaw, 15)
  const completionsMax = 15

  // Combine validation factors (normalize to 0-45)
  const validationTotal = karmaScore + savesScore + completionsScore
  const validationMax = karmaMax + savesMax + completionsMax // 60
  const validation = (validationTotal / validationMax) * 45

  // ============================================
  // FINAL COMPOSITE SCORE
  // ============================================
  const total = Math.round(practice + contribution + validation)

  return {
    total: Math.min(total, 100),
    practice: Math.round(practice * 10) / 10,
    contribution: Math.round(contribution * 10) / 10,
    validation: Math.round(validation * 10) / 10,
    factors: {
      hours: {
        value: inputs.totalHours,
        score: Math.round(hoursScore * 10) / 10,
        max: hoursMax
      },
      depth: {
        value: inputs.avgSessionMinutes,
        score: Math.round(depthScore * 10) / 10,
        max: depthMax
      },
      consistency: {
        value: inputs.sessionsPerWeekAvg,
        score: Math.round(consistencyScore * 10) / 10,
        max: consistencyMax
      },
      pearlsShared: {
        value: inputs.pearlsShared,
        score: Math.round(pearlsScore * 10) / 10,
        max: pearlsMax
      },
      meditationsCreated: {
        value: inputs.meditationsCreated,
        score: Math.round(meditationsScore * 10) / 10,
        max: meditationsMax
      },
      karmaReceived: {
        value: inputs.karmaReceived,
        score: Math.round(karmaScore * 10) / 10,
        max: karmaMax
      },
      contentSaved: {
        value: inputs.contentSavedByOthers,
        score: Math.round(savesScore * 10) / 10,
        max: savesMax
      },
      completions: {
        value: inputs.meditationCompletions,
        score: Math.round(completionsScore * 10) / 10,
        max: completionsMax
      }
    }
  }
}

/**
 * Voice level type for semantic styling
 */
export type VoiceLevel = 'high' | 'established' | 'growing' | 'new'

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
