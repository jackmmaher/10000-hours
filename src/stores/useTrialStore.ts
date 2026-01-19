/**
 * Trial Store - Manages free trial session state
 *
 * Ephemeral trial sessions for non-paying users to experience
 * the meditation timer without consuming hours or recording data.
 */

import { create } from 'zustand'

export type TrialPhase = 'idle' | 'pending' | 'active' | 'settling' | 'complete'

interface TrialState {
  isTrialActive: boolean
  trialGoalSeconds: number | null
  trialPhase: TrialPhase

  // Actions
  startTrial: (goalMinutes: number) => void
  setTrialPhase: (phase: TrialPhase) => void
  endTrial: () => void
  completeTrial: () => void
  cancelTrial: () => void
}

export const useTrialStore = create<TrialState>((set) => ({
  isTrialActive: false,
  trialGoalSeconds: null,
  trialPhase: 'idle',

  startTrial: (goalMinutes: number) =>
    set({
      isTrialActive: true,
      trialGoalSeconds: goalMinutes * 60,
      trialPhase: 'pending',
    }),

  setTrialPhase: (phase: TrialPhase) => set({ trialPhase: phase }),

  endTrial: () =>
    set({
      trialPhase: 'settling',
    }),

  completeTrial: () =>
    set({
      trialPhase: 'complete',
    }),

  cancelTrial: () =>
    set({
      isTrialActive: false,
      trialGoalSeconds: null,
      trialPhase: 'idle',
    }),
}))
