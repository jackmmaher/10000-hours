# Meditation Posture Training Mode: Two-View Calibration System

## Executive Summary

A **pre-meditation posture training feature** using a two-view calibration approach (side view + front view) to teach users correct seated alignment. This addresses the fundamental limitation that front-camera-only systems cannot measure the most critical meditation posture metrics: forward head position and lumbar curve.

**Complexity rating: 5-6/10** (increased from single-view due to two-camera workflow)

**Core insight from research:** Meditation traditions universally emphasize maintaining the natural lumbar lordosis and avoiding forward head posture—both require sagittal (side) view measurement. A front-view-only system would teach "balanced" but not "correct" posture.

---

## What the Research Says About "Correct" Meditation Posture

### Universal Principles Across Traditions

Despite variations between Zen, Vipassana, yoga, and secular mindfulness, the research reveals consistent biomechanical principles:

**1. The spine should be erect but maintain natural curves**

The Yoga Sutras state: _"sthira sukham āsanam"_ — your meditation seat should be steady and comfortable. The Rochester Zen Center's classic instruction specifies: "Full lotus posture, side view, showing **ears in line with shoulders**, and **top of nose in line with navel**. The chin should be slightly drawn in. The buttocks are thrust out, with the **spine erect**."

**2. Hips elevated above knees enables proper pelvic tilt**

"Sitting on the front edge of a rolled-up blanket, pillow, or cushion supports proper alignment—**bringing the hips slightly above the knees and allowing the pelvis to tilt forward**. Positioning in this way will emphasize the **natural curvature in your lumbar spine**, bringing stability to support a straight spine for extended periods."

**3. Head balanced directly over the spine**

"Make sure your **head is directly over your heart, and your heart is right over your hips**, so your vertebrae are stacked." — Mindful Minutes

"The string image: Imagine an invisible thread gently pulling the **crown of your head upwards**."

### Quantified Anatomical Targets

From clinical biomechanics research, we can define measurable targets:

| Metric                          | Measurement Method                               | Normal/Target Range                           | Source                         |
| ------------------------------- | ------------------------------------------------ | --------------------------------------------- | ------------------------------ |
| **Craniovertebral Angle (CVA)** | Side view: angle from C7 to tragus vs horizontal | 50-56° (normal), <45° indicates severe FHP    | PMC studies, Physiopedia       |
| **Lumbar Lordosis Angle (LLA)** | Side view: L1-L5 curvature                       | 20-45° standing; slightly reduced when seated | PubMed: normal range with 1 SD |
| **Shoulder Level**              | Front view: bilateral symmetry                   | Within ±4° of horizontal                      | Posture assessment protocols   |
| **Lateral Spine Deviation**     | Front view: midline deviation                    | Within ±5° of vertical                        | Photogrammetry standards       |
| **Head Lateral Tilt**           | Front view: ear-to-ear level                     | Within ±5° of horizontal                      | CVA literature                 |

**Critical finding:** CVA measurement requires **lateral photographs** with markers on C7 spinous process and tragus of ear. "It is recommended to measure CVA in standing posture as the postural muscles activity decrease in slump sitting compared to standing." For seated meditation, the same side-view approach applies.

---

## Why Two Views Are Non-Negotiable

### What Each View Can Measure

| Posture Issue                       | Front View         | Side View              | Importance for Meditation                   |
| ----------------------------------- | ------------------ | ---------------------- | ------------------------------------------- |
| Forward head posture                | ❌ Cannot measure  | ✅ CVA measurement     | **Critical** - #1 cause of neck pain        |
| Lumbar lordosis (slouching vs arch) | ❌ Cannot measure  | ✅ Spine curve visible | **Critical** - foundation of seated posture |
| Pelvic tilt                         | ❌ Cannot measure  | ✅ Hip angle visible   | **Critical** - determines spine position    |
| Chin tuck                           | ❌ Cannot measure  | ✅ Head-neck angle     | **High** - cervical alignment               |
| Shoulder level asymmetry            | ✅ Full visibility | ⚠️ Limited             | Medium - bilateral balance                  |
| Lateral lean (left/right)           | ✅ Full visibility | ❌ Cannot measure      | Medium - weight distribution                |
| Head tilt (ear to ear)              | ✅ Full visibility | ❌ Cannot measure      | Medium - neck tension indicator             |

