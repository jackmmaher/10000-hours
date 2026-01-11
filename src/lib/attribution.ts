/**
 * Attribution Tracking
 *
 * Tracks how a user's contributions help others:
 * - Template completions by others
 * - Pearl saves by others
 * - Upvotes received
 *
 * Generates oxytocin-triggering notifications:
 * "Your meditation helped 3 people this week"
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { addNotification } from './db'

export interface AttributionStats {
  templateCompletions: number // How many completed your meditations
  pearlSaves: number // How many saved your pearls
  upvotesReceived: number // Karma received
  timeframe: 'today' | 'week' | 'month'
}

/**
 * Get the start date for a timeframe
 */
function getStartDate(timeframe: 'today' | 'week' | 'month'): Date {
  const now = new Date()
  switch (timeframe) {
    case 'today':
      now.setHours(0, 0, 0, 0)
      return now
    case 'week': {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      return weekStart
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    default:
      now.setDate(now.getDate() - 7)
      return now
  }
}

/**
 * Get attribution stats for a user
 */
export async function getAttributionStats(
  userId: string,
  timeframe: 'today' | 'week' | 'month' = 'week'
): Promise<AttributionStats> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      templateCompletions: 0,
      pearlSaves: 0,
      upvotesReceived: 0,
      timeframe,
    }
  }

  const startDate = getStartDate(timeframe)

  try {
    // Get user's template IDs
    const { data: userTemplates } = await supabase
      .from('session_templates')
      .select('id')
      .eq('user_id', userId)

    const userTemplateIds = userTemplates?.map((t) => t.id) || []

    // Get user's pearl IDs
    const { data: userPearls } = await supabase.from('pearls').select('id').eq('user_id', userId)

    const userPearlIds = userPearls?.map((p) => p.id) || []

    // Query completions of user's templates by others
    let templateCompletions = 0
    if (userTemplateIds.length > 0) {
      const { count } = await supabase
        .from('session_template_completions')
        .select('*', { count: 'exact', head: true })
        .in('template_id', userTemplateIds)
        .gte('created_at', startDate.toISOString())
        .neq('user_id', userId)

      templateCompletions = count || 0
    }

    // Query pearl saves by others
    let pearlSaves = 0
    if (userPearlIds.length > 0) {
      const { count } = await supabase
        .from('pearl_saves')
        .select('*', { count: 'exact', head: true })
        .in('pearl_id', userPearlIds)
        .gte('created_at', startDate.toISOString())
        .neq('user_id', userId)

      pearlSaves = count || 0
    }

    // Query upvotes on user's templates by others
    let upvotesReceived = 0
    if (userTemplateIds.length > 0) {
      const { count } = await supabase
        .from('session_template_votes')
        .select('*', { count: 'exact', head: true })
        .in('template_id', userTemplateIds)
        .gte('created_at', startDate.toISOString())
        .neq('user_id', userId)

      upvotesReceived = count || 0
    }

    return {
      templateCompletions,
      pearlSaves,
      upvotesReceived,
      timeframe,
    }
  } catch (err) {
    console.error('Error fetching attribution stats:', err)
    return {
      templateCompletions: 0,
      pearlSaves: 0,
      upvotesReceived: 0,
      timeframe,
    }
  }
}

/**
 * Generate attribution notification if there's positive impact
 * Language is warm and personal - "You helped someone", not "3 users engaged"
 */
export async function generateAttributionNotification(userId: string): Promise<boolean> {
  const stats = await getAttributionStats(userId, 'week')

  // Only generate if there's positive impact
  const totalImpact = stats.templateCompletions + stats.pearlSaves

  if (totalImpact === 0) return false

  // Build notification message with warm language
  let title = ''
  let body = ''

  if (stats.templateCompletions > 0 && stats.pearlSaves > 0) {
    title = 'Your wisdom is spreading'
    body = `${stats.templateCompletions} ${stats.templateCompletions === 1 ? 'person' : 'people'} practiced your meditations and ${stats.pearlSaves} saved your pearls this week.`
  } else if (stats.templateCompletions > 0) {
    title = 'You helped someone meditate'
    body =
      stats.templateCompletions === 1
        ? 'Someone practiced your meditation this week.'
        : `${stats.templateCompletions} people practiced your meditations this week.`
  } else {
    title = 'Your pearl resonated'
    body =
      stats.pearlSaves === 1
        ? 'Someone saved your pearl this week.'
        : `${stats.pearlSaves} people saved your pearls this week.`
  }

  await addNotification({
    id: `attribution-${Date.now()}`,
    type: 'attribution',
    title,
    body,
    createdAt: Date.now(),
    metadata: {
      helpedCount: totalImpact,
      timeframe: 'this week',
    },
  })

  return true
}

/**
 * Check if we should run attribution check (once per week max)
 */
export function shouldCheckAttribution(): boolean {
  const lastCheck = localStorage.getItem('lastAttributionCheck')
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  return !lastCheck || parseInt(lastCheck) < weekAgo
}

/**
 * Mark attribution check as done
 */
export function markAttributionChecked(): void {
  localStorage.setItem('lastAttributionCheck', Date.now().toString())
}
