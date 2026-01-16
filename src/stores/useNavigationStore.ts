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
  | 'journey' // Personal space - plans, sessions, insights
  | 'explore' // Community discovery - pearls + sessions + courses
  | 'progress' // Milestones, stats, insight-driven history
  | 'profile' // User identity, preferences, wellbeing tracking
  | 'settings' // Sub-page: Theme, display options, legal
  // Legacy views (still accessible via internal links)
  | 'calendar' // -> accessed from progress
  | 'insights' // -> accessed from journey
  | 'pearls' // -> accessed from explore
  | 'saved-pearls' // -> accessed from explore

interface NavigationState {
  view: AppView
  // Intent flags - consumed by target views
  openVoiceModal: boolean
  // Timer settling lock - prevents navigation during 4-second settle window
  isSettling: boolean
  // Post-session insight capture flow
  pendingInsightSessionId: string | null // Session awaiting insight capture
  showInsightModal: boolean // Whether to show insight modal
  pendingInsightSessionDuration: number | null // Duration for body awareness prompt
  pendingMilestone: string | null // Milestone message to show in modal header
  pendingSourceTemplateId: string | null // If session was from a recommendation
  // CTA navigation intents - consumed and cleared by target views
  exploreFilter: 'all' | 'pearls' | 'meditations' | null
  journeySubTab: 'sessions' | 'saved' | 'pearls' | null
  openPlanningModal: boolean
  scrollToSubTabs: boolean
  // Welcome cutscene state
  showWelcomeCutscene: boolean
  welcomeCutsceneShown: boolean // Tracks if shown this session (in-memory only)
  // Actions
  setView: (view: AppView) => void
  setIsSettling: (settling: boolean) => void
  setViewWithVoiceModal: () => void
  clearVoiceModalIntent: () => void
  // Post-session actions
  triggerPostSessionFlow: (
    sessionId: string,
    duration: number,
    milestone?: string,
    sourceTemplateId?: string
  ) => void
  showInsightCaptureModal: () => void
  hideInsightCaptureModal: () => void
  clearPostSessionState: () => void
  // For notification deep-link
  navigateToInsightCapture: (sessionId: string) => void
  // CTA navigation actions
  navigateToExploreWithFilter: (filter: 'meditations' | 'pearls') => void
  navigateToJourneyTab: (subTab: 'sessions' | 'saved' | 'pearls') => void
  navigateToJourneyPlanning: () => void
  clearNavigationIntent: () => void
  // Welcome cutscene actions
  triggerWelcomeCutscene: () => void
  dismissWelcomeCutscene: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: 'timer',
  openVoiceModal: false,
  isSettling: false,
  pendingInsightSessionId: null,
  showInsightModal: false,
  pendingInsightSessionDuration: null,
  pendingMilestone: null,
  pendingSourceTemplateId: null,
  // CTA navigation intents
  exploreFilter: null,
  journeySubTab: null,
  openPlanningModal: false,
  scrollToSubTabs: false,
  // Welcome cutscene state
  showWelcomeCutscene: false,
  welcomeCutsceneShown: false,

  setView: (view) =>
    set((state) => {
      // GUARD: Block navigation during timer settling window
      // This prevents race conditions between navigation and stopTimer()
      if (state.isSettling) {
        console.warn('[NavigationStore] Navigation blocked: timer settling')
        return state // Return unchanged state
      }

      // Trigger insight modal when navigating AWAY from timer with pending insight
      // This keeps the timer experience sacred - modal appears on the destination tab
      const leavingTimer = state.view === 'timer' && view !== 'timer'
      const hasPendingInsight = state.pendingInsightSessionId && !state.showInsightModal

      return {
        view,
        showInsightModal: leavingTimer && hasPendingInsight ? true : state.showInsightModal,
      }
    }),

  setIsSettling: (settling) => set({ isSettling: settling }),
  setViewWithVoiceModal: () => set({ view: 'progress', openVoiceModal: true }),
  clearVoiceModalIntent: () => set({ openVoiceModal: false }),

  // Called after session ends - stay on timer tab with pending insight
  triggerPostSessionFlow: (sessionId, duration, milestone, sourceTemplateId) =>
    set({
      // Don't change view - stay on timer tab
      pendingInsightSessionId: sessionId,
      pendingInsightSessionDuration: duration,
      pendingMilestone: milestone || null,
      pendingSourceTemplateId: sourceTemplateId || null,
      showInsightModal: false, // Will be shown after merge animation
    }),

  // Called after stats animation settles
  showInsightCaptureModal: () => set({ showInsightModal: true }),

  hideInsightCaptureModal: () => set({ showInsightModal: false }),

  clearPostSessionState: () =>
    set({
      pendingInsightSessionId: null,
      pendingInsightSessionDuration: null,
      pendingMilestone: null,
      pendingSourceTemplateId: null,
      showInsightModal: false,
    }),

  // For deep-linking from notification
  navigateToInsightCapture: (sessionId) =>
    set({
      view: 'journey',
      pendingInsightSessionId: sessionId,
      pendingInsightSessionDuration: null,
      pendingMilestone: null,
      showInsightModal: true, // Show immediately for notification tap
    }),

  // CTA navigation actions - consumed and cleared by target views
  navigateToExploreWithFilter: (filter) =>
    set({
      view: 'explore',
      exploreFilter: filter,
    }),

  navigateToJourneyTab: (subTab) =>
    set({
      view: 'journey',
      journeySubTab: subTab,
      scrollToSubTabs: true,
    }),

  navigateToJourneyPlanning: () =>
    set({
      view: 'journey',
      openPlanningModal: true,
    }),

  clearNavigationIntent: () =>
    set({
      exploreFilter: null,
      journeySubTab: null,
      openPlanningModal: false,
      scrollToSubTabs: false,
    }),

  // Welcome cutscene actions
  triggerWelcomeCutscene: () => set({ showWelcomeCutscene: true }),
  dismissWelcomeCutscene: () =>
    set({
      showWelcomeCutscene: false,
      welcomeCutsceneShown: true,
    }),
}))
