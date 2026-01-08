/**
 * SessionCard - Community session template card for explore feed
 *
 * Shows a session template with gradient accent, title, tagline, and stats.
 * Matches the visual identity of Journey's saved meditation cards.
 */

import { SessionTemplate } from './SessionDetailModal'
import { VoiceBadgeWithHours } from './VoiceBadge'

/**
 * Calculate simplified feed Voice score for sessions
 * Uses hours, karma, saves, and completions
 */
function calculateSessionVoice(hours: number, karma: number, saves: number, completions: number): number {
  // Hours: log10(hours + 1) * 10, cap at 40
  const hoursScore = Math.min(Math.log10(hours + 1) * 10, 40)

  // Karma: sqrt(karma) * 2, cap at 20
  const karmaScore = Math.min(Math.sqrt(karma) * 2, 20)

  // Saves: sqrt(saves) * 3, cap at 20
  const savesScore = Math.min(Math.sqrt(saves) * 3, 20)

  // Completions: sqrt(completions) * 1.5, cap at 20
  const completionsScore = Math.min(Math.sqrt(completions) * 1.5, 20)

  return Math.round(hoursScore + karmaScore + savesScore + completionsScore)
}

interface SessionCardProps {
  session: SessionTemplate
  gradient: string
  onClick: () => void
}

export function SessionCard({ session, gradient, onClick }: SessionCardProps) {
  // Calculate Voice score from available session data
  const voiceScore = calculateSessionVoice(
    session.creatorHours,
    session.karma,
    session.saves,
    session.completions
  )

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative overflow-hidden rounded-2xl bg-cream transition-all hover:shadow-md active:scale-[0.99]"
    >
      {/* Gradient accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradient}`} />

      <div className="p-4 pl-5">
        {/* Header row with Voice badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/40 font-medium">{session.discipline}</span>
            <span className="text-ink/20">·</span>
            <span className="text-xs text-ink/40">{session.durationGuidance}</span>
            <span className="text-ink/20">·</span>
            <span className="text-xs text-ink/40">{session.posture}</span>
          </div>

          {/* Voice credibility badge */}
          <VoiceBadgeWithHours score={voiceScore} />
        </div>

        {/* Title */}
        <p className="font-serif text-ink text-lg mb-1.5 leading-snug pr-8">
          {session.title}
        </p>

        {/* Tagline */}
        <p className="text-sm text-ink/50 italic line-clamp-1 mb-3">
          "{session.tagline}"
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-ink/30">
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
          <span className="tabular-nums">{session.completions.toLocaleString()} practiced</span>
        </div>
      </div>

      {/* Subtle arrow indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/15 group-hover:text-ink/30 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
