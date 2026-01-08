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
import { INTENTION_TO_GRADIENT, INTENTIONS } from '../lib/animations'
import { DISCIPLINES, POSES, BEST_TIMES } from '../lib/meditation-options'
import { saveTemplateDraft, getTemplateDraft, deleteTemplateDraft } from '../lib/db'

interface TemplateEditorProps {
  onClose: () => void
  onPublished: () => void
  creatorHours: number
}

// Duration options in minutes (matches MeditationPlanner)
const DURATION_MINUTES = [5, 10, 15, 20, 30, 45, 60]

// Experience level presets
const EXPERIENCE_LEVELS = [
  { label: 'Beginner', hours: 0, description: 'New to meditation' },
  { label: '10+ hours', hours: 10, description: 'Some experience' },
  { label: '50+ hours', hours: 50, description: 'Regular practice' },
  { label: '100+ hours', hours: 100, description: 'Dedicated practitioner' }
]

export function TemplateEditor({ onClose, onPublished, creatorHours }: TemplateEditorProps) {
  const { user } = useAuthStore()

  // Form state
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [duration, setDuration] = useState(15)
  const [discipline, setDiscipline] = useState(DISCIPLINES[0])
  const [posture, setPosture] = useState(POSES[0])
  const [bestTime, setBestTime] = useState('Anytime')
  const [environment, setEnvironment] = useState('')
  const [guidanceNotes, setGuidanceNotes] = useState('')
  const [intention, setIntention] = useState('Calm')
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
        // Parse duration from guidance string if needed
        const durationMatch = draft.durationGuidance.match(/(\d+)/)
        if (durationMatch) {
          setDuration(parseInt(durationMatch[1], 10))
        }
        setDiscipline(draft.discipline)
        setPosture(draft.posture)
        setBestTime(draft.bestTime)
        setEnvironment(draft.environment)
        setGuidanceNotes(draft.guidanceNotes)
        setIntention(draft.intention || 'Calm')
        setRecommendedHours(draft.recommendedAfterHours)
        setTags(draft.tags)
        setHasDraft(true)
      }
    }
    loadDraft()
  }, [])

  // Get preview gradient based on intention
  const previewGradient = INTENTION_TO_GRADIENT[intention] || INTENTIONS[0].gradient

  const isValid = title.trim() && tagline.trim() && guidanceNotes.trim() && intention.trim()
  const hasContent = title.trim() || tagline.trim() || guidanceNotes.trim()

  // Format duration for storage (e.g., "15 mins")
  const formatDurationGuidance = (mins: number) => `${mins} mins`

  // Save current form as draft
  const handleSaveDraft = useCallback(async () => {
    if (isSavingDraft) return

    setIsSavingDraft(true)
    try {
      await saveTemplateDraft({
        title,
        tagline,
        durationGuidance: formatDurationGuidance(duration),
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
      onClose()
    } catch (err) {
      console.error('Save draft error:', err)
      setError('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }, [isSavingDraft, title, tagline, duration, discipline, posture, bestTime, environment, guidanceNotes, intention, recommendedHours, tags, onClose])

  // Discard draft and clear form
  const handleDiscardDraft = useCallback(async () => {
    await deleteTemplateDraft()
    setTitle('')
    setTagline('')
    setDuration(15)
    setDiscipline(DISCIPLINES[0])
    setPosture(POSES[0])
    setBestTime('Anytime')
    setEnvironment('')
    setGuidanceNotes('')
    setIntention('Calm')
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
        durationGuidance: formatDurationGuidance(duration),
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
  }, [user, isValid, isPublishing, title, tagline, duration, discipline, posture, bestTime, environment, guidanceNotes, intention, recommendedHours, tags, creatorHours, onPublished])

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

        {/* Form */}
        <div className="px-6 pb-32 pt-6 space-y-6">
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

          {/* Live Preview Card - only shows when title has content */}
          {title.trim() && (
            <div className="animate-fade-in">
              <p className="text-xs text-ink/40 mb-2">Preview</p>
              <div className="bg-cream-deep rounded-xl overflow-hidden shadow-sm">
                <div className={`h-20 bg-gradient-to-br ${previewGradient} flex items-center justify-center`}>
                  <p className="font-serif text-lg text-white text-center px-4 drop-shadow-sm">
                    {title}
                  </p>
                </div>
                {tagline.trim() && (
                  <div className="p-3">
                    <p className="text-sm text-ink/60 italic line-clamp-1">
                      "{tagline}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Intention - Visual Color Picker */}
          <div>
            <label className="block text-xs text-ink/40 mb-3">Intention * <span className="text-ink/30">(sets card color)</span></label>
            <div className="grid grid-cols-4 gap-2">
              {INTENTIONS.map(({ label, gradient }) => (
                <button
                  key={label}
                  onClick={() => setIntention(label)}
                  className={`
                    relative rounded-xl overflow-hidden transition-all
                    ${intention === label
                      ? 'ring-2 ring-ink/40 ring-offset-2 ring-offset-cream scale-105'
                      : 'opacity-80 hover:opacity-100'
                    }
                  `}
                >
                  <div className={`h-12 bg-gradient-to-br ${gradient}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration - Chip Buttons */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_MINUTES.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    duration === mins
                      ? 'bg-ink text-cream'
                      : 'bg-cream-deep text-ink/70 hover:bg-cream-deep/80'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Discipline & Posture row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink/40 mb-2">Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30 appearance-none"
              >
                {DISCIPLINES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink/40 mb-2">Posture</label>
              <select
                value={posture}
                onChange={(e) => setPosture(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30 appearance-none"
              >
                {POSES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Best Time */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Best Time</label>
            <div className="flex flex-wrap gap-2">
              {BEST_TIMES.map((time) => (
                <button
                  key={time}
                  onClick={() => setBestTime(time)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    bestTime === time
                      ? 'bg-ink text-cream'
                      : 'bg-cream-deep text-ink/70 hover:bg-cream-deep/80'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Environment (optional) */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Environment <span className="text-ink/30">(optional)</span></label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder="e.g., Quiet space, outdoors, by water"
              className="w-full px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30"
              maxLength={100}
            />
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

          {/* Experience Level - Chip Buttons */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Experience Level</label>
            <p className="text-xs text-ink/30 mb-3">Who is this meditation best suited for?</p>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_LEVELS.map(({ label, hours, description }) => (
                <button
                  key={hours}
                  onClick={() => setRecommendedHours(hours)}
                  className={`px-4 py-3 rounded-xl text-left transition-all ${
                    recommendedHours === hours
                      ? 'bg-ink text-cream'
                      : 'bg-cream-deep text-ink/70 hover:bg-cream-deep/80'
                  }`}
                >
                  <span className="block text-sm font-medium">{label}</span>
                  <span className={`block text-xs mt-0.5 ${
                    recommendedHours === hours ? 'text-cream/70' : 'text-ink/40'
                  }`}>
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-ink/40 mb-2">Tags <span className="text-ink/30">(comma-separated)</span></label>
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
