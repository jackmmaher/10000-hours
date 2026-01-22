/**
 * MindStateSlider - 1-10 scale for self-assessment
 *
 * Used for pre and post session assessment of mental state.
 * "Racing" (1) to "Calm" (10)
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
  const textMuted = variant === 'dark' ? 'text-white/50' : 'text-ink/50'
  const dotInactive =
    variant === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-ink/20 hover:bg-ink/30'

  return (
    <div className="w-full">
      {label && <p className={`text-center ${textColor} mb-4`}>{label}</p>}

      {/* Scale labels */}
      <div className={`flex justify-between text-xs ${textMuted} mb-3 px-1`}>
        <span>Racing</span>
        <span>Calm</span>
      </div>

      {/* Dots */}
      <div className="flex justify-between items-center gap-1 px-1">
        {dots.map((dot) => (
          <button
            key={dot}
            onClick={() => onChange(dot)}
            className={`relative flex items-center justify-center transition-all ${
              value === dot ? 'w-8 h-8 -my-1' : 'w-6 h-6'
            }`}
            aria-label={`Select ${dot}`}
          >
            <div
              className={`rounded-full transition-all ${
                value === dot
                  ? 'w-8 h-8 bg-accent shadow-lg shadow-accent/30'
                  : value !== null && dot < value && dot > (value || 0)
                    ? 'w-3 h-3 bg-accent/30'
                    : `w-3 h-3 ${dotInactive}`
              }`}
            />
            {value === dot && (
              <span className="absolute text-white text-xs font-semibold">{dot}</span>
            )}
          </button>
        ))}
      </div>

      {/* Current value display */}
      {value !== null && (
        <div className="text-center mt-4">
          <span className={`text-2xl font-serif ${textColor}`}>{value}</span>
          <span className={`${textMuted} text-sm`}>/10</span>
        </div>
      )}
    </div>
  )
}
