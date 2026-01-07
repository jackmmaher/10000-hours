/**
 * CourseCard - Course preview card for explore feed
 *
 * Shows a course with title, description, session count, and engagement stats.
 */

interface CoursePreview {
  id: string
  title: string
  description: string
  sessionCount: number
  karma: number
  saves: number
}

interface CourseCardProps {
  course: CoursePreview
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-cream-deep rounded-xl p-5 border-l-4 border-indigo-deep/30">
      {/* Type indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-indigo-deep font-medium">
          Course · {course.sessionCount} sessions
        </span>
      </div>

      {/* Title */}
      <p className="font-serif text-lg text-ink mb-2">
        {course.title}
      </p>

      {/* Description */}
      <p className="text-sm text-ink/60 mb-4 line-clamp-2">
        {course.description}
      </p>

      {/* Stats and CTA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-ink/40">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
            </svg>
            <span className="tabular-nums">{course.karma}</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="tabular-nums">{course.saves}</span>
          </span>
        </div>

        <button className="text-sm text-indigo-deep hover:text-indigo-deep/80 transition-colors">
          View course →
        </button>
      </div>
    </div>
  )
}
