/**
 * VoiceDetailModal - Detailed breakdown of Voice score
 *
 * Shows how the Voice score is calculated with all contributing factors.
 * Makes the algorithm transparent and helps users understand how to build credibility.
 *
 * Uses living theme colors with opacity variations for visual harmony.
 */

import { VoiceScore, getVoiceVisual, VoiceLevel, getVoiceTier, getNextTier, VoiceTier } from '../lib/voice'
import { FEATURE_UNLOCKS, getUnlockedFeatures, getTierDisplayName } from '../lib/featureUnlocks'

interface VoiceDetailModalProps {
  voice: VoiceScore
  onClose: () => void
}

/**
 * Get dot color with opacity based on voice level
 * Uses --accent from living theme with varying intensity
 */
function getVoiceDotStyle(level: VoiceLevel): string {
  switch (level) {
    case 'high':
      return 'var(--accent)'
    case 'established':
      return 'color-mix(in srgb, var(--accent) 85%, transparent)'
    case 'growing':
      return 'color-mix(in srgb, var(--accent) 70%, transparent)'
    case 'new':
    default:
      return 'var(--text-muted, rgba(0,0,0,0.3))'
  }
}

export function VoiceDetailModal({ voice, onClose }: VoiceDetailModalProps) {
  const visual = getVoiceVisual(voice.total)
  const tier = getVoiceTier(voice.total)
  const nextTier = getNextTier(tier.tier)

  // Glow for high scores
  const scoreGlow = visual.glow !== 'none'
    ? { textShadow: `0 0 ${visual.glow === 'strong' ? '8px' : '4px'} var(--accent-glow, rgba(0,0,0,0.1))` }
    : {}

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
                <p
                  className="font-serif text-3xl tabular-nums"
                  style={{ color: 'var(--text-primary)', ...scoreGlow }}
                >
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
              {/* Tier label and progress */}
              <div className="mt-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: voice.total >= 70 ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {tier.label}
                </span>
                <span className="text-xs text-ink/40 ml-2">
                  {tier.description}
                </span>
              </div>
              {/* Progress to next tier */}
              {nextTier && (
                <p className="text-xs text-ink/40 mt-1">
                  {nextTier.minScore - voice.total} points to {nextTier.label}
                </p>
              )}
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
          {/* Component bars - all use accent color with varying opacity */}
          <div className="mb-6">
            <ComponentBar
              label="Practice"
              score={voice.practice}
              max={30}
              opacity={1}
              description="Depth and consistency of your meditation"
            />
            <ComponentBar
              label="Contribution"
              score={voice.contribution}
              max={20}
              opacity={0.85}
              description="Sharing wisdom with the community"
            />
            <ComponentBar
              label="Validation Received"
              score={voice.validationReceived}
              max={25}
              opacity={0.7}
              description="Community recognition of your wisdom"
            />
            <ComponentBar
              label="Validation Given"
              score={voice.validationGiven}
              max={25}
              opacity={0.55}
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

          {/* Feature Unlocks */}
          <FeatureUnlocksSection currentTier={tier.tier} />

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
  opacity,
  description
}: {
  label: string
  score: number
  max: number
  opacity: number
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
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: `color-mix(in srgb, var(--accent) ${opacity * 100}%, transparent)`
          }}
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
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor: 'color-mix(in srgb, var(--accent) 40%, transparent)'
            }}
          />
        </div>
      </div>
      <span className="text-xs text-ink/30 tabular-nums w-10 text-right">
        {score.toFixed(1)}
      </span>
    </div>
  )
}

/**
 * Feature Unlocks Section
 * Shows features unlocked at current tier and what's coming
 */
function FeatureUnlocksSection({ currentTier }: { currentTier: VoiceTier }) {
  const unlockedFeatures = getUnlockedFeatures(currentTier)
  const lockedFeatures = FEATURE_UNLOCKS.filter(f => !unlockedFeatures.some(u => u.id === f.id))

  // Don't show if no features to display
  if (FEATURE_UNLOCKS.length === 0) return null

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-ink mb-3">Feature Unlocks</p>

      {/* Unlocked features */}
      {unlockedFeatures.length > 0 && (
        <div className="space-y-2 mb-4">
          {unlockedFeatures.map(feature => (
            <div
              key={feature.id}
              className="flex items-start gap-3 p-3 bg-moss/10 rounded-xl"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <svg className="w-3 h-3 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-ink font-medium">{feature.name}</p>
                <p className="text-xs text-ink/50">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Locked features (coming soon) */}
      {lockedFeatures.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-ink/40 mb-2">Unlocks with higher Voice</p>
          {lockedFeatures.map(feature => (
            <div
              key={feature.id}
              className="flex items-start gap-3 p-3 bg-cream-deep rounded-xl opacity-70"
            >
              <div className="w-5 h-5 rounded-full bg-ink/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-ink/60">{feature.name}</p>
                <p className="text-xs text-ink/40">
                  {feature.description} • Requires {getTierDisplayName(feature.requiredTier)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