**Research confirms:** "Camera locations perpendicular to the motion plane yield the smallest errors (6-8°), while angles off-perpendicular dramatically increase measurement error." For sagittal plane measurements (forward/back), you need a side view.

---

## Clothing Requirements: The Research Is Clear

### Clinical Photogrammetry Standards

From posture assessment literature: "Simply put, **the less clothing the test subject is wearing, the better**. Since it may not be possible to undress the subject to a certain extent depending on the examination setting, compromises can be made, **although these come at the expense of accuracy**."

Professional protocols specify: "Ideally, the subject should stand in their underwear."

### What This Means for Your App

**For Side View (Critical):**

- **Ideal:** Shirtless or sports bra/tank top
- **Acceptable:** Tight-fitting shirt tucked in
- **Problematic:** Loose t-shirt, hoodie, or bulky clothing

The reason: You need to see the **contour of the back** to assess lumbar curve. A loose shirt obscures this completely. "It is clear that the T-shirt being worn **obscures the back contour**, and therefore, **no statements can be made about local misalignments** in this body segment."

**For Front View (Less Critical):**

- Clothing matters less for shoulder/head assessment
- Loose clothing is acceptable
- Just need shoulders and head clearly visible

### Practical Recommendation for Your App

**Option A: Shirt tucked in tightly**

- Ask users to wear a fitted shirt tucked firmly into waistband
- The waistline serves as a visual anchor for hip position
- Spine curve partially visible through fabric tension

**Option B: Shirtless/sports bra (highest accuracy)**

- Explicitly optional, not required
- Offer this as "advanced calibration" for users who want maximum precision
- Many meditation practitioners are comfortable with this in private setting

**Option C: Marker-based compromise**

- Have user place a small sticker or draw a dot on their lower back at belt line
- This provides a reference point even through loose clothing
- Less accurate than seeing full contour but better than nothing

### App UX Recommendation

