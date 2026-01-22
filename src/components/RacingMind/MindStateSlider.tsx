/**
 * MindStateSlider - 1-10 scale for self-assessment
 *
 * Used for pre and post session assessment of mental state.
 * "Racing" (1) to "Calm" (10)
 *
 * Redesigned with a visible track and clear tappable dots.
 */

interface MindStateSliderProps {
  value: number | null
  onChange: (value: number) => void
  label?: string
  /** Use light text colors for dark backgrounds */
  variant?: 'light' | 'dark'
}

export function MindStateSlider({
  value,
  onChange,
  label,
  variant = 'light',
}: MindStateSliderProps) {
  const dots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // Color classes based on variant
  const textColor = variant === 'dark' ? 'text-white' : 'text-ink'
  const textMuted = variant === 'dark' ? 'text-white/60' : 'text-ink/60'
  const trackBg = variant === 'dark' ? 'bg-white/10' : 'bg-ink/10'
  const dotBorder = variant === 'dark' ? 'border-white/40' : 'border-ink/40'
  const dotBg = variant === 'dark' ? 'bg-white/20' : 'bg-base'

  return (
    <div className="w-full">
      {label && <p className={`text-center ${textColor} mb-5`}>{label}</p>}

      {/* Scale labels */}
      <div className={`flex justify-between text-xs ${textMuted} mb-2 px-2`}>
        <span>Racing</span>
        <span>Calm</span>
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
