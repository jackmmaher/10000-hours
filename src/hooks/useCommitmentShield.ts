/**
 * useCommitmentShield - Composable hook for shield visibility
 *
 * Determines whether the Commitment Shield overlay should display,
 * and in which state (locked, flexibility, in-progress).
 *
 * Shield shows when:
 * - Commitment mode is active
 * - Today is a required day
 * - Session is not yet completed
 * - Current time is within the practice window
 * - User is NOT on the settings page
 * - Timer is not currently running (active/settling)
 */

import { useTodayCommitment, type TodayCommitmentState } from './useTodayCommitment'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSessionStore } from '../stores/useSessionStore'

export type ShieldState = 'locked' | 'flexibility' | 'in-progress'

export interface CommitmentShieldResult {
  /** Whether the shield should be displayed */
  shouldShow: boolean
  /** Current shield state */
  state: ShieldState
  /** Full commitment state from useTodayCommitment */
  commitment: TodayCommitmentState
}

export function useCommitmentShield(): CommitmentShieldResult {
  const commitment = useTodayCommitment()
  const view = useNavigationStore((s) => s.view)
  const timerPhase = useSessionStore((s) => s.timerPhase)

  // Timer is "active" if running or in completing state
  const timerIsActive = timerPhase === 'running' || timerPhase === 'preparing'

  // Determine if shield should show
  // Shield is hidden when commitment is paused
  const shouldShow =
    commitment.isActive &&
    !commitment.isPaused &&
    commitment.isRequired &&
    !commitment.isCompleted &&
    commitment.isWithinWindow &&
    !commitment.isLoading &&
    view !== 'settings' &&
    view !== 'store' &&
    view !== 'privacy' &&
    view !== 'terms' &&
    !timerIsActive

  // Determine shield state
  let state: ShieldState = 'locked'
  if (timerIsActive) {
    state = 'in-progress'
  }

  return {
    shouldShow,
    state,
    commitment,
  }
}
