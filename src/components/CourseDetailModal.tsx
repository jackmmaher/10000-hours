/**
 * CourseDetailModal - Full course details with session list
 *
 * Shows course description, difficulty, session list with progress,
 * and start/continue CTA.
 */

import { useMemo, useState, useEffect } from 'react'
import { SessionTemplate } from './SessionDetailModal'
import { getCourseProgress, startCourse, UserCourseProgress } from '../lib/db'

export interface Course {
  id: string
  title: string
  description: string
  sessionCount: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  karma: number
  saves: number
  sessionIds: string[]
}

interface CourseDetailModalProps {
  course: Course
  sessions: SessionTemplate[]
  onClose: () => void
  onSessionSelect: (session: SessionTemplate) => void
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'text-moss' },
  intermediate: { label: 'Intermediate', color: 'text-amber-600' },
  advanced: { label: 'Advanced', color: 'text-indigo-deep' }
}

export function CourseDetailModal({
  course,
  sessions,
  onClose,
  onSessionSelect
}: CourseDetailModalProps) {
  const [progress, setProgress] = useState<UserCourseProgress | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  // Get sessions for this course
  const courseSessions = useMemo(() => {
    return course.sessionIds
      .map(id => sessions.find(s => s.id === id))
      .filter((s): s is SessionTemplate => s !== undefined)
  }, [course.sessionIds, sessions])

  // Load progress
  useEffect(() => {
    getCourseProgress(course.id).then(p => setProgress(p ?? null))
  }, [course.id])

  const handleStart = async () => {
    setIsStarting(true)
    const newProgress = await startCourse(course.id)
    setProgress(newProgress)
    setIsStarting(false)

    // Open first session
    if (courseSessions.length > 0) {
      onSessionSelect(courseSessions[0])
    }
  }

  const handleContinue = () => {
    if (!progress) return

    // Find next incomplete session
    const nextPosition = progress.sessionsCompleted.length
    if (nextPosition < courseSessions.length) {
      onSessionSelect(courseSessions[nextPosition])
    }
  }

  const completedCount = progress?.sessionsCompleted.length ?? 0
  const isCompleted = completedCount >= course.sessionCount

  const difficulty = DIFFICULTY_LABELS[course.difficulty] || DIFFICULTY_LABELS.beginner

  // Block swipe navigation when modal is open
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
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="relative bg-indigo-deep/10 pt-12 pb-8 px-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-ink/10 rounded-full flex items-center justify-center text-ink/50 hover:bg-ink/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Course type badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-indigo-deep/20 text-indigo-deep px-2 py-1 rounded-full">
              Course
            </span>
            <span className={`text-xs ${difficulty.color}`}>
              {difficulty.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl text-ink mb-2">
            {course.title}
          </h1>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-ink/50">
            <span>{course.sessionCount} sessions</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
              </svg>
              {course.karma}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {course.saves}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-cream min-h-screen px-6 py-6">
          {/* Description */}
          <p className="text-ink/70 leading-relaxed mb-8">
            {course.description}
          </p>

          {/* Progress indicator */}
          {progress && (
            <div className="mb-8 p-4 bg-cream-deep rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-ink/60">Your progress</p>
                <p className="text-sm text-ink font-medium tabular-nums">
                  {completedCount} / {course.sessionCount}
                </p>
              </div>
              <div className="h-2 bg-cream rounded-full overflow-hidden">
                <div
                  className="h-full bg-moss transition-all duration-500"
                  style={{ width: `${(completedCount / course.sessionCount) * 100}%` }}
                />
              </div>
              {isCompleted && (
                <p className="text-xs text-moss mt-2">Course completed!</p>
              )}
            </div>
          )}

          {/* Session list */}
          <div className="mb-8">
            <p className="font-serif text-sm text-ink/50 mb-4">Sessions</p>

            <div className="space-y-3">
              {courseSessions.map((session, index) => {
                const isSessionCompleted = progress?.sessionsCompleted.includes(index)
                const isNext = !isSessionCompleted && index === completedCount

                return (
                  <button
                    key={session.id}
                    onClick={() => onSessionSelect(session)}
                    className={`
                      w-full text-left p-4 rounded-xl transition-all
                      ${isSessionCompleted
                        ? 'bg-moss/10 border border-moss/20'
                        : isNext
                          ? 'bg-cream-deep border border-moss'
                          : 'bg-cream-deep border border-transparent hover:border-ink/10'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Number/check */}
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                        ${isSessionCompleted
                          ? 'bg-moss text-cream'
                          : 'bg-ink/10 text-ink/50'
                        }
                      `}>
                        {isSessionCompleted ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isSessionCompleted ? 'text-ink/60' : 'text-ink'}`}>
                          {session.title}
                        </p>
                        <p className="text-xs text-ink/40 mt-1">
                          {session.durationGuidance} · {session.discipline}
                        </p>
                      </div>

                      {/* Next indicator */}
                      {isNext && (
                        <span className="text-xs text-moss">Next</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 bg-cream border-t border-ink/5 px-6 py-4 pb-safe">
          {!progress ? (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-3 bg-indigo-deep text-cream rounded-xl text-sm font-medium hover:bg-indigo-deep/90 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {isStarting ? 'Starting...' : 'Start Course'}
            </button>
          ) : isCompleted ? (
            <button
              onClick={handleStart}
              className="w-full py-3 bg-cream-deep text-ink/60 rounded-xl text-sm font-medium hover:bg-cream-deep/80 transition-colors"
            >
              Restart Course
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-moss text-cream rounded-xl text-sm font-medium hover:bg-moss/90 transition-colors active:scale-[0.98]"
            >
              Continue · Session {completedCount + 1}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
