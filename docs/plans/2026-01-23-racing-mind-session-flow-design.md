# Racing Mind Session Flow Redesign

## Problem

The current racing mind session flow is jarring and lacks the experiential quality users are paying for:

1. **Abrupt start**: User clicks "Begin Session" and is immediately thrown into a moving ball with timer running - no preparation or transition
2. **No lead-in**: Camera access is requested with no calming context, then session starts instantly
3. **Abrupt end**: Session ends without graceful wind-down; orb just stops
4. **Fragmented completion**: Two separate screens (Practice Complete modal, then Statistics page) instead of unified experience
5. **Camera bug**: Camera continues recording after session ends until user manually stops it

## Design

### Session Timing Model

The session is structured like a movie at a theater - ceremonial intro and outro bookend the actual practice:

```
[16s Intro] → [Selected Duration] → [16s Outro]
```

- **Intro/Outro**: Experiential transitions (not recorded to time bank)
- **Core Session**: The actual tracked practice time (recorded to time bank)
- **Example**: 5-minute session = 16s intro + 5:00 session + 16s outro = 5:32 total experience

### Session Start Sequence

1. User taps "Begin Session" → transitions to dark screen
2. Orb fades in, stationary at center of screen
3. Orb begins gentle **4-4-4-4 breathing cycle**, gradually expanding into its full horizontal orbit
4. During this 16-second warm-up:
   - Calming instructional text appears below the orb
   - Example: "Follow the ball with your eyes... back and forth... back and forth..."
   - Camera permission is requested (if not already granted)
5. Text fades out
6. Timer begins counting → user is now in the active session

### Active Session

- Timer counts the selected duration (e.g., 0:00 → 5:00)
- Orb oscillates horizontally at full amplitude
- Eye tracking via camera is active
- Cancel/End buttons available in header

### Session End Sequence

1. Timer reaches selected duration and stops (e.g., 5:00)
2. Orb begins **reverse animation**:
   - Gradually decelerates from full orbit
   - Follows same 4-4-4-4 rhythm in reverse
   - Returns to center over 16 seconds
3. **Camera stops automatically** as part of wind-down (no user action required)
4. Orb comes to rest at center
5. "Practice Complete" text fades in below the orb
6. CTA button appears (e.g., "See Your Results")
7. Tapping CTA transitions to unified summary card

### Unified Summary Card

Single card replacing the current two-screen flow:

```
┌─────────────────────────────────────┐
│                                     │
│         Practice Complete           │
│                                     │
│   How is your mind now?             │
│   Calm ●●●●●●○○○○ Racing            │
│         1 2 3 4 5 6 7 8 9 10        │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ You went from 7 → 5         │   │  ← Reveals after rating
│   │ That's a 2-point improvement│   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     EYE TRACKING DATA       │   │
│   │  0%      +17%       11      │   │
│   │ Accuracy Smoothness Saccades│   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │        Duration             │   │
│   │          5:00               │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Ready to go deeper?         │   │
│   │ Your mind is now calmer...  │   │
│   └─────────────────────────────┘   │
│                                     │
│   [      Meditate Now       ]       │  ← Primary CTA
│   [      Practice Again     ]       │
│   [          Done           ]       │  ← Closes, returns to previous
│                                     │
└─────────────────────────────────────┘
```

**Behavior:**

- Mind rating slider at top
- When user selects a rating, analysis text reveals with animation ("You went from X to Y...")
- Eye tracking data, duration, and encouragement card visible
- Three actions at bottom: Meditate Now (primary), Practice Again, Done

## Technical Requirements

1. **Intro animation**: 4-4-4-4 breathing cycle (16s total) with orb expanding from center to full horizontal orbit
2. **Outro animation**: Reverse of intro - orb decelerating from full orbit back to center (16s)
3. **Camera lifecycle**: Camera must stop automatically when outro begins, not require manual user action
4. **Timer scope**: Timer only counts core session duration, not intro/outro
5. **State management**: Track pre-session mind rating to calculate improvement shown post-session
6. **Unified card**: Merge Practice Complete modal and Statistics page into single scrollable card

## Success Criteria

- Session start feels like settling into a meditation, not being thrown into an exercise
- Session end feels like gentle emergence, not abrupt termination
- Camera stops without user intervention
- User rates their mind and immediately sees their improvement in context
- Single, cohesive post-session experience (not two screens)