```
┌─────────────────────────────────────────────────────────────────┐
│  CLOTHING SETUP                                                  │
│                                                                  │
│  For best results during side-view calibration:                 │
│                                                                  │
│  ✓ Wear a fitted shirt, tucked in                               │
│  ✓ Or practice with upper body uncovered                        │
│  ✓ Hair tied back if long (need to see ear)                     │
│                                                                  │
│  Why? We need to see your back's natural curve                  │
│  to assess your seated posture accurately.                      │
│                                                                  │
│  🔒 Your camera feed is processed locally on your device.       │
│     Images are never stored or uploaded.                        │
│                                                                  │
│  [ Continue with fitted clothing ]                               │
│  [ I'll go shirtless for better accuracy ]                      │
│  [ Skip side view (front-only calibration) ]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Four Universal Meditation Positions to Support

Based on tradition and research, these are the positions your app should support:

### 1. Chair Sitting (Egyptian Position)

**Most accessible, recommended for beginners and those with mobility issues**

**Setup:**

- Sit on front edge of chair (not leaning against back)
- Feet flat on floor, hip-width apart
- Thighs parallel to floor (90° knee angle)
- Hands on thighs or in lap

**Target metrics:**

- CVA: 50-56°
- Lumbar lordosis: Maintain natural curve (don't flatten against chair)
- Thigh-torso angle: ~90° or slightly more
- Shoulder level: Within ±4°

**Visual reference:** "Side view of zazen in a straight-back chair, with cushion under buttocks and the feet resting firmly on the floor. Note that the sitter maintains an upright posture and does not lean back."

### 2. Burmese Position (Sukhasana variant)

**Most common floor position for Westerners**

**Setup:**

- Sit on front edge of cushion (zafu)
- Legs uncrossed, one foot in front of the other
- Both knees touching floor/mat
- Hips above knees

**Target metrics:**

- CVA: 50-56°
- Lumbar lordosis: 15-35° (slightly reduced from standing due to hip flexion)
- Hip-knee relationship: Hips visibly higher than knees
- Shoulder level: Within ±4°

**Visual reference:** "The so-called Burmese posture, with the legs uncrossed, the left or right foot in front and both knees touching mat."

### 3. Seiza (Kneeling)

**Traditional Japanese position, excellent for spinal alignment**

**Setup:**

- Kneel with tops of feet flat on floor
- Sit back on heels or use bench/cushion between heels and buttocks
- Thighs vertical or near-vertical

**Target metrics:**

- CVA: 50-56°
- Lumbar lordosis: 20-40° (often easier to maintain than cross-legged)
- Shoulder level: Within ±4°

**Visual reference:** "Side view of the traditional Japanese sitting posture with knees in line with one another on the mat and straddling a cushion inserted between the heels and buttocks."

### 4. Quarter/Half Lotus

**For more experienced practitioners with hip flexibility**

**Setup:**

- One or both feet resting on opposite thigh
- Knees should reach floor (use cushion if needed to achieve this)
- Spine erect without strain

**Target metrics:**

- CVA: 50-56°
- Lumbar lordosis: 15-30° (hip flexion reduces lordosis)
- Both knees stable on floor
- Shoulder level: Within ±4°

**Note:** "If you force yourself into full lotus, you can injure your knees. Make sure you're able to sit with a straight spine and with your knees close to the floor. If that isn't the case, take a modified meditation seat."

---

## Two-View Calibration: User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: POSITION SELECT                                         │
│                                                                  │
│  How will you sit today?                                         │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Chair  │  │ Burmese │  │  Seiza  │  │  Lotus  │            │
│  │   💺    │  │   🧘    │  │   🪑    │  │   🧘‍♀️   │            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│                                                                  │
│  [ What's the difference? ]                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: CLOTHING CHECK                                          │
│                                                                  │
│  For accurate side-view assessment:                             │
│                                                                  │
│  • Wear a fitted shirt, tucked in tightly                       │
│  • Or practice with upper body uncovered                        │
│  • Tie back long hair (we need to see your ear)                │
│                                                                  │
│  Why? We need to see your back's natural curve.                 │
│                                                                  │
│  🔒 Your camera feed is processed locally on your device.       │
│     Images are never stored or uploaded.                        │
│                                                                  │
│  [ I'm ready ]    [ Skip side view ]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: SIDE VIEW SETUP                                         │
│                                                                  │
│  Place your phone to your LEFT or RIGHT side                    │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │                                         │                    │
│  │    📱 ←─── 3-4 feet ───→ 🧘            │                    │
│  │                                         │                    │
│  │   Phone at shoulder height              │                    │
│  │   Your full profile should be visible   │                    │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Checklist:                                                      │
│  [ ] Head to hips visible                                        │
│  [ ] Ear clearly visible                                         │
│  [ ] Back contour visible                                        │
│                                                                  │
│              [ Camera looks good → ]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: SIDE VIEW TRAINING                                      │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │                                         │                    │
│  │   [ Live camera feed - side view ]      │                    │
│  │                                         │                    │
│  │      ╭───╮                              │                    │
│  │      │ ○ │  ← Head position line        │                    │
│  │      ╰─┬─╯                              │                    │
│  │        │                                │                    │
│  │        │   ← Spine line (color-coded)  │                    │
│  │       ╱│                                │                    │
│  │      ╱ │   ← Lumbar curve indicator    │                    │
│  │     ╱  │                                │                    │
│  │    ────┴────  ← Hip/seat reference     │                    │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  "Tuck your chin slightly - imagine                             │
│   making a gentle double chin"                                   │
│                                                                  │
│  CVA: 48° → Target: 52-56°  [━━━━━━░░░░] 85%                   │
│                                                                  │
│  [ Hold aligned position for 10 seconds ]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                    (User achieves alignment)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: SIDE VIEW COMPLETE - TRANSITION                         │
│                                                                  │
│  ✓ Side profile captured                                        │
│                                                                  │
│  Your sagittal alignment:                                        │
│  • Head position: Good (CVA 54°)                                │
│  • Spine curve: Natural lordosis maintained                     │
│  • Chin tuck: Correct                                           │
│                                                                  │
│  Now let's check your front alignment.                          │
│                                                                  │
│  Move your phone to face you directly.                          │
│                                                                  │
│              [ Continue to front view → ]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: FRONT VIEW SETUP                                        │
│                                                                  │
│  Place your phone directly in front of you                      │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │                                         │                    │
│  │              📱                         │                    │
│  │               │                         │                    │
│  │               │ 4-6 feet                │                    │
│  │               │                         │                    │
│  │              🧘                         │                    │
│  │                                         │                    │
│  │   Phone at eye level when seated        │                    │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Checklist:                                                      │
│  [ ] Head and shoulders visible                                  │
│  [ ] Hips visible (if floor sitting)                            │
│                                                                  │
│              [ Camera looks good → ]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: FRONT VIEW TRAINING                                     │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │                                         │                    │
│  │   [ Live camera feed - front view ]     │                    │
│  │                                         │                    │
│  │           │                             │                    │
│  │        ╭──┼──╮  ← Head level line       │                    │
│  │        │  ○  │                          │                    │
│  │        ╰──┬──╯                          │                    │
│  │     ┌─────┼─────┐  ← Shoulder line      │                    │
│  │     │     │     │                       │                    │
│  │           │       ← Spine vertical      │                    │
│  │     └─────┼─────┘  ← Hip line           │                    │
│  │           │                             │                    │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  "Level your shoulders - drop the right                         │
│   shoulder slightly"                                             │
│                                                                  │
│  Balance: [━━━━━━━━━░] 92%                                      │
│                                                                  │
│  [ Hold for 5 seconds ]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: BODY AWARENESS INTEGRATION                              │
│                                                                  │
│  You're aligned. Before we finish:                              │
│                                                                  │
│  Close your eyes and notice:                                     │
│                                                                  │
│  • Your sit bones pressing evenly into your seat                │
│  • The gentle curve in your lower back                          │
│  • Your chin slightly tucked, neck long                         │
│  • Your crown floating upward                                    │
│                                                                  │
│  This is your aligned posture.                                   │
│  Remember how this FEELS.                                        │
│                                                                  │
│  ───────────────────────────────────────────                    │
│                                                                  │
│  [ Start 20-min meditation ]                                     │
│  [ Practice alignment again ]                                    │
│  [ Save & exit ]                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation: Key Differences from Single-View

### Pose Estimation Model Selection

For **side view**, you need different keypoints than front view:

| View  | Critical Keypoints                       | BlazePose Support | Notes                                       |
| ----- | ---------------------------------------- | ----------------- | ------------------------------------------- |
| Side  | Ear (tragus proxy), shoulder, hip, ankle | ✅ Yes            | Ear keypoint + shoulder/hip for CVA         |
| Side  | Spine curve                              | ⚠️ Indirect       | Must infer from shoulder-hip-knee alignment |
| Front | Both shoulders, both hips, nose          | ✅ Yes            | Standard bilateral detection                |

**BlazePose's 33 keypoints include both ears**, which is essential for CVA calculation from the side.

### CVA Calculation from Keypoints

```typescript
// Side view CVA calculation
function calculateCVA(keypoints: Keypoint[]): number {
  // BlazePose keypoint indices
  const LEFT_EAR = 7
  const RIGHT_EAR = 8
  const LEFT_SHOULDER = 11
  const RIGHT_SHOULDER = 12
  const LEFT_HIP = 23
  const RIGHT_HIP = 24

  // For side view, use the visible ear (whichever has higher confidence)
  const ear =
    keypoints[LEFT_EAR].score > keypoints[RIGHT_EAR].score
      ? keypoints[LEFT_EAR]
      : keypoints[RIGHT_EAR]

  // Use visible shoulder as C7 proxy (actual C7 not detectable)
  const shoulder =
    keypoints[LEFT_SHOULDER].score > keypoints[RIGHT_SHOULDER].score
      ? keypoints[LEFT_SHOULDER]
      : keypoints[RIGHT_SHOULDER]

  // CVA = angle between (ear-to-shoulder line) and horizontal
  // In image coordinates, Y increases downward
  const deltaX = ear.x - shoulder.x
  const deltaY = shoulder.y - ear.y // Flip because Y increases down

  // Angle from horizontal (0° = ear directly above shoulder)
  const angleRad = Math.atan2(deltaY, Math.abs(deltaX))
  const angleDeg = angleRad * (180 / Math.PI)

  // CVA is typically measured from horizontal
  // Normal CVA ~50-56°, lower = more forward head
  return 90 - angleDeg
}
```

**Important limitation:** BlazePose doesn't detect C7 directly. The shoulder keypoint serves as a proxy, which introduces ~5-10° of measurement variance compared to clinical assessment with markers on actual C7. This is acceptable for training/awareness purposes but wouldn't meet clinical standards.

### Lumbar Curve Assessment (Challenging)

The lumbar curve is **not directly measurable** from pose estimation keypoints alone—you'd need to see the actual spine contour. Options:

**Option A: Proxy measurement via hip-shoulder-ear alignment**

```typescript
function assessSpineAlignment(keypoints: Keypoint[]): SpineAssessment {
  const ear = getVisibleEar(keypoints)
  const shoulder = getVisibleShoulder(keypoints)
  const hip = getVisibleHip(keypoints)

  // In good posture, ear should be slightly behind shoulder
  // and shoulder slightly behind hip (natural S-curve)
  const earToShoulder = ear.x - shoulder.x
  const shoulderToHip = shoulder.x - hip.x

  // Positive values = behind (good), negative = forward (slouching)
  // These thresholds are approximate and would need calibration
  if (earToShoulder < -20 && shoulderToHip < -10) {
    return { status: 'slouching', guidance: 'Lift your chest, draw shoulders back' }
  }
  if (earToShoulder > 30) {
    return { status: 'overarched', guidance: 'Relax your lower back slightly' }
  }
  return { status: 'aligned', guidance: 'Good spinal alignment' }
}
```

**Option B: Silhouette contour analysis (more complex)**

If user is shirtless or in tight clothing, you could potentially:

1. Extract body silhouette from pose segmentation
2. Analyze the curvature of the back edge
3. Detect lordotic vs kyphotic curve

This requires BlazePose's segmentation output plus computer vision edge detection—significantly more complex but more accurate.

### Two-Phase Session State

```typescript
// stores/postureTrainingStore.ts
interface TwoViewCalibrationState {
  // Phase tracking
  phase:
    | 'position-select'
    | 'clothing-check'
    | 'side-setup'
    | 'side-training'
    | 'side-complete'
    | 'front-setup'
    | 'front-training'
    | 'awareness'
    | 'complete'

