/**
 * VoiceBreakdown - Detailed view of Voice score calculation
 *
 * Shows users how their credibility score is calculated and
 * what they can focus on to increase it (deliberate improvement).
 *
 * Displays:
 * - Overall score with visual treatment
 * - Three component scores (Practice, Contribution, Validation)
 * - Individual factor breakdown with progress bars
 * - Actionable suggestions for lowest-scoring areas
 */

import { VoiceScore, VoiceInputs, calculateVoice, getVoiceVisual, VoiceLevel } from '../lib/voice'
import { VoiceBadge } from './VoiceBadge'

interface VoiceBreakdownProps {
  inputs: VoiceInputs
}

/**
 * Get CSS variable values for a voice level
 */
function getVoiceTextStyle(level: VoiceLevel) {
  return `var(--voice-${level}-text)`
}

export function VoiceBreakdown({ inputs }: VoiceBreakdownProps) {
  const voice = calculateVoice(inputs)
  const visual = getVoiceVisual(voice.total)

  // Find lowest-scoring component for suggestion
  const components = [
    { name: 'practice', score: voice.practice, max: 30, label: 'Practice Depth' },
    { name: 'contribution', score: voice.contribution, max: 25, label: 'Contribution' },
    { name: 'validation', score: voice.validation, max: 45, label: 'Community Validation' }
  ]
  const lowestComponent = components.reduce((a, b) =>
    (a.score / a.max) < (b.score / b.max) ? a : b
  )

  // Generate suggestion based on lowest component
  const suggestion = getSuggestion(lowestComponent.name, voice)

  return (
    <div className="bg-cream rounded-2xl p-6">
      {/* Header with score */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-lg text-ink mb-1">Your Voice</h3>
          <p className="text-sm text-ink/50">
            How the community weighs your wisdom
          </p>
        </div>
        <div className="text-right">
          <div
            className="text-3xl font-serif mb-1"
            style={{ color: getVoiceTextStyle(visual.level) }}
          >
            {voice.total}
          </div>
          <VoiceBadge score={voice.total} />
        </div>
      </div>

      {/* Component breakdown */}
      <div className="space-y-4 mb-6">
        <ComponentBar
          label="Practice Depth"
          sublabel="Hours, session length, consistency"
          score={voice.practice}
          max={30}
          color="bg-indigo-deep/60"
        />
        <ComponentBar
          label="Contribution"
          sublabel="Pearls shared, meditations created"
          score={voice.contribution}
          max={25}
          color="bg-moss/60"
        />
        <ComponentBar
          label="Community Validation"
          sublabel="Karma, saves, completions by others"
          score={voice.validation}
          max={45}
          color="bg-amber-600/60"
        />
      </div>

      {/* Suggestion card */}
      <div className="bg-cream-deep rounded-xl p-4">
        <p className="text-xs text-ink/40 uppercase tracking-wide mb-2">
          Focus area
        </p>
        <p className="text-sm text-ink/70 leading-relaxed">
          {suggestion}
        </p>
      </div>

      {/* Detailed factors (collapsible) */}
      <details className="mt-6 group">
        <summary className="text-sm text-ink/40 cursor-pointer hover:text-ink/60 transition-colors">
          View detailed breakdown
        </summary>
        <div className="mt-4 space-y-3 pt-4 border-t border-ink/5">
          <FactorRow
            label="Hours meditated"
            value={`${voice.factors.hours.value.toLocaleString()} hrs`}
            score={voice.factors.hours.score}
            max={voice.factors.hours.max}
          />
          <FactorRow
            label="Average session"
            value={`${voice.factors.depth.value} min`}
            score={voice.factors.depth.score}
            max={voice.factors.depth.max}
          />
          <FactorRow
            label="Sessions per week"
            value={`${voice.factors.consistency.value.toFixed(1)}/wk`}
            score={voice.factors.consistency.score}
            max={voice.factors.consistency.max}
          />
          <div className="h-2" />
          <FactorRow
            label="Pearls shared"
            value={voice.factors.pearlsShared.value.toString()}
            score={voice.factors.pearlsShared.score}
            max={voice.factors.pearlsShared.max}
          />
          <FactorRow
            label="Meditations created"
            value={voice.factors.meditationsCreated.value.toString()}
            score={voice.factors.meditationsCreated.score}
            max={voice.factors.meditationsCreated.max}
          />
          <div className="h-2" />
          <FactorRow
            label="Karma received"
            value={voice.factors.karmaReceived.value.toLocaleString()}
            score={voice.factors.karmaReceived.score}
            max={voice.factors.karmaReceived.max}
          />
          <FactorRow
            label="Content saved by others"
            value={voice.factors.contentSaved.value.toString()}
            score={voice.factors.contentSaved.score}
            max={voice.factors.contentSaved.max}
          />
          <FactorRow
            label="Meditation completions"
            value={voice.factors.completions.value.toString()}
            score={voice.factors.completions.score}
            max={voice.factors.completions.max}
          />
        </div>
      </details>

      {/* Philosophy note */}
      <p className="mt-6 text-xs text-ink/30 italic text-center">
        Voice rewards the full picture: practice, contribution, and community validation.
        <br />
        Hours alone won't max your score. Wisdom that resonates will.
      </p>
    </div>
  )
}

// Component progress bar
function ComponentBar({
  label,
  sublabel,
  score,
  max,
  color
}: {
  label: string
  sublabel: string
  score: number
  max: number
  color: string
}) {
  const percentage = (score / max) * 100

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div>
          <span className="text-sm text-ink font-medium">{label}</span>
          <span className="text-xs text-ink/40 ml-2">{sublabel}</span>
        </div>
        <span className="text-sm text-ink/50 tabular-nums">
          {score.toFixed(1)} / {max}
        </span>
      </div>
      <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Individual factor row
function FactorRow({
  label,
  value,
  score,
  max
}: {
  label: string
  value: string
  score: number
  max: number
}) {
  const percentage = (score / max) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-ink/50">{label}</span>
          <span className="text-ink/40 tabular-nums">{value}</span>
        </div>
        <div className="h-1 bg-ink/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-ink/20 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] text-ink/30 tabular-nums w-10 text-right">
        {score.toFixed(1)}/{max}
      </span>
    </div>
  )
}

// Generate actionable suggestion based on lowest component
function getSuggestion(component: string, voice: VoiceScore): string {
  switch (component) {
    case 'practice':
      if (voice.factors.hours.score < voice.factors.hours.max * 0.3) {
        return "Your practice time is building. Each session adds to your foundation. Consider extending sessions by a few minutes to deepen each sit."
      }
      if (voice.factors.depth.score < voice.factors.depth.max * 0.3) {
        return "Longer sessions build depth. Try extending your sits by 5-10 minutes. The mind settles differently after 20 minutes."
      }
      if (voice.factors.consistency.score < voice.factors.consistency.max * 0.3) {
        return "Consistency compounds. Even short daily sessions build more than occasional long ones. Aim for regularity over duration."
      }
      return "Your practice foundation is growing. Continue your current rhythm while exploring longer sessions."

    case 'contribution':
      if (voice.factors.pearlsShared.score < 3) {
        return "Your insights have value. After your next session, try capturing a thought and sharing it as a pearl. Others walk similar paths."
      }
      if (voice.factors.meditationsCreated.score < 3) {
        return "Consider creating a guided meditation. Your practice experience could help others find their way."
      }
      return "You're contributing to the community. Each pearl or meditation you share helps others on their journey."

    case 'validation':
      if (voice.factors.karmaReceived.score < 5) {
        return "Community validation comes with time. Keep sharing authentic insights - wisdom that resonates will find its audience."
      }
      if (voice.factors.contentSaved.score < 5) {
        return "When your content gets saved, it means lasting value. Focus on insights that others might return to."
      }
      return "Your contributions are resonating. The community is beginning to recognize your voice."

    default:
      return "Keep practicing, contributing, and letting your wisdom find its audience. Voice grows organically."
  }
}

/**
 * Compact version for profile header
 */
export function VoiceCompact({ inputs }: { inputs: VoiceInputs }) {
  const voice = calculateVoice(inputs)
  const visual = getVoiceVisual(voice.total)

  return (
    <div className="flex items-center gap-3">
      <div
        className="text-2xl font-serif"
        style={{ color: getVoiceTextStyle(visual.level) }}
      >
        {voice.total}
      </div>
      <div>
        <VoiceBadge score={voice.total} />
        <p className="text-xs text-ink/40 mt-0.5">Voice score</p>
      </div>
    </div>
  )
}
