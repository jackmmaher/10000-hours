/**
 * VoiceDetailModal - Detailed breakdown of Voice score
 *
 * Shows how the Voice score is calculated with all contributing factors.
 * Makes the algorithm transparent and helps users understand how to build credibility.
 */

import { VoiceScore, getVoiceVisual, VoiceLevel } from '../lib/voice'

interface VoiceDetailModalProps {
  voice: VoiceScore
  onClose: () => void
}

/**
 * Get CSS variable value for voice dot color
 */
function getVoiceDotStyle(level: VoiceLevel) {
  return `var(--voice-${level}-dot)`
}

export function VoiceDetailModal({ voice, onClose }: VoiceDetailModalProps) {
  const visual = getVoiceVisual(voice.total)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-ink/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-ink/40 mb-1">Your meditation credibility</p>
              <div className="flex items-center gap-3">
                <p className="font-serif text-3xl text-indigo-deep tabular-nums">
                  {voice.total}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: dot <= visual.dots
                          ? getVoiceDotStyle(visual.level)
                          : 'var(--border-subtle, rgba(0,0,0,0.1))'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-ink/40 hover:text-ink/60 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {/* Component bars */}
          <div className="mb-6">
            <ComponentBar
              label="Practice"
              score={voice.practice}
              max={30}
              color="bg-moss"
              description="Depth and consistency of your meditation"
            />
            <ComponentBar
              label="Contribution"
              score={voice.contribution}
              max={20}
              color="bg-bark"
              description="Sharing wisdom with the community"
            />
            <ComponentBar
              label="Validation Received"
              score={voice.validationReceived}
              max={25}
              color="bg-amber-500"
              description="Community recognition of your wisdom"
            />
            <ComponentBar
              label="Validation Given"
              score={voice.validationGiven}
              max={25}
              color="bg-indigo-deep/70"
              description="Your engagement with community content"
            />
          </div>

          {/* Detailed factors */}
          <div className="space-y-6">
            {/* Practice factors */}
            <FactorSection title="Practice" subtitle="30% of score">
              <Factor
                label="Hours logged"
                value={`${voice.factors.hours.value.toFixed(1)}h`}
                score={voice.factors.hours.score}
                max={voice.factors.hours.max}
              />
              <Factor
                label="Session depth"
                value={`${Math.round(voice.factors.depth.value)}min avg`}
                score={voice.factors.depth.score}
                max={voice.factors.depth.max}
              />
              <Factor
                label="Consistency"
                value={`${voice.factors.consistency.value.toFixed(1)}/week`}
                score={voice.factors.consistency.score}
                max={voice.factors.consistency.max}
              />
            </FactorSection>

            {/* Contribution factors */}
            <FactorSection title="Contribution" subtitle="20% of score">
              <Factor
                label="Pearls shared"
                value={voice.factors.pearlsShared.value.toString()}
                score={voice.factors.pearlsShared.score}
                max={voice.factors.pearlsShared.max}
              />
              <Factor
                label="Meditations created"
                value={voice.factors.meditationsCreated.value.toString()}
                score={voice.factors.meditationsCreated.score}
                max={voice.factors.meditationsCreated.max}
              />
            </FactorSection>

            {/* Validation Received factors */}
            <FactorSection title="Validation Received" subtitle="25% of score">
              <Factor
                label="Karma received"
                value={voice.factors.karmaReceived.value.toString()}
                score={voice.factors.karmaReceived.score}
                max={voice.factors.karmaReceived.max}
              />
              <Factor
                label="Content saved by others"
                value={voice.factors.contentSaved.value.toString()}
                score={voice.factors.contentSaved.score}
                max={voice.factors.contentSaved.max}
              />
              <Factor
                label="Your meditations completed"
                value={voice.factors.completionsReceived.value.toString()}
                score={voice.factors.completionsReceived.score}
                max={voice.factors.completionsReceived.max}
              />
            </FactorSection>

            {/* Validation Given factors */}
            <FactorSection title="Validation Given" subtitle="25% of score">
              <Factor
                label="Karma given"
                value={voice.factors.karmaGiven.value.toString()}
                score={voice.factors.karmaGiven.score}
                max={voice.factors.karmaGiven.max}
              />
              <Factor
                label="Content you saved"
                value={voice.factors.savesMade.value.toString()}
                score={voice.factors.savesMade.score}
                max={voice.factors.savesMade.max}
              />
              <Factor
                label="Meditations completed"
                value={voice.factors.completionsPerformed.value.toString()}
                score={voice.factors.completionsPerformed.score}
                max={voice.factors.completionsPerformed.max}
              />
            </FactorSection>
          </div>

          {/* Explanation */}
          <div className="mt-6 p-4 bg-cream-deep rounded-xl">
            <p className="text-xs text-ink/50 leading-relaxed">
              Voice measures meditation credibility across practice depth, contribution, and
              two-way validation. It rewards both sharing wisdom AND engaging with others' content.
              High scores require giving to the community as much as receiving recognition.
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="px-6 pb-8 pt-4 border-t border-ink/5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-medium bg-ink/5 text-ink/70 hover:bg-ink/10 transition-colors active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function ComponentBar({
  label,
  score,
  max,
  color,
  description
}: {
  label: string
  score: number
  max: number
  color: string
  description: string
}) {
  const percent = (score / max) * 100

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-sm text-ink/50 tabular-nums">
          {score.toFixed(1)} / {max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-deep">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-ink/40 mt-1">{description}</p>
    </div>
  )
}

function FactorSection({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink/40">{subtitle}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Factor({
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
  const percent = (score / max) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink/60">{label}</span>
          <span className="text-ink/40 tabular-nums">{value}</span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-cream-deep">
          <div
            className="h-full rounded-full bg-ink/20 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-ink/30 tabular-nums w-10 text-right">
        {score.toFixed(1)}
      </span>
    </div>
  )
}
