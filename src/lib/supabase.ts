import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = (): boolean => supabase !== null;

/**
 * Update user's Voice score in their profile
 * Called when Voice is recalculated locally
 */
export async function updateVoiceScore(userId: string, voiceScore: number): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  const { error } = await supabase.rpc('update_voice_score', {
    p_user_id: userId,
    p_voice_score: voiceScore
  })

  if (error) {
    console.error('Failed to update voice score:', error)
    return false
  }

  return true
}
