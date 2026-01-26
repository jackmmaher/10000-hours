/**
 * Progress - Redesigned stats page
 *
 * Structure (Global → Local → Actionable):
 * 1. Hero: Cumulative hours + session count + Voice score
 * 2. Milestones: Achievement badges + progress to next
 * 3. Practice Shape: Pattern recognition (time, discipline, pose)
 * 4. Commitment: Planned vs actual follow-through
 * 5. Growth: Session duration evolution
 * 6. Suggested Actions: Conditional, actionable insights
 *
 * Design principle: Insights over data dumps
 */

import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSwipe } from '../hooks/useSwipe'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useVoice } from '../hooks/useVoice'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { formatTotalHours } from '../lib/format'
import {
  getAllPlannedSessions,
  getSavedTemplates,
  getAllCourseProgress,
  getInsightsWithContent,
  getUserPreferences,
  updateUserPreferences,
  Session,
  PlannedSession,
  SavedTemplate,
  UserCourseProgress,
  Insight,
  UserPreferences,
} from '../lib/db'
import { GOAL_PRESETS } from '../lib/milestones'
import {
  getPracticeShape,
  getCommitmentStats,
  getGrowthTrajectory,
  getSuggestedActions,
} from '../lib/progressInsights'

// Components
import { AchievementGallery } from './AchievementGallery'
import { InsightCard } from './InsightCard'
import { VoiceBadge } from './VoiceBadge'
import { PracticeShape } from './PracticeShape'
import { CommitmentCard } from './CommitmentCard'
import { GrowthBars } from './GrowthBars'
import { SuggestedForYou } from './SuggestedForYou'
import { SuggestedActions } from './SuggestedActions'
import { VoiceDetailModal } from './VoiceDetailModal'
import { StruggleAlert } from './StruggleAlert'