  // Position
  selectedPosition: 'chair' | 'burmese' | 'seiza' | 'lotus' | null

  // Side view results
  sideViewMetrics: {
    cva: number // Craniovertebral angle
    spineAlignment: 'slouching' | 'aligned' | 'overarched'
    chinTuck: 'forward' | 'correct' | 'overtucked'
    capturedAt: Date
  } | null

  // Front view results
  frontViewMetrics: {
    shoulderTilt: number // Degrees from horizontal
    lateralLean: number // Spine deviation from vertical
    headTilt: number // Head lateral tilt
    capturedAt: Date
  } | null

  // Combined assessment
  overallScore: number // 0-100
  primaryIssue: string | null

  // Calibration confidence tracking (BlazePose landmark confidence)
  calibrationConfidence: number // Average landmark confidence 0-1
  clothingCheckTriggered: boolean // Auto-triggered when confidence low
}
```

### Camera Transition UX

The trickiest part is guiding users to physically move their phone between positions. Key considerations:

1. **Clear visual instructions** with diagrams showing phone placement
2. **Automatic view detection** - detect if user is in side vs front view based on pose geometry
3. **Graceful handling of wrong angle** - if user hasn't moved phone, guide them
4. **Ghost UI transitions** - use Framer Motion for fluid visual guides that adapt as phone moves

```typescript
function detectViewOrientation(keypoints: Keypoint[]): 'side' | 'front' | 'unknown' {
  const leftShoulder = keypoints[11]
  const rightShoulder = keypoints[12]
  const leftHip = keypoints[23]
  const rightHip = keypoints[24]
  const nose = keypoints[0]

  // If both shoulders visible with similar confidence, likely front view
  const shoulderConfidenceDiff = Math.abs(leftShoulder.score - rightShoulder.score)
  const bothShouldersVisible = leftShoulder.score > 0.5 && rightShoulder.score > 0.5

  // If nose is between shoulders, likely front view
  const noseInCenter =
    nose.x > Math.min(leftShoulder.x, rightShoulder.x) &&
    nose.x < Math.max(leftShoulder.x, rightShoulder.x)

  if (bothShouldersVisible && shoulderConfidenceDiff < 0.2 && noseInCenter) {
    return 'front'
  }

  // If one shoulder much more visible than other, likely side view
  if (shoulderConfidenceDiff > 0.4) {
    return 'side'
  }

  return 'unknown'
}

