/**
 * LockSetupFlow - 11-screen guided setup for Meditation Lock
 *
 * Restructured for optimal cognitive load (1-2 decisions per screen):
 *
 * Phase 1: WHO
 *   1. Identity Framing
 *
 * Phase 2: WHEN
 *   2. Anchor Activity + Location
 *   3. Anchor Time + Backup
 *
 * Phase 3: WHAT
 *   4. Commitment Duration
 *   5. Celebration Ritual
 *
 * Phase 4: HOW
 *   6. Obstacle Anticipation
 *   7. Accountability
 *
 * Phase 5: WHERE
 *   8. App Selection
 *   9. Schedule Configuration
 *
 * Phase 6: SAFETY
 *   10. Safety Settings
 *
 * Phase 7: LAUNCH
 *   11. Summary + Activation
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../../hooks/useTapFeedback'
import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
} from '../../lib/db/meditationLockSettings'
import { LockSetupFormState, initialFormState } from './types'

// Screen components
import { IdentityScreen } from './screens/IdentityScreen'
import { AnchorActivityScreen } from './screens/AnchorActivityScreen'
import { AnchorTimeScreen } from './screens/AnchorTimeScreen'
import { CommitmentScreen } from './screens/CommitmentScreen'
import { CelebrationScreen } from './screens/CelebrationScreen'
import { ObstacleScreen } from './screens/ObstacleScreen'
import { AccountabilityScreen } from './screens/AccountabilityScreen'
import { AppSelectionScreen } from './screens/AppSelectionScreen'
import { ScheduleConfigScreen } from './screens/ScheduleConfigScreen'
import { SafetySettingsScreen } from './screens/SafetySettingsScreen'
import { SummaryScreen } from './screens/SummaryScreen'

interface LockSetupFlowProps {
  onComplete: () => void
  onClose: () => void
}

const TOTAL_SCREENS = 11
const STORAGE_KEY = 'lockSetupDraft'

// Phase definitions for progress indicator
const PHASES = [
  { name: 'Identity', screens: [1] },
  { name: 'Routine', screens: [2, 3] },
  { name: 'Commitment', screens: [4, 5] },
  { name: 'Obstacles', screens: [6, 7] },
  { name: 'Apps', screens: [8, 9] },
  { name: 'Safety', screens: [10] },
  { name: 'Start', screens: [11] },
]

export function LockSetupFlow({ onComplete, onClose }: LockSetupFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [formState, setFormState] = useState<LockSetupFormState>(initialFormState)
  const [direction, setDirection] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const haptic = useTapFeedback()
  const saveTimeoutRef = useRef<number | null>(null)

  // Load existing settings OR draft from localStorage on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        // First check for draft in localStorage
        const draft = localStorage.getItem(STORAGE_KEY)
        if (draft) {
          const { formState: savedForm, screen } = JSON.parse(draft)
          setFormState(savedForm)
          setCurrentScreen(screen)
          setIsLoading(false)
          return
        }

        // Otherwise load from database
        const settings = await getMeditationLockSettings()

        setFormState({
          // Screen 1
          identityStatement: settings.identityStatement || '',
          whyItMatters: settings.whyItMatters || '',

          // Screen 2-3
          anchorRoutine: settings.anchorRoutine || '',
          anchorLocation: settings.anchorLocation || '',
          anchorTimeHour: settings.anchorTimeHour ?? 7,
          anchorTimeMinute: settings.anchorTimeMinute ?? 0,
          backupAnchor: settings.backupAnchor,

          // Screen 4
          unlockDurationMinutes: settings.unlockDurationMinutes || 10,
          minimumFallbackMinutes: settings.minimumFallbackMinutes || 2,

          // Screen 5
          celebrationRitual: settings.celebrationRitual || '',

          // Screen 6
          obstacleStrategy: settings.obstacles?.[0]?.copingResponse || '',
          selectedObstacles: settings.obstacles?.map((o) => o.obstacle) || [],
          obstacles: settings.obstacles || [],

          // Screen 7
          accountabilityPartner: '',
          accountabilityEnabled: settings.accountabilityEnabled || false,
          accountabilityPhone: settings.accountabilityPhone || '',
          accountabilityMethod: settings.accountabilityMethod || 'sms',
          notifyOnCompletion: settings.notifyOnCompletion ?? true,
          notifyOnSkip: settings.notifyOnSkip ?? false,

          // Screen 8-9
          appsToBlock: [],
          blockedAppTokens: settings.blockedAppTokens || [],
          scheduleType: settings.activeDays?.every((d) => d) ? 'everyday' : 'weekdays',
          scheduleWindows:
            settings.scheduleWindows?.length > 0
              ? settings.scheduleWindows
              : [{ startHour: 7, startMinute: 0, endHour: 9, endMinute: 0 }],
          activeDays: settings.activeDays || [false, true, true, true, true, true, false],
          reminderEnabled: settings.reminderEnabled ?? true,
          eveningReminderEnabled: false,
          reminderMinutesBefore: settings.reminderMinutesBefore || 10,
          reminderStyle: settings.reminderStyle || 'simple',
          customReminderMessage: settings.customReminderMessage || '',

          // Screen 10-11
          streakFreezesPerMonth: settings.streakFreezesPerMonth || 3,
          gracePeriodMinutes: settings.gracePeriodMinutes ?? 30,
          safetyAutoUnlockHours: settings.safetyAutoUnlockHours ?? 2,
          activationDate: settings.activationDate || 0,
        })
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Auto-save draft to localStorage on form changes (debounced)
  useEffect(() => {
    if (isLoading) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formState,
          screen: currentScreen,
        })
      )
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formState, currentScreen, isLoading])

  const updateForm = useCallback((updates: Partial<LockSetupFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Save all form data to database and complete setup
  const saveAndComplete = useCallback(async () => {
    haptic.success()

    await updateMeditationLockSettings({
      enabled: true,
      activationDate: formState.activationDate,
      identityStatement: formState.identityStatement,
      whyItMatters: formState.whyItMatters || null,
      anchorRoutine: formState.anchorRoutine,
      anchorLocation: formState.anchorLocation,
      anchorTimeHour: formState.anchorTimeHour,
      anchorTimeMinute: formState.anchorTimeMinute,
      backupAnchor: formState.backupAnchor,
      unlockDurationMinutes: formState.unlockDurationMinutes,
      minimumFallbackMinutes: formState.minimumFallbackMinutes,
      celebrationRitual: formState.celebrationRitual || null,
      obstacles: formState.obstacles,
      accountabilityEnabled: formState.accountabilityEnabled,
      accountabilityPhone: formState.accountabilityPhone || null,
      accountabilityMethod: formState.accountabilityMethod,
      notifyOnCompletion: formState.notifyOnCompletion,
      notifyOnSkip: formState.notifyOnSkip,
      blockedAppTokens: formState.blockedAppTokens,
      scheduleWindows: formState.scheduleWindows,
      activeDays: formState.activeDays,
      reminderEnabled: formState.reminderEnabled,
      reminderMinutesBefore: formState.reminderMinutesBefore,
      reminderStyle: formState.reminderStyle,
      customReminderMessage: formState.customReminderMessage || null,
      streakFreezesPerMonth: formState.streakFreezesPerMonth,
      streakFreezesRemaining: formState.streakFreezesPerMonth,
      gracePeriodMinutes: formState.gracePeriodMinutes,
      safetyAutoUnlockHours: formState.safetyAutoUnlockHours,
    })

    // Clear draft on successful completion
    localStorage.removeItem(STORAGE_KEY)

    onComplete()
  }, [formState, haptic, onComplete])

  const handleNext = useCallback(async () => {
    if (currentScreen < TOTAL_SCREENS) {
      haptic.medium()
      setDirection(1)
      setCurrentScreen((s) => s + 1)
    } else {
      await saveAndComplete()
    }
  }, [currentScreen, haptic, saveAndComplete])

  const handleBack = useCallback(() => {
    haptic.light()
    if (currentScreen > 1) {
      setDirection(-1)
      setCurrentScreen((s) => s - 1)
    } else {
      onClose()
    }
  }, [currentScreen, haptic, onClose])

  // Animation variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  const screenProps = {
    formState,
    updateForm,
    onNext: handleNext,
    onBack: handleBack,
  }

  // Get current phase info
  const getCurrentPhaseIndex = () => {
    for (let i = 0; i < PHASES.length; i++) {
      if (PHASES[i].screens.includes(currentScreen)) {
        return i
      }
    }
    return 0
  }

  const currentPhaseIndex = getCurrentPhaseIndex()

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{
              borderColor: 'var(--border-subtle)',
              borderTopColor: 'var(--accent)',
            }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Phase-based progress indicator */}
      <div className="pt-6 pb-4 px-6 safe-area-top">
        <div className="flex justify-center items-center gap-1.5">
          {PHASES.map((phase, index) => {
            const isCompleted = index < currentPhaseIndex
            const phaseScreenCount = phase.screens.length

            return (
              <div key={phase.name} className="flex items-center gap-1.5">
                {/* Phase dots */}
                <div className="flex gap-1">
                  {Array.from({ length: phaseScreenCount }, (_, dotIndex) => {
                    const screenNum = phase.screens[dotIndex]
                    const isDotActive = screenNum === currentScreen
                    const isDotCompleted = screenNum < currentScreen

                    return (
                      <motion.div
                        key={dotIndex}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: isDotActive ? 20 : 6,
                          height: 6,
                          background: isDotActive
                            ? 'var(--accent)'
                            : isDotCompleted
                              ? 'color-mix(in oklab, var(--accent) 60%, transparent)'
                              : 'var(--border-subtle)',
                        }}
                        layout
                      />
                    )
                  })}
                </div>

                {/* Separator between phases */}
                {index < PHASES.length - 1 && (
                  <div
                    className="w-px h-3 mx-0.5"
                    style={{
                      background: isCompleted
                        ? 'color-mix(in oklab, var(--accent) 40%, transparent)'
                        : 'var(--border-subtle)',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Phase label */}
        <motion.p
          key={currentPhaseIndex}
          className="text-xs text-center mt-2"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {PHASES[currentPhaseIndex].name}
        </motion.p>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="max-w-[400px] mx-auto px-6 pb-32">
              {currentScreen === 1 && <IdentityScreen {...screenProps} />}
              {currentScreen === 2 && <AnchorActivityScreen {...screenProps} />}
              {currentScreen === 3 && <AnchorTimeScreen {...screenProps} />}
              {currentScreen === 4 && <CommitmentScreen {...screenProps} />}
              {currentScreen === 5 && <CelebrationScreen {...screenProps} />}
              {currentScreen === 6 && <ObstacleScreen {...screenProps} />}
              {currentScreen === 7 && <AccountabilityScreen {...screenProps} />}
              {currentScreen === 8 && <AppSelectionScreen {...screenProps} />}
              {currentScreen === 9 && <ScheduleConfigScreen {...screenProps} />}
              {currentScreen === 10 && <SafetySettingsScreen {...screenProps} />}
              {currentScreen === 11 && <SummaryScreen {...screenProps} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export type { LockSetupFormState, ScreenProps } from './types'
