/**
 * CommitmentSetupFlow - 12-screen guided setup for Commitment Mode
 *
 * Casino-style habit formation with financial stakes via the hour bank.
 *
 * Phase 1: WHO (1 screen) - Identity framing
 *   1. IdentityScreen
 *
 * Phase 2: WHEN (3 screens) - Schedule & timing
 *   2. AnchorActivityScreen
 *   3. ScheduleTypeScreen
 *   4. WindowScreen
 *
 * Phase 3: WHAT (2 screens) - Commitment parameters
 *   5. MinSessionScreen
 *   6. CommitmentDurationScreen
 *
 * Phase 4: HOW (2 screens) - Obstacles & support
 *   7. ObstacleScreen
 *   8. AccountabilityScreen
 *
 * Phase 5: SAFETY (2 screens) - Forgiveness & stakes
 *   9. GracePeriodScreen
 *   10. StakesScreen
 *
 * Phase 6: RITUAL (1 screen) - Celebration
 *   11. CelebrationScreen
 *
 * Phase 7: LAUNCH (1 screen) - Summary & activation
 *   12. ReviewScreen
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../../hooks/useTapFeedback'
import { getCommitmentSettings, updateCommitmentSettings } from '../../lib/db/commitmentSettings'
import { generateCommitmentSeed } from '../../lib/commitment'
import { CommitmentSetupFormState, initialFormState } from './types'

// Screen components
import { IdentityScreen } from './screens/IdentityScreen'
import { AnchorActivityScreen } from './screens/AnchorActivityScreen'
import { ScheduleTypeScreen } from './screens/ScheduleTypeScreen'
import { WindowScreen } from './screens/WindowScreen'
import { MinSessionScreen } from './screens/MinSessionScreen'
import { CommitmentDurationScreen } from './screens/CommitmentDurationScreen'
import { ObstacleScreen } from './screens/ObstacleScreen'
import { AccountabilityScreen } from './screens/AccountabilityScreen'
import { GracePeriodScreen } from './screens/GracePeriodScreen'
import { StakesScreen } from './screens/StakesScreen'
import { CelebrationScreen } from './screens/CelebrationScreen'
import { ReviewScreen } from './screens/ReviewScreen'

interface CommitmentSetupFlowProps {
  onComplete: () => void
  onClose: () => void
}

const TOTAL_SCREENS = 12
const STORAGE_KEY = 'commitmentSetupDraft'

// Phase definitions for progress indicator
const PHASES = [
  { name: 'Identity', screens: [1] },
  { name: 'Schedule', screens: [2, 3, 4] },
  { name: 'Commitment', screens: [5, 6] },
  { name: 'Obstacles', screens: [7, 8] },
  { name: 'Safety', screens: [9, 10] },
  { name: 'Ritual', screens: [11] },
  { name: 'Launch', screens: [12] },
]

export function CommitmentSetupFlow({ onComplete, onClose }: CommitmentSetupFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [formState, setFormState] = useState<CommitmentSetupFormState>(initialFormState)
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

        // Otherwise load from database (if editing existing commitment)
        const settings = await getCommitmentSettings()

        if (settings.isActive) {
          // Load existing commitment settings
          setFormState({
            identityStatement: '',
            whyItMatters: '',
            anchorRoutine: '',
            anchorLocation: '',
            scheduleType: settings.scheduleType,
            customDays: settings.customDays || [false, true, true, true, true, true, false],
            flexibleTarget: settings.flexibleTarget || 5,
            windowType: settings.windowType,
            windowStartHour: settings.windowStartHour || 5,
            windowStartMinute: settings.windowStartMinute || 0,
            windowEndHour: settings.windowEndHour || 12,
            windowEndMinute: settings.windowEndMinute || 0,
            minimumSessionMinutes: settings.minimumSessionMinutes,
            minimumFallbackMinutes: 2,
            commitmentDuration: settings.commitmentDuration,
            selectedObstacles: [],
            obstacles: [],
            accountabilityEnabled: false,
            accountabilityPhone: '',
            accountabilityMethod: 'sms',
            notifyOnCompletion: true,
            notifyOnSkip: false,
            gracePeriodCount: settings.gracePeriodCount,
            stakesAcknowledged: false,
            celebrationRitual: '',
            endBehavior: settings.endBehavior,
            activationDate: 0,
          })
        }
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

  const updateForm = useCallback((updates: Partial<CommitmentSetupFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Save all form data to database and complete setup
  const saveAndComplete = useCallback(async () => {
    haptic.success()

    // Calculate dates
    const startDate = formState.activationDate || Date.now()
    const endDate = startDate + formState.commitmentDuration * 24 * 60 * 60 * 1000

    // Calculate grace periods based on duration
    const gracePeriods = Math.floor(formState.commitmentDuration / 30) * 3

    await updateCommitmentSettings({
      isActive: true,
      commitmentStartDate: startDate,
      commitmentEndDate: endDate,
      commitmentDuration: formState.commitmentDuration,

      // Schedule
      scheduleType: formState.scheduleType,
      customDays: formState.scheduleType === 'custom' ? formState.customDays : undefined,
      flexibleTarget: formState.scheduleType === 'flexible' ? formState.flexibleTarget : undefined,
      windowType: formState.windowType,
      windowStartHour: formState.windowType === 'specific' ? formState.windowStartHour : undefined,
      windowStartMinute:
        formState.windowType === 'specific' ? formState.windowStartMinute : undefined,
      windowEndHour: formState.windowType === 'specific' ? formState.windowEndHour : undefined,
      windowEndMinute: formState.windowType === 'specific' ? formState.windowEndMinute : undefined,
      minimumSessionMinutes: formState.minimumSessionMinutes,

      // Forgiveness
      gracePeriodCount: gracePeriods,
      gracePeriodUsed: 0,

      // End behavior
      endBehavior: formState.endBehavior,

      // RNG
      rngSeed: generateCommitmentSeed(startDate),
      rngSequenceIndex: 0,

      // Reset analytics
      totalSessionsCompleted: 0,
      totalSessionsMissed: 0,
      totalBonusMinutesEarned: 0,
      totalPenaltyMinutesDeducted: 0,
      lastSessionDate: null,
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
              {currentScreen === 3 && <ScheduleTypeScreen {...screenProps} />}
              {currentScreen === 4 && <WindowScreen {...screenProps} />}
              {currentScreen === 5 && <MinSessionScreen {...screenProps} />}
              {currentScreen === 6 && <CommitmentDurationScreen {...screenProps} />}
              {currentScreen === 7 && <ObstacleScreen {...screenProps} />}
              {currentScreen === 8 && <AccountabilityScreen {...screenProps} />}
              {currentScreen === 9 && <GracePeriodScreen {...screenProps} />}
              {currentScreen === 10 && <StakesScreen {...screenProps} />}
              {currentScreen === 11 && <CelebrationScreen {...screenProps} />}
              {currentScreen === 12 && <ReviewScreen {...screenProps} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export type { CommitmentSetupFormState, ScreenProps } from './types'
