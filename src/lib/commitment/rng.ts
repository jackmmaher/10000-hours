/**
 * Seeded Random Number Generator for Commitment Mode
 *
 * Uses Mulberry32 PRNG for deterministic "random" rewards.
 * This ensures the same sequence of outcomes for a given seed,
 * allowing consistent replay and preventing manipulation.
 */

/**
 * Mulberry32 PRNG - a fast, high-quality 32-bit generator
 * https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 *
 * @param seed - 32-bit integer seed
 * @returns Function that returns next random number in [0, 1)
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generate a seed for a new commitment period
 * Combines start date with a random component for uniqueness
 *
 * @param startDate - Commitment start date timestamp
 * @returns 32-bit integer seed
 */
export function generateCommitmentSeed(startDate: number): number {
  // Combine date with random value for uniqueness
  // Use bitwise OR with 0 to convert to 32-bit integer
  const dateComponent = startDate | 0
  const randomComponent = (Math.random() * 0xffffffff) | 0
  return (dateComponent ^ randomComponent) >>> 0
}

/**
 * RNG state and interface
 */
export interface CommitmentRNG {
  /** Get next random number in [0, 1) */
  random: () => number
  /** Current sequence index after this call */
  currentIndex: number
}

/**
 * Create an RNG at a specific position in the sequence
 * This allows resuming from a saved state
 *
 * @param seed - The commitment's seed
 * @param sequenceIndex - Position in sequence to start from (0 = beginning)
 * @returns RNG interface with random() function and index tracking
 */
export function createCommitmentRNG(seed: number, sequenceIndex: number = 0): CommitmentRNG {
  const rng = mulberry32(seed)

  // Fast-forward to the desired position
  for (let i = 0; i < sequenceIndex; i++) {
    rng()
  }

  let currentIndex = sequenceIndex

  return {
    random: () => {
      currentIndex++
      return rng()
    },
    get currentIndex() {
      return currentIndex
    },
  }
}

/**
 * Get a random integer in range [min, max] (inclusive)
 *
 * @param rng - The RNG instance
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range
 */
export function randomInt(rng: CommitmentRNG, min: number, max: number): number {
  return Math.floor(rng.random() * (max - min + 1)) + min
}

/**
 * Check if a random event occurs with given probability
 *
 * @param rng - The RNG instance
 * @param probability - Probability in [0, 1]
 * @returns true if event occurs
 */
export function randomChance(rng: CommitmentRNG, probability: number): boolean {
  return rng.random() < probability
}
