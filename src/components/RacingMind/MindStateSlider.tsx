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
    question: 'How calm do you feel now?',
    lowLabel: 'A little calmer',
    highLabel: 'Still mind',
    lowDescription: 'Slightly settled',
    highDescription: 'Deep stillness',
  },
}

export function MindStateSlider({
  value,
  onChange,
  scaleType,
  variant = 'light',
}: MindStateSliderProps) {
  const config = SCALE_CONFIG[scaleType]

  // Color classes based on variant
  const textColor = variant === 'dark' ? 'text-white' : 'text-ink'
  const textMuted = variant === 'dark' ? 'text-white/60' : 'text-ink/60'
  const trackBg = variant === 'dark' ? 'bg-white/10' : 'bg-ink/10'

  // Contextual description based on selected value
  const getValueDescription = () => {
    if (value === null) return null

    if (scaleType === 'racing') {
      if (value <= 3) return 'Relatively calm, some background noise'
      if (value <= 5) return 'Moderate mental chatter'
      if (value <= 7) return 'Active, persistent thoughts'
      return 'Intense mental activity'
    } else {
      if (value <= 3) return 'Beginning to settle'
      if (value <= 5) return 'Noticeably calmer'
      if (value <= 7) return 'Significantly settled'
      return 'Deep stillness achieved'
    }
  }

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10))
  }

  // Calculate fill percentage for the track
  const fillPercent = value !== null ? ((value - 1) / 9) * 100 : 0

  return (
    <div className="w-full">
      {/* Question */}
      <p className={`text-center ${textColor} font-medium mb-2`}>{config.question}</p>

      {/* Contextual hint */}
      <p className={`text-center text-xs ${textMuted} mb-5`}>
        {value === null
          ? scaleType === 'racing'
            ? 'Be honest with yourself'
            : "Notice where you've landed"
          : getValueDescription()}
      </p>

      {/* Scale labels */}
      <div className={`flex justify-between text-xs mb-3 px-1`}>
        <div className="text-left">
          <span className={textMuted}>1</span>
          <span className={`ml-1 ${textMuted}`}>{config.lowLabel}</span>
        </div>
        <div className="text-right">
          <span className={textMuted}>{config.highLabel}</span>
          <span className={`ml-1 ${textMuted}`}>10</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        {/* Track background */}
        <div
          className={`absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full ${trackBg}`}
        />

        {/* Filled track */}
        {value !== null && (
          <div
            className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-accent transition-all duration-150"
            style={{ width: `${fillPercent}%` }}
          />
        )}

        {/* Native range input */}
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value ?? 5}
          onChange={handleSliderChange}
          className="relative w-full h-10 appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-8
            [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-accent/40
            [&::-webkit-slider-thumb]:border-4
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-8
            [&::-moz-range-thumb]:h-8
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:shadow-accent/40
            [&::-moz-range-thumb]:border-4
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:duration-150
            [&::-moz-range-thumb]:hover:scale-110"
          style={{ opacity: value === null ? 0.5 : 1 }}
          aria-label={config.question}
        />
      </div>

      {/* Endpoint descriptions */}
      <div className={`flex justify-between text-[10px] ${textMuted} mt-1 px-1`}>
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
