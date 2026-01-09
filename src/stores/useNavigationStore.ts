/**
 * Navigation Store - Manages app view state
 *
 * Extracted from useSessionStore to separate concerns:
 * - Navigation (which view is active) belongs here
 * - Session data (timer, sessions, enlightenment) stays in useSessionStore
 */

import { create } from 'zustand'

// Navigation structure: Timer | Journey | Explore | Progress | Profile
export type AppView =
  | 'timer'
  | 'journey'           // Personal space - plans, sessions, insights
  | 'explore'           // Community discovery - pearls + sessions + courses
  | 'progress'          // Milestones, stats, insight-driven history
  | 'profile'           // User identity, preferences, wellbeing tracking
  | 'settings'          // Sub-page: Theme, display options, legal
  // Legacy views (still accessible via internal links)
  | 'calendar'          // -> accessed from progress
  | 'insights'          // -> accessed from journey
  | 'pearls'            // -> accessed from explore
  | 'saved-pearls'      // -> accessed from explore

interface NavigationState {
  view: AppView
  // Intent flags - consumed by target views
  openVoiceModal: boolean
  setView: (view: AppView) => void
  setViewWithVoiceModal: () => void
  clearVoiceModalIntent: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: 'timer',
  openVoiceModal: false,
  setView: (view) => set({ view }),
  setViewWithVoiceModal: () => set({ view: 'progress', openVoiceModal: true }),
  clearVoiceModalIntent: () => set({ openVoiceModal: false })
}))
