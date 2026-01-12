# Post-Meditation Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace jarring post-meditation experience with calm transition to Journey tab, stats animation, and unified insight capture modal with Skip/Remind/Capture options.

**Architecture:** Session ends -> calm fade -> auto-navigate to Journey tab -> stats animate -> insight modal appears after 1.5s delay. "Remind me later" creates persistent in-app notification linked to session. Notification tap navigates to Journey with that session expanded for insight capture.

**Tech Stack:** React, Zustand stores, IndexedDB (Dexie), TypeScript

---

## Task 1: Add `insight_reminder` Notification Type

**Files:**

- Modify: `src/lib/notifications.ts:17`

**Step 1: Update NotificationType union**

```typescript
export type NotificationType =
  | 'attribution'
  | 'milestone'
  | 'gentle_reminder'
  | 'content_reported'
  | 'insight_reminder'
```

**Step 2: Extend InAppNotification metadata interface**

In `src/lib/notifications.ts`, update the metadata interface (around line 29):

```typescript
  metadata?: {
    contentId?: string      // Pearl or template ID
    helpedCount?: number    // How many people it helped
    timeframe?: string      // "this week", "today"
    sessionId?: string      // For insight_reminder - links to session
  }
```

**Step 3: Commit**

```bash
git add src/lib/notifications.ts
git commit -m "feat: add insight_reminder notification type with sessionId metadata"
```

---

## Task 2: Update NotificationCenter for Insight Reminders

**Files:**

- Modify: `src/components/NotificationCenter.tsx:23-34`

**Step 1: Add icon and color for insight_reminder**

Update `NOTIFICATION_ICONS` (line 23):

```typescript
const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  attribution: '\u{1F49D}', // Heart with ribbon for "your content helped"
  milestone: '\u{2728}', // Sparkles for achievement
  gentle_reminder: '\u{1F9D8}', // Person meditating for reminder
  content_reported: '\u{1F4CB}', // Clipboard for content review
  insight_reminder: '\u{1F4AD}', // Thought balloon for insight
}
```

Update `NOTIFICATION_COLORS` (line 30):

```typescript
const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  attribution: 'bg-pink-500/10',
  milestone: 'bg-amber-500/10',
  gentle_reminder: 'bg-blue-500/10',
  content_reported: 'bg-orange-500/10',
  insight_reminder: 'bg-indigo-500/10',
}
```

**Step 2: Make NotificationItem clickable for insight_reminder**

The NotificationCenter needs to handle clicks on insight_reminder notifications. Add an `onAction` prop to `NotificationCenterProps` and pass it through:

In `NotificationCenter.tsx`, update the props interface (around line 18):

```typescript
interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onInsightReminderClick?: (sessionId: string) => void
}
```

Update the component signature and pass down:

```typescript
export function NotificationCenter({ isOpen, onClose, onInsightReminderClick }: NotificationCenterProps) {
```

Update `NotificationItem` call (around line 115-120):

```typescript
<NotificationItem
  key={notification.id}
  notification={notification}
  onDismiss={() => handleDismiss(notification.id)}
  onClick={
    notification.type === 'insight_reminder' && notification.metadata?.sessionId
      ? () => {
          onInsightReminderClick?.(notification.metadata!.sessionId!)
          handleDismiss(notification.id)
          onClose()
        }
      : undefined
  }
/>
```

Update `NotificationItemProps` interface (around line 132):

```typescript
interface NotificationItemProps {
  notification: InAppNotification
  onDismiss: () => void
  onClick?: () => void
}
```

Update `NotificationItem` to be clickable (around line 137):

