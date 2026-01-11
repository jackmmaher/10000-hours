/**
 * Templates Service - Community guided meditation templates API
 *
 * Handles CRUD operations for session templates through Supabase.
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { SessionTemplate } from './types'

// Template input type (without computed fields)
export interface TemplateInput {
  title: string
  tagline: string
  durationGuidance: string
  discipline: string
  posture: string
  bestTime: string
  environment?: string
  guidanceNotes: string
  intention: string
  recommendedAfterHours?: number
  intentTags?: string[]
}

// Timeout wrapper for Supabase calls
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ])
}

/**
 * Create a new session template
 * Automatically adds creator's vote and save (starts with karma=1, saves=1)
 */
export async function createTemplate(
  template: TemplateInput,
  userId: string,
  creatorHours: number
): Promise<SessionTemplate | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('Supabase not configured - cannot publish template')
    throw new Error('Supabase not configured. Please check your connection settings.')
  }

  console.log('Creating template:', { title: template.title, userId })

  try {
    const supabasePromise = new Promise<{
      data: Record<string, unknown> | null
      error: { message: string } | null
    }>((resolve) => {
      supabase!
        .from('session_templates')
        .insert({
          user_id: userId,
          title: template.title,
          tagline: template.tagline,
          duration_guidance: template.durationGuidance,
          discipline: template.discipline,
          posture: template.posture,
          best_time: template.bestTime,
          environment: template.environment || null,
          guidance_notes: template.guidanceNotes,
          intention: template.intention,
          recommended_after_hours: template.recommendedAfterHours || 0,
          tags: [], // Deprecated - using intent_tags only
          intent_tags: template.intentTags || [],
          creator_hours: creatorHours,
        })
        .select()
        .single()
        .then(resolve)
    })

    const { data, error } = await withTimeout(supabasePromise, 15000)

    if (error) {
      console.error('Create template error:', error)
      throw new Error(error.message || 'Failed to create template')
    }

    if (!data) {
      throw new Error('No data returned from server')
    }

    console.log('Template created successfully:', data.id)

    // Auto-add creator's vote and save (triggers will update counts)
    // These are fire-and-forget - don't fail creation if they fail
    await Promise.all([
      supabase
        .from('session_template_votes')
        .insert({ template_id: data.id, user_id: userId })
        .then(() => {}),
      supabase
        .from('session_template_saves')
        .insert({ template_id: data.id, user_id: userId })
        .then(() => {}),
    ]).catch((err) => console.warn('Auto-vote/save failed (non-critical):', err))

    const result = mapTemplateFromDb(data)
    // Override with correct initial values since triggers will have run
    return {
      ...result,
      karma: 1, // Creator's vote
      saves: 1, // Creator's save
    }
  } catch (err) {
    console.error('Create template failed:', err)
    throw err
  }
}

/**
 * Get published templates from the community
 */
export async function getPublishedTemplates(limit = 50, offset = 0): Promise<SessionTemplate[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('session_templates')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Get templates error:', error)
    return []
  }

  return (data || []).map(mapTemplateFromDb)
}

/**
 * Get templates created by a specific user
 */
export async function getMyTemplates(userId: string): Promise<SessionTemplate[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('session_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get my templates error:', error)
    return []
  }

  return (data || []).map(mapTemplateFromDb)
}

/**
 * Update a template (user can only update their own)
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<TemplateInput>,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const dbUpdates: Record<string, unknown> = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline
  if (updates.durationGuidance !== undefined) dbUpdates.duration_guidance = updates.durationGuidance
  if (updates.discipline !== undefined) dbUpdates.discipline = updates.discipline
  if (updates.posture !== undefined) dbUpdates.posture = updates.posture
  if (updates.bestTime !== undefined) dbUpdates.best_time = updates.bestTime
  if (updates.environment !== undefined) dbUpdates.environment = updates.environment
  if (updates.guidanceNotes !== undefined) dbUpdates.guidance_notes = updates.guidanceNotes
  if (updates.intention !== undefined) dbUpdates.intention = updates.intention
  if (updates.recommendedAfterHours !== undefined)
    dbUpdates.recommended_after_hours = updates.recommendedAfterHours
  if (updates.intentTags !== undefined) dbUpdates.intent_tags = updates.intentTags

  const { error } = await supabase
    .from('session_templates')
    .update(dbUpdates)
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) {
    console.error('Update template error:', error)
    return false
  }

  return true
}

/**
 * Delete a template (user can only delete their own)
 */
export async function deleteTemplate(templateId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('session_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) {
    console.error('Delete template error:', error)
    return false
  }

  return true
}

/**
 * Map database row to SessionTemplate interface
 */
function mapTemplateFromDb(row: Record<string, unknown>): SessionTemplate {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    title: row.title as string,
    tagline: row.tagline as string,
    durationGuidance: row.duration_guidance as string,
    discipline: row.discipline as string,
    posture: row.posture as string,
    bestTime: row.best_time as string,
    environment: row.environment as string | undefined,
    guidanceNotes: row.guidance_notes as string,
    intention: row.intention as string,
    recommendedAfterHours: (row.recommended_after_hours as number) || 0,
    intentTags: (row.intent_tags as string[]) || [],
    karma: (row.karma as number) || 0,
    saves: (row.saves as number) || 0,
    completions: (row.completions as number) || 0,
    creatorHours: (row.creator_hours as number) || 0,
    creatorVoiceScore: (row.creator_voice_score as number) || 0,
    courseId: row.course_id as string | undefined,
    coursePosition: row.course_position as number | undefined,
  }
}

