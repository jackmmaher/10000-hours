/**
 * Suggested Actions
 *
 * Generate conditional, actionable suggestions based on practice gaps.
 */

import type { Session, PlannedSession, SavedTemplate, UserCourseProgress, Insight } from '../db'
import type { SuggestedAction } from './types'

/**
 * Generate conditional, actionable suggestions based on practice gaps
 */
export function getSuggestedActions(
  sessions: Session[],
  plannedSessions: PlannedSession[],
  savedTemplates: SavedTemplate[],
  courseProgress: UserCourseProgress[],
  insights: Insight[]
): SuggestedAction[] {
  const suggestions: SuggestedAction[] = []

  // 1. Unfinished courses
  const activeCourses = courseProgress.filter((c) => c.status === 'active')
  for (const course of activeCourses) {
    const remaining = getCourseTotalSessions(course.courseId) - course.sessionsCompleted.length
    if (remaining > 0) {
      suggestions.push({
        id: `course-${course.courseId}`,
        type: 'course',
        message: `${remaining} session${remaining > 1 ? 's' : ''} remain in your course`,
        detail: `${course.sessionsCompleted.length} of ${getCourseTotalSessions(course.courseId)} complete`,
        actionLabel: 'Continue',
        actionView: 'journey',
        priority: 1,
      })
    }
  }

  // 2. Saved but unused templates
  const usedTemplateIds = new Set(
    plannedSessions.filter((p) => p.sourceTemplateId).map((p) => p.sourceTemplateId)
  )
  const unusedTemplates = savedTemplates.filter((t) => !usedTemplateIds.has(t.templateId))
  if (unusedTemplates.length > 0) {
    suggestions.push({
      id: 'unused-templates',
      type: 'template',
      message: `${unusedTemplates.length} saved meditation${unusedTemplates.length > 1 ? 's' : ''} you haven't tried`,
      actionLabel: 'View saved',
      actionView: 'journey',
      priority: 2,
    })
  }

  // 3. Discipline imbalance
  const disciplineCounts: Record<string, number> = {}
  let totalWithDiscipline = 0
  for (const session of sessions) {
    if (session.discipline) {
      disciplineCounts[session.discipline] = (disciplineCounts[session.discipline] || 0) + 1
      totalWithDiscipline++
    }
  }

  if (totalWithDiscipline >= 10) {
    const sorted = Object.entries(disciplineCounts).sort((a, b) => b[1] - a[1])
    if (sorted.length >= 2) {
      const [topName, topCount] = sorted[0]
      const [bottomName, bottomCount] = sorted[sorted.length - 1]
      const topPct = Math.round((topCount / totalWithDiscipline) * 100)

      if (topPct > 40 && bottomCount < 5) {
        suggestions.push({
          id: 'discipline-imbalance',
          type: 'discipline',
          message: `${bottomName}: ${bottomCount} sessions`,
          detail: `${topName}: ${topCount} sessions (${topPct}%)`,
          actionLabel: 'Explore styles',
          actionView: 'explore',
          priority: 3,
        })
      }
    }
  }

  // 4. Weak day of week
  if (sessions.length >= 14) {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]
    const dayNames = [
      'Sundays',
      'Mondays',
      'Tuesdays',
      'Wednesdays',
      'Thursdays',
      'Fridays',
      'Saturdays',
    ]

    for (const session of sessions) {
      dayCounts[new Date(session.startTime).getDay()]++
    }

    const avgPerDay = sessions.length / 7
    let weakestDay = -1
    let weakestCount = Infinity

    for (let i = 0; i < 7; i++) {
      if (dayCounts[i] < weakestCount) {
        weakestCount = dayCounts[i]
        weakestDay = i
      }
    }

    // Only suggest if significantly below average (less than 50%)
    if (weakestCount < avgPerDay * 0.5 && weakestCount < sessions.length * 0.1) {
      suggestions.push({
        id: 'weak-day',
        type: 'day',
        message: `${dayNames[weakestDay]} are your quietest`,
        detail: `${weakestCount} sessions vs ${Math.round(avgPerDay)} avg`,
        priority: 4,
      })
    }
  }

  // 5. Insights not shared as pearls
  const unsharedInsights = insights.filter(
    (i) => i.rawText && i.rawText.trim().length > 20 && !i.sharedPearlId
  )
  if (unsharedInsights.length >= 3) {
    suggestions.push({
      id: 'unshared-insights',
      type: 'insight',
      message: `${unsharedInsights.length} insights could become pearls`,
      detail: 'Share wisdom with the community',
      actionLabel: 'View insights',
      actionView: 'journey',
      priority: 5,
    })
  }

  // 6. Pose variety (if they only use one pose)
  const poseCounts: Record<string, number> = {}
  let totalWithPose = 0
  for (const session of sessions) {
    if (session.pose) {
      poseCounts[session.pose] = (poseCounts[session.pose] || 0) + 1
      totalWithPose++
    }
  }

  if (totalWithPose >= 10) {
    const poses = Object.keys(poseCounts)
    if (poses.length === 1) {
      suggestions.push({
        id: 'pose-variety',
        type: 'pose',
        message: `Always ${poses[0]}?`,
        detail: 'Different poses can unlock different experiences',
        priority: 6,
      })
    }
  }

  // Add fallback suggestions if we don't have enough
  if (suggestions.length < 2 && sessions.length >= 3) {
    // Encourage exploring community content
    if (savedTemplates.length === 0) {
      suggestions.push({
        id: 'explore-templates',
        type: 'template',
        message: 'Discover guided meditations',
        detail: 'Community-created sessions to try',
        actionLabel: 'Explore',
        actionView: 'explore',
        priority: 7,
      })
    }

    // Encourage recording insights
    if (insights.length < 3 && sessions.length >= 5) {
      suggestions.push({
        id: 'record-insights',
        type: 'insight',
        message: 'Capture post-session insights',
        detail: 'Voice notes after meditation preserve realizations',
        actionLabel: 'Learn more',
        actionView: 'journey',
        priority: 8,
      })
    }

    // Celebrate consistency if they have regular practice
    const uniqueDays = new Set(sessions.map((s) => new Date(s.startTime).toDateString())).size
    if (uniqueDays >= 5 && suggestions.length < 2) {
      suggestions.push({
        id: 'consistency-note',
        type: 'day',
        message: `${uniqueDays} days of practice`,
        detail: 'Building a sustainable rhythm',
        priority: 9,
      })
    }
  }

  // Sort by priority and limit to top 4
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

// Helper to get course total sessions (would need course data)
// For now, default to 5 if unknown
function getCourseTotalSessions(_courseId: string): number {
  // TODO: Look up from course data
  return 5
}
