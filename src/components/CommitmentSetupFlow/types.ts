/**
 * Types for Commitment Setup Flow
 *
 * Form state that accumulates across the 12 screens of commitment setup.
 */

import type {
  CommitmentScheduleType,
  CommitmentWindowType,
  CommitmentEndBehavior,
  AccountabilityMethod,
} from '../../lib/db/types'

// Obstacle with coping response (reused from MeditationLock)
export interface CommitmentObstacle {
  obstacle: string
  copingResponse: string
}

// Form state accumulated across all screens
export interface CommitmentSetupFormState {
  // Phase 1: Identity (Screen 1 - KEPT from LockSetupFlow)
  identityStatement: string
  whyItMatters: string

  // Phase 2: Anchor (Screen 2 - KEPT from LockSetupFlow)
  anchorRoutine: string
  anchorLocation: string

  // Phase 2: Schedule (Screen 3 - NEW)
  scheduleType: CommitmentScheduleType
  customDays: boolean[] // [Sun..Sat]
  flexibleTarget: number // sessions/week

  // Phase 2: Window (Screen 4 - ADAPTED from AnchorTimeScreen)
  windowType: CommitmentWindowType
  windowStartHour: number
  windowStartMinute: number
  windowEndHour: number
  windowEndMinute: number

  // Phase 3: Session (Screen 5 - ADAPTED from CommitmentScreen)
  minimumSessionMinutes: number
  minimumFallbackMinutes: number // "hard day" minimum

  // Phase 3: Duration (Screen 6 - NEW)
  commitmentDuration: 30 | 60 | 90

  // Phase 4: Obstacles (Screen 7 - KEPT from LockSetupFlow)
  selectedObstacles: string[]
  obstacles: CommitmentObstacle[]

  // Phase 4: Accountability (Screen 8 - KEPT from LockSetupFlow)
  accountabilityEnabled: boolean
  accountabilityPhone: string
  accountabilityMethod: AccountabilityMethod
  notifyOnCompletion: boolean
  notifyOnSkip: boolean

  // Phase 5: Safety (Screen 9 - ADAPTED)
  gracePeriodCount: number // 3 per 30 days

  // Phase 5: Stakes (Screen 10 - NEW)
  stakesAcknowledged: boolean

  // Phase 6: Celebration (Screen 11 - KEPT from LockSetupFlow)
  celebrationRitual: string

  // Phase 6: End behavior (Screen 12 - in ReviewScreen)
  endBehavior: CommitmentEndBehavior

  // Activation
  activationDate: number // When commitment starts
}

// Initial form state with sensible defaults
export const initialFormState: CommitmentSetupFormState = {
  // Phase 1: Identity
  identityStatement: '',
  whyItMatters: '',

  // Phase 2: Anchor
  anchorRoutine: '',
  anchorLocation: '',

  // Phase 2: Schedule
  scheduleType: 'daily',
  customDays: [false, true, true, true, true, true, false], // Mon-Fri
  flexibleTarget: 5,

  // Phase 2: Window
  windowType: 'anytime',
  windowStartHour: 5,
  windowStartMinute: 0,
  windowEndHour: 12,
  windowEndMinute: 0,

  // Phase 3: Session
  minimumSessionMinutes: 10,
  minimumFallbackMinutes: 2,

  // Phase 3: Duration
  commitmentDuration: 30,

  // Phase 4: Obstacles
  selectedObstacles: [],
  obstacles: [],

  // Phase 4: Accountability
  accountabilityEnabled: false,
  accountabilityPhone: '',
  accountabilityMethod: 'sms',
  notifyOnCompletion: true,
  notifyOnSkip: false,

  // Phase 5: Safety
  gracePeriodCount: 3,

  // Phase 5: Stakes
  stakesAcknowledged: false,

  // Phase 6: Celebration
  celebrationRitual: '',

  // Phase 6: End behavior
  endBehavior: 'auto-renew',

  // Activation
  activationDate: 0,
}

// Screen props interface
export interface ScreenProps {
  formState: CommitmentSetupFormState
  updateForm: (updates: Partial<CommitmentSetupFormState>) => void
  onNext: () => void
  onBack: () => void
}