```typescript
function NotificationItem({ notification, onDismiss, onClick }: NotificationItemProps) {
  const icon = NOTIFICATION_ICONS[notification.type]
  const bgColor = NOTIFICATION_COLORS[notification.type]

  // ... formatRelativeTime stays the same ...

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      className={`flex items-start gap-3 p-4 rounded-xl ${bgColor} ${onClick ? 'w-full text-left cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      {/* ... rest of component unchanged ... */}
    </Wrapper>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/NotificationCenter.tsx
git commit -m "feat: add insight_reminder display and click handling in NotificationCenter"
```

---

## Task 3: Update Navigation Store for Post-Session Flow

**Files:**

- Modify: `src/stores/useNavigationStore.ts`

**Step 1: Add post-session navigation state**

Replace the entire file:

```typescript
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
  // Post-session insight capture flow
  pendingInsightSessionId: string | null // Session awaiting insight capture
  showInsightModal: boolean // Whether to show insight modal
  pendingInsightSessionDuration: number | null // Duration for body awareness prompt
  pendingMilestone: string | null // Milestone message to show in modal header
  // Actions
  setView: (view: AppView) => void
  setViewWithVoiceModal: () => void
  clearVoiceModalIntent: () => void
  // Post-session actions
  triggerPostSessionFlow: (sessionId: string, duration: number, milestone?: string) => void
  showInsightCaptureModal: () => void
  hideInsightCaptureModal: () => void
  clearPostSessionState: () => void
  // For notification deep-link
  navigateToInsightCapture: (sessionId: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: 'timer',
  openVoiceModal: false,
  pendingInsightSessionId: null,
  showInsightModal: false,
  pendingInsightSessionDuration: null,
  pendingMilestone: null,

  setView: (view) => set({ view }),
  setViewWithVoiceModal: () => set({ view: 'progress', openVoiceModal: true }),
  clearVoiceModalIntent: () => set({ openVoiceModal: false }),

  // Called after session ends - navigate to Journey with pending insight
  triggerPostSessionFlow: (sessionId, duration, milestone) =>
    set({
      view: 'journey',
      pendingInsightSessionId: sessionId,
      pendingInsightSessionDuration: duration,
      pendingMilestone: milestone || null,
      showInsightModal: false, // Will be shown after delay
    }),

  // Called after stats animation settles
  showInsightCaptureModal: () => set({ showInsightModal: true }),

  hideInsightCaptureModal: () => set({ showInsightModal: false }),

  clearPostSessionState: () =>
    set({
      pendingInsightSessionId: null,
      pendingInsightSessionDuration: null,
      pendingMilestone: null,
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
}))
```

**Step 2: Commit**

```bash
git add src/stores/useNavigationStore.ts
git commit -m "feat: add post-session navigation state and insight modal triggers"
```

---

## Task 4: Update Session Store - Remove Insight Phase

**Files:**

- Modify: `src/stores/useSessionStore.ts`

**Step 1: Remove 'capture' from TimerPhase type (line 11)**

```typescript
type TimerPhase = 'idle' | 'preparing' | 'running' | 'complete' | 'enlightenment'
```

**Step 2: Remove startInsightCapture and skipInsightCapture actions**

Remove from interface (lines 46-47):

```typescript
// Remove these two lines:
// startInsightCapture: () => void
// skipInsightCapture: () => void
```

Add new action for creating insight reminder:

```typescript
  createInsightReminder: (sessionId: string) => Promise<void>
  completeSession: () => void  // New - clean transition to idle
```

**Step 3: Remove the action implementations (lines 253-264)**

Delete these:

```typescript
// Delete startInsightCapture and skipInsightCapture
```

**Step 4: Add new implementations**

```typescript
  createInsightReminder: async (sessionId: string) => {
    try {
      const notification: InAppNotification = {
        id: crypto.randomUUID(),
        type: 'insight_reminder',
        title: 'Capture your insight',
        body: 'You have a moment waiting to be remembered',
        createdAt: Date.now(),
        metadata: { sessionId }
      }
      await addNotification(notification)
    } catch (err) {
      console.warn('Failed to create insight reminder:', err)
    }
  },

  completeSession: () => {
    set({
      timerPhase: 'idle',
      lastSessionDuration: null,
      lastSessionUuid: null,
      justAchievedMilestone: null
    })
  }
```

**Step 5: Update imports at top of file**

Make sure `InAppNotification` is imported:

```typescript
import { InAppNotification } from '../lib/notifications'
```

**Step 6: Commit**

```bash
git add src/stores/useSessionStore.ts
git commit -m "refactor: remove capture phase, add insight reminder and completeSession actions"
```

---

## Task 5: Create InsightModal Component

**Files:**

- Create: `src/components/InsightModal.tsx`

**Step 1: Create the new modal component**

```typescript
/**
 * InsightModal - Post-meditation insight capture modal
 *
 * Unified modal that appears after session ends and stats animate.
 * Offers three choices: Skip, Remind me later, Capture.
 *
 * States:
 * - prompt: Shows body awareness + three buttons
 * - capture: Voice recording in progress
 * - complete: Saving/done (brief)
 */

import { useState, useCallback, useEffect } from 'react'
import { useVoiceCapture } from '../hooks/useVoiceCapture'
import { useAudioLevel } from '../hooks/useAudioLevel'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { addInsight } from '../lib/db'
import { formatDuration } from '../lib/format'

interface InsightModalProps {
  sessionId: string
  sessionDuration?: number | null
  milestoneMessage?: string | null
  onComplete: () => void
  onSkip: () => void
  onRemindLater: () => void
}

// Body awareness prompts - gentle, non-demanding
const BODY_AWARENESS_PROMPTS = [
  'Notice how your body feels right now.',
  'Take a moment to feel your breath.',
  'Observe any sensations in your body.',
  'Notice where you hold tension.',
  'Feel the weight of your body.',
  'Sense the space around you.'
]

// Stretch suggestions for long sessions (30+ minutes)
const STRETCH_SUGGESTIONS = [
  'Consider a gentle neck roll.',
  'Perhaps stretch your shoulders.',
  'Maybe stand and stretch your legs.',
  'A slow, mindful stretch may feel good.'
]

type ModalState = 'prompt' | 'capture' | 'saving'

// Claude-style horizontal waveform visualizer
function AudioWaveform({ level }: { level: number }) {
  const barCount = 32

  return (
    <div className="flex items-center justify-center gap-0.5 h-12 w-64">
      {Array.from({ length: barCount }).map((_, i) => {
        const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2)
        const sensitivity = 1 - centerDistance * 0.5
        const minHeight = 12
        const maxHeight = 100
        const height = minHeight + (level * sensitivity * (maxHeight - minHeight))

        return (
          <div
            key={i}
            className="w-1 rounded-full transition-all duration-75"
            style={{
              height: `${height}%`,
              opacity: 0.6 + (level * sensitivity * 0.4),
              background: 'var(--accent)',
            }}
          />
        )
      })}
    </div>
  )
}

