/**
 * JourneyMyPearls - Displays user's created and saved pearls
 *
 * Shows two sections:
 * - My Wisdom: Pearls created by the user (editable)
 * - Collected Wisdom: Pearls saved from community (removable)
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { Card, CardBody, PearlOrb } from './Card'
import type { Pearl } from '../lib/pearls'

export function JourneyMyPearls() {
  const { user } = useAuthStore()
  const [createdPearls, setCreatedPearls] = useState<Pearl[]>([])
  const [savedPearls, setSavedPearls] = useState<Pearl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPearlId, setEditingPearlId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const loadPearls = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    try {
      const { getMyPearls, getSavedPearls } = await import('../lib/pearls')
      const [created, saved] = await Promise.all([
        getMyPearls(user.id),
        getSavedPearls(user.id)
      ])
      setCreatedPearls(created)
      setSavedPearls(saved)
    } catch (err) {
      console.error('Failed to load pearls:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPearls()
  }, [user])

  const handleUnsave = async (pearlId: string) => {
    if (!user) return
    try {
      const { unsavePearl } = await import('../lib/pearls')
      await unsavePearl(pearlId, user.id)
      setSavedPearls(prev => prev.filter(p => p.id !== pearlId))
    } catch (err) {
      console.error('Failed to unsave pearl:', err)
    }
  }

  const handleStartEdit = (pearl: Pearl) => {
    setEditingPearlId(pearl.id)
    setEditText(pearl.text)
  }

  const handleCancelEdit = () => {
    setEditingPearlId(null)
    setEditText('')
  }

  const handleSaveEdit = async () => {
    if (!user || !editingPearlId || isSavingEdit) return
    if (editText.length > 280) return

    setIsSavingEdit(true)
    try {
      const { updatePearl } = await import('../lib/pearls')
      const success = await updatePearl(editingPearlId, editText, user.id)
      if (success) {
        setCreatedPearls(prev =>
          prev.map(p => p.id === editingPearlId
            ? { ...p, text: editText, editedAt: new Date().toISOString() }
            : p
          )
        )
        setEditingPearlId(null)
        setEditText('')
      }
    } catch (err) {
      console.error('Failed to update pearl:', err)
    } finally {
      setIsSavingEdit(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-cream-deep to-cream flex items-center justify-center shadow-inner">
          <div className="w-6 h-6 rounded-full bg-cream-deep" />
        </div>
        <p className="text-ink/50 text-sm">
          Sign in to see your pearls
        </p>
      </div>
    )
  }

  const hasNoPearls = createdPearls.length === 0 && savedPearls.length === 0

  if (hasNoPearls) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-cream-deep to-cream flex items-center justify-center shadow-inner">
          <div className="w-6 h-6 rounded-full bg-cream-deep" />
        </div>
        <p className="text-ink/50 text-sm mb-1">
          No pearls yet
        </p>
        <p className="text-ink/30 text-xs">
          Distill insights into wisdom, or save pearls from Explore
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Created by me section */}
      {createdPearls.length > 0 && (
        <div>
          <p className="text-xs text-ink-soft font-medium tracking-wide mb-4">
            My Wisdom
          </p>
          <div className="space-y-4">
            {createdPearls.map((pearl) => (
              <Card key={pearl.id} variant="default">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <div className="flex items-center gap-3">
                    <PearlOrb variant="personal" />
                    <span className="text-xs text-ink-soft">
                      {new Date(pearl.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                      {pearl.editedAt && <span className="italic text-ink/40 ml-1">· edited</span>}
                    </span>
                  </div>
                  {editingPearlId !== pearl.id && (
                    <button
                      onClick={() => handleStartEdit(pearl)}
                      className="text-xs text-ink-soft hover:text-ink transition-colors px-2 py-1 -mr-2"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Body */}
                <CardBody>
                  {editingPearlId === pearl.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full h-24 px-3 py-2 rounded-xl bg-deep/30 text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 font-serif"
                        maxLength={280}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${editText.length > 280 ? 'text-rose-500' : 'text-ink/40'}`}>
                          {editText.length}/280
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs text-ink-soft hover:text-ink transition-colors px-3 py-1.5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={isSavingEdit || editText.length === 0 || editText.length > 280}
                            className="text-xs bg-accent text-on-accent font-medium hover:opacity-90 transition-opacity px-3 py-1.5 rounded-lg disabled:opacity-50"
                          >
                            {isSavingEdit ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="font-serif text-ink leading-relaxed text-[15px]">
                      "{pearl.text}"
                    </p>
                  )}
                </CardBody>

                {/* Footer - Upvotes */}
                {editingPearlId !== pearl.id && (
                  <div className="flex items-center gap-1.5 px-5 pt-2 pb-4 text-ink-soft">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-sm tabular-nums">{pearl.upvotes}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Saved from community section */}
      {savedPearls.length > 0 && (
        <div>
          <p className="text-xs text-ink-soft font-medium tracking-wide mb-4">
            Collected Wisdom
          </p>
          <div className="space-y-4">
            {savedPearls.map((pearl) => (
              <Card key={pearl.id} variant="subtle">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <div className="flex items-center gap-3">
                    <PearlOrb variant="collected" />
                    {pearl.isPreserved && (
                      <span className="text-xs text-ink/40 italic">preserved</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnsave(pearl.id)}
                    className="text-xs text-ink-soft hover:text-rose-500 transition-colors px-2 py-1 -mr-2"
                  >
                    Remove
                  </button>
                </div>

                {/* Body */}
                <CardBody>
                  <p className="font-serif text-ink leading-relaxed text-[15px]">
                    "{pearl.text}"
                  </p>
                </CardBody>

                {/* Footer - Upvotes (read-only) */}
                <div className="flex items-center gap-1.5 px-5 pt-2 pb-4 text-ink/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-sm tabular-nums">{pearl.upvotes}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
