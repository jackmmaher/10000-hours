/**
 * TrendChart - Cumulative progress visualization
 *
 * Shows meditation hours accumulated over time as a smooth Bezier curve.
 * The line always trends upward since cumulative time never decreases.
 * Matches the Ghibli aesthetic with organic, flowing lines.
 */

import { useMemo } from 'react'
import { Session } from '../lib/db'

interface TrendChartProps {
  sessions: Session[]
  days: number | null  // null = all time
  height?: number
}

// Generate smooth Bezier curve path from points
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    // Calculate control points for smooth curve
    const tension = 0.3
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return path
}

// Format axis label
function formatAxisLabel(hours: number): string {
  if (hours >= 100) return `${Math.round(hours)}h`
  if (hours >= 10) return `${hours.toFixed(0)}h`
  if (hours >= 1) return `${hours.toFixed(1)}h`
  return `${Math.round(hours * 60)}m`
}

export function TrendChart({ sessions, days, height = 120 }: TrendChartProps) {
  const chartData = useMemo(() => {
    if (sessions.length === 0) return null

    // Filter sessions by time range
    const cutoff = days ? Date.now() - (days * 24 * 60 * 60 * 1000) : 0
    const filteredSessions = sessions
      .filter(s => s.startTime >= cutoff)
      .sort((a, b) => a.startTime - b.startTime)

    if (filteredSessions.length === 0) return null

    // Calculate cumulative hours at each session
    let cumulative = 0

    // Find cumulative hours before the cutoff (for continuity)
    const priorSessions = sessions.filter(s => s.startTime < cutoff)
    cumulative = priorSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600

    const dataPoints = filteredSessions.map(session => {
      cumulative += session.durationSeconds / 3600
      return {
        timestamp: session.startTime,
        hours: cumulative
      }
    })

    // Get time range
    const startTime = filteredSessions[0].startTime
    const endTime = filteredSessions[filteredSessions.length - 1].endTime
    const timeRange = endTime - startTime

    // Get hours range
    const startHours = dataPoints[0].hours - (filteredSessions[0].durationSeconds / 3600)
    const endHours = dataPoints[dataPoints.length - 1].hours
    const hoursRange = endHours - startHours

    return {
      points: dataPoints,
      startTime,
      endTime,
      timeRange,
      startHours,
      endHours,
      hoursRange
    }
  }, [sessions, days])

  if (!chartData || chartData.points.length < 2) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-xs text-ink/30 italic">
          More sessions needed for trend
        </p>
      </div>
    )
  }

  // Chart dimensions
  const width = 300
  const padding = { top: 10, right: 40, bottom: 20, left: 10 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Scale points to chart coordinates
  const scaledPoints = chartData.points.map(p => ({
    x: padding.left + ((p.timestamp - chartData.startTime) / chartData.timeRange) * chartWidth,
    y: padding.top + chartHeight - ((p.hours - chartData.startHours) / chartData.hoursRange) * chartHeight
  }))

  // Add starting point at bottom left for area fill
  const areaPath = generateSmoothPath(scaledPoints)
  const areaPathClosed = `${areaPath} L ${scaledPoints[scaledPoints.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`

  // Y-axis labels (3 marks)
  const yLabels = [
    { value: chartData.startHours, y: padding.top + chartHeight },
    { value: chartData.startHours + chartData.hoursRange / 2, y: padding.top + chartHeight / 2 },
    { value: chartData.endHours, y: padding.top }
  ]

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87A878" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#87A878" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={label.y}
            x2={width - padding.right}
            y2={label.y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-ink/10"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaPathClosed}
          fill="url(#trendGradient)"
        />

        {/* Main trend line */}
        <path
          d={areaPath}
          fill="none"
          stroke="#87A878"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End point dot */}
        <circle
          cx={scaledPoints[scaledPoints.length - 1].x}
          cy={scaledPoints[scaledPoints.length - 1].y}
          r="4"
          fill="#87A878"
        />

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x={width - padding.right + 5}
            y={label.y + 3}
            className="text-[9px] fill-ink/40"
            fontFamily="inherit"
          >
            {formatAxisLabel(label.value)}
          </text>
        ))}

        {/* X-axis labels (start and end dates) */}
        <text
          x={padding.left}
          y={height - 2}
          className="text-[9px] fill-ink/30"
          fontFamily="inherit"
        >
          {new Date(chartData.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
        <text
          x={width - padding.right}
          y={height - 2}
          className="text-[9px] fill-ink/30"
          fontFamily="inherit"
          textAnchor="end"
        >
          {new Date(chartData.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
      </svg>
    </div>
  )
}
