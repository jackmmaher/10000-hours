/**
 * Canvas Constants - Colors and visual parameters
 */

import type { Season } from '../../lib/livingTheme'

export const LEAF_COLORS = ['#D97706', '#B45309', '#DC2626', '#CA8A04', '#92400E', '#991B1B']

export const STAR_TEMPS: Record<Season, { cool: string; warm: string }> = {
  winter: { cool: 'rgba(186, 230, 253, 1)', warm: 'rgba(224, 242, 254, 1)' },
  summer: { cool: 'rgba(254, 243, 199, 1)', warm: 'rgba(253, 224, 71, 1)' },
  spring: { cool: 'rgba(233, 213, 255, 1)', warm: 'rgba(255, 255, 255, 1)' },
  autumn: { cool: 'rgba(255, 237, 213, 1)', warm: 'rgba(254, 215, 170, 1)' },
}
