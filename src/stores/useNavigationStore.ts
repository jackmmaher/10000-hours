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
  // Post-session insight capture flow
  pendingInsightSessionId: string | null       // Session awaiting insight capture
  showInsightModal: boolean                     // Whether to show insight modal
  pendingInsightSessionDuration: number | null  // Duration for body awareness prompt
  pendingMilestone: string | null               // Milestone message to show in modal header
  // Actions
  setView: (view: AppView) => void
  setViewWithVoiceModal: () => void
  clearVoiceModalIntent: () => void
  // Post-session actions
  triggerPostSessionFlow: (sessionId: string, duration: number, milestone?: string) => void
  showInsightCaptureModal: () => void
  hideInsightCaptureModal: () => void
  clearPostSessionState: () => void
  // For notification deep-link
  navigateToInsightCapture: (sessionId: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: 'timer',
  openVoiceModal: false,
  pendingInsightSessionId: null,
  showInsightModal: false,
  pendingInsightSessionDuration: null,
  pendingMilestone: null,

  setView: (view) => set({ view }),
  setViewWithVoiceModal: () => set({ view: 'progress', openVoiceModal: true }),
  clearVoiceModalIntent: () => set({ openVoiceModal: false }),

  // Called after session ends - navigate to Journey with pending insight
  triggerPostSessionFlow: (sessionId, duration, milestone) => set({
    view: 'journey',
    pendingInsightSessionId: sessionId,
    pendingInsightSessionDuration: duration,
    pendingMilestone: milestone || null,
    showInsightModal: false  // Will be shown after delay
  }),

  // Called after stats animation settles
  showInsightCaptureModal: () => set({ showInsightModal: true }),

  hideInsightCaptureModal: () => set({ showInsightModal: false }),

  clearPostSessionState: () => set({
    pendingInsightSessionId: null,
    pendingInsightSessionDuration: null,
    pendingMilestone: null,
    showInsightModal: false
  }),

  // For deep-linking from notification
  navigateToInsightCapture: (sessionId) => set({
    view: 'journey',
    pendingInsightSessionId: sessionId,
    pendingInsightSessionDuration: null,
    pendingMilestone: null,
    showInsightModal: true  // Show immediately for notification tap
  })
}))
