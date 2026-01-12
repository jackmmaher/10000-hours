/**
 * Auth Store - Supabase authentication state
 *
 * Handles sign-in/out with Apple and Google OAuth.
 * Manages user session and profile data.
 */

import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  tier: 'free' | 'premium'
  // Validation received
  totalKarma: number
  totalSaves: number
  totalCompletionsReceived: number // Others completing your meditations
  // Validation given (two-way)
  karmaGiven: number
  savesMade: number
  completionsPerformed: number
  // Contribution
  pearlsCreated: number
  // Metadata
  createdAt: string
}

interface AuthState {
  // State
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      set({ isLoading: false })
      return
    }

    try {
      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth init error:', error)
        set({ isLoading: false, error: error.message })
        return
      }

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          user: session.user,
          session,
          profile: profile
            ? {
                id: profile.id,
                tier: profile.tier,
                totalKarma: profile.total_karma || 0,
                totalSaves: profile.total_saves || 0,
                totalCompletionsReceived: profile.total_completions_received || 0,
                karmaGiven: profile.karma_given || 0,
                savesMade: profile.saves_made || 0,
                completionsPerformed: profile.completions_performed || 0,
                pearlsCreated: profile.pearls_created || 0,
                createdAt: profile.created_at,
              }
            : null,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && supabase) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({
            user: session.user,
            session,
            profile: profile
              ? {
                  id: profile.id,
                  tier: profile.tier,
                  totalKarma: profile.total_karma || 0,
                  totalSaves: profile.total_saves || 0,
                  totalCompletionsReceived: profile.total_completions_received || 0,
                  karmaGiven: profile.karma_given || 0,
                  savesMade: profile.saves_made || 0,
                  completionsPerformed: profile.completions_performed || 0,
                  pearlsCreated: profile.pearls_created || 0,
                  createdAt: profile.created_at,
                }
              : null,
            isAuthenticated: true,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
            profile: null,
            isAuthenticated: false,
          })
        }
      })
    } catch (err) {
      console.error('Auth init error:', err)
      set({ isLoading: false, error: 'Failed to initialize auth' })
    }
  },

  signInWithGoogle: async () => {
    if (!supabase) {
      set({ error: 'Supabase not configured' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })

      if (error) throw error
    } catch (err) {
      console.error('Google sign-in error:', err)
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign-in failed',
      })
    }
  },

  signInWithApple: async () => {
    if (!supabase) {
      set({ error: 'Supabase not configured' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
        },
      })

      if (error) throw error
    } catch (err) {
      console.error('Apple sign-in error:', err)
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign-in failed',
      })
    }
  },

  signOut: async () => {
    if (!supabase) return

    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (err) {
      console.error('Sign-out error:', err)
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign-out failed',
      })
    }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!supabase || !user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        set({
          profile: {
            id: profile.id,
            tier: profile.tier,
            totalKarma: profile.total_karma || 0,
            totalSaves: profile.total_saves || 0,
            totalCompletionsReceived: profile.total_completions_received || 0,
            karmaGiven: profile.karma_given || 0,
            savesMade: profile.saves_made || 0,
            completionsPerformed: profile.completions_performed || 0,
            pearlsCreated: profile.pearls_created || 0,
            createdAt: profile.created_at,
          },
        })
      }
    } catch (err) {
      console.error('Profile refresh error:', err)
    }
  },

  clearError: () => set({ error: null }),
}))
