/**
 * ThemePreview - Debug tool for previewing theme variations
 *
 * A floating panel that allows real-time scrubbing through:
 * - Times of day (Morning, Daytime, Evening, Night)
 * - Seasons (Spring, Summer, Autumn, Winter)
 *
 * DELETE THIS FILE AFTER THEME DESIGN IS FINALIZED
 */

import { useState, useEffect } from 'react'
import {
  TimeOfDay,
  Season,
  calculateTheme,
  themeToCSSProperties,
  getThemeName,
  SEASONAL_TIME_BOUNDARIES
} from '../lib/themeEngine'
import { AmbientAtmosphere } from './AmbientAtmosphere'
import { useSettingsStore } from '../stores/useSettingsStore'

const TIMES: TimeOfDay[] = ['morning', 'daytime', 'evening', 'night']
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

// Dynamic time labels based on seasonal boundaries
function getTimeLabels(season: Season): Record<TimeOfDay, string> {
  const bounds = SEASONAL_TIME_BOUNDARIES[season]
  const formatHour = (h: number) => {
    const hour = Math.floor(h)
    const min = Math.round((h - hour) * 60)
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return min > 0 ? `${displayHour}:${min.toString().padStart(2, '0')}${ampm}` : `${displayHour}${ampm}`
  }
  return {
    morning: `${formatHour(bounds.morning.start)}-${formatHour(bounds.morning.end)}`,
    daytime: `${formatHour(bounds.daytime.start)}-${formatHour(bounds.daytime.end)}`,
    evening: `${formatHour(bounds.evening.start)}-${formatHour(bounds.evening.end)}`,
    night: `${formatHour(bounds.night.start)}-${formatHour(bounds.night.end)}`
  }
}

// SVG Icons (no emojis!)
const SunIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" fill="none" />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SunsetIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M17 18a5 5 0 0 0-10 0" />
    <line x1="12" y1="9" x2="12" y2="2" />
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
    <line x1="1" y1="18" x2="3" y2="18" />
    <line x1="21" y1="18" x2="23" y2="18" />
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
    <line x1="23" y1="22" x2="1" y2="22" />
  </svg>
)

const DawnIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M17 18a5 5 0 0 0-10 0" />
    <line x1="12" y1="2" x2="12" y2="9" />
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
    <line x1="1" y1="18" x2="3" y2="18" />
    <line x1="21" y1="18" x2="23" y2="18" />
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
    <line x1="23" y1="22" x2="1" y2="22" />
    <polyline points="8,6 12,2 16,6" />
  </svg>
)

const FlowerIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2C12 2 14 5 14 7C14 9 12 10 12 10C12 10 10 9 10 7C10 5 12 2 12 2Z" />
    <path d="M12 22C12 22 14 19 14 17C14 15 12 14 12 14C12 14 10 15 10 17C10 19 12 22 12 22Z" />
    <path d="M2 12C2 12 5 10 7 10C9 10 10 12 10 12C10 12 9 14 7 14C5 14 2 12 2 12Z" />
    <path d="M22 12C22 12 19 10 17 10C15 10 14 12 14 12C14 12 15 14 17 14C19 14 22 12 22 12Z" />
  </svg>
)

const LeafIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" />
  </svg>
)

const SnowflakeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const PaletteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.55-.22-1.05-.58-1.41-.36-.38-.58-.89-.58-1.43 0-1.1.9-2 2-2h2.36c3.07 0 5.64-2.57 5.64-5.64C22 5.93 17.52 2 12 2z" />
    <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
  </svg>
)

const TIME_ICONS: Record<TimeOfDay, React.ReactNode> = {
  morning: <DawnIcon />,
  daytime: <SunIcon />,
  evening: <SunsetIcon />,
  night: <MoonIcon />
}

const SEASON_ICONS: Record<Season, React.ReactNode> = {
  spring: <FlowerIcon />,
  summer: <SunIcon />,
  autumn: <LeafIcon />,
  winter: <SnowflakeIcon />
}