// Auto-trigger clothing check when BlazePose confidence is low
function checkCalibrationConfidence(keypoints: Keypoint[], store: PostureStore): void {
  const criticalKeypoints = [
    keypoints[11], // LEFT_SHOULDER
    keypoints[12], // RIGHT_SHOULDER
    keypoints[23], // LEFT_HIP
    keypoints[24], // RIGHT_HIP
  ]

  const avgConfidence =
    criticalKeypoints.reduce((sum, kp) => sum + kp.score, 0) / criticalKeypoints.length

  store.setCalibrationConfidence(avgConfidence)

  // If hip or shoulder confidence drops below 0.5, likely clothing issue
  if (avgConfidence < 0.5 && !store.clothingCheckTriggered) {
    store.setClothingCheckTriggered(true)
    // Trigger "Clothing Check" UI automatically
  }
}
```

---

## Haptic Guidance System (Capacitor Haptics)

Haptic feedback allows users to align with their eyes closed, fostering "Body Awareness Integration" (Step 8 in the user flow). This directly addresses the repositioning friction between views.

### Haptic Patterns

| Feedback Type             | Pattern                | Trigger Condition                 |
| ------------------------- | ---------------------- | --------------------------------- |
| **Double pulse**          | Two quick vibrations   | Head too far forward (CVA < 45°)  |
| **Single pulse**          | One medium vibration   | Target CVA achieved (50-56°)      |
| **Triple pulse**          | Three quick vibrations | Shoulders uneven (>8° tilt)       |
| **Long gentle vibration** | 300ms sustained        | Full alignment achieved           |
| **Rhythmic guide**        | Pulse every 2 seconds  | Guiding user during repositioning |

### Implementation

```typescript
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

