/**
 * Reciprocity Data Service
 *
 * Tracks give/receive balance for community interactions.
 * Surfaces the bidirectional nature of community contribution.
 *
 * Oxytocin trigger: Seeing the mutual flow of community support.
 */

import { supabase, isSupabaseConfigured } from './supabase'

export interface ReciprocityData {
  received: {
    karma: number // Upvotes on your templates
    saves: number // Others saving your templates/pearls
    completions: number // Others completing your templates
  }
  given: {
    karma: number // Upvotes you've given
    saves: number // Templates/pearls you've saved
    completions: number // Community templates you've completed
  }
}

/**
 * Get reciprocity data for a user
 * Shows the give/receive balance with the community
 */
export async function getReciprocityData(userId: string): Promise<ReciprocityData> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      received: { karma: 0, saves: 0, completions: 0 },
      given: { karma: 0, saves: 0, completions: 0 },
    }
  }

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

    // RECEIVED - upvotes on your templates
    let receivedTemplateKarma = 0
    if (userTemplateIds.length > 0) {
      const { count } = await supabase
        .from('session_template_votes')
        .select('*', { count: 'exact', head: true })
        .in('template_id', userTemplateIds)
        .neq('user_id', userId)
      receivedTemplateKarma = count || 0
    }

    // RECEIVED - upvotes on your pearls
    let receivedPearlKarma = 0
    if (userPearlIds.length > 0) {
      const { count } = await supabase
        .from('pearl_votes')
        .select('*', { count: 'exact', head: true })
        .in('pearl_id', userPearlIds)
        .neq('user_id', userId)
      receivedPearlKarma = count || 0
    }

    const receivedKarma = receivedTemplateKarma + receivedPearlKarma

    // RECEIVED - saves of your templates
    let receivedTemplateSaves = 0
    if (userTemplateIds.length > 0) {
      const { count } = await supabase
        .from('session_template_saves')
        .select('*', { count: 'exact', head: true })
        .in('template_id', userTemplateIds)
        .neq('user_id', userId)
      receivedTemplateSaves = count || 0
    }

    // RECEIVED - saves of your pearls
    let receivedPearlSaves = 0
    if (userPearlIds.length > 0) {
      const { count } = await supabase
        .from('pearl_saves')
        .select('*', { count: 'exact', head: true })
        .in('pearl_id', userPearlIds)
        .neq('user_id', userId)
      receivedPearlSaves = count || 0
    }

    // RECEIVED - completions of your templates
    let receivedCompletions = 0
    if (userTemplateIds.length > 0) {
      const { count } = await supabase
        .from('session_template_completions')
        .select('*', { count: 'exact', head: true })
        .in('template_id', userTemplateIds)
        .neq('user_id', userId)
      receivedCompletions = count || 0
    }

    // GIVEN - upvotes you've given (templates + pearls)
    const { count: givenTemplateKarma } = await supabase
      .from('session_template_votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: givenPearlKarma } = await supabase
      .from('pearl_votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const givenKarma = (givenTemplateKarma || 0) + (givenPearlKarma || 0)

    // GIVEN - saves you've made
    const { count: givenTemplateSaves } = await supabase
      .from('session_template_saves')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: givenPearlSaves } = await supabase
      .from('pearl_saves')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // GIVEN - community templates you've completed
    const { count: givenCompletions } = await supabase
      .from('session_template_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return {
      received: {
        karma: receivedKarma,
        saves: receivedTemplateSaves + receivedPearlSaves,
        completions: receivedCompletions,
      },
      given: {
        karma: givenKarma,
        saves: (givenTemplateSaves || 0) + (givenPearlSaves || 0),
        completions: givenCompletions || 0,
      },
    }
  } catch (err) {
    console.error('Error fetching reciprocity data:', err)
    return {
      received: { karma: 0, saves: 0, completions: 0 },
      given: { karma: 0, saves: 0, completions: 0 },
    }
  }
}
