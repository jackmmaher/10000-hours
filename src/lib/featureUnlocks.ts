/**
 * Practice Progressions
 *
 * Natural enhancements that emerge with sustained practice.
 * Not rewards or unlocks — honest descriptions of what continued
 * practice and engagement brings.
 *
 * Design philosophy:
 * - These aren't gated features — they're truths about practice
 * - No gamification: users shouldn't feel "locked out" or grinding toward a reward
 * - Universal appeal: meaningful to both beginners and experienced practitioners
 */

export interface PracticeProgression {
  id: string
  title: string
  description: string
}

/**
 * What naturally emerges with sustained practice.
 * These are displayed without tier requirements or lock states.
 */
export const PRACTICE_PROGRESSIONS: PracticeProgression[] = [
  {
    id: 'deeper_insights',
    title: 'Richer insights emerge from deeper data',
    description: 'The more you practice, the clearer your patterns become',
  },
  {
    id: 'voice_carries',
    title: 'Your voice carries further in community',
    description: 'Sustained contribution naturally reaches more people',
  },
  {
    id: 'guide_others',
    title: 'Your experience becomes a guide for others',
    description: 'Depth of practice makes what you share meaningful',
  },
]