export function Progress() {
  const { sessions, totalSeconds, justAchievedMilestone, clearMilestoneCelebration } =
    useSessionStore()
  const { setView, openVoiceModal, clearVoiceModalIntent } = useNavigationStore()

  // Clear non-hour milestones (session count, weekly first) silently
  // Hour milestones are handled in AchievementGallery
  useEffect(() => {
    if (justAchievedMilestone && 'type' in justAchievedMilestone) {
      // This is a session or weekly milestone, not an hour milestone
      // Clear it silently - the notification system handles these separately
      clearMilestoneCelebration()
    }
  }, [justAchievedMilestone, clearMilestoneCelebration])
  const { voice } = useVoice()
  const haptic = useTapFeedback()

  // Load additional data from IndexedDB
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([])
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([])
  const [courseProgress, setCourseProgress] = useState<UserCourseProgress[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [showGoalSettings, setShowGoalSettings] = useState(false)

  // Handle navigation intent to open Voice modal (e.g., from Header)
  // Uses a ref to track intent so it persists across voice loading
  const shouldOpenVoiceModalRef = React.useRef(false)

  useEffect(() => {
    if (openVoiceModal) {
      shouldOpenVoiceModalRef.current = true
      clearVoiceModalIntent()
    }
  }, [openVoiceModal, clearVoiceModalIntent])

  useEffect(() => {
    if (shouldOpenVoiceModalRef.current && voice) {
      setShowVoiceModal(true)
      shouldOpenVoiceModalRef.current = false
    }
  }, [voice])

  useEffect(() => {
    async function loadData() {
      try {
        const [plans, templates, courses, insightData, prefs] = await Promise.all([
          getAllPlannedSessions(),
          getSavedTemplates(),
          getAllCourseProgress(),
          getInsightsWithContent(),
          getUserPreferences(),
        ])
        setPlannedSessions(plans)
        setSavedTemplates(templates)
        setCourseProgress(courses)
        setInsights(insightData)
        setPreferences(prefs)
      } catch (err) {
        console.error('Failed to load progress data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [sessions]) // Reload when sessions change

  // All-time session count
  const sessionCount = sessions.length

  // Calculate current hours for goal setting UI
  const currentHours = totalSeconds / 3600

  // Handle practice goal change
  const handleGoalChange = async (goal: number | undefined) => {
    haptic.light()
    await updateUserPreferences({ practiceGoalHours: goal })
    setPreferences((prev) => (prev ? { ...prev, practiceGoalHours: goal } : null))
  }

  // Compute insights
  const practiceShape = useMemo(() => getPracticeShape(sessions), [sessions])

  const commitmentStats = useMemo(
    () => getCommitmentStats(sessions, plannedSessions),
    [sessions, plannedSessions]
  )

  const growthTrajectory = useMemo(() => getGrowthTrajectory(sessions), [sessions])

  const suggestedActions = useMemo(
    () => getSuggestedActions(sessions, plannedSessions, savedTemplates, courseProgress, insights),
    [sessions, plannedSessions, savedTemplates, courseProgress, insights]
  )

  // Reference to scroll container
  const scrollRef = useRef<HTMLDivElement>(null)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => {
      // Reload data
      const [plans, templates, courses, insightData, prefs] = await Promise.all([
        getAllPlannedSessions(),
        getSavedTemplates(),
        getAllCourseProgress(),
        getInsightsWithContent(),
        getUserPreferences(),
      ])
      setPlannedSessions(plans)
      setSavedTemplates(templates)
      setCourseProgress(courses)
      setInsights(insightData)
      setPreferences(prefs)
    },
  })

  // Swipe navigation
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setView('timer')
      }
    },
    onSwipeLeft: () => setView('profile'),
    onSwipeRight: () => setView('explore'),
  })

  return (
    <div
      ref={scrollRef}
      className="h-full bg-cream overflow-y-auto pt-16 pb-24"
      {...navSwipeHandlers}
      onTouchStart={(e) => {
        pullHandlers.onTouchStart(e)
        navSwipeHandlers.onTouchStart?.(e)
      }}
      onTouchMove={pullHandlers.onTouchMove}
      onTouchEnd={(e) => {
        pullHandlers.onTouchEnd()
        navSwipeHandlers.onTouchEnd?.(e)
      }}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center overflow-hidden transition-all duration-200"
        style={{
          height: isPulling || isRefreshing ? Math.min(pullDistance, 80) : 0,
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 py-2">
          {isRefreshing ? (
            <div className="w-5 h-5 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 text-moss transition-transform duration-200"
              style={{ transform: pullDistance >= 80 ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          <span className="text-sm text-moss">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= 80
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </span>
        </div>
      </div>

      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* ============================================ */}
        {/* SECTION 1: Hero - Cumulative achievement */}
        {/* ============================================ */}
        <div className="mb-8 text-center">
          <p className="font-serif text-display-sm text-indigo-deep tabular-nums">
            {formatTotalHours(totalSeconds)}
          </p>
          <p className="text-sm text-ink/40 mt-1">
            {sessionCount} session{sessionCount !== 1 ? 's' : ''}
          </p>

          {/* Voice score display - glassmorphic CTA */}
          {voice && (
            <button
              onClick={() => {
                haptic.light()
                setShowVoiceModal(true)
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
                bg-elevated/90 shadow-sm
                hover:shadow-md transition-all active:scale-[0.98] touch-manipulation"
            >
              <VoiceBadge score={voice.total} showScore />
              <span className="text-xs text-ink/40">Voice</span>
              <svg
                className="w-3 h-3 text-ink/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 2: Milestones */}
        {/* ============================================ */}
        <AchievementGallery />

        {/* ============================================ */}
        {/* SECTION 2.5: Practice Goal - Moved from Profile */}
        {/* ============================================ */}
        <div className="mb-6">
          <button
            onClick={() => {
              haptic.light()
              setShowGoalSettings(!showGoalSettings)
            }}
            className="w-full flex items-center justify-between p-4 bg-elevated shadow-sm
              rounded-xl hover:shadow-md transition-all touch-manipulation cursor-pointer"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-ink">Practice Goal</p>
              <p className="text-xs text-ink/40 mt-0.5">
                {preferences?.practiceGoalHours
                  ? `${preferences.practiceGoalHours} hours`
                  : 'No limit — milestones continue forever'}
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-ink/30 transition-transform ${showGoalSettings ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showGoalSettings && (
            <div className="mt-3 p-4 bg-cream-warm rounded-xl space-y-4">
              {/* Current progress indicator */}
              <p className="text-xs text-center text-ink/50">
                Your practice: {Math.floor(currentHours)} hours
              </p>

              {/* No limit option */}
              <button
                onClick={() => handleGoalChange(undefined)}
                className={`w-full p-3 rounded-lg text-left transition-colors touch-manipulation cursor-pointer ${
                  !preferences?.practiceGoalHours
                    ? 'bg-moss text-cream'
                    : 'bg-cream text-ink/60 hover:bg-cream-deep'
                }`}
              >
                <p className="text-sm font-medium">No limit</p>
                <p className="text-xs mt-0.5 opacity-70">
                  Milestones appear as you progress, forever
                </p>
              </button>

              {/* Goal presets */}
              <div>
                <p className="text-xs text-ink/40 mb-2">Set a destination</p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_PRESETS.map((goal) => {
                    const isSelected = preferences?.practiceGoalHours === goal
                    const isAchieved = goal <= currentHours
                    const isDisabled = isAchieved && !isSelected

                    return (
                      <button
                        key={goal}
                        onClick={() => !isDisabled && handleGoalChange(goal)}
                        disabled={isDisabled}
                        aria-label={`Set goal to ${goal} hours${isAchieved ? ' (already achieved)' : ''}`}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation ${
                          isSelected
                            ? 'bg-moss text-cream'
                            : isDisabled
                              ? 'bg-cream-deep/50 text-ink/30 cursor-not-allowed'
                              : 'bg-cream text-ink/60 hover:bg-cream-deep cursor-pointer'
                        }`}
                        style={{ opacity: isDisabled ? 0.5 : 1 }}
                      >
                        {goal.toLocaleString()}h{isAchieved && !isSelected && ' ✓'}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Explainer text */}
              <p className="text-xs text-center text-ink/40">
                Setting a destination helps celebrate your progress. When you arrive, you can extend
                further.
              </p>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 3: Generated insight message */}
        {/* ============================================ */}
        <InsightCard sessions={sessions} />

        {/* Loading state for additional data */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ============================================ */}
            {/* SECTION 4: Practice Shape */}
            {/* ============================================ */}
            <PracticeShape shape={practiceShape} />

            {/* ============================================ */}
            {/* SECTION 4.5: Struggle Detection */}
            {/* Shows when user might be having difficulty */}
            {/* ============================================ */}
            <StruggleAlert />

            {/* ============================================ */}
            {/* SECTION 5: Commitment */}
            {/* ============================================ */}
            <CommitmentCard stats={commitmentStats} totalSessions={sessionCount} />

            {/* ============================================ */}
            {/* SECTION 6: Growth Trajectory */}
            {/* ============================================ */}
            <GrowthBars trajectory={growthTrajectory} totalSessions={sessionCount} />

            {/* ============================================ */}
            {/* SECTION 7: Suggested For You */}
            {/* Weekly personalized recommendation */}
            {/* ============================================ */}
            <SuggestedForYou />

            {/* ============================================ */}
            {/* SECTION 8: Suggested Actions */}
            {/* ============================================ */}
            <SuggestedActions actions={suggestedActions} />
          </>
        )}

        {/* ============================================ */}
        {/* SECTION 8: All Time Summary (minimal) */}
        {/* ============================================ */}
        {sessionCount > 0 && <AllTimeSummary sessions={sessions} />}
      </div>

      {/* Voice detail modal */}
      {showVoiceModal && voice && (
        <VoiceDetailModal voice={voice} onClose={() => setShowVoiceModal(false)} />
      )}
    </div>
  )
}

/**
 * Minimal all-time summary - just the essentials
 */
function AllTimeSummary({ sessions }: { sessions: Session[] }) {
  const firstSessionDate =
    sessions.length > 0 ? new Date(Math.min(...sessions.map((s) => s.startTime))) : null

  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const avgMinutes = sessions.length > 0 ? Math.round(totalSeconds / sessions.length / 60) : 0

  const longestSeconds =
    sessions.length > 0 ? Math.max(...sessions.map((s) => s.durationSeconds)) : 0
  const longestMinutes = Math.round(longestSeconds / 60)

  if (!firstSessionDate) return null

  return (
    <div className="pt-8 border-t border-ink/5">
      <p className="font-serif text-sm text-ink/30 tracking-wide mb-4">All Time</p>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg text-ink tabular-nums">{sessions.length}</p>
          <p className="text-xs text-ink/40">sessions</p>
        </div>
        <div>
          <p className="text-lg text-ink tabular-nums">{avgMinutes}m</p>
          <p className="text-xs text-ink/40">avg session</p>
        </div>
        <div>
          <p className="text-lg text-ink tabular-nums">{longestMinutes}m</p>
          <p className="text-xs text-ink/40">longest</p>
        </div>
      </div>

      <p className="text-xs text-ink/30 text-center mt-4">
        Since {firstSessionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>
    </div>
  )
}
