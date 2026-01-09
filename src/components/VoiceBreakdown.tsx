/**
 * VoiceBreakdown - Detailed view of Voice score calculation
 *
 * Shows users how their credibility score is calculated and
 * what they can focus on to increase it (deliberate improvement).
 *
 * Uses living theme colors with opacity variations for visual harmony.
 *
 * Displays:
 * - Overall score with visual treatment
 * - Four component scores (Practice, Contribution, Validation Received/Given)
 * - Individual factor breakdown with progress bars
 * - Actionable suggestions for lowest-scoring areas
 */

import { VoiceScore, VoiceInputs, calculateVoice, getVoiceVisual, VoiceLevel } from '../lib/voice'
import { VoiceBadge } from './VoiceBadge'

interface VoiceBreakdownProps {
  inputs: VoiceInputs
}

/**
 * Get text color with appropriate styling for voice level
 * Uses theme text colors for harmony
 */
function getVoiceTextStyle(level: VoiceLevel): string {
  switch (level) {
    case 'high':
    case 'established':
      return 'var(--text-primary, #1a1a1a)'
    case 'growing':
    case 'new':
    default:
      return 'var(--text-secondary, #6B7280)'
  }
}

export function VoiceBreakdown({ inputs }: VoiceBreakdownProps) {
  const voice = calculateVoice(inputs)
  const visual = getVoiceVisual(voice.total)

  // Find lowest-scoring component for suggestion
  const components = [
    { name: 'practice', score: voice.practice, max: 30, label: 'Practice Depth' },
    { name: 'contribution', score: voice.contribution, max: 20, label: 'Contribution' },
    { name: 'validationReceived', score: voice.validationReceived, max: 25, label: 'Validation Received' },
    { name: 'validationGiven', score: voice.validationGiven, max: 25, label: 'Validation Given' }
  ]
  const lowestComponent = components.reduce((a, b) =>
    (a.score / a.max) < (b.score / b.max) ? a : b
  )

  // Generate suggestion based on lowest component
  const suggestion = getSuggestion(lowestComponent.name, voice)

  // Glow for high scores
  const scoreGlow = visual.glow !== 'none'
    ? { textShadow: `0 0 ${visual.glow === 'strong' ? '8px' : '4px'} var(--accent-glow, rgba(0,0,0,0.1))` }
    : {}

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
            style={{ color: getVoiceTextStyle(visual.level), ...scoreGlow }}
          >
            {voice.total}
          </div>
          <VoiceBadge score={voice.total} />
        </div>
      </div>

      {/* Component breakdown - all use accent color with varying opacity */}
      <div className="space-y-4 mb-6">
        <ComponentBar
          label="Practice Depth"
          sublabel="Hours, session length, consistency"
          score={voice.practice}
          max={30}
          opacity={1}
        />
        <ComponentBar
          label="Contribution"
          sublabel="Pearls shared, meditations created"
          score={voice.contribution}
          max={20}
          opacity={0.85}
        />
        <ComponentBar
          label="Validation Received"
          sublabel="Karma, saves, completions by others"
          score={voice.validationReceived}
          max={25}
          opacity={0.7}
        />
        <ComponentBar
          label="Validation Given"
          sublabel="Your upvotes, saves, completions"
          score={voice.validationGiven}
          max={25}
          opacity={0.55}
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
          {/* Practice */}
          <p className="text-xs text-ink/30 font-medium">Practice</p>
          <FactorRow
            label="Hours meditated"
            value={`${voice.factors.hours.value.toLocaleString()} hrs`}
            score={voice.factors.hours.score}
            max={voice.factors.hours.max}
          />
          <FactorRow
            label="Average session"
            value={`${Math.round(voice.factors.depth.value)} min`}
            score={voice.factors.depth.score}
            max={voice.factors.depth.max}
          />
          <FactorRow
            label="Sessions per week"
            value={`${voice.factors.consistency.value.toFixed(1)}/wk`}
            score={voice.factors.consistency.score}
            max={voice.factors.consistency.max}
          />
          {/* Contribution */}
          <div className="h-2" />
          <p className="text-xs text-ink/30 font-medium">Contribution</p>
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
          {/* Validation Received */}
          <div className="h-2" />
          <p className="text-xs text-ink/30 font-medium">Validation Received</p>
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
            label="Your meditations completed"
            value={voice.factors.completionsReceived.value.toString()}
            score={voice.factors.completionsReceived.score}
            max={voice.factors.completionsReceived.max}
          />
          {/* Validation Given */}
          <div className="h-2" />
          <p className="text-xs text-ink/30 font-medium">Validation Given</p>
          <FactorRow
            label="Karma given"
            value={voice.factors.karmaGiven.value.toLocaleString()}
            score={voice.factors.karmaGiven.score}
            max={voice.factors.karmaGiven.max}
          />
          <FactorRow
            label="Content you saved"
            value={voice.factors.savesMade.value.toString()}
            score={voice.factors.savesMade.score}
            max={voice.factors.savesMade.max}
          />
          <FactorRow
            label="Meditations completed"
            value={voice.factors.completionsPerformed.value.toString()}
            score={voice.factors.completionsPerformed.score}
            max={voice.factors.completionsPerformed.max}
          />
        </div>
      </details>

      {/* Philosophy note */}
      <p className="mt-6 text-xs text-ink/30 italic text-center">
        Voice rewards giving as much as receiving.
        <br />
        Support others' practice, and let your wisdom resonate.
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
  opacity
}: {
  label: string
  sublabel: string
  score: number
  max: number
  opacity: number
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
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: `color-mix(in srgb, var(--accent) ${opacity * 100}%, transparent)`
          }}
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
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: 'color-mix(in srgb, var(--accent) 40%, transparent)'
            }}
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

    case 'validationReceived':
      if (voice.factors.karmaReceived.score < 5) {
        return "Community recognition comes with time. Keep sharing authentic insights - wisdom that resonates will find its audience."
      }
      if (voice.factors.contentSaved.score < 5) {
        return "When your content gets saved, it means lasting value. Focus on insights that others might return to."
      }
      return "Your contributions are resonating. The community is beginning to recognize your voice."

    case 'validationGiven':
      if (voice.factors.karmaGiven.score < 5) {
        return "Explore the community feed and upvote content that resonates. Supporting others strengthens the whole community."
      }
      if (voice.factors.savesMade.score < 5) {
        return "Save pearls and meditations that speak to you. Building your collection also supports the creators."
      }
      if (voice.factors.completionsPerformed.score < 5) {
        return "Try practicing with community meditations. Plan one from your saved collection and complete it to deepen your engagement."
      }
      return "You're actively engaging with the community. Keep supporting others' practice alongside your own."

    default:
      return "Keep practicing, contributing, and engaging with the community. Voice grows through reciprocity."
  }
}

/**
 * Compact version for profile header
 */
export function VoiceCompact({ inputs }: { inputs: VoiceInputs }) {
  const voice = calculateVoice(inputs)
  const visual = getVoiceVisual(voice.total)

  // Glow for high scores
  const scoreGlow = visual.glow !== 'none'
    ? { textShadow: `0 0 ${visual.glow === 'strong' ? '8px' : '4px'} var(--accent-glow, rgba(0,0,0,0.1))` }
    : {}

  return (
    <div className="flex items-center gap-3">
      <div
        className="text-2xl font-serif"
        style={{ color: getVoiceTextStyle(visual.level), ...scoreGlow }}
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
