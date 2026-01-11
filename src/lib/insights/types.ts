/**
 * Progress Insights - Type Definitions
 */

export interface PatternStrength {
  label: string
  value: string
  strength: number // 0-5 dots
  percentage: number
  detail?: string
}

export interface PracticeShape {
  timeOfDay: PatternStrength | null
  discipline: PatternStrength | null
  pose: PatternStrength | null
  dayOfWeek: PatternStrength | null
}

export interface CommitmentStats {
  plannedHours: number
  actualHours: number
  overUnderPercent: number // positive = over-delivered
  completionRate: number // 0-100
  plansCreated: number
  plansCompleted: number
  trend: 'improving' | 'stable' | 'declining' | 'new'
}

export interface MonthlyAverage {
  label: string // "Oct", "Nov", etc.
  avgMinutes: number
  sessionCount: number
}

export interface GrowthTrajectory {
  months: MonthlyAverage[]
  trend: 'deepening' | 'stable' | 'shortening' | 'new'
  oldestAvg: number
  newestAvg: number
  changePercent: number
}

export interface SuggestedAction {
  id: string
  type: 'course' | 'template' | 'discipline' | 'day' | 'insight' | 'pose'
  message: string
  detail?: string
  actionLabel?: string
  actionView?: 'journey' | 'explore' | 'timer'
  priority: number // lower = more important
}

export interface DisciplineBreakdown {
  name: string
  count: number
  percentage: number
  totalMinutes: number
}

export interface WeekComparison {
  thisWeek: { sessions: number; minutes: number }
  lastWeek: { sessions: number; minutes: number }
  trend: 'up' | 'down' | 'same'
  changePercent: number
}
