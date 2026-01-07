/**
 * TemplateEditor - Create/edit guided meditation templates
 *
 * Full-screen modal for creating community session templates.
 * All fields map to SessionTemplate interface.
 * Supports draft saving for work-in-progress templates.
 */

import { useState, useCallback, useEffect } from 'react'
import { createTemplate, TemplateInput } from '../lib/templates'
import { useAuthStore } from '../stores/useAuthStore'
import { INTENTION_TO_GRADIENT, SESSION_HERO_GRADIENTS } from '../lib/animations'
import { DISCIPLINES, POSES, BEST_TIMES, DURATION_OPTIONS } from '../lib/meditation-options'
import { saveTemplateDraft, getTemplateDraft, deleteTemplateDraft } from '../lib/db'

interface TemplateEditorProps {
  onClose: () => void
  onPublished: () => void
  creatorHours: number
}

export function TemplateEditor({ onClose, onPublished, creatorHours }: TemplateEditorProps) {
  const { user } = useAuthStore()

  // Form state
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [durationGuidance, setDurationGuidance] = useState('15-20 mins')
  const [discipline, setDiscipline] = useState(DISCIPLINES[0])
  const [posture, setPosture] = useState(POSES[0])
  const [bestTime, setBestTime] = useState('Anytime')
  const [environment, setEnvironment] = useState('')
  const [guidanceNotes, setGuidanceNotes] = useState('')
  const [intention, setIntention] = useState('')
  const [recommendedHours, setRecommendedHours] = useState(0)
  const [tags, setTags] = useState('')

  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(false)

  // Load existing draft on mount
  useEffect(() => {
    async function loadDraft() {
      const draft = await getTemplateDraft()
      if (draft) {
        setTitle(draft.title)
        setTagline(draft.tagline)
        setDurationGuidance(draft.durationGuidance)
        setDiscipline(draft.discipline)
        setPosture(draft.posture)
        setBestTime(draft.bestTime)
        setEnvironment(draft.environment)
        setGuidanceNotes(draft.guidanceNotes)
        setIntention(draft.intention)
        setRecommendedHours(draft.recommendedAfterHours)
        setTags(draft.tags)
        setHasDraft(true)
      }
    }
    loadDraft()
  }, [])

  // Get preview gradient based on intention
  const previewGradient = INTENTION_TO_GRADIENT[intention] || SESSION_HERO_GRADIENTS[0]

  const isValid = title.trim() && tagline.trim() && guidanceNotes.trim() && intention.trim()
  const hasContent = title.trim() || tagline.trim() || guidanceNotes.trim() || intention.trim()

  // Save current form as draft
  const handleSaveDraft = useCallback(async () => {
    if (isSavingDraft) return

    setIsSavingDraft(true)
    try {
      await saveTemplateDraft({
        title,
        tagline,
        durationGuidance,
        discipline,
        posture,
        bestTime,
        environment,
        guidanceNotes,
        intention,
        recommendedAfterHours: recommendedHours,
        tags
      })
      setHasDraft(true)
      onClose() // Close after saving draft
    } catch (err) {
      console.error('Save draft error:', err)
      setError('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }, [isSavingDraft, title, tagline, durationGuidance, discipline, posture, bestTime, environment, guidanceNotes, intention, recommendedHours, tags, onClose])

  // Discard draft and clear form
  const handleDiscardDraft = useCallback(async () => {
    await deleteTemplateDraft()
    setTitle('')
    setTagline('')
    setDurationGuidance('15-20 mins')
    setDiscipline(DISCIPLINES[0])
    setPosture(POSES[0])
    setBestTime('Anytime')
    setEnvironment('')
    setGuidanceNotes('')
    setIntention('')
    setRecommendedHours(0)
    setTags('')
    setHasDraft(false)
  }, [])

  const handlePublish = useCallback(async () => {
    if (!user || !isValid || isPublishing) return

    setIsPublishing(true)
    setError(null)

    try {
      const template: TemplateInput = {
        title: title.trim(),
        tagline: tagline.trim(),
        durationGuidance,
        discipline,
        posture,
        bestTime,
        environment: environment.trim() || undefined,
        guidanceNotes: guidanceNotes.trim(),
        intention: intention.trim(),
        recommendedAfterHours: recommendedHours,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      const result = await createTemplate(template, user.id, creatorHours)

      if (result) {
        // Clear draft on successful publish
        await deleteTemplateDraft()
        onPublished()
      } else {
        setError('Failed to publish. Please try again.')
      }
    } catch (err) {
      console.error('Publish error:', err)
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message.includes('timed out')) {
        setError('Connection timed out. Please check your internet and try again.')
      } else if (message.includes('not configured')) {
        setError('Unable to connect to server. Please try again later.')
      } else {
        setError(message)
      }
    } finally {
      setIsPublishing(false)
    }
  }, [user, isValid, isPublishing, title, tagline, durationGuidance, discipline, posture, bestTime, environment, guidanceNotes, intention, recommendedHours, tags, creatorHours, onPublished])

  // Block swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
      <div className="h-full overflow-y-auto bg-cream">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-cream border-b border-ink/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={hasContent ? handleSaveDraft : onClose}
              disabled={isSavingDraft}
              className="text-sm text-ink/50 hover:text-ink/70 transition-colors"
            >
              {isSavingDraft ? 'Saving...' : hasContent ? 'Save Draft' : 'Cancel'}
            </button>
            <p className="font-serif text-ink">
              {hasDraft ? 'Edit Draft' : 'Create Meditation'}
            </p>
            <button
              onClick={handlePublish}
              disabled={!isValid || isPublishing}
              className={`text-sm font-medium transition-colors ${
                isValid && !isPublishing
                  ? 'text-moss hover:text-moss/80'
                  : 'text-ink/30 cursor-not-allowed'
              }`}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Preview card */}
        <div className="px-6 py-4">
          <p className="text-xs text-ink/40 mb-2">Preview</p>
          <div className="bg-cream-deep rounded-xl overflow-hidden">
            <div className={`h-20 bg-gradient-to-br ${previewGradient} flex items-center justify-center`}>
              <p className="font-serif text-lg text-white text-center px-4 drop-shadow-sm">
                {title || 'Your title here'}
              </p>
            </div>
            <div className="p-3">
              <p className="text-sm text-ink/60 italic line-clamp-1">
                "{tagline || 'Your tagline here'}"
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-32 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Stillness"
              className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30"
              maxLength={60}
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Tagline *</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g., Begin each day with presence"
              className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30"
              maxLength={100}
            />
          </div>

          {/* Duration & Discipline row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink/40 mb-2">Duration</label>
              <select
                value={durationGuidance}
                onChange={(e) => setDurationGuidance(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30"
              >
                {DURATION_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink/40 mb-2">Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30"
              >
                {DISCIPLINES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Posture & Best Time row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink/40 mb-2">Posture</label>
              <select
                value={posture}
                onChange={(e) => setPosture(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30"
              >
                {POSES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink/40 mb-2">Best Time</label>
              <select
                value={bestTime}
                onChange={(e) => setBestTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30"
              >
                {BEST_TIMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Environment (optional) */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Environment (optional)</label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder="e.g., Quiet space, outdoors, by water"
              className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30"
              maxLength={100}
            />
          </div>

          {/* Intention (drives gradient color) */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Intention * <span className="text-ink/30">(drives card color)</span></label>
            <input
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g., Presence, Calm, Focus, Clarity"
              className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30"
              maxLength={50}
            />
            <p className="text-xs text-ink/30 mt-1">
              Try: Presence, Calm, Focus, Clarity, Release, Compassion, Awareness
            </p>
          </div>

          {/* Guidance Notes */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Guidance Notes *</label>
            <textarea
              value={guidanceNotes}
              onChange={(e) => setGuidanceNotes(e.target.value)}
              placeholder="Detailed instructions for the meditation practice..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30 resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-ink/30 mt-1 text-right">
              {guidanceNotes.length}/2000
            </p>
          </div>

          {/* Recommended hours */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Recommended after hours</label>
            <input
              type="number"
              value={recommendedHours}
              onChange={(e) => setRecommendedHours(Math.max(0, parseInt(e.target.value) || 0))}
              min={0}
              className="w-24 px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30"
            />
            <p className="text-xs text-ink/30 mt-1">
              0 = suitable for beginners
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., morning, beginner, stress"
              className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30"
            />
          </div>

          {/* Creator hours badge */}
          <div className="bg-cream-deep rounded-xl p-4">
            <p className="text-xs text-ink/40">
              This meditation will show that you have <span className="font-medium text-ink/60">{creatorHours} hours</span> of practice.
            </p>
          </div>

          {/* Discard draft option */}
          {hasDraft && (
            <div className="text-center pt-4">
              <button
                onClick={handleDiscardDraft}
                className="text-sm text-ink/40 hover:text-rose-500 transition-colors"
              >
                Discard draft and start fresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
