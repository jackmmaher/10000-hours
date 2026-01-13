/**
 * PearlPicker - Modal for selecting a saved pearl to attach to a planned session
 *
 * Shows user's saved pearls from Supabase. Selecting one attaches it
 * as the intention/guidance for the meditation session.
 */

import { useState, useEffect } from 'react'
import { Pearl, getSavedPearls } from '../../lib/pearls'
import { useAuthStore } from '../../stores/useAuthStore'

interface PearlPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (pearl: Pearl) => void
  selectedPearlId?: string
}

export function PearlPicker({ isOpen, onClose, onSelect, selectedPearlId }: PearlPickerProps) {
  const { user } = useAuthStore()
  const [pearls, setPearls] = useState<Pearl[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user?.id) {
      setIsLoading(true)
      getSavedPearls(user.id)
        .then(setPearls)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, user?.id])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-cream rounded-t-2xl max-h-[70vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink/10">
          <h3 className="font-serif text-lg text-ink">Attach a Pearl</h3>
          <button onClick={onClose} className="p-2 text-ink/50 hover:text-ink touch-manipulation">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
            </div>
          ) : pearls.length === 0 ? (
            <div className="text-center py-8 text-ink/50">
              <p className="mb-2">No saved pearls yet</p>
              <p className="text-sm">
                Save pearls from the Explore tab to use as meditation guidance
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pearls.map((pearl) => (
                <button
                  key={pearl.id}
                  onClick={() => {
                    onSelect(pearl)
                    onClose()
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-colors touch-manipulation ${
                    selectedPearlId === pearl.id
                      ? 'bg-moss/20 border-2 border-moss'
                      : 'bg-white/50 border border-ink/10 hover:border-moss/50'
                  }`}
                >
                  <p className="text-ink leading-relaxed">"{pearl.text}"</p>
                  {pearl.isPreserved && <p className="text-xs text-ink/40 mt-2">Saved copy</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear selection option */}
        {selectedPearlId && (
          <div className="p-4 border-t border-ink/10">
            <button
              onClick={() => {
                onSelect({
                  id: '',
                  text: '',
                  userId: '',
                  upvotes: 0,
                  saves: 0,
                  createdAt: '',
                } as Pearl)
                onClose()
              }}
              className="w-full py-3 text-ink/50 hover:text-ink transition-colors touch-manipulation"
            >
              Remove attached pearl
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
