/**
 * SessionCard - Community session template card for explore feed
 *
 * Uses unified Card system with glassmorphism.
 * Shows session with gradient accent, title, tagline, and engagement stats.
 */

import { SessionTemplate } from './SessionDetailModal'
import { Card, CardHeader, CardBody, AccentBar, CardEngagement } from './Card'

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
    <Card variant="default" onClick={onClick} className="group">
      <div className="flex">
        {/* Gradient accent bar */}
        <div className="py-4 pl-4">
          <AccentBar gradient={`bg-gradient-to-b ${gradient}`} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <CardHeader
            label={session.discipline}
            sublabel={`${session.durationGuidance} · ${session.posture}`}
            voiceScore={voiceScore}
            compact
          />

          {/* Body */}
          <CardBody compact>
            <p className="font-serif text-ink text-lg leading-snug pr-6 mb-1">
              {session.title}
            </p>
            <p className="text-sm text-ink-soft italic line-clamp-1">
              "{session.tagline}"
            </p>
          </CardBody>

          {/* Stats */}
          <CardEngagement
            upvotes={session.karma}
            saves={session.saves}
            practiced={session.completions}
            compact
          />
        </div>

        {/* Subtle arrow indicator */}
        <div className="flex items-center pr-4 text-ink/15 group-hover:text-ink/30 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Card>
  )
}
