# Eye Tracking KPIs Redesign

## Problem

Current eye tracking metrics (Accuracy, Smoothness, Saccade Count) measure motor skill, not therapeutic engagement. The science shows that **time spent tracking the orb** drives amygdala deactivation - not the precision of tracking.

Users see numbers like "72% accuracy" with no understanding of what it means or how it connects to feeling calmer.

## Core Insight

Eye tracking serves two purposes:

1. **Behavioral enforcement** - Knowing you're being watched increases focus
2. **Reward feedback** - Connecting effort to outcome reinforces the practice

The therapeutic benefit comes from engagement (eyes on orb = amygdala quieting), not skill (how precisely you tracked).

## New Metrics

### 1. Focus Time

- **Definition**: Total seconds where gaze was within 150px of orb center
- **Display**: `8m 42s` (using app's standard time format)
- **Meaning**: Direct therapeutic dose - each second = active amygdala suppression

### 2. Engagement Rate

- **Definition**: Focus Time ÷ Session Duration × 100
- **Display**: `87%`
- **Meaning**: How much of the session was "active treatment"

### 3. Longest Focus Streak

- **Definition**: Longest continuous period without gaze breaking away
- **Break threshold**: Gaze outside 150px for 500ms+ counts as a break
- **Display**: `2m 15s`
- **Meaning**: Depth indicator - longer unbroken periods = deeper settling

## Detection Thresholds

| Threshold           | Value                             | Rationale                                                  |
| ------------------- | --------------------------------- | ---------------------------------------------------------- |
| On-orb radius       | 150px                             | ~3x orb size (50px radius), accounts for WebGazer accuracy |
| Break duration      | 500ms                             | Brief glances don't count, genuine breaks do               |
| Expected engagement | 70-90% focused, 40-60% distracted | Tune after testing                                         |
| Expected streaks    | 30s - 3m typical                  | Not whole session, not constant breaks                     |

## Results Screen Flow

### Step 1: Calm Rating

User rates their calm state (1-10 scale)

### Step 2: Reward Reveal (animates after rating)

**High engagement (≥75%) + feels calm (≥5):**

```
8m 42s of focus. Calm of 7.
You earned that.
```

**High engagement + doesn't feel calm:**

```
8m 42s of focus. The settling is happening.
You'll feel it more each session.
```

**Lower engagement (<75%) + feels calm:**

```
6m 30s of focus. Calm of 7.
Imagine what full focus would feel like.
```

**Lower engagement + doesn't feel calm:**

```
6m 30s of focus.
More focus, more calm. That's the deal.
```

### Step 3: Metrics Row (animates with delay)

```
  8m 42s      87%      2m 15s
  Focus     Engaged    Streak
```

### Step 4: Nudge (small text)

```
Next session: eyes soft, center of the orb, let it lead.
```

### Step 5: CTAs

- Meditate Now (primary)
- Practice Again
- Done

## Language Principles

Based on Cialdini, Thaler, Pavlovian conditioning:

- **Direct cause-effect**: You did X → You got Y
- **No science lectures**: Don't explain amygdala, just link effort to reward
- **Tight, punchy**: Short sentences, immediate connection
- **Actionable**: Give them something to try next session

## Technical Changes

### useTrackingScore.ts

Replace current metrics with:

```typescript
interface TrackingMetrics {
  focusTimeSeconds: number // Total time gaze within threshold of orb
  engagementPercent: number // focusTime / sessionDuration * 100
  longestStreakSeconds: number // Longest continuous focus period
}
```

New calculation functions:

- `calculateFocusTime(gazeHistory, orbHistory, threshold)` - Sum time where distance < 150px
- `calculateLongestStreak(gazeHistory, orbHistory, threshold, breakDuration)` - Find longest unbroken period

### RacingMindSummary.tsx

- Remove "Eye Tracking Insights" / "Eye Tracking Data" sections
- Add reward message component that takes calm rating + metrics
- Add three-metric display row
- Add nudge text

### ValidationDisplay.tsx

- Can be removed or heavily simplified
- Logic consolidated into RacingMindSummary

### Keep unchanged

- Calibration system (EyeCalibration/\*)
- WebGazer integration (useEyeTracking)
- Gaze history collection during session

## Success Criteria

1. Users understand what Focus Time means without explanation
2. Users feel the connection between their effort and their calm rating
3. Users know what to do differently next session
4. Metrics are realistic (not always 100%, not always failing)

## References

- [de Voogd et al. 2018](https://www.jneurosci.org/content/38/40/8694) - Eye movements deactivate amygdala
- [Oculocardiac reflex research](https://drarielleschwartz.com/the-vagus-nerve-and-eye-movements-tools-for-trauma-recovery-dr-arielle-schwartz/) - Eye movements activate parasympathetic response
