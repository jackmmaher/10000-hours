# Post-Meditation Flow Redesign

## Problem

The current post-meditation experience has conflicting, overlapping events:
- Body awareness prompt appears, then disappears
- Microphone permission request fires immediately with no context
- Milestone/tier celebrations compete for attention
- Features designed in isolation now fight each other
- No unified "offboarding" — just independent features racing

The result: a jarring experience that demands cognitive decisions immediately after meditation.

## Design Principles

1. **Preserve the calm** — minimal UI, let user sit with their experience
2. **Show progress first** — lead them to Journey tab to see stats update
3. **User agency** — insight capture is invited, not demanded
4. **Context before action** — explain why before asking for anything

## New Flow

```
Session ends
    ↓
Calm fade (1-2s)
    ↓
Auto-navigate to Journey tab
    ↓
Stats animate in (user sees session added to progress)
    ↓
After stats settle (~1.5s)
    ↓
Insight modal appears
```

## Insight Capture Modal

Appears after stats animation settles on Journey tab.

### Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   "Notice how your body feels right now"            │  <- Calming header
│                                                     │
│   ───────────────────────────────────────────────   │
│                                                     │
│   Consider capturing this moment while it's fresh   │  <- Gentle prompt
│                                                     │
│   ┌───────────┐  ┌─────────────────┐  ┌─────────┐  │
│   │   Skip    │  │ Remind me later │  │ Capture │  │
│   └───────────┘  └─────────────────┘  └─────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Milestone Variant

If a milestone was just achieved, header becomes:
```
"You just reached 100 hours"
"Notice how your body feels in this moment"
```

### Button Behaviors

| Button | Action |
|--------|--------|
| Skip | Dismiss modal, no notification, session has no insight |
| Remind me later | Dismiss modal, create insight_reminder notification with sessionId |
| Capture | Transition modal to voice capture UI, request mic permission |

## Notification System

### New Notification Type

Add `insight_reminder` to `NotificationType`:
- Icon: Subtle, non-emoji indicator
- Color: Calm, not urgent
- Metadata: `{ sessionId: string }`

### Notification Action

When user taps insight reminder notification:
1. Navigate to Journey tab
2. Go to Insights section
3. Expand the specific session
4. Insight capture ready to go

## Technical Changes

### Files to Modify

1. **Timer.tsx**
   - Remove auto-mount of InsightCapture on 'complete' phase
   - Remove automatic microphone request trigger
   - Add navigation to Journey tab after session ends

2. **InsightCapture.tsx**
   - Refactor to be modal-based, not phase-based
   - Remove auto-start recording
   - Add three-button UI (Skip, Remind me later, Capture)
   - Voice capture only starts when user taps Capture

3. **notifications.ts**
   - Add `insight_reminder` to NotificationType
   - Extend metadata interface to include sessionId

4. **NotificationCenter.tsx**
   - Add icon/color for insight_reminder
   - Make notification clickable with navigation action

5. **useSessionStore.ts**
   - Remove insight capture triggering from stopTimer
   - Add function to create insight reminder notification

6. **Journey tab component**
   - Accept navigation param for post-meditation redirect
   - Handle insight modal display after stats settle
   - Handle deep-link from notification to specific session

### New Components

1. **InsightModal.tsx**
   - Standalone modal component
   - Three states: prompt, capture, complete
   - Manages own visibility and transitions

## Microphone Permission

- Only requested when user explicitly taps "Capture"
- Clear context established by the modal flow
- One-time browser permission, not repeated asks
- Consider: settings toggle for "always skip insight capture"

## Celebrations

Milestone and tier celebrations become:
- Subtle toast overlays on Journey tab, OR
- Folded into insight modal header when applicable

Not competing screens — integrated into the flow.
