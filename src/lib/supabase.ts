import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isSupabaseConfigured = (): boolean => supabase !== null

/**
 * Update user's Voice score in their profile
 * Called when Voice is recalculated locally
 */
export async function updateVoiceScore(userId: string, voiceScore: number): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  // Clamp score to valid range before sending to server
  const clampedScore = Math.round(Math.max(0, Math.min(100, voiceScore)))

  const { error } = await supabase.rpc('update_voice_score', {
    p_user_id: userId,
    p_voice_score: clampedScore,
  })

  if (error) {
    if (error.message?.includes('Unauthorized')) {
      console.error('Voice score update rejected: authorization failure')
    } else if (error.message?.includes('Invalid voice score')) {
      console.error('Voice score update rejected: validation failure')
    } else {
      console.error('Failed to update voice score:', error.message)
    }
    return false
  }

  return true
}
