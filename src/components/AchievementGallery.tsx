/**
 * AchievementGallery - Displays all achieved milestones with memory
 *
 * All users see full achievement history with dates.
 * Design principle: "Gold star on copybook" - earned achievements are always visible
 * Tap a milestone to see detailed stats and sessions that earned it.
 */

import { useMemo, useEffect, useState, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { getAchievements, Achievement, getUserPreferences } from '../lib/db'
import { generateMilestones } from '../lib/milestones'
import { getAdaptiveMilestone } from '../lib/calculations'
import { formatShortDate } from '../lib/format'
import { MilestoneSummary } from './MilestoneSummary'
import { MilestoneProgress } from './MilestoneProgress'
import { useTapFeedback } from '../hooks/useTapFeedback'

// Format milestone label (e.g., "2h", "100h", "1,000h")
function formatMilestoneLabel(hours: number): string {
  return `${hours.toLocaleString()}h`
}

export function AchievementGallery() {
  const { sessions, totalSeconds, justAchievedMilestone, clearMilestoneCelebration } =
    useSessionStore()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showCurrentProgress, setShowCurrentProgress] = useState(false)
  const [userGoalHours, setUserGoalHours] = useState<number | undefined>()
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()
  const hasPlayedMilestoneSound = useRef(false)

  // Check if there's a newly achieved hour milestone to highlight
  const newlyAchievedHours = useMemo(() => {
    if (!justAchievedMilestone) return null
    // Only highlight hour milestones (Achievement type has 'hours' property but no 'type')
    if ('hours' in justAchievedMilestone && !('type' in justAchievedMilestone)) {
      return justAchievedMilestone.hours
    }
    return null
  }, [justAchievedMilestone])

  // Play milestone sound and auto-open modal when user navigates to Progress tab with new milestone
  useEffect(() => {
    if (newlyAchievedHours && !isLoading && !hasPlayedMilestoneSound.current) {
      hasPlayedMilestoneSound.current = true
      audio.milestone()
      // Auto-select the newly achieved milestone to show the modal
      const newAchievement = achievements.find((a) => a.hours === newlyAchievedHours)
      if (newAchievement) {
        setSelectedAchievement(newAchievement)
      }
    }
  }, [newlyAchievedHours, isLoading, achievements, audio])

  // Reset the sound flag when milestone is cleared
  useEffect(() => {
    if (!justAchievedMilestone) {
      hasPlayedMilestoneSound.current = false
    }
  }, [justAchievedMilestone])

  // Load achievements and user goal from database
  useEffect(() => {
    async function loadData() {
      const [loaded, prefs] = await Promise.all([getAchievements(), getUserPreferences()])
      setAchievements(loaded)
      setUserGoalHours(prefs?.practiceGoalHours)
      setIsLoading(false)
    }
    loadData()
  }, [totalSeconds])

  // Get current milestone progress with user's goal
  const milestone = useMemo(
    () => getAdaptiveMilestone(sessions, userGoalHours),
    [sessions, userGoalHours]
  )

  const currentHours = totalSeconds / 3600

  // Get milestones to display (achieved + next) using user's goal
  const displayMilestones = useMemo(() => {
    const milestones = generateMilestones(userGoalHours)
    const achieved = achievements.slice(-4) // Last 4 achieved
    const nextIndex = milestones.findIndex((m) => m > currentHours)
    const nextMilestone = nextIndex >= 0 ? milestones[nextIndex] : null
    return { achieved, nextMilestone, nextIndex }
  }, [achievements, currentHours, userGoalHours])

  if (isLoading) {
    return null
  }

  // If no achievements and no progress, show nothing
  if (achievements.length === 0 && currentHours < 1) {
    return null
  }

  return (
    <div className="mb-10">
      <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Milestones</p>

      {/* Achievement badges row */}
      <div className="flex items-end gap-4 overflow-x-auto pb-2">
        {displayMilestones.achieved.map((achievement) => {
          const isNewlyAchieved = achievement.hours === newlyAchievedHours
          return (
            <button
              key={achievement.hours}
              onClick={() => {
                haptic.light()
                setSelectedAchievement(achievement)
              }}
              className={`
                flex flex-col items-center min-w-[48px] active:scale-95 transition-transform touch-manipulation
                ${isNewlyAchieved ? 'animate-pulse' : ''}
              `}
            >
              {/* Badge */}
              <div
                className={`
                  w-10 h-10 rounded-full bg-indigo-deep flex items-center justify-center mb-1
                  hover:bg-indigo-deep/90 transition-colors
                  ${isNewlyAchieved ? 'ring-2 ring-moss ring-offset-2 ring-offset-cream' : ''}
                `}
              >
                <span className="text-xs font-medium text-cream">
                  {formatMilestoneLabel(achievement.hours)}
                </span>
              </div>

              {/* Date */}
              <span
                className={`text-[10px] whitespace-nowrap ${isNewlyAchieved ? 'text-moss font-medium' : 'text-indigo-deep/50'}`}
              >
                {isNewlyAchieved ? 'Just now!' : formatShortDate(new Date(achievement.achievedAt))}
              </span>
            </button>
          )
        })}

        {/* Next milestone (in progress) - clickable */}
        {displayMilestones.nextMilestone && (
          <button
            onClick={() => {
              haptic.light()
              setShowCurrentProgress(true)
            }}
            className="flex flex-col items-center min-w-[48px] active:scale-95 transition-transform touch-manipulation"
          >
            {/* Progress ring */}
            <div className="relative w-10 h-10 mb-1">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-indigo-deep/10"
                />
                {/* Progress arc */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(milestone.progressPercent / 100) * 100.5} 100.5`}
                  className="text-moss/60"
                />
              </svg>
              {/* Label */}
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-indigo-deep/50">
                {formatMilestoneLabel(displayMilestones.nextMilestone)}
              </span>
            </div>

            {/* Progress text */}
            <span className="text-[10px] text-moss/70 whitespace-nowrap">
              {Math.round(milestone.progressPercent)}%
            </span>
          </button>
        )}
      </div>

      {/* Progress River - organic, flowing progress */}
      {displayMilestones.nextMilestone && (
        <div className="mt-5">
          <div className="flex justify-between text-[10px] text-ink/40 mb-2">
            <span className="tabular-nums">{milestone.currentFormatted}</span>
            <span className="tabular-nums">{milestone.targetFormatted}</span>
          </div>
          {/* The River - organic rounded bar with gradient flow */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-cream-deep">
            {/* Main progress fill with bark-to-moss gradient */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${milestone.progressPercent}%`,
                background: 'linear-gradient(90deg, #A08060 0%, #87A878 100%)',
              }}
            />
            {/* Subtle shimmer overlay for life */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                animation: 'riverShimmer 3s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* Milestone detail modal */}
      {selectedAchievement && (
        <MilestoneSummary
          achievement={selectedAchievement}
          previousAchievement={
            achievements.find((_, i) => achievements[i + 1]?.hours === selectedAchievement.hours) ||
            null
          }
          sessions={sessions}
          onClose={() => {
            // Clear the "just achieved" state when closing the modal
            if (selectedAchievement.hours === newlyAchievedHours) {
              clearMilestoneCelebration()
            }
            setSelectedAchievement(null)
          }}
          isNewlyAchieved={selectedAchievement.hours === newlyAchievedHours}
        />
      )}

      {/* Current milestone progress modal */}
      {showCurrentProgress && displayMilestones.nextMilestone && (
        <MilestoneProgress
          currentHours={currentHours}
          targetHours={displayMilestones.nextMilestone}
          previousHours={achievements.length > 0 ? achievements[achievements.length - 1].hours : 0}
          progressPercent={milestone.progressPercent}
          sessions={sessions}
          onClose={() => setShowCurrentProgress(false)}
        />
      )}
    </div>
  )
}