export function InsightModal({
  sessionId,
  sessionDuration,
  milestoneMessage,
  onComplete,
  onSkip,
  onRemindLater
}: InsightModalProps) {
  const [modalState, setModalState] = useState<ModalState>('prompt')
  const [bodyAwarenessPrompt] = useState(() => {
    const isLongSession = sessionDuration && sessionDuration >= 1800
    const prompts = isLongSession
      ? [...BODY_AWARENESS_PROMPTS, ...STRETCH_SUGGESTIONS]
      : BODY_AWARENESS_PROMPTS
    return prompts[Math.floor(Math.random() * prompts.length)]
  })

  const {
    state,
    error,
    displayText,
    durationMs,
    isSupported,
    isRecording,
    mediaStream,
    startCapture,
    stopCapture,
    cancelCapture
  } = useVoiceCapture()

  const { audioLevel, startAnalyzing, stopAnalyzing } = useAudioLevel()
  const haptic = useTapFeedback()

  // Start audio analysis when recording
  useEffect(() => {
    if (isRecording && mediaStream) {
      startAnalyzing(mediaStream)
    }
  }, [isRecording, mediaStream, startAnalyzing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzing()
    }
  }, [stopAnalyzing])

  // Handle capture button click
  const handleStartCapture = useCallback(() => {
    haptic.medium()
    setModalState('capture')
    startCapture()
  }, [haptic, startCapture])

  // Handle done - save and close
  const handleDone = useCallback(async () => {
    if (!isRecording) return

    haptic.success()
    stopAnalyzing()
    setModalState('saving')

    try {
      const result = await stopCapture()
      const textToSave = result?.transcript?.trim() || displayText?.trim() || '[Voice note captured]'

      await addInsight({
        sessionId: sessionId,
        rawText: textToSave
      })

      onComplete()
    } catch (err) {
      console.error('Failed to save insight:', err)
      onComplete()
    }
  }, [isRecording, stopCapture, sessionId, displayText, stopAnalyzing, haptic, onComplete])

  // Handle skip
  const handleSkip = useCallback(() => {
    haptic.light()
    stopAnalyzing()
    if (isRecording) {
      cancelCapture()
    }
    onSkip()
  }, [haptic, stopAnalyzing, isRecording, cancelCapture, onSkip])

  // Handle remind later
  const handleRemindLater = useCallback(() => {
    haptic.light()
    onRemindLater()
  }, [haptic, onRemindLater])

  // Block swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  // Voice not supported - show simplified modal
  if (!isSupported) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm"
        onClick={handleSkip}
        onTouchStart={handleTouchEvent}
        onTouchMove={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
      >
        <div
          className="bg-cream rounded-t-3xl w-full max-w-lg p-6 pb-safe shadow-xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-serif text-lg text-ink text-center mb-2">
            Voice capture not supported
          </p>
          <p className="text-sm text-ink/50 text-center mb-6">
            Try Chrome or Safari for voice notes
          </p>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-ink/60 hover:text-ink transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (modalState === 'capture' && state === 'error' && error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm"
        onClick={handleSkip}
        onTouchStart={handleTouchEvent}
        onTouchMove={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
      >
        <div
          className="bg-cream rounded-t-3xl w-full max-w-lg p-6 pb-safe shadow-xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-serif text-lg text-ink text-center mb-2">
            Couldn't access microphone
          </p>
          <p className="text-sm text-ink/50 text-center mb-6">
            {error}
          </p>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-ink/60 hover:text-ink transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm"
      onClick={handleSkip}
      onTouchStart={handleTouchEvent}
      onTouchMove={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
    >
      <div
        className="bg-cream rounded-t-3xl w-full max-w-lg shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prompt state */}
        {modalState === 'prompt' && (
          <div className="p-6 pb-safe">
            {/* Milestone or body awareness header */}
            <div className="text-center mb-6">
              {milestoneMessage ? (
                <>
                  <p className="font-serif text-lg text-ink mb-1">
                    {milestoneMessage}
                  </p>
                  <p className="text-ink/50">
                    {bodyAwarenessPrompt}
                  </p>
                </>
              ) : (
                <p className="font-serif text-lg text-ink/70">
                  {bodyAwarenessPrompt}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-ink/10 mb-6" />

            {/* Call to action */}
            <p className="text-center text-ink/60 mb-6">
              Consider capturing this moment while it's fresh
            </p>

            {/* Three buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-ink/5 text-ink/60 hover:bg-ink/10 transition-colors active:scale-[0.98]"
              >
                Skip
              </button>
              <button
                onClick={handleRemindLater}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-ink/5 text-ink/60 hover:bg-ink/10 transition-colors active:scale-[0.98]"
              >
                Remind me later
              </button>
              <button
                onClick={handleStartCapture}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-ink text-cream hover:bg-ink/90 transition-colors active:scale-[0.98]"
              >
                Capture
              </button>
            </div>
          </div>
        )}

        {/* Capture state */}
        {modalState === 'capture' && (
          <div className="p-6 pb-safe">
            <div className="flex flex-col items-center">
              {/* Recording indicator */}
              {isRecording ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full mb-4 animate-pulse"
                    style={{ background: 'var(--accent)' }}
                  />
                  <AudioWaveform level={audioLevel} />
                  <p className="text-lg text-ink/60 tabular-nums mt-4 mb-2 font-medium">
                    {formatDuration(Math.floor(durationMs / 1000))}
                  </p>
                </>
              ) : state === 'requesting' ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-8 h-8 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  <p className="text-sm text-ink/50 mt-4">Requesting microphone...</p>
                </div>
              ) : null}

              {/* Transcription */}
              {isRecording && (
                <div className="w-full min-h-[80px] mb-4">
                  {displayText ? (
                    <p className="text-ink/70 leading-relaxed text-center">
                      {displayText}
                    </p>
                  ) : (
                    <p className="text-ink/30 text-center text-sm">
                      Speak now — your voice is being captured
                    </p>
                  )}
                </div>
              )}

              {/* Done button */}
              {isRecording && (
                <button
                  onClick={handleDone}
                  className="w-full py-4 rounded-xl font-medium bg-ink text-cream active:scale-[0.98] transition-all"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}

        {/* Saving state */}
        {modalState === 'saving' && (
          <div className="p-6 pb-safe flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            <p className="text-sm text-ink/50 mt-4">Saving...</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/InsightModal.tsx
git commit -m "feat: create InsightModal component with Skip/Remind/Capture options"
```

---

## Task 6: Update Timer.tsx - Navigate to Journey

**Files:**

- Modify: `src/components/Timer.tsx`

**Step 1: Remove insight capture imports and phase handling**

Remove line 13:

```typescript
// Remove: import { InsightCapture } from './InsightCapture'
```

**Step 2: Update useSessionStore destructuring (around line 15-29)**

Remove `startInsightCapture` and `skipInsightCapture` from destructuring:

```typescript
const {
  timerPhase,
  totalSeconds,
  lastSessionDuration,
  hasReachedEnlightenment,
  justReachedEnlightenment,
  lastSessionUuid,
  justAchievedMilestone,
  startPreparing,
  startTimer,
  stopTimer,
  acknowledgeEnlightenment,
  completeSession,
} = useSessionStore()
```

**Step 3: Update navigation store import**

```typescript
const { setView, triggerPostSessionFlow } = useNavigationStore()
```

**Step 4: Remove skipInsightSetting from settings store (line 32)**

```typescript
const { hideTimeDisplay } = useSettingsStore()
```

**Step 5: Replace the auto-transition useEffect (lines 77-83)**

Replace:

```typescript
// After session complete, transition to insight capture (or skip if preference set)
// Brief delay (800ms) for user to register completion, not a forced wait
useEffect(() => {
  if (timerPhase === 'complete') {
    const handler = skipInsightSetting ? skipInsightCapture : startInsightCapture
    const timer = setTimeout(handler, 800)
    return () => clearTimeout(timer)
  }
}, [timerPhase, startInsightCapture, skipInsightCapture, skipInsightSetting])
```

With:

```typescript
// After session complete, navigate to Journey tab for calm offboarding
useEffect(() => {
  if (timerPhase === 'complete' && lastSessionUuid && lastSessionDuration) {
    // Build milestone message if one was just achieved
    let milestoneMessage: string | undefined
    if (justAchievedMilestone) {
      if ('type' in justAchievedMilestone) {
        milestoneMessage = justAchievedMilestone.label
      } else {
        milestoneMessage = `You just reached ${justAchievedMilestone.hours} hours`
      }
    }

    // Brief moment to register completion, then navigate
    const timer = setTimeout(() => {
      triggerPostSessionFlow(lastSessionUuid, lastSessionDuration, milestoneMessage)
      completeSession()
    }, 800)
    return () => clearTimeout(timer)
  }
}, [
  timerPhase,
  lastSessionUuid,
  lastSessionDuration,
  justAchievedMilestone,
  triggerPostSessionFlow,
  completeSession,
])
```

**Step 6: Remove InsightCapture render (lines 380-388)**

Delete this entire block:

```typescript
{/* Insight capture after session */}
{timerPhase === 'capture' && (
  <InsightCapture
    sessionId={lastSessionUuid || undefined}
    sessionDuration={lastSessionDuration || undefined}
    onComplete={skipInsightCapture}
    onSkip={skipInsightCapture}
  />
)}
```

**Step 7: Commit**

```bash
git add src/components/Timer.tsx
git commit -m "refactor: replace insight capture phase with Journey navigation"
```

---

## Task 7: Update Journey.tsx - Show Insight Modal

**Files:**

- Modify: `src/components/Journey.tsx`

**Step 1: Add imports**

At top of file, add:

```typescript
import { InsightModal } from './InsightModal'
```

**Step 2: Get post-session state from navigation store**

Update the destructuring (around line 55):

```typescript
const {
  setView,
  pendingInsightSessionId,
  pendingInsightSessionDuration,
  pendingMilestone,
  showInsightModal,
  showInsightCaptureModal,
  hideInsightCaptureModal,
  clearPostSessionState,
} = useNavigationStore()
```

**Step 3: Add useEffect to trigger modal after stats settle**

Add after other useEffects (around line 190):

```typescript
// Show insight modal after stats animation settles (for post-session flow)
useEffect(() => {
  if (pendingInsightSessionId && !showInsightModal) {
    const timer = setTimeout(() => {
      showInsightCaptureModal()
    }, 1500) // Wait for stats animation
    return () => clearTimeout(timer)
  }
}, [pendingInsightSessionId, showInsightModal, showInsightCaptureModal])
```

**Step 4: Get session store for creating insight reminders**

```typescript
const { createInsightReminder } = useSessionStore()
```

**Step 5: Add InsightModal render before closing div (around line 368)**

Add before the final `</div>`:

```typescript
{/* Post-session insight capture modal */}
{showInsightModal && pendingInsightSessionId && (
  <InsightModal
    sessionId={pendingInsightSessionId}
    sessionDuration={pendingInsightSessionDuration}
    milestoneMessage={pendingMilestone}
    onComplete={() => {
      hideInsightCaptureModal()
      clearPostSessionState()
      // Refresh insight stream
      setInsightStreamKey(k => k + 1)
    }}
    onSkip={() => {
      hideInsightCaptureModal()
      clearPostSessionState()
    }}
    onRemindLater={async () => {
      await createInsightReminder(pendingInsightSessionId)
      hideInsightCaptureModal()
      clearPostSessionState()
    }}
  />
)}
```

**Step 6: Commit**

```bash
git add src/components/Journey.tsx
git commit -m "feat: integrate InsightModal into Journey for post-session flow"
```

---

## Task 8: Wire Up Notification Click in App.tsx

**Files:**

- Modify: `src/App.tsx`

**Step 1: Find NotificationCenter usage and add handler**

Search for `<NotificationCenter` in App.tsx and add the `onInsightReminderClick` prop:

```typescript
<NotificationCenter
  isOpen={showNotifications}
  onClose={() => setShowNotifications(false)}
  onInsightReminderClick={(sessionId) => {
    navigateToInsightCapture(sessionId)
  }}
/>
```

**Step 2: Get navigateToInsightCapture from navigation store**

Add to the navigation store destructuring in App.tsx:

```typescript
const { view, navigateToInsightCapture } = useNavigationStore()
```

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire notification click to insight capture navigation"
```

---

## Task 9: Add CSS Animation for Modal Slide-up

**Files:**

- Modify: `src/index.css` (or wherever animations are defined)

**Step 1: Check if animate-slide-up exists**

Search for `slide-up` in CSS files. If it doesn't exist, add:

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add slide-up animation for insight modal"
```

---

## Task 10: Clean Up Old InsightCapture Auto-Start Logic

**Files:**

- Modify: `src/components/InsightCapture.tsx`

The old InsightCapture component is still used from Journey tab for adding insights to past sessions. We need to:

1. Remove the auto-start recording behavior
2. Keep it functional for manual use

**Step 1: Remove auto-start useEffect (lines 98-121)**

Delete this entire block:

```typescript
// Auto-start recording on mount (after body awareness prompt fades)
useEffect(() => {
  let cancelled = false
  // ... rest of auto-start logic
}, [isSupported, state, startCapture])
```

**Step 2: Remove showBodyAwareness state and related logic**

Remove state (line 88):

```typescript
// Remove: const [showBodyAwareness, setShowBodyAwareness] = useState(true)
```

Remove body awareness prompt JSX (lines 235-244):

```typescript
// Remove the body awareness overlay
```

**Step 3: Add a start button for manual triggering**

Update the idle state to show a start button:

```typescript
{state === 'idle' && (
  <button
    onClick={() => startCapture()}
    className="py-3 px-6 rounded-xl font-medium bg-ink text-cream active:scale-[0.98]"
  >
    Start Recording
  </button>
)}
```

**Step 4: Commit**

```bash
git add src/components/InsightCapture.tsx
git commit -m "refactor: remove auto-start from InsightCapture, add manual start button"
```

---

## Task 11: Update Settings - Remove skipInsightCapture

**Files:**

- Modify: `src/components/Settings.tsx`
- Modify: `src/stores/useSettingsStore.ts`

Since insight capture is now always prompted with Skip/Remind/Capture options, the global "skip insight capture" setting is less useful. Consider removing it or renaming to "Never prompt for insights."

**Step 1: Optional - remove or update the setting toggle**

If keeping: rename to "Never show insight prompts" in Settings.tsx.

If removing: delete the toggle from Settings.tsx and remove `skipInsightCapture` from useSettingsStore.

**Step 2: Commit**

```bash
git add src/components/Settings.tsx src/stores/useSettingsStore.ts
git commit -m "chore: update/remove skipInsightCapture setting"
```

---

## Task 12: Final Testing

**Manual test checklist:**

1. Complete a meditation session
2. Verify calm transition (no jarring prompts)
3. Verify navigation to Journey tab
4. Verify stats update/animation
5. Verify insight modal appears after ~1.5s
6. Test "Skip" button - modal closes, no notification
7. Test "Remind me later" - modal closes, notification appears
8. Test "Capture" - voice recording starts, can record and save
9. Tap insight reminder notification - navigates to Journey with modal open
10. Verify insight is saved and appears in Insights stream

**Step 1: Run the app and test**

```bash
npm run dev
```

**Step 2: Fix any issues found**

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete post-meditation flow redesign

- Calm transition from timer to Journey tab
- Stats animation before insight prompt
- Unified insight modal with Skip/Remind/Capture
- Insight reminder notifications with deep-linking
- Removed jarring auto-recording behavior"
```

---

## Summary of Changes

| File                     | Change                                                  |
| ------------------------ | ------------------------------------------------------- |
| `notifications.ts`       | Add `insight_reminder` type with sessionId metadata     |
| `NotificationCenter.tsx` | Add click handling for insight reminders                |
| `useNavigationStore.ts`  | Add post-session navigation state and actions           |
| `useSessionStore.ts`     | Remove capture phase, add reminder and complete actions |
| `InsightModal.tsx`       | New unified modal with three options                    |
| `Timer.tsx`              | Navigate to Journey instead of insight capture phase    |
| `Journey.tsx`            | Show InsightModal after stats settle                    |
| `App.tsx`                | Wire notification click to navigation                   |
| `index.css`              | Add slide-up animation                                  |
| `InsightCapture.tsx`     | Remove auto-start, add manual trigger                   |
| `Settings.tsx`           | Update/remove skipInsightCapture setting                |