// Haptic feedback functions
const hapticFeedback = {
  // Head too far forward - double pulse
  headForward: async () => {
    await Haptics.impact({ style: ImpactStyle.Medium })
    await new Promise((resolve) => setTimeout(resolve, 100))
    await Haptics.impact({ style: ImpactStyle.Medium })
  },

  // Target CVA achieved - single pulse
  cvaAchieved: async () => {
    await Haptics.impact({ style: ImpactStyle.Light })
  },

  // Shoulders uneven - triple pulse
  shouldersUneven: async () => {
    for (let i = 0; i < 3; i++) {
      await Haptics.impact({ style: ImpactStyle.Light })
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
  },

  // Full alignment achieved - success vibration
  fullAlignment: async () => {
    await Haptics.notification({ type: NotificationType.Success })
  },

  // Gentle guidance pulse during repositioning
  guidancePulse: async () => {
    await Haptics.impact({ style: ImpactStyle.Light })
  },
}

// Integration with posture detection loop
function onPostureUpdate(metrics: PostureMetrics, prevMetrics: PostureMetrics | null) {
  // CVA feedback
  if (metrics.cva < 45 && (!prevMetrics || prevMetrics.cva >= 45)) {
    hapticFeedback.headForward()
  } else if (
    metrics.cva >= 50 &&
    metrics.cva <= 56 &&
    (!prevMetrics || prevMetrics.cva < 50 || prevMetrics.cva > 56)
  ) {
    hapticFeedback.cvaAchieved()
  }

  // Shoulder feedback
  if (
    Math.abs(metrics.shoulderTilt) > 8 &&
    (!prevMetrics || Math.abs(prevMetrics.shoulderTilt) <= 8)
  ) {
    hapticFeedback.shouldersUneven()
  }

  // Full alignment celebration
  if (isFullyAligned(metrics) && (!prevMetrics || !isFullyAligned(prevMetrics))) {
    hapticFeedback.fullAlignment()
  }
}

function isFullyAligned(metrics: PostureMetrics): boolean {
  return (
    metrics.cva >= 50 &&
    metrics.cva <= 56 &&
    Math.abs(metrics.shoulderTilt) <= 4 &&
    Math.abs(metrics.lateralLean) <= 5
  )
}
```

### User Education

On first use of haptic guidance, show a brief explainer:

```
┌─────────────────────────────────────────────────────────────────┐
│  HAPTIC GUIDANCE                                                 │
│                                                                  │
│  Feel your way to alignment:                                     │
│                                                                  │
│  📳📳  Double pulse = head too forward                          │
│  📳    Single pulse = good head position                        │
│  📳📳📳 Triple pulse = level your shoulders                      │
│  〰️    Long vibration = perfect alignment!                       │
│                                                                  │
│  This lets you align with your eyes closed,                     │
│  building true body awareness.                                   │
│                                                                  │
│  [ Got it ]                                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Guidance Messages: Evidence-Based Corrections

### Side View Corrections

| Issue Detected                        | Guidance Message                                                                            | Anatomical Basis                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| CVA < 45° (severe FHP)                | "Tuck your chin gently—imagine making a slight double chin while keeping your gaze forward" | Reduces cervical flexion, increases CVA |
| CVA 45-50° (mild FHP)                 | "Draw your head back slightly, as if a string is pulling the crown upward"                  | Brings ear over shoulder                |
| Slouching (shoulders forward of hips) | "Lift through your chest without arching. Feel your sternum rise"                           | Engages thoracic extensors              |
| Excessive lordosis                    | "Gently engage your lower belly. Let your tailbone drop slightly"                           | Reduces anterior pelvic tilt            |

### Front View Corrections

| Issue Detected      | Guidance Message                                                 | Anatomical Basis               |
| ------------------- | ---------------------------------------------------------------- | ------------------------------ |
| Right shoulder high | "Soften your right shoulder, let it melt down"                   | Releases upper trapezius       |
| Left shoulder high  | "Release your left shoulder toward the floor"                    | Releases upper trapezius       |
| Lateral lean right  | "Shift your weight slightly left, centering over your sit bones" | Rebalances weight distribution |
| Head tilted         | "Bring your ears level—imagine balancing a book on your head"    | Levels cervical spine          |

---

## Database Schema for Calibration Data

```typescript
// Dexie schema additions
interface PostureCalibration {
  id?: number

  // Position this calibration applies to
  position: 'chair' | 'burmese' | 'seiza' | 'lotus'

  // Side view baseline
  sideView: {
    cva: number // Target CVA for this user
    shoulderHipAlignment: number // Shoulder position relative to hip
    capturedAt: Date
  } | null

  // Front view baseline
  frontView: {
    shoulderLevelAngle: number // User's natural shoulder level
    capturedAt: Date
  } | null

  // Metadata
  createdAt: Date
  updatedAt: Date

  // How many times has user trained with this baseline
  trainingSessionCount: number
}

interface PostureTrainingSession {
  id?: number
  calibrationId: number // Links to baseline used
  position: string

  // What was achieved
  sideViewAchieved: boolean
  frontViewAchieved: boolean

  // Metrics at completion
  finalCVA: number
  finalShoulderTilt: number

  // Duration
  durationSeconds: number

  completedAt: Date
}
```

---

## Implementation Phases (Revised)

### Phase 1: Side View Foundation (2 weeks)

- [ ] Implement side-view camera setup with positioning guide
- [ ] CVA calculation from ear/shoulder keypoints
- [ ] Basic spine alignment proxy measurement
- [ ] Side-view specific guidance messages
- [ ] Validate CVA readings against expected ranges
- [ ] Add calibration confidence tracking to Zustand store
- [ ] Implement auto-clothing-check trigger when confidence < 0.5

**Validation:** CVA measurements fall in 40-60° range for most users; guidance triggers correctly for forward head; clothing check triggers when BlazePose struggles

### Phase 2: Front View Integration (1 week)

- [ ] Front-view camera setup
- [ ] Automatic view orientation detection
- [ ] Shoulder level and lateral lean calculations
- [ ] Front-view guidance messages
- [ ] Smooth transition flow between views
- [ ] Ghost UI transitions with Framer Motion

**Validation:** Can complete full two-view flow; system correctly identifies which view user is in

### Phase 3: Haptic Feedback System (1 week)

- [ ] Capacitor Haptics integration
- [ ] Implement haptic patterns (double/single/triple pulse, long vibration)
- [ ] Wire haptics to posture detection loop
- [ ] Add haptic guidance explainer screen
- [ ] Test eyes-closed alignment workflow
- [ ] User preference toggle for haptics on/off

**Validation:** Users can achieve alignment with eyes closed using haptic cues alone

### Phase 4: Training UX Polish (1-2 weeks)

- [ ] Position selection with visual guides
- [ ] Clothing recommendation screen with privacy messaging
- [ ] Progress indicators and hold timers
- [ ] Body awareness prompts
- [ ] Session completion celebration
- [ ] Integration with meditation timer flow

**Validation:** Complete user flow feels smooth and educational

### Phase 5: Persistence & Progress (1 week)

- [ ] Dexie storage for calibrations per position
- [ ] Training session history
- [ ] Progress tracking over time
- [ ] "Quick check" mode for returning users
- [ ] Optional: baseline recalibration prompts

**Validation:** Calibrations persist; user can see improvement over time

### Total Estimated Timeline: 6-8 weeks

---

## Key Technical Risks

| Risk                                         | Likelihood | Impact | Mitigation                                                                                                    |
| -------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| Users struggle with phone repositioning      | High       | Medium | Very clear visual guides; Ghost UI; haptic guidance during transition; detect wrong orientation automatically |
| Side-view lumbar assessment inaccurate       | High       | Medium | Frame as "spinal alignment" not "lumbar curve"; acknowledge limitation                                        |
| CVA proxy (shoulder not C7) introduces error | Medium     | Low    | Acceptable for training; not claiming clinical accuracy                                                       |
| Loose clothing defeats side-view purpose     | Medium     | Medium | Strong UX guidance; auto-detect via calibration confidence; offer "skip side view" fallback                   |
| Low-light fails in meditative settings       | Medium     | Low    | Ambient light check; warn if too dark                                                                         |
| Two-view flow feels cumbersome               | Medium     | High   | Make each phase feel purposeful; haptic guidance; option for quick single-view check                          |
| Haptics feel intrusive during meditation     | Medium     | Medium | User toggle; calibrate intensity; only use during training phase, not live meditation                         |

---

## Success Metrics

**Adoption:**

- % of users who complete full two-view calibration at least once
- Ratio of side-view completions to front-only skips
- Clothing check trigger rate (indicates detection quality issues)

**Effectiveness:**

- CVA improvement over multiple sessions
- Self-reported posture awareness improvement
- Correlation with meditation session length
- Eyes-closed alignment success rate (haptic-only)

**Usability:**

- Average time to complete calibration
- Drop-off rate at each step
- "Skip" usage rate
- Haptic feedback preference (on vs off)

---

## Alternative: Quick Single-View Mode

For users who've completed full calibration before, or who can't do the two-view setup, offer a simplified "Quick Check":

```
┌─────────────────────────────────────────────────────────────────┐
│  QUICK POSTURE CHECK                                             │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │                                         │                    │
│  │   [ Front camera view ]                 │                    │
│  │                                         │                    │
│  │         Balance: ✓ Centered            │                    │
│  │         Shoulders: ✓ Level             │                    │
│  │         Head: ✓ Upright                │                    │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Looking good! Ready to meditate.                               │
│                                                                  │
│  Note: For full alignment check including                       │
│  forward head posture, do a Side View calibration.             │
│                                                                  │
│  [ Start Meditation ]    [ Full Calibration ]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

This acknowledges the limitation (front-only can't assess FHP) while still providing value for returning users who just want a quick confirmation.

---

## Future Integration: Om Coach Synergy

**Note for future development:** The posture tracking and Om Coach features should eventually "handshake."

**The biomechanical connection:** A slouched spine physically limits the diaphragm's excursion, which reduces the duration and resonance of the "A" and "U" sounds during Om chanting.

**Potential integration:**

- If a user has poor posture (Side View fails), warn them that their "Om Resonance" might be affected
- Correlate "Posture Score" with "Om Mastery Score" to show users how alignment impacts breath capacity
- Use this as motivation for users who might otherwise skip posture training

This creates a virtuous feedback loop where improving one feature improves the other.
