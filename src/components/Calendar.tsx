import { useMemo, useState } from 'react'
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

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

type CalendarView = 'month' | 'year'

export function Calendar() {
  const { sessions, setView } = useSessionStore()

  const today = new Date()
  const [viewType, setViewType] = useState<CalendarView>('month')
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [expandedSession, setExpandedSession] = useState(false)

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
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
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

  // Get intensity color class
  const getIntensityClass = (intensity: number): string => {
    if (intensity === 0) return 'bg-indigo-deep/5'
    if (intensity < 0.25) return 'bg-indigo-deep/15'
    if (intensity < 0.5) return 'bg-indigo-deep/30'
    if (intensity < 0.75) return 'bg-indigo-deep/50'
    return 'bg-indigo-deep/70'
  }

  return (
    <div className="h-full bg-cream overflow-y-auto" {...navSwipeHandlers}>
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView('stats')}
            className="flex items-center text-sm text-indigo-deep/50 hover:text-indigo-deep/70 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            stats
          </button>

          {/* Toggle view type */}
          <button
            onClick={() => setViewType(viewType === 'month' ? 'year' : 'month')}
            className="text-xs text-indigo-deep/50 hover:text-indigo-deep/70 transition-colors uppercase tracking-wider"
          >
            {viewType === 'month' ? 'Year view' : 'Month view'}
          </button>
        </div>

        {viewType === 'year' ? (
          // Year heat map view
          <div className="space-y-6">
            {yearsWithData.map(year => (
              <div key={year}>
                <p className="text-sm text-indigo-deep/70 mb-2">{year}</p>
                <div className="grid grid-cols-12 gap-1">
                  {MONTHS_SHORT.map((monthLabel, monthIndex) => {
                    const intensity = getMonthIntensity(year, monthIndex)
                    return (
                      <button
                        key={monthIndex}
                        onClick={() => {
                          setCurrentYear(year)
                          setCurrentMonth(monthIndex)
                          setViewType('month')
                        }}
                        className={`
                          aspect-square rounded-sm flex items-center justify-center
                          text-[10px] transition-colors
                          ${getIntensityClass(intensity)}
                          ${intensity > 0.5 ? 'text-cream' : 'text-indigo-deep/40'}
                          hover:ring-1 hover:ring-indigo-deep/30
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
            <div className="flex items-center justify-center gap-2 pt-4">
              <span className="text-xs text-indigo-deep/40">Less</span>
              <div className="flex gap-1">
                {[0, 0.15, 0.35, 0.6, 0.85].map((intensity, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${getIntensityClass(intensity)}`}
                  />
                ))}
              </div>
              <span className="text-xs text-indigo-deep/40">More</span>
            </div>
          </div>
        ) : (
          // Month view
          <>
            {/* Month navigation */}
            <div
              className="flex items-center justify-between mb-6"
              {...monthSwipeHandlers}
            >
              <button
                onClick={goToPrevMonth}
                className="p-2 text-indigo-deep/50 hover:text-indigo-deep/70 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToToday}
                className="font-serif text-xl text-indigo-deep hover:text-indigo-deep/70 transition-colors"
              >
                {formatMonthYear(new Date(currentYear, currentMonth))}
              </button>

              <button
                onClick={goToNextMonth}
                className="p-2 text-indigo-deep/50 hover:text-indigo-deep/70 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div
                  key={day}
                  className="text-center text-xs text-indigo-deep/40 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                      className={`
                        w-full h-full flex flex-col items-center justify-center rounded-sm
                        transition-colors relative
                        ${isSelected(day)
                          ? 'bg-indigo-deep text-cream'
                          : isToday(day)
                            ? 'bg-indigo-deep/10 text-indigo-deep'
                            : 'text-indigo-deep/70 hover:bg-indigo-deep/5'
                        }
                      `}
                    >
                      <span className="text-sm">{day}</span>
                      {/* Session indicator dot */}
                      {sessionDates.has(day) && (
                        <span
                          className={`
                            absolute bottom-1 w-1 h-1 rounded-full
                            ${isSelected(day) ? 'bg-cream' : 'bg-indigo-deep/50'}
                          `}
                        />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Selected date detail */}
            {selectedDate && (
              <div className="border-t border-indigo-deep/10 pt-6">
                <p className="text-sm text-indigo-deep/70 mb-2">
                  {formatFullDate(selectedDate)}
                </p>

                {selectedSessions.length > 0 ? (
                  <>
                    <button
                      onClick={() => setExpandedSession(!expandedSession)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <p className="font-serif text-xl text-indigo-deep">
                        {formatDuration(selectedTotal)}
                      </p>
                      <span className="text-sm text-indigo-deep/50">
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
                            className="flex justify-between text-sm text-indigo-deep/60"
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
                    <div className="mt-4 pt-4 border-t border-indigo-deep/5">
                      <p className="text-xs text-indigo-deep/40">
                        Since this date: {formatTotalHours(
                          sessions
                            .filter(s => s.startTime >= selectedDate.getTime())
                            .reduce((sum, s) => sum + s.durationSeconds, 0)
                        )} hrs
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-indigo-deep/40">No sessions</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
