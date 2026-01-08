import { useMemo, useState, useEffect } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useSwipe } from '../hooks/useSwipe'
import {
  getMonthlyData,
  getSessionDatesForMonth,
  getSessionsForDate,
  getTotalForDate
} from '../lib/calculations'
import {
  formatMonthYear,
  formatFullDate,
  formatDuration,
  formatTime,
  formatTotalHours
} from '../lib/format'
import { getPlannedSessionsForMonth, PlannedSession } from '../lib/db'

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] // Monday-first to match WeekStones
const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

type CalendarView = 'month' | 'year'

interface CalendarProps {
  /** When true, hides the standalone header (for embedding in Journey) */
  embedded?: boolean
  /** Called when a date is clicked - receives the Date object */
  onDateClick?: (date: Date) => void
  /** Key to force refresh when plans change */
  refreshKey?: number
}

export function Calendar({ embedded = false, onDateClick, refreshKey }: CalendarProps) {
  const { sessions, setView } = useSessionStore()

  const today = new Date()
  const [viewType, setViewType] = useState<CalendarView>('month')
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [expandedSession, setExpandedSession] = useState(false)
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([])

  // Load planned sessions for current month
  useEffect(() => {
    const loadPlans = async () => {
      const plans = await getPlannedSessionsForMonth(currentYear, currentMonth)
      setPlannedSessions(plans)
    }
    loadPlans()
  }, [currentYear, currentMonth, refreshKey])

  // Get planned dates for current month
  const plannedDates = useMemo(() => {
    const dates = new Set<number>()
    plannedSessions.forEach(p => {
      const planDate = new Date(p.date)
      if (planDate.getMonth() === currentMonth && planDate.getFullYear() === currentYear) {
        dates.add(planDate.getDate())
      }
    })
    return dates
  }, [plannedSessions, currentMonth, currentYear])

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

  // Calendar grid (Monday-first)
  const calendarDays = useMemo(() => {
    // getDay() returns 0=Sunday, 1=Monday, etc.
    // Convert to Monday-first: Monday=0, Tuesday=1, ..., Sunday=6
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const firstDay = (firstDayOfMonth + 6) % 7 // Sunday(0)→6, Monday(1)→0, etc.
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
    <div className={embedded ? '' : 'h-full bg-cream overflow-y-auto'} {...(embedded ? {} : navSwipeHandlers)}>
      <div className={embedded ? '' : 'px-6 py-8 max-w-lg mx-auto'}>
        {/* Header - only show when standalone */}
        {!embedded && (
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
        )}

        {/* View type toggle for embedded mode */}
        {embedded && (
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif text-sm text-ink/50 tracking-wide">
              Calendar
            </p>
            <button
              onClick={() => setViewType(viewType === 'month' ? 'year' : 'month')}
              className="text-xs text-moss hover:text-moss/80 transition-colors"
            >
              {viewType === 'month' ? 'Year →' : '← Month'}
            </button>
          </div>
        )}

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
                className="p-2 text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.95]"
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

            {/* Calendar grid - typographic field of days */}
            <div className="grid grid-cols-7 gap-1.5 mb-8">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />
                }

                const hasSession = sessionDates.has(day)
                const hasPlan = plannedDates.has(day)
                const dayDate = new Date(currentYear, currentMonth, day)
                const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                const isFuture = dayDate > new Date(today.getFullYear(), today.getMonth(), today.getDate())
                const isTodayDate = isToday(day)
                const isSelectedDate = isSelected(day)

                const handleDayClick = () => {
                  const clickedDate = new Date(currentYear, currentMonth, day)
                  clickedDate.setHours(0, 0, 0, 0)

                  if (embedded && onDateClick) {
                    onDateClick(clickedDate)
                  } else {
                    setSelectedDate(clickedDate)
                    if (onDateClick) {
                      onDateClick(clickedDate)
                    }
                  }
                }

                // Typographic visual language - the number IS the interface
                // Selected state overrides all
                if (isSelectedDate) {
                  return (
                    <div key={index} className="aspect-square">
                      <button
                        onClick={handleDayClick}
                        className="w-full h-full flex items-center justify-center rounded-lg bg-ink transition-all active:scale-[0.95]"
                      >
                        <span className="text-sm font-medium text-cream">{day}</span>
                      </button>
                    </div>
                  )
                }

                // Today - the threshold moment
                if (isTodayDate) {
                  return (
                    <div key={index} className="aspect-square">
                      <button
                        onClick={handleDayClick}
                        className={`
                          w-full h-full flex items-center justify-center rounded-lg transition-all active:scale-[0.95]
                          ${hasSession || hasPlan
                            ? 'bg-[#F5EDE4]' // Warm touched paper - path continues
                            : 'bg-[#FAF6F1]' // Softer warm - open invitation
                          }
                        `}
                      >
                        <span className="text-sm font-medium text-ink">{day}</span>
                      </button>
                    </div>
                  )
                }

                // Past with session - settled, present, weight
                if (isPast && hasSession) {
                  return (
                    <div key={index} className="aspect-square">
                      <button
                        onClick={handleDayClick}
                        className="w-full h-full flex items-center justify-center rounded-lg bg-[#F7F2EC] hover:bg-[#F2EBE3] transition-all active:scale-[0.95]"
                      >
                        <span className="text-sm font-medium text-ink/90">{day}</span>
                      </button>
                    </div>
                  )
                }

                // Past without session - receded, light, unburdened
                if (isPast && !hasSession) {
                  return (
                    <div key={index} className="aspect-square">
                      <button
                        onClick={handleDayClick}
                        className="w-full h-full flex items-center justify-center rounded-lg hover:bg-cream-deep/50 transition-all active:scale-[0.95]"
                      >
                        <span className="text-sm text-ink/25">{day}</span>
                      </button>
                    </div>
                  )
                }

                // Future with plan - warm anticipation, treasure ahead
                if (isFuture && hasPlan) {
                  return (
                    <div key={index} className="aspect-square">
                      <button
                        onClick={handleDayClick}
                        className="w-full h-full flex items-center justify-center rounded-lg hover:bg-[#FDF8F3] transition-all active:scale-[0.95]"
                      >
                        <span className="text-sm font-medium text-[#B8956C]">{day}</span>
                      </button>
                    </div>
                  )
                }

                // Future without plan - possibility, air, lightness
                return (
                  <div key={index} className="aspect-square">
                    <button
                      onClick={handleDayClick}
                      className="w-full h-full flex items-center justify-center rounded-lg hover:bg-cream-deep/50 transition-all active:scale-[0.95]"
                    >
                      <span className="text-sm text-ink/40">{day}</span>
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Selected date detail - skip when embedded with onDateClick (MeditationPlanner shows this) */}
            {selectedDate && !(embedded && onDateClick) && (
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
