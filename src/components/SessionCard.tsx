/**
 * SessionCard - Community session template card for explore feed
 *
 * Shows a session template with hero gradient, title, tagline, and stats.
 */

import { SessionTemplate } from './SessionDetailModal'

interface SessionCardProps {
  session: SessionTemplate
  gradient: string
  onClick: () => void
}

export function SessionCard({ session, gradient, onClick }: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-cream-deep rounded-xl overflow-hidden hover:ring-2 hover:ring-ink/10 transition-all active:scale-[0.99]"
    >
      {/* Hero gradient */}
      <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <p className="font-serif text-xl text-white text-center px-4 drop-shadow-sm">
          {session.title}
        </p>
        {/* Discipline badge */}
        <span className="absolute top-3 right-3 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
          {session.discipline}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tagline */}
        <p className="text-sm text-ink/70 italic mb-3">
          "{session.tagline}"
        </p>

        {/* Details row */}
        <div className="flex flex-wrap gap-2 text-xs text-ink/50 mb-3">
          <span className="bg-cream px-2 py-0.5 rounded-full">
            {session.durationGuidance}
          </span>
          <span className="bg-cream px-2 py-0.5 rounded-full">
            {session.posture}
          </span>
          <span className="bg-cream px-2 py-0.5 rounded-full">
            {session.bestTime}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-ink/40">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
            </svg>
            <span className="tabular-nums">{session.karma}</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="tabular-nums">{session.saves}</span>
          </span>
          <span className="tabular-nums">{session.completions.toLocaleString()} done</span>
          <span className="ml-auto text-ink/30">{session.creatorHours} hrs</span>
        </div>
      </div>
    </button>
  )
}
