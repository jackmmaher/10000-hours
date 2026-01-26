/**
 * Outcome Calculator for Commitment Mode
 *
 * Calculates rewards and penalties using casino-style psychology.
 * Probabilities are based on clinical psychology research on intermittent reinforcement.
 *
 * Key design: Net effect is always slightly negative over a commitment period
 * (the house always wins), but users gain the habit.
 *
 * Break-even point: ~90% completion rate
 */

import { CommitmentRNG, randomChance, randomInt } from './rng'

// ============================================================================
// Probability Constants (based on clinical psychology)
// ============================================================================

/** Probability of getting a bonus on session completion */
export const BONUS_PROBABILITY = 0.12 // 12%

/** Probability of getting a mystery bonus (rare, exciting) */
export const MYSTERY_PROBABILITY = 0.03 // 3%

/** Probability of near-miss display (drives engagement) */
export const NEAR_MISS_PROBABILITY = 0.25 // 25%

// ============================================================================
// Amount Ranges (in minutes)
// ============================================================================

/** Bonus amount range for regular completion bonus */
export const BONUS_MIN_MINUTES = 15
export const BONUS_MAX_MINUTES = 45

/** Mystery bonus amount range (slightly different to feel special) */
export const MYSTERY_MIN_MINUTES = 20
export const MYSTERY_MAX_MINUTES = 40

/** Penalty amount range for missed sessions */
export const PENALTY_MIN_MINUTES = 25
export const PENALTY_MAX_MINUTES = 50

// ============================================================================
// Types
// ============================================================================

export type SessionOutcomeType =
  | 'bonus' // Regular completion bonus (12%)
  | 'mystery' // Rare mystery bonus (3%)
  | 'near-miss' // Almost got a bonus, shown to user (25%)
  | 'none' // Standard completion, no special outcome

export interface SessionOutcome {
  type: SessionOutcomeType
  minutesChange: number // Positive for bonus, 0 for near-miss/none
  wasNearMiss: boolean
  message: string // Display message for the outcome
}

export interface MissedPenalty {
  minutesChange: number // Always negative
  message: string
}

// ============================================================================
// Outcome Calculation
// ============================================================================

/**
 * Calculate the outcome for a completed session
 *
 * Order of checks:
 * 1. Mystery bonus (3%) - rarest, most exciting
 * 2. Regular bonus (12%) - intermittent reinforcement
 * 3. Near-miss (25%) - "so close!" engagement driver
 * 4. None - standard completion
 *
 * @param rng - Seeded RNG for deterministic results
 * @returns SessionOutcome with type, amount, and message
 */
export function calculateSessionCompletion(rng: CommitmentRNG): SessionOutcome {
  // Check for mystery bonus first (rarest)
  if (randomChance(rng, MYSTERY_PROBABILITY)) {
    const minutes = randomInt(rng, MYSTERY_MIN_MINUTES, MYSTERY_MAX_MINUTES)
    return {
      type: 'mystery',
      minutesChange: minutes,
      wasNearMiss: false,
      message: `Mystery bonus! +${minutes} minutes`,
    }
  }

  // Check for regular bonus
  if (randomChance(rng, BONUS_PROBABILITY)) {
    const minutes = randomInt(rng, BONUS_MIN_MINUTES, BONUS_MAX_MINUTES)
    return {
      type: 'bonus',
      minutesChange: minutes,
      wasNearMiss: false,
      message: `Bonus! +${minutes} minutes`,
    }
  }

  // Check for near-miss (no actual reward, but shown to user)
  if (randomChance(rng, NEAR_MISS_PROBABILITY)) {
    return {
      type: 'near-miss',
      minutesChange: 0,
      wasNearMiss: true,
      message: 'So close! Almost got a bonus',
    }
  }

  // Standard completion
  return {
    type: 'none',
    minutesChange: 0,
    wasNearMiss: false,
    message: 'Session complete',
  }
}

/**
 * Calculate the penalty for a missed session
 *
 * @param rng - Seeded RNG for deterministic results
 * @returns MissedPenalty with amount and message
 */
export function calculateMissedPenalty(rng: CommitmentRNG): MissedPenalty {
  const minutes = randomInt(rng, PENALTY_MIN_MINUTES, PENALTY_MAX_MINUTES)
  return {
    minutesChange: -minutes,
    message: `Missed session: -${minutes} minutes`,
  }
}

// ============================================================================
// Analytics Helpers
// ============================================================================

/**
 * Calculate expected value per session at a given completion rate
 * Used for break-even analysis and UI explanations
 *
 * @param completionRate - Rate of completed sessions (0-1)
 * @returns Expected minutes change per required session
 */
export function calculateExpectedValue(completionRate: number): number {
  // Expected gain from completed sessions
  const avgBonus = (BONUS_MIN_MINUTES + BONUS_MAX_MINUTES) / 2
  const avgMystery = (MYSTERY_MIN_MINUTES + MYSTERY_MAX_MINUTES) / 2
  const expectedGain =
    completionRate * (BONUS_PROBABILITY * avgBonus + MYSTERY_PROBABILITY * avgMystery)

  // Expected loss from missed sessions
  const avgPenalty = (PENALTY_MIN_MINUTES + PENALTY_MAX_MINUTES) / 2
  const expectedLoss = (1 - completionRate) * avgPenalty

  return expectedGain - expectedLoss
}

/**
 * Calculate the break-even completion rate
 * This is the rate at which expected gains equal expected losses
 *
 * @returns Completion rate needed to break even (approximately 0.90)
 */
export function calculateBreakEvenRate(): number {
  const avgBonus = (BONUS_MIN_MINUTES + BONUS_MAX_MINUTES) / 2
  const avgMystery = (MYSTERY_MIN_MINUTES + MYSTERY_MAX_MINUTES) / 2
  const avgPenalty = (PENALTY_MIN_MINUTES + PENALTY_MAX_MINUTES) / 2

  const gainPerCompletion = BONUS_PROBABILITY * avgBonus + MYSTERY_PROBABILITY * avgMystery
  const lossPerMiss = avgPenalty

  // breakEven * gainPerCompletion = (1 - breakEven) * lossPerMiss
  // breakEven * gainPerCompletion = lossPerMiss - breakEven * lossPerMiss
  // breakEven * (gainPerCompletion + lossPerMiss) = lossPerMiss
  // breakEven = lossPerMiss / (gainPerCompletion + lossPerMiss)
  return lossPerMiss / (gainPerCompletion + lossPerMiss)
}

/**
 * Format outcome for display in UI
 *
 * @param outcome - The session outcome
 * @returns Object with display properties
 */
export function formatOutcomeForDisplay(outcome: SessionOutcome): {
  title: string
  subtitle: string
  showConfetti: boolean
  color: 'gold' | 'purple' | 'gray' | 'green'
} {
  switch (outcome.type) {
    case 'mystery':
      return {
        title: 'Mystery Bonus!',
        subtitle: `+${outcome.minutesChange} minutes added to your bank`,
        showConfetti: true,
        color: 'purple',
      }
    case 'bonus':
      return {
        title: 'Bonus!',
        subtitle: `+${outcome.minutesChange} minutes added to your bank`,
        showConfetti: true,
        color: 'gold',
      }
    case 'near-miss':
      return {
        title: 'So Close!',
        subtitle: 'You almost got a bonus. Keep going!',
        showConfetti: false,
        color: 'gray',
      }
    case 'none':
    default:
      return {
        title: 'Complete',
        subtitle: 'Session logged successfully',
        showConfetti: false,
        color: 'green',
      }
  }
}
