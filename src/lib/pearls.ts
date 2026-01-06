/**
 * Pearls Service - Community wisdom sharing API
 *
 * Handles CRUD operations for pearls (shared insights),
 * voting, and saving through Supabase.
 */

import { supabase, isSupabaseConfigured } from './supabase'

export interface Pearl {
  id: string
  userId: string
  text: string
  upvotes: number
  saves: number
  createdAt: string
  hasVoted?: boolean
  hasSaved?: boolean
}

export type PearlFilter = 'new' | 'rising' | 'top'

/**
 * Create a new pearl from an insight
 */
export async function createPearl(text: string, userId: string): Promise<Pearl | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured')
    return null
  }

  // Validate text length (max 280 chars like a tweet)
  if (text.length > 280) {
    throw new Error('Pearl must be 280 characters or less')
  }

  const { data, error } = await supabase
    .from('pearls')
    .insert({
      user_id: userId,
      text: text.trim()
    })
    .select()
    .single()

  if (error) {
    console.error('Create pearl error:', error)
    throw new Error('Failed to share pearl')
  }

  return {
    id: data.id,
    userId: data.user_id,
    text: data.text,
    upvotes: data.upvotes,
    saves: data.saves,
    createdAt: data.created_at,
    hasVoted: false,
    hasSaved: false
  }
}

/**
 * Get pearls feed with optional user vote/save status
 */
export async function getPearls(
  filter: PearlFilter = 'new',
  userId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<Pearl[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured')
    return []
  }

  // Use the helper function if user is authenticated
  if (userId) {
    const { data, error } = await supabase
      .rpc('get_pearls_for_user', {
        p_user_id: userId,
        p_filter: filter,
        p_limit: limit,
        p_offset: offset
      })

    if (error) {
      console.error('Get pearls error:', error)
      return []
    }

    return (data || []).map((p: {
      id: string
      user_id: string
      text: string
      upvotes: number
      saves: number
      created_at: string
      has_voted: boolean
      has_saved: boolean
    }) => ({
      id: p.id,
      userId: p.user_id,
      text: p.text,
      upvotes: p.upvotes,
      saves: p.saves,
      createdAt: p.created_at,
      hasVoted: p.has_voted,
      hasSaved: p.has_saved
    }))
  }

  // Anonymous user - just get pearls without vote/save status
  let query = supabase
    .from('pearls')
    .select('*')

  // Apply ordering based on filter
  if (filter === 'top') {
    query = query.order('upvotes', { ascending: false })
  } else if (filter === 'rising') {
    // Rising = recent + some engagement
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Get pearls error:', error)
    return []
  }

  return (data || []).map(p => ({
    id: p.id,
    userId: p.user_id,
    text: p.text,
    upvotes: p.upvotes,
    saves: p.saves,
    createdAt: p.created_at,
    hasVoted: false,
    hasSaved: false
  }))
}

/**
 * Vote for a pearl (upvote)
 */
export async function votePearl(pearlId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('pearl_votes')
    .insert({
      pearl_id: pearlId,
      user_id: userId
    })

  if (error) {
    // Might already be voted
    if (error.code === '23505') {
      return true // Already voted, that's fine
    }
    console.error('Vote error:', error)
    return false
  }

  return true
}

/**
 * Remove vote from a pearl
 */
export async function unvotePearl(pearlId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('pearl_votes')
    .delete()
    .eq('pearl_id', pearlId)
    .eq('user_id', userId)

  if (error) {
    console.error('Unvote error:', error)
    return false
  }

  return true
}

/**
 * Save a pearl to user's collection
 */
export async function savePearl(pearlId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('pearl_saves')
    .insert({
      pearl_id: pearlId,
      user_id: userId
    })

  if (error) {
    if (error.code === '23505') {
      return true // Already saved
    }
    console.error('Save error:', error)
    return false
  }

  return true
}

/**
 * Remove pearl from user's saved collection
 */
export async function unsavePearl(pearlId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('pearl_saves')
    .delete()
    .eq('pearl_id', pearlId)
    .eq('user_id', userId)

  if (error) {
    console.error('Unsave error:', error)
    return false
  }

  return true
}

/**
 * Get user's saved pearls
 */
export async function getSavedPearls(userId: string): Promise<Pearl[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('pearl_saves')
    .select(`
      pearl_id,
      pearls (
        id,
        user_id,
        text,
        upvotes,
        saves,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get saved pearls error:', error)
    return []
  }

  return (data || [])
    .filter(d => d.pearls)
    .map(d => {
      const p = d.pearls as unknown as {
        id: string
        user_id: string
        text: string
        upvotes: number
        saves: number
        created_at: string
      }
      return {
        id: p.id,
        userId: p.user_id,
        text: p.text,
        upvotes: p.upvotes,
        saves: p.saves,
        createdAt: p.created_at,
        hasVoted: false, // Would need additional query
        hasSaved: true
      }
    })
}

/**
 * Delete a pearl (user's own)
 */
export async function deletePearl(pearlId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase
    .from('pearls')
    .delete()
    .eq('id', pearlId)
    .eq('user_id', userId)

  if (error) {
    console.error('Delete pearl error:', error)
    return false
  }

  return true
}

/**
 * Get user's community stats
 */
export async function getUserStats(userId: string): Promise<{ karma: number; saves: number } | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('total_karma, total_saves')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Get user stats error:', error)
    return null
  }

  return {
    karma: data.total_karma,
    saves: data.total_saves
  }
}
