/**
 * Navigation Store Tests
 *
 * Tests for the navigation state management store.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useNavigationStore } from '../useNavigationStore'

// Helper to reset store between tests
function resetStore() {
  useNavigationStore.setState({
    view: 'timer',
    openVoiceModal: false,
    pendingInsightSessionId: null,
    showInsightModal: false,
    pendingInsightSessionDuration: null,
    pendingMilestone: null,
    exploreFilter: null,
    journeySubTab: null,
    openPlanningModal: false,
  })
}

describe('useNavigationStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('initial state', () => {
    it('starts on timer view', () => {
      const { view } = useNavigationStore.getState()
      expect(view).toBe('timer')
    })

    it('has no pending intents', () => {
      const state = useNavigationStore.getState()
      expect(state.openVoiceModal).toBe(false)
      expect(state.pendingInsightSessionId).toBeNull()
      expect(state.showInsightModal).toBe(false)
      expect(state.exploreFilter).toBeNull()
      expect(state.journeySubTab).toBeNull()
      expect(state.openPlanningModal).toBe(false)
    })
  })

  describe('basic navigation', () => {
    it('setView changes the current view', () => {
      const { setView } = useNavigationStore.getState()

      setView('journey')
      expect(useNavigationStore.getState().view).toBe('journey')

      setView('explore')
      expect(useNavigationStore.getState().view).toBe('explore')

      setView('progress')
      expect(useNavigationStore.getState().view).toBe('progress')

      setView('profile')
      expect(useNavigationStore.getState().view).toBe('profile')
    })

    it('setView supports legacy views', () => {
      const { setView } = useNavigationStore.getState()

      setView('calendar')
      expect(useNavigationStore.getState().view).toBe('calendar')

      setView('insights')
      expect(useNavigationStore.getState().view).toBe('insights')

      setView('pearls')
      expect(useNavigationStore.getState().view).toBe('pearls')
    })
  })

  describe('voice modal intent', () => {
    it('setViewWithVoiceModal navigates to progress with modal flag', () => {
      const { setViewWithVoiceModal } = useNavigationStore.getState()

      setViewWithVoiceModal()

      const state = useNavigationStore.getState()
      expect(state.view).toBe('progress')
      expect(state.openVoiceModal).toBe(true)
    })

    it('clearVoiceModalIntent clears the flag', () => {
      const { setViewWithVoiceModal, clearVoiceModalIntent } = useNavigationStore.getState()

      setViewWithVoiceModal()
      expect(useNavigationStore.getState().openVoiceModal).toBe(true)

      clearVoiceModalIntent()
      expect(useNavigationStore.getState().openVoiceModal).toBe(false)
    })
  })

  describe('post-session flow', () => {
    it('triggerPostSessionFlow sets up insight capture', () => {
      const { triggerPostSessionFlow } = useNavigationStore.getState()

      triggerPostSessionFlow('session-123', 1800) // 30 minutes

      const state = useNavigationStore.getState()
      expect(state.view).toBe('journey')
      expect(state.pendingInsightSessionId).toBe('session-123')
      expect(state.pendingInsightSessionDuration).toBe(1800)
      expect(state.pendingMilestone).toBeNull()
      expect(state.showInsightModal).toBe(false) // Not shown yet
    })

    it('triggerPostSessionFlow includes milestone when provided', () => {
      const { triggerPostSessionFlow } = useNavigationStore.getState()

      triggerPostSessionFlow('session-456', 3600, '10 hours reached!')

      const state = useNavigationStore.getState()
      expect(state.pendingInsightSessionId).toBe('session-456')
      expect(state.pendingMilestone).toBe('10 hours reached!')
    })

    it('showInsightCaptureModal shows the modal', () => {
      const { triggerPostSessionFlow, showInsightCaptureModal } = useNavigationStore.getState()

      triggerPostSessionFlow('session-123', 1800)
      expect(useNavigationStore.getState().showInsightModal).toBe(false)

      showInsightCaptureModal()
      expect(useNavigationStore.getState().showInsightModal).toBe(true)
    })

    it('hideInsightCaptureModal hides the modal', () => {
      const { showInsightCaptureModal, hideInsightCaptureModal } = useNavigationStore.getState()

      showInsightCaptureModal()
      expect(useNavigationStore.getState().showInsightModal).toBe(true)

      hideInsightCaptureModal()
      expect(useNavigationStore.getState().showInsightModal).toBe(false)
    })

    it('clearPostSessionState resets all post-session state', () => {
      const { triggerPostSessionFlow, showInsightCaptureModal, clearPostSessionState } =
        useNavigationStore.getState()

      triggerPostSessionFlow('session-123', 1800, 'Milestone!')
      showInsightCaptureModal()

      clearPostSessionState()

      const state = useNavigationStore.getState()
      expect(state.pendingInsightSessionId).toBeNull()
      expect(state.pendingInsightSessionDuration).toBeNull()
      expect(state.pendingMilestone).toBeNull()
      expect(state.showInsightModal).toBe(false)
    })
  })

  describe('notification deep-link', () => {
    it('navigateToInsightCapture sets up immediate modal display', () => {
      const { navigateToInsightCapture } = useNavigationStore.getState()

      navigateToInsightCapture('session-789')

      const state = useNavigationStore.getState()
      expect(state.view).toBe('journey')
      expect(state.pendingInsightSessionId).toBe('session-789')
      expect(state.showInsightModal).toBe(true) // Immediate for notifications
      expect(state.pendingInsightSessionDuration).toBeNull()
      expect(state.pendingMilestone).toBeNull()
    })
  })

  describe('CTA navigation', () => {
    it('navigateToExploreWithFilter sets view and filter', () => {
      const { navigateToExploreWithFilter } = useNavigationStore.getState()

      navigateToExploreWithFilter('pearls')

      const state = useNavigationStore.getState()
      expect(state.view).toBe('explore')
      expect(state.exploreFilter).toBe('pearls')
    })

    it('navigateToExploreWithFilter works with meditations filter', () => {
      const { navigateToExploreWithFilter } = useNavigationStore.getState()

      navigateToExploreWithFilter('meditations')

      const state = useNavigationStore.getState()
      expect(state.view).toBe('explore')
      expect(state.exploreFilter).toBe('meditations')
    })

    it('navigateToJourneyTab sets view and subTab', () => {
      const { navigateToJourneyTab } = useNavigationStore.getState()

      navigateToJourneyTab('sessions')
      expect(useNavigationStore.getState().journeySubTab).toBe('sessions')

      navigateToJourneyTab('saved')
      expect(useNavigationStore.getState().journeySubTab).toBe('saved')

      navigateToJourneyTab('pearls')
      expect(useNavigationStore.getState().journeySubTab).toBe('pearls')
    })

    it('navigateToJourneyPlanning opens planning modal', () => {
      const { navigateToJourneyPlanning } = useNavigationStore.getState()

      navigateToJourneyPlanning()

      const state = useNavigationStore.getState()
      expect(state.view).toBe('journey')
      expect(state.openPlanningModal).toBe(true)
    })

    it('clearNavigationIntent clears all CTA intents', () => {
      const {
        navigateToExploreWithFilter,
        navigateToJourneyTab,
        navigateToJourneyPlanning,
        clearNavigationIntent,
      } = useNavigationStore.getState()

      // Set up various intents
      navigateToExploreWithFilter('pearls')
      navigateToJourneyTab('saved')
      navigateToJourneyPlanning()

      // Clear them all
      clearNavigationIntent()

      const state = useNavigationStore.getState()
      expect(state.exploreFilter).toBeNull()
      expect(state.journeySubTab).toBeNull()
      expect(state.openPlanningModal).toBe(false)
    })
  })

  describe('state isolation', () => {
    it('setView does not affect other state', () => {
      const { triggerPostSessionFlow, setView } = useNavigationStore.getState()

      // Set up some state
      triggerPostSessionFlow('session-123', 1800)

      // Navigate elsewhere
      setView('progress')

      // Post-session state should persist
      const state = useNavigationStore.getState()
      expect(state.view).toBe('progress')
      expect(state.pendingInsightSessionId).toBe('session-123')
    })
  })
})