/**
 * Check if a string is a valid UUID
 * Note: All templates now use UUIDs (both seeded and user-created)
 */
export function isUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Record a template completion
 * All templates now use UUIDs and are tracked in Supabase
 */
export async function recordTemplateCompletion(
  templateId: string,
  userId: string,
  sessionUuid?: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase.from('session_template_completions').insert({
    template_id: templateId,
    user_id: userId,
    session_uuid: sessionUuid || null,
  })

  if (error) {
    // Duplicate completion is allowed (users can complete same template multiple times)
    // but if it's a unique constraint error, that's fine
    if (error.code === '23505') {
      return true
    }
    console.error('Record completion error:', error)
    return false
  }

  return true
}

/**
 * Get live stats for a template from Supabase
 * All templates now use UUIDs and are tracked in Supabase
 */
export async function getTemplateStats(
  templateId: string
): Promise<{ karma: number; saves: number; completions: number } | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('session_templates')
    .select('karma, saves, completions')
    .eq('id', templateId)
    .single()

  if (error || !data) {
    console.error('Get template stats error:', error)
    return null
  }

  return {
    karma: data.karma || 0,
    saves: data.saves || 0,
    completions: data.completions || 0,
  }
}

/**
 * Vote for a template (upvote)
 * Triggers automatically increment karma on the template
 */
export async function voteTemplate(templateId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase.from('session_template_votes').insert({
    template_id: templateId,
    user_id: userId,
  })

  if (error) {
    // Already voted (duplicate key) is not an error for the user
    if (error.code === '23505') {
      return true
    }
    console.error('Vote template error:', error)
    return false
  }

  return true
}

/**
 * Remove vote from a template (unvote)
 * Triggers automatically decrement karma on the template
 */
export async function unvoteTemplate(templateId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('session_template_votes')
    .delete()
    .eq('template_id', templateId)
    .eq('user_id', userId)

  if (error) {
    console.error('Unvote template error:', error)
    return false
  }

  return true
}

/**
 * Save a template to user's collection
 * Triggers automatically increment saves on the template
 */
export async function saveTemplate(templateId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase.from('session_template_saves').insert({
    template_id: templateId,
    user_id: userId,
  })

  if (error) {
    // Already saved (duplicate key) is not an error for the user
    if (error.code === '23505') {
      return true
    }
    console.error('Save template error:', error)
    return false
  }

  return true
}

/**
 * Remove template from user's saved collection
 * Triggers automatically decrement saves on the template
 */
export async function unsaveTemplate(templateId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('session_template_saves')
    .delete()
    .eq('template_id', templateId)
    .eq('user_id', userId)

  if (error) {
    console.error('Unsave template error:', error)
    return false
  }

  return true
}

/**
 * Check if user has voted for a template
 */
export async function hasUserVoted(templateId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { data, error } = await supabase
    .from('session_template_votes')
    .select('template_id')
    .eq('template_id', templateId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Check vote error:', error)
    return false
  }

  return data !== null
}

/**
 * Check if user has saved a template
 */
export async function hasUserSaved(templateId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { data, error } = await supabase
    .from('session_template_saves')
    .select('template_id')
    .eq('template_id', templateId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Check save error:', error)
    return false
  }

  return data !== null
}

/**
 * Report a template for content issues
 * Returns the template creator's user ID for notification purposes
 */
export async function reportTemplate(
  templateId: string,
  reporterId: string,
  reason: string
): Promise<{ success: boolean; creatorId?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false }
  }

  try {
    // First get the template to find the creator
    const { data: template, error: templateError } = await supabase
      .from('session_templates')
      .select('user_id')
      .eq('id', templateId)
      .single()

    if (templateError) {
      console.error('Get template for report error:', templateError)
      return { success: false }
    }

    // Create the report
    const { error: reportError } = await supabase.from('template_reports').insert({
      template_id: templateId,
      reporter_id: reporterId,
      reason: reason,
    })

    if (reportError) {
      // Check for duplicate report
      if (reportError.code === '23505') {
        console.log('User has already reported this template')
        return { success: true, creatorId: template?.user_id }
      }
      console.error('Create report error:', reportError)
      return { success: false }
    }

    return {
      success: true,
      creatorId: template?.user_id,
    }
  } catch (err) {
    console.error('Report template failed:', err)
    return { success: false }
  }
}

/**
 * Get templates with user's vote/save status using RPC
 * More efficient than separate queries
 */
export async function getTemplatesForUser(
  userId: string,
  filter: 'top' | 'new' | 'rising' | 'most_saved' = 'new',
  limit = 50,
  offset = 0
): Promise<(SessionTemplate & { hasVoted: boolean; hasSaved: boolean; hasCompleted: boolean })[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  const { data, error } = await supabase.rpc('get_session_templates_for_user', {
    p_user_id: userId,
    p_filter: filter,
    p_discipline: null,
    p_difficulty: null,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    console.error('Get templates for user error:', error)
    return []
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    ...mapTemplateFromDb(row),
    hasVoted: row.has_voted as boolean,
    hasSaved: row.has_saved as boolean,
    hasCompleted: row.has_completed as boolean,
  }))
}
