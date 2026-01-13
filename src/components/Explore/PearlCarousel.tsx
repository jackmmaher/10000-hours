/**
 * PearlCarousel - Horizontal scrolling pearl feed
 *
 * Creates scroll rhythm break with horizontal direction change.
 * Uses native scroll with snap points for smooth UX.
 */

import { CompactPearlCard } from './CompactPearlCard'
import { SectionHeader } from './SectionHeader'
import type { Pearl } from '../../lib/pearls'
import type { ExploreInteractionProps } from './types'

interface PearlCarouselProps extends ExploreInteractionProps {
  pearls: Pearl[]
  title?: string
  onVote: (id: string, hasVoted: boolean) => Promise<void>
  onSave: (id: string, hasSaved: boolean) => Promise<void>
  onSeeAll?: () => void
}

export function PearlCarousel({
  pearls,
  title = 'Rising Pearls',
  onVote,
  onSave,
  onSeeAll,
  isAuthenticated,
  currentUserId,
  onRequireAuth,
}: PearlCarouselProps) {
  if (pearls.length === 0) return null

  return (
    <section className="mb-12">
      {/* Section header - respects page padding */}
      <div className="px-6">
        <SectionHeader title={title} onSeeAll={onSeeAll} />
      </div>

      {/* Carousel container - extends to edges for peek effect */}
      <div
        className="
          flex gap-3 overflow-x-auto pb-2
          px-6
          scroll-snap-type-x mandatory
          scrollbar-hide
          -webkit-overflow-scrolling-touch
        "
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {pearls.map((pearl) => (
          <CompactPearlCard
            key={pearl.id}
            pearl={pearl}
            onVote={onVote}
            onSave={onSave}
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
            onRequireAuth={onRequireAuth}
          />
        ))}
        {/* End spacer for last card visibility */}
        <div className="w-3 flex-shrink-0" aria-hidden />
      </div>
    </section>
  )
}
