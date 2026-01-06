import { useMemo, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useSwipe } from '../hooks/useSwipe'
import {
  getMonthlyData,
  getSessionDatesForMonth,
  getSessionsForDate,
  getTotalForDate
} from '../lib/calculations'
import { getCalendarFadeOpacity } from '../lib/tierLogic'
import {
  formatMonthYear,
  formatFullDate,
  formatDuration,
  formatTime,
  formatTotalHours
} from '../lib/format'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

type CalendarView = 'month' | 'year'

export function Calendar() {
  const { sessions, setView } = useSessionStore()
  const { isPremiumOrTrial } = usePremiumStore()

  const today = new Date()
  const [viewType, setViewType] = useState<CalendarView>('month')
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [expandedSession, setExpandedSession] = useState(false)

  // Calculate the oldest allowed month for FREE tier (90 days back)
  const oldestAllowedDate = useMemo(() => {
    if (isPremiumOrTrial) return null // No limit
    const date = new Date()
    date.setDate(date.getDate() - 90)
    return date
  }, [isPremiumOrTrial])

  // Check if a month is within the allowed range
  const isMonthAllowed = (year: number, month: number): boolean => {
    if (isPremiumOrTrial) return true
    if (!oldestAllowedDate) return true
    const monthStart = new Date(year, month, 1)
    return monthStart >= oldestAllowedDate
  }

  // Calculate day age for fade effect
  const getDayAge = (day: number): number => {
    const date = new Date(currentYear, currentMonth, day)
    const diffMs = today.getTime() - date.getTime()
    return Math.floor(diffMs / (24 * 60 * 60 * 1000))
  }

  // Get fade opacity for a specific day
  const getDayFadeOpacity = (day: number): number => {
    if (isPremiumOrTrial) return 1
    return getCalendarFadeOpacity(getDayAge(day))
  }

  // Monthly heat map data
  const monthlyData = useMemo(() => getMonthlyData(sessions), [sessions])

  // Get years with data for year view
  const yearsWithData = useMemo(() => {
    const years = new Set<number>()
    sessions.forEach(s => years.add(new Date(s.startTime).getFullYear()))
    if (years.size === 0) years.add(today.getFullYear())
    return Array.from(years).sort()
  }, [sessions])

  // Session dates for current month
  const sessionDates = useMemo(
    () => getSessionDatesForMonth(sessions, currentYear, currentMonth),
    [sessions, currentYear, currentMonth]
  )

  // Selected date data
  const selectedSessions = useMemo(() => {
    if (!selectedDate) return []
    return getSessionsForDate(sessions, selectedDate)
  }, [sessions, selectedDate])

  const selectedTotal = useMemo(() => {
    if (!selectedDate) return 0
    return getTotalForDate(sessions, selectedDate)
  }, [sessions, selectedDate])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const days: (number | null)[] = []

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }, [currentYear, currentMonth])

  // Navigation
  const goToPrevMonth = () => {
    let newMonth = currentMonth - 1
    let newYear = currentYear

    if (newMonth < 0) {
      newMonth = 11
      newYear = currentYear - 1
    }

    // Check if allowed (90-day limit for FREE tier)
    if (!isMonthAllowed(newYear, newMonth)) {
      return // Don't navigate beyond allowed range
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  // Check if can go to previous month
  const canGoPrev = useMemo(() => {
    let prevMonth = currentMonth - 1
    let prevYear = currentYear
    if (prevMonth < 0) {
      prevMonth = 11
      prevYear = currentYear - 1
    }
    return isMonthAllowed(prevYear, prevMonth)
  }, [currentMonth, currentYear, isMonthAllowed])

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(today)
  }

  // Check if day is today
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  // Check if day is selected
  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    )
  }

  // Swipe handlers
  const monthSwipeHandlers = useSwipe({
    onSwipeLeft: goToNextMonth,
    onSwipeRight: goToPrevMonth
  })

  const navSwipeHandlers = useSwipe({
    onSwipeRight: () => setView('stats'),
    onSwipeDown: () => setView('timer')
  })

  // Get intensity for a month in year view
  const getMonthIntensity = (year: number, month: number): number => {
    const data = monthlyData.find(m => m.year === year && m.month === month)
    return data?.intensity ?? 0
  }

  // Get intensity color - warmer moss-based palette
  const getIntensityStyle = (intensity: number): { bg: string; text: string } => {
    if (intensity === 0) return { bg: 'bg-cream-deep', text: 'text-ink/30' }
    if (intensity < 0.25) return { bg: 'bg-moss/15', text: 'text-ink/50' }
    if (intensity < 0.5) return { bg: 'bg-moss/30', text: 'text-ink/70' }
    if (intensity < 0.75) return { bg: 'bg-moss/50', text: 'text-cream' }
    return { bg: 'bg-moss/70', text: 'text-cream' }
  }

  return (
    <div className="h-full bg-cream overflow-y-auto" {...navSwipeHandlers}>
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setView('stats')}
            className="flex items-center text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Stats
          </button>

          {/* Toggle view type */}
          <button
            onClick={() => setViewType(viewType === 'month' ? 'year' : 'month')}
            className="text-xs text-ink/40 hover:text-ink/60 transition-colors tracking-wide"
          >
            {viewType === 'month' ? 'Year View' : 'Month View'}
          </button>
        </div>

        {viewType === 'year' ? (
          // Year heat map view - garden overview
          <div className="space-y-8">
            {yearsWithData.map(year => (
              <div key={year}>
                <p className="font-serif text-sm text-ink/60 mb-3">{year}</p>
                <div className="grid grid-cols-12 gap-1.5">
                  {MONTHS_SHORT.map((monthLabel, monthIndex) => {
                    const intensity = getMonthIntensity(year, monthIndex)
                    const style = getIntensityStyle(intensity)
                    return (
                      <button
                        key={monthIndex}
                        onClick={() => {
                          setCurrentYear(year)
                          setCurrentMonth(monthIndex)
                          setViewType('month')
                        }}
                        className={`
                          aspect-square rounded-md flex items-center justify-center
                          text-[10px] transition-all active:scale-[0.95]
                          ${style.bg} ${style.text}
                          hover:ring-1 hover:ring-ink/20
                        `}
                      >
                        {monthLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className="text-xs text-ink/30">Less</span>
              <div className="flex gap-1">
                {[0, 0.15, 0.35, 0.6, 0.85].map((intensity, i) => {
                  const style = getIntensityStyle(intensity)
                  return (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${style.bg}`}
                    />
                  )
                })}
              </div>
              <span className="text-xs text-ink/30">More</span>
            </div>
          </div>
        ) : (
          // Month view
          <>
            {/* Month navigation */}
            <div
              className="flex items-center justify-between mb-8"
              {...monthSwipeHandlers}
            >
              <button
                onClick={goToPrevMonth}
                disabled={!canGoPrev}
                className={`p-2 transition-colors active:scale-[0.95] ${canGoPrev ? 'text-ink/40 hover:text-ink/60' : 'text-ink/15 cursor-not-allowed'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToToday}
                className="font-serif text-xl text-ink hover:text-ink/70 transition-colors"
              >
                {formatMonthYear(new Date(currentYear, currentMonth))}
              </button>

              <button
                onClick={goToNextMonth}
                className="p-2 text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.95]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {DAYS.map(day => (
                <div
                  key={day}
                  className="text-center text-xs text-ink/30 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid - garden of days */}
            <div className="grid grid-cols-7 gap-1.5 mb-8">
              {calendarDays.map((day, index) => {
                const fadeOpacity = day ? getDayFadeOpacity(day) : 1
                const dayAge = day ? getDayAge(day) : 0
                const isOldAndBlurred = !isPremiumOrTrial && dayAge > 90
                const hasSession = day ? sessionDates.has(day) : false

                return (
                  <div key={index} className="aspect-square">
                    {day && (
                      <button
                        onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                        className={`
                          w-full h-full flex flex-col items-center justify-center rounded-lg
                          transition-all relative active:scale-[0.95]
                          ${isSelected(day)
                            ? 'bg-ink text-cream shadow-sm'
                            : isToday(day)
                              ? 'ring-1 ring-ink/30 text-ink'
                              : 'text-ink/60 hover:bg-cream-deep'
                          }
                          ${isOldAndBlurred ? 'blur-[1px]' : ''}
                        `}
                        style={{
                          opacity: isSelected(day) ? 1 : fadeOpacity,
                          // Subtle moss warmth for days with sessions
                          backgroundColor: hasSession && !isSelected(day) && !isToday(day)
                            ? 'rgba(135, 168, 120, 0.08)'
                            : undefined
                        }}
                      >
                        <span className="text-sm">{day}</span>
                        {/* Session indicator - organic dot */}
                        {hasSession && !isSelected(day) && (
                          <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-moss/60" />
                        )}
                        {hasSession && isSelected(day) && (
                          <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-cream/80" />
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Selected date detail - no divider, breathing space */}
            {selectedDate && (
              <div className="pt-4">
                <p className="text-sm text-ink/50 mb-2">
                  {formatFullDate(selectedDate)}
                </p>

                {selectedSessions.length > 0 ? (
                  <>
                    <button
                      onClick={() => setExpandedSession(!expandedSession)}
                      className="flex items-center justify-between w-full text-left active:scale-[0.99]"
                    >
                      <p className="font-serif text-xl text-ink">
                        {formatDuration(selectedTotal)}
                      </p>
                      <span className="text-sm text-ink/40">
                        {selectedSessions.length} session{selectedSessions.length > 1 ? 's' : ''}
                        <svg
                          className={`inline w-4 h-4 ml-1 transition-transform ${expandedSession ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>

                    {/* Expanded session list */}
                    {expandedSession && (
                      <div className="mt-4 space-y-2">
                        {selectedSessions.map((session, i) => (
                          <div
                            key={session.id || i}
                            className="flex justify-between text-sm text-ink/50"
                          >
                            <span>{formatTime(new Date(session.startTime))}</span>
                            <span className="tabular-nums">
                              {formatDuration(session.durationSeconds)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cumulative since this date */}
                    <div className="mt-5">
                      <p className="text-xs text-ink/30">
                        Since this date: {formatTotalHours(
                          sessions
                            .filter(s => s.startTime >= selectedDate.getTime())
                            .reduce((sum, s) => sum + s.durationSeconds, 0)
                        )}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink/30 italic">No sessions</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
