/**
 * Types for Lock Setup Flow
 *
 * These types represent the form state that accumulates across the 8 screens.
 */

import type {
  MeditationLockObstacle,
  MeditationLockScheduleWindow,
  AccountabilityMethod,
  ReminderStyle,
} from '../../lib/db/types'

// Form state accumulated across all screens
export interface LockSetupFormState {
  // Screen 1: Identity Framing
  identityStatement: string
  whyItMatters: string

  // Screen 2: Anchor Routine
  anchorRoutine: string
  anchorLocation: string
  anchorTimeHour: number
  anchorTimeMinute: number
  backupAnchor: string | null

  // Screen 3: Commitment Level
  unlockDurationMinutes: number
  minimumFallbackMinutes: number

  // Screen 4: Celebration Ritual
  celebrationRitual: string

  // Screen 5: Obstacle Anticipation
  obstacleStrategy: string
  selectedObstacles: string[]
  obstacles: MeditationLockObstacle[]

  // Screen 6: Accountability
  accountabilityPartner: string // Name of person who cares
  accountabilityEnabled: boolean
  accountabilityPhone: string
  accountabilityMethod: AccountabilityMethod
  notifyOnCompletion: boolean
  notifyOnSkip: boolean

  // Screen 7: Apps, Schedule & Reminders
  appsToBlock: string[] // Display names from picker
  blockedAppTokens: string[] // Native tokens for actual blocking
  scheduleType: 'weekdays' | 'everyday'
  scheduleWindows: MeditationLockScheduleWindow[]
  activeDays: boolean[]
  reminderEnabled: boolean
  eveningReminderEnabled: boolean
  reminderMinutesBefore: number
  reminderStyle: ReminderStyle
  customReminderMessage: string

  // Screen 8: Forgiveness & Fresh Start
  streakFreezesPerMonth: number
  gracePeriodMinutes: number | null
  safetyAutoUnlockHours: number | null
  activationDate: number
}

// Initial form state with sensible defaults
export const initialFormState: LockSetupFormState = {
  // Screen 1
  identityStatement: '',
  whyItMatters: '',

  // Screen 2
  anchorRoutine: '',
  anchorLocation: '',
  anchorTimeHour: 7,
  anchorTimeMinute: 0,
  backupAnchor: null,

  // Screen 3
  unlockDurationMinutes: 10,
  minimumFallbackMinutes: 2,

  // Screen 4
  celebrationRitual: '',

  // Screen 5
  obstacleStrategy: '',
  selectedObstacles: [],
  obstacles: [],

  // Screen 6
  accountabilityPartner: '',
  accountabilityEnabled: false,
  accountabilityPhone: '',
  accountabilityMethod: 'sms',
  notifyOnCompletion: true,
  notifyOnSkip: false,

  // Screen 7
  appsToBlock: [],
  blockedAppTokens: [],
  scheduleType: 'weekdays',
  scheduleWindows: [{ startHour: 7, startMinute: 0, endHour: 9, endMinute: 0 }],
  activeDays: [false, true, true, true, true, true, false], // Mon-Fri
  reminderEnabled: true,
  eveningReminderEnabled: false,
  reminderMinutesBefore: 10,
  reminderStyle: 'simple',
  customReminderMessage: '',

  // Screen 8
  streakFreezesPerMonth: 3,
  gracePeriodMinutes: 30,
  safetyAutoUnlockHours: 2,
  activationDate: 0,
}

// Screen props interface
export interface ScreenProps {
  formState: LockSetupFormState
  updateForm: (updates: Partial<LockSetupFormState>) => void
  onNext: () => void
  onBack: () => void
}