export function ThemePreview() {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [timeIndex, setTimeIndex] = useState(1)
  const [seasonIndex, setSeasonIndex] = useState(3)
  const [isOverriding, setIsOverriding] = useState(true)

  // Read visual effects setting from store
  const { visualEffects } = useSettingsStore()
  const isExpressive = visualEffects === 'expressive'

  const currentTime = TIMES[timeIndex]
  const currentSeason = SEASONS[seasonIndex]

  // Apply theme override when scrubbing
  useEffect(() => {
    if (!isOverriding) return

    const tokens = calculateTheme(currentTime, currentSeason)
    const properties = themeToCSSProperties(tokens)
    const root = document.documentElement

    root.style.setProperty('--theme-transition', '0.3s ease')

    Object.entries(properties).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    if (tokens.isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [currentTime, currentSeason, isOverriding])

  const handleToggleOverride = () => {
    if (isOverriding) {
      document.documentElement.style.setProperty('--theme-transition', '0.5s ease')
      window.dispatchEvent(new Event('themeReset'))
    }
    setIsOverriding(!isOverriding)
  }

  // Render the ambient atmosphere layer with season
  const atmosphereLayer = isOverriding ? (
    <AmbientAtmosphere
      timeOfDay={currentTime}
      season={currentSeason}
      expressive={isExpressive}
    />
  ) : null

  if (!isOpen) {
    return (
      <>
        {atmosphereLayer}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-[9999] w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)'
          }}
          title="Open Theme Preview"
        >
          <PaletteIcon />
        </button>
      </>
    )
  }

  if (isMinimized) {
    return (
      <>
        {atmosphereLayer}
        <div
          className="fixed top-4 right-4 z-[9999] rounded-xl shadow-xl overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <span style={{ color: 'var(--text-primary)' }}>
              {TIME_ICONS[currentTime]}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {currentSeason}
            </span>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-lg leading-none"
              style={{ color: 'var(--text-muted)' }}
            >
              ×
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {atmosphereLayer}
      <div
        className="fixed top-4 right-4 z-[9999] w-80 rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 sticky top-0"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)'
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--accent)' }}><PaletteIcon /></span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Living Theme Lab
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-lg leading-none"
              style={{ color: 'var(--text-muted)' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Preview Mode toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Preview Mode
            </span>
            <button
              onClick={handleToggleOverride}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: isOverriding ? 'var(--accent)' : 'var(--toggle-off)' }}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${isOverriding ? 'translate-x-5' : 'translate-x-0.5'}`}
                style={{ background: 'var(--toggle-thumb)' }}
              />
            </button>
          </div>

          {/* Current theme display */}
          <div
            className="text-center py-4 rounded-lg"
            style={{ background: 'var(--bg-deep)' }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span style={{ color: 'var(--accent)' }}>{TIME_ICONS[currentTime]}</span>
              <span style={{ color: 'var(--accent)' }}>{SEASON_ICONS[currentSeason]}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {getThemeName(currentTime, currentSeason)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {getTimeLabels(currentSeason)[currentTime]}
            </p>
          </div>

          {/* === SEASON === */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Season
              </span>
              <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                {currentSeason}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {SEASONS.map((season, i) => (
                <button
                  key={season}
                  onClick={() => {
                    setSeasonIndex(i)
                    if (!isOverriding) setIsOverriding(true)
                  }}
                  className={`py-2.5 rounded-lg text-center transition-all ${seasonIndex === i ? 'ring-2 ring-[var(--accent)]' : ''}`}
                  style={{
                    background: seasonIndex === i ? 'var(--accent-muted)' : 'var(--bg-deep)',
                    color: seasonIndex === i ? 'var(--accent)' : 'var(--text-secondary)'
                  }}
                >
                  <div className="flex justify-center mb-1">{SEASON_ICONS[season]}</div>
                  <p className="text-[10px] capitalize">{season}</p>
                </button>
              ))}
            </div>
          </div>

          {/* === TIME OF DAY === */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Time of Day
              </span>
              <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                {currentTime}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {TIMES.map((time, i) => (
                <button
                  key={time}
                  onClick={() => {
                    setTimeIndex(i)
                    if (!isOverriding) setIsOverriding(true)
                  }}
                  className={`py-2.5 rounded-lg text-center transition-all ${timeIndex === i ? 'ring-2 ring-[var(--accent)]' : ''}`}
                  style={{
                    background: timeIndex === i ? 'var(--accent-muted)' : 'var(--bg-deep)',
                    color: timeIndex === i ? 'var(--accent)' : 'var(--text-secondary)'
                  }}
                >
                  <div className="flex justify-center mb-1">{TIME_ICONS[time]}</div>
                  <p className="text-[10px] capitalize">{time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* === QUICK COMBOS === */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Quick Presets
            </p>
            <div className="grid grid-cols-2 gap-2">
              <QuickPreset
                label="Spring Dawn"
                desc="Cherry blossoms + dew"
                onClick={() => {
                  setSeasonIndex(0)
                  setTimeIndex(0)
                  setIsOverriding(true)
                }}
              />
              <QuickPreset
                label="Summer Night"
                desc="Fireflies + warm stars"
                onClick={() => {
                  setSeasonIndex(1)
                  setTimeIndex(3)
                  setIsOverriding(true)
                }}
              />
              <QuickPreset
                label="Autumn Evening"
                desc="Harvest moon + leaves"
                onClick={() => {
                  setSeasonIndex(2)
                  setTimeIndex(2)
                  setIsOverriding(true)
                }}
              />
              <QuickPreset
                label="Winter Night"
                desc="Aurora + shooting stars"
                onClick={() => {
                  setSeasonIndex(3)
                  setTimeIndex(3)
                  setIsOverriding(true)
                }}
              />
            </div>
          </div>

          {/* Auto-cycle button */}
          <AutoCycleButton
            onCycle={(season, time) => {
              setSeasonIndex(SEASONS.indexOf(season))
              setTimeIndex(TIMES.indexOf(time))
              setIsOverriding(true)
            }}
          />

          {/* Note */}
          <p className="text-[10px] text-center pt-2" style={{ color: 'var(--text-muted)' }}>
            Delete after design finalized
          </p>
        </div>
      </div>
    </>
  )
}

function QuickPreset({ label, desc, onClick }: { label: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs py-2.5 px-3 rounded-lg transition-colors text-left"
      style={{ background: 'var(--bg-deep)', color: 'var(--text-secondary)' }}
    >
      <p className="font-medium">{label}</p>
      <p className="text-[10px] opacity-60 mt-0.5">{desc}</p>
    </button>
  )
}

/**
 * Auto-cycle through all 16 theme combinations
 */
function AutoCycleButton({
  onCycle
}: {
  onCycle: (season: Season, time: TimeOfDay) => void
}) {
  const [isCycling, setIsCycling] = useState(false)
  const [, setCycleIndex] = useState(0)

  // All 16 combinations (4 seasons x 4 times)
  const cycles: Array<{ season: Season; time: TimeOfDay }> = [
    // Spring
    { season: 'spring', time: 'morning' },
    { season: 'spring', time: 'daytime' },
    { season: 'spring', time: 'evening' },
    { season: 'spring', time: 'night' },
    // Summer
    { season: 'summer', time: 'morning' },
    { season: 'summer', time: 'daytime' },
    { season: 'summer', time: 'evening' },
    { season: 'summer', time: 'night' },
    // Autumn
    { season: 'autumn', time: 'morning' },
    { season: 'autumn', time: 'daytime' },
    { season: 'autumn', time: 'evening' },
    { season: 'autumn', time: 'night' },
    // Winter
    { season: 'winter', time: 'morning' },
    { season: 'winter', time: 'daytime' },
    { season: 'winter', time: 'evening' },
    { season: 'winter', time: 'night' }
  ]

  useEffect(() => {
    if (!isCycling) return

    const interval = setInterval(() => {
      setCycleIndex((prev) => {
        const next = (prev + 1) % cycles.length
        const c = cycles[next]
        onCycle(c.season, c.time)
        return next
      })
    }, 4000) // 4 seconds per theme

    return () => clearInterval(interval)
  }, [isCycling, onCycle])

  return (
    <button
      onClick={() => {
        if (!isCycling) {
          const c = cycles[0]
          onCycle(c.season, c.time)
        }
        setIsCycling(!isCycling)
      }}
      className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      style={{
        background: isCycling ? 'var(--accent)' : 'var(--bg-deep)',
        color: isCycling ? 'var(--text-on-accent)' : 'var(--text-secondary)'
      }}
    >
      {isCycling ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          Stop Cycle
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          Cycle All 16 Themes
        </>
      )}
    </button>
  )
}
