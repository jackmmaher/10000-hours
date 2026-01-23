/**
 * MindStateSlider - Psychologically-framed assessment scales
 *
 * Two scale types designed using Cialdini/Thaler behavioral principles:
 *
 * PRE-SESSION (racing scale):
 * - "How racing is your mind right now?"
 * - 1 = "Few thoughts I can't quiet" → 10 = "A chorus that won't let me sit still"
 * - Gets user to acknowledge/confess their racing mind (pre-commitment)
 *
 * POST-SESSION (calm scale):
 * - "How much calmer is your mind now?"
 * - 1 = "The voice is still there" → 10 = "Complete mental stillness"
 * - Assumes benefit occurred (anchoring), higher = better (intuitive)
 */

interface MindStateSliderProps {
  value: number | null
  onChange: (value: number) => void
  /** Scale type determines labels and framing */
  scaleType: 'racing' | 'calm'
  /** Use light text colors for dark backgrounds */
  variant?: 'light' | 'dark'
}

const SCALE_CONFIG = {
  racing: {
    question: 'How racing is your mind right now?',
    lowLabel: 'Few quiet thoughts',
    highLabel: 'Relentless chorus',
    lowDescription: 'Some thoughts, but manageable',
    highDescription: "Won't let me sit still",
  },
  calm: {
    question: 'How much calmer is your mind now?',
    lowLabel: 'Still noisy',
    highLabel: 'Complete stillness',
    lowDescription: 'Voices still there, listening less',
    highDescription: 'What voices?',
  },
}

export function MindStateSlider({
  value,
  onChange,
  scaleType,
  variant = 'light',
}: MindStateSliderProps) {
  const dots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const config = SCALE_CONFIG[scaleType]

  // Color classes based on variant
  const textColor = variant === 'dark' ? 'text-white' : 'text-ink'
  const textMuted = variant === 'dark' ? 'text-white/60' : 'text-ink/60'
  const trackBg = variant === 'dark' ? 'bg-white/10' : 'bg-ink/10'
  const dotBorder = variant === 'dark' ? 'border-white/40' : 'border-ink/40'
  const dotBg = variant === 'dark' ? 'bg-white/20' : 'bg-base'

  // Contextual description based on selected value
  const getValueDescription = () => {
    if (value === null) return null

    if (scaleType === 'racing') {
      if (value <= 3) return 'Relatively calm, some background noise'
      if (value <= 5) return 'Moderate mental chatter'
      if (value <= 7) return 'Active, persistent thoughts'
      return 'Intense mental activity'
    } else {
      if (value <= 3) return 'Some improvement, work to do'
      if (value <= 5) return 'Noticeably calmer'
      if (value <= 7) return 'Significantly settled'
      return 'Deep calm achieved'
    }
  }

  return (
    <div className="w-full">
      {/* Question */}
      <p className={`text-center ${textColor} font-medium mb-2`}>{config.question}</p>

      {/* Contextual hint */}
      <p className={`text-center text-xs ${textMuted} mb-5`}>
        {value === null
          ? scaleType === 'racing'
            ? 'Be honest with yourself'
            : 'Notice what changed'
          : getValueDescription()}
      </p>

      {/* Scale labels with descriptions */}
      <div className={`flex justify-between text-xs mb-2 px-1`}>
        <div className="text-left">
          <span className={textMuted}>1</span>
          <span className={`ml-1 ${textMuted}`}>{config.lowLabel}</span>
        </div>
        <div className="text-right">
          <span className={textMuted}>{config.highLabel}</span>
          <span className={`ml-1 ${textMuted}`}>10</span>
        </div>
      </div>

      {/* Slider track with dots */}
      <div className="relative px-2">
        {/* Track background */}
        <div
          className={`absolute top-1/2 left-2 right-2 h-1 -translate-y-1/2 rounded-full ${trackBg}`}
        />

        {/* Filled track up to selected value */}
        {value !== null && (
          <div
            className="absolute top-1/2 left-2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ width: `${((value - 1) / 9) * 100}%` }}
          />
        )}

        {/* Dots */}
        <div className="relative flex justify-between items-center">
          {dots.map((dot) => {
            const isSelected = value === dot
            const isBefore = value !== null && dot < value

            return (
              <button
                key={dot}
                onClick={() => onChange(dot)}
                className="relative flex items-center justify-center w-8 h-10 -mx-1"
                aria-label={`Select ${dot}`}
              >
                <div
                  className={`rounded-full transition-all flex items-center justify-center ${
                    isSelected
                      ? 'w-9 h-9 bg-accent shadow-lg shadow-accent/40'
                      : isBefore
                        ? 'w-4 h-4 bg-accent'
                        : `w-4 h-4 ${dotBg} border-2 ${dotBorder}`
                  }`}
                >
                  {isSelected && <span className="text-white text-sm font-bold">{dot}</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Number scale below */}
      <div className="flex justify-between px-2 mt-1">
        {dots.map((dot) => (
          <div
            key={dot}
            className={`w-8 -mx-1 text-center text-[10px] ${
              value === dot ? 'text-accent font-bold' : textMuted
            }`}
          >
            {dot}
          </div>
        ))}
      </div>

      {/* Endpoint descriptions */}
      <div className={`flex justify-between text-[10px] ${textMuted} mt-2 px-1`}>
        <span className="max-w-[80px]">{config.lowDescription}</span>
        <span className="max-w-[80px] text-right">{config.highDescription}</span>
      </div>

      {/* Current value display */}
      {value !== null && (
        <div className="text-center mt-4">
          <span className={`text-3xl font-serif ${textColor}`}>{value}</span>
          <span className={`${textMuted} text-sm`}>/10</span>
        </div>
      )}
    </div>
  )
}
