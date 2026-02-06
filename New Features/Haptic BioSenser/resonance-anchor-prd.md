# PRD: Resonance Anchor — Disguised Breath Training

**Version:** 1.0  
**Date:** 2026-01-23  
**Status:** Ready for Implementation

---

## Executive Summary

The Resonance Anchor is a meditation tool that appears to be a sound-and-haptic "resonance matching" experience but is secretly a precisely-timed breathing exercise. Users hum into their phone while feeling synchronized vibration feedback—they believe they're "finding their resonance" but are actually being guided through optimized exhale-dominant breath patterns proven to activate the parasympathetic nervous system.

This PRD establishes both the immediate feature (Resonance Anchor) and the underlying **Disguised Breath Engine** architecture that enables future "breath games" (floating feather, etc.) to share the same scientifically-validated timing logic.

---

## Table of Contents

1. [The Strategic Insight](#1-the-strategic-insight)
2. [Scientific Foundation](#2-scientific-foundation)
3. [User Experience Design](#3-user-experience-design)
4. [Technical Architecture](#4-technical-architecture)
5. [Core IP: The Breath Engine](#5-core-ip-the-breath-engine)
6. [Implementation Specifications](#6-implementation-specifications)
7. [Session Duration & Progression](#7-session-duration--progression)
8. [Metrics & Validation](#8-metrics--validation)
9. [Platform Constraints & Workarounds](#9-platform-constraints--workarounds)
10. [Future Extensions](#10-future-extensions)
11. [Appendix: Code Snippets](#11-appendix-code-snippets)

---

## 1. The Strategic Insight

### The Problem with "Breathing Exercises"

Traditional breathing exercises fail anxious users because:

- **Cognitive overload**: "Inhale 4 seconds, hold 2, exhale 6" requires counting while anxious
- **Self-monitoring anxiety**: "Am I doing it right?" amplifies the racing mind
- **Boredom/abandonment**: Watching a bubble inflate is not engaging enough to hold attention
- **Passive consumption**: Listening to instructions keeps users in "receiving" mode, not "doing" mode

### The Solution: Trojan Horse Breathing

Research confirms that the therapeutic benefit of chanting, humming, Om toning, and similar practices comes primarily from the **forced long exhales** inherent in sustained vocalization—not from mystical vibration frequencies or vagal nerve "targeting."

**Core insight**: You cannot sustain a hum without a long, controlled exhale. The vocalization IS the breathing exercise.

By framing the experience as "resonance matching" rather than "breathing exercise":

1. Users focus on an engaging task (match the tone, feel the pulse)
2. The breathing happens automatically as a byproduct
3. No counting, no self-monitoring, no "doing it wrong"
4. The verbal/motor system is occupied, suppressing racing thoughts

---

## 2. Scientific Foundation

### What's Strongly Supported

| Claim                                                                     | Evidence Level      | Key Citations                                           |
| ------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------- |
| Exhale-dominant breathing activates parasympathetic response              | **Strong**          | Hayashi 2018, Meehan & Shaffer 2024, Lehrer et al. 2020 |
| Slow breathing (4.5-6.5 bpm) maximizes HRV through RSA resonance          | **Strong**          | Lehrer & Gevirtz 2014, Bernardi et al. 2001             |
| Vocalization suppresses internal verbalization (articulatory suppression) | **Moderate-Strong** | Baddeley Working Memory Model, Sokolov 1972 EMG studies |
| Biofeedback improves self-regulation skills                               | **Moderate**        | Goessl et al. 2017 meta-analysis (Hedges' g = 0.83)     |
| Humming increases HF-HRV                                                  | **Moderate**        | Inbaraj et al. 2022, Trivedi et al. 2023                |

### What We're NOT Claiming

| Overclaimed Concept                                          | Reality                                                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| "Matching your vocal frequency to stimulate specific nerves" | Phone motors can't produce precise frequencies; the mechanism is breath timing, not Hz matching |
| "Tactile binaural beats"                                     | No evidence this works through haptics                                                          |
| "Leading brain from beta to theta waves"                     | Neural entrainment effects are inconsistent in consumer contexts                                |
| "Vocal jitter as validated stress biomarker"                 | Research is equivocal; jitter alone lacks clinical sensitivity                                  |

### The Honest Mechanism Model

```
User hums → Forces long exhale (6-8 sec) → RSA activates → HR decreases
     ↓
Haptics provide feedback → User adjusts to maintain steady hum → Closed-loop attention
     ↓
Motor/verbal system occupied → Articulatory suppression → Racing thoughts interrupted
```

---

## 3. User Experience Design

### 3.1 Session Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SETUP PHASE                               │
│  • Duration selection (5 / 10 / 15 min)                         │
│  • Pre-session "mental noise" rating (1-10)                     │
│  • Brief instruction: "Hold phone to chest, hum along"          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      RESONANCE PHASE                             │
│  • Visual: Soft orb pulses at target breathing rhythm           │
│  • Audio: Optional low drone provides pitch reference           │
│  • Haptic: Phone vibrates when user's hum is detected           │
│  • User goal: "Match the orb's pulse with your voice"           │
│                                                                  │
│  Hidden reality: Orb timing = optimal breath timing             │
│  • Orb bright/expanding = exhale phase (user hums)              │
│  • Orb dim/contracting = inhale phase (user silent)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       ANCHOR PHASE                               │
│  • User stops humming, haptics continue but slow                │
│  • "Ghost anchor" tapers vibration over 30-60 seconds           │
│  • Trains association: stillness = the calm feeling             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUMMARY PHASE                               │
│  • Post-session "mental noise" rating                           │
│  • Show improvement: "Racing mind 7 → Calm 4"                   │
│  • Optional: Steadiness graph (not "stress detection")          │
│  • CTA: Meditate Now / Practice Again / Done                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Visual Design: The Resonance Orb

The orb serves multiple functions:

1. **Breath pacing guide** (hidden): Expansion/contraction timing matches optimal breath rhythm
2. **Feedback indicator** (visible): Glow intensity reflects hum steadiness
3. **Attention anchor**: Gives eyes something to rest on

**States:**

| State              | Visual                       | Meaning (User Sees)         | Reality                               |
| ------------------ | ---------------------------- | --------------------------- | ------------------------------------- |
| Expanding + bright | Orb grows, glow intensifies  | "The resonance is building" | Exhale phase - user should hum        |
| Contracting + dim  | Orb shrinks, glow fades      | "Let the resonance settle"  | Inhale phase - user should breathe in |
| Steady glow aura   | Cyan ring appears around orb | "You're locked in"          | Pitch stability detected              |
| Flickering         | Orb brightness wavers        | "Find your center"          | Pitch unstable / breath unsteady      |

**Animation timing** (mapped to breath phases):

```typescript
interface BreathCycle {
  inhaleMs: number // Orb contracts, dim
  exhaleMs: number // Orb expands, bright
  holdMs?: number // Optional pause at full expansion
}

// Example: 6 breaths per minute = 10 second cycle
// 4 sec inhale, 6 sec exhale = parasympathetic bias
const defaultCycle: BreathCycle = {
  inhaleMs: 4000,
  exhaleMs: 6000,
  holdMs: 0,
}
```

### 3.3 Haptic Design: Perceptual Resonance

We are NOT matching frequencies. We are creating a **felt sense of synchronization** through:

1. **Presence/absence**: Haptics ON during exhale (when hum detected), OFF during inhale
2. **Texture**: Smooth continuous pulse = steady hum. Choppy/stuttering = unstable
3. **Tapering**: Ghost anchor phase gradually increases gaps between pulses

**Haptic patterns:**

```typescript
// During active humming (exhale phase)
// Rapid micro-pulses feel like "resonance"
const resonancePattern = [8, 8, 8, 8, 8, 8, 8, 8] // [on, off, on, off...] in ms

// When pitch is unstable
// Irregular pattern feels "off"
const unstablePattern = [15, 30, 5, 50, 10, 20]

// Ghost anchor decay
// Progressively longer gaps
function getDecayPattern(step: number): number[] {
  const gap = Math.min(50 + step * 10, 500)
  return [10, gap]
}
```

### 3.4 Audio Design: The Reference Tone

**Optional** low drone provides:

- Pitch reference for users who want guidance
- Ambient soundscape that masks environment
- Frequency in comfortable humming range (120-180 Hz)

**NOT required**: Users can hum at any comfortable pitch. The app detects whatever they produce.

### 3.5 Instructional Copy

**Setup screen:**

> "Hold your phone against your chest with both hands. When the orb begins to glow, hum a low, steady tone—like 'hmmm' or 'om.' Feel the vibration in your hands match the vibration in your chest. That's your resonance."

**During practice (if shown at all):**

> "Match the orb's rhythm with your voice..."  
> "Let the resonance settle..."  
> "Find your center..."

**We never say:**

- "Breathe in for 4 seconds"
- "This is a breathing exercise"
- "Exhale now"

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESONANCE ANCHOR FEATURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   UI Layer   │    │ Breath Engine│    │ Audio Analysis│       │
│  │              │◄───┤   (Core IP)  │◄───┤              │       │
│  │ • Orb visual │    │              │    │ • Mic input  │       │
│  │ • Timer      │    │ • Phase state│    │ • Pitch (YIN)│       │
│  │ • Sliders    │    │ • Timing     │    │ • Amplitude  │       │
│  └──────────────┘    │ • Progression│    │ • Stability  │       │
│         │            └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         ▼                   ▼                    │               │
│  ┌──────────────┐    ┌──────────────┐           │               │
│  │Haptic Output │    │Session Store │◄──────────┘               │
│  │              │    │              │                            │
│  │ • Vibration  │    │ • Metrics    │                            │
│  │ • Patterns   │    │ • Progress   │                            │
│  └──────────────┘    └──────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 File Structure

```
src/
├── components/
│   └── ResonanceAnchor/
│       ├── index.tsx                 # Main orchestrator
│       ├── ResonanceAnchorSetup.tsx  # Duration picker, pre-assessment
│       ├── ResonanceAnchorPractice.tsx # Active session
│       ├── ResonanceAnchorSummary.tsx  # Results
│       ├── ResonanceOrb.tsx          # PixiJS visualization
│       ├── useResonanceOrb.ts        # Orb animation hook
│       └── MentalNoiseSlider.tsx     # Pre/post assessment
│
├── hooks/
│   ├── useResonanceSession.ts        # Session lifecycle
│   ├── useVoiceAnalysis.ts           # Mic + pitch detection
│   └── useHapticFeedback.ts          # Vibration control
│
├── lib/
│   ├── breathEngine.ts               # THE CORE IP
│   ├── pitchDetection.ts             # YIN algorithm wrapper
│   └── resonanceAnimation.ts         # Visual timing math
│
├── stores/
│   └── useResonanceStore.ts          # Session state (Zustand)
│
└── plugins/
    └── haptics.ts                    # Capacitor haptics wrapper
```

### 4.3 State Machine

```typescript
type ResonancePhase =
  | 'setup' // Duration selection, pre-assessment
  | 'intro' // Fade in, initial instructions
  | 'resonance' // Active practice with breath cycles
  | 'anchor' // Ghost anchor tapering
  | 'summary' // Results and post-assessment

type BreathPhase =
  | 'inhale' // Orb contracting, user silent
  | 'exhale' // Orb expanding, user humming
  | 'hold' // Optional pause

interface ResonanceState {
  // Session state
  phase: ResonancePhase
  durationSeconds: number
  elapsedSeconds: number

  // Breath engine state
  breathPhase: BreathPhase
  currentCycleMs: number
  cycleProgress: number // 0-1 within current breath cycle

  // Voice analysis state
  isHumming: boolean
  pitchHz: number | null
  pitchStability: number // 0-100

  // Metrics
  preSessionScore: number | null
  postSessionScore: number | null
  totalHummingMs: number
  steadinessScore: number
}
```

---

## 5. Core IP: The Breath Engine

This is the reusable module that powers all "disguised breath" features.

### 5.1 Responsibilities

1. **Phase timing**: Manages inhale/exhale/hold phases with configurable durations
2. **Progressive slowing**: Gradually lengthens cycles over session duration
3. **Event emission**: Notifies UI layer of phase changes
4. **Abstraction**: Agnostic to visual representation (orb, feather, whatever)

### 5.2 Interface

```typescript
// lib/breathEngine.ts

export interface BreathEngineConfig {
  // Timing
  initialBreathsPerMinute: number // Start faster (e.g., 8 bpm)
  targetBreathsPerMinute: number // End slower (e.g., 5.5 bpm)
  inhaleRatio: number // Portion of cycle for inhale (e.g., 0.4)
  exhaleRatio: number // Portion of cycle for exhale (e.g., 0.6)

  // Progression
  sessionDurationMs: number
  progressionCurve: 'linear' | 'easeOut' | 'stepped'

  // Callbacks
  onPhaseChange: (phase: BreathPhase, durationMs: number) => void
  onCycleComplete: (cycleNumber: number) => void
  onProgress: (progress: number) => void // 0-1 session progress
}

export interface BreathEngine {
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void

  // Current state
  getCurrentPhase: () => BreathPhase
  getPhaseProgress: () => number // 0-1 within current phase
  getCycleProgress: () => number // 0-1 within current cycle
  getCurrentBpm: () => number

  // For UI binding
  getTargetAmplitude: () => number // 0-1 for visual scaling
}

export function createBreathEngine(config: BreathEngineConfig): BreathEngine
```

### 5.3 Implementation

```typescript
// lib/breathEngine.ts

import BezierEasing from 'bezier-easing'

export type BreathPhase = 'inhale' | 'exhale' | 'hold'

export interface BreathEngineConfig {
  initialBreathsPerMinute: number
  targetBreathsPerMinute: number
  inhaleRatio: number
  exhaleRatio: number
  sessionDurationMs: number
  progressionCurve: 'linear' | 'easeOut' | 'stepped'
  onPhaseChange: (phase: BreathPhase, durationMs: number) => void
  onCycleComplete: (cycleNumber: number) => void
  onProgress: (progress: number) => void
}

// Easing for smooth deceleration
const easeOutCubic = BezierEasing(0.22, 0.61, 0.36, 1)

export function createBreathEngine(config: BreathEngineConfig) {
  let isRunning = false
  let isPaused = false
  let startTime = 0
  let pauseTime = 0
  let totalPausedMs = 0
  let animationId: number | null = null

  let currentPhase: BreathPhase = 'inhale'
  let cycleStartTime = 0
  let cycleNumber = 0

  /**
   * Calculate current breaths-per-minute based on session progress
   */
  function getCurrentBpm(sessionProgress: number): number {
    const { initialBreathsPerMinute, targetBreathsPerMinute, progressionCurve } = config

    let easedProgress: number
    switch (progressionCurve) {
      case 'easeOut':
        easedProgress = easeOutCubic(sessionProgress)
        break
      case 'stepped':
        // Step down every 25% of session
        easedProgress = Math.floor(sessionProgress * 4) / 4
        break
      default:
        easedProgress = sessionProgress
    }

    return (
      initialBreathsPerMinute - (initialBreathsPerMinute - targetBreathsPerMinute) * easedProgress
    )
  }

  /**
   * Get cycle duration in ms for current BPM
   */
  function getCycleDurationMs(bpm: number): number {
    return (60 / bpm) * 1000
  }

  /**
   * Main animation loop
   */
  function tick() {
    if (!isRunning || isPaused) return

    const now = performance.now()
    const elapsedMs = now - startTime - totalPausedMs
    const sessionProgress = Math.min(1, elapsedMs / config.sessionDurationMs)

    // Report session progress
    config.onProgress(sessionProgress)

    // Check if session complete
    if (sessionProgress >= 1) {
      stop()
      return
    }

    // Calculate current timing
    const bpm = getCurrentBpm(sessionProgress)
    const cycleDurationMs = getCycleDurationMs(bpm)
    const inhaleDurationMs = cycleDurationMs * config.inhaleRatio
    const exhaleDurationMs = cycleDurationMs * config.exhaleRatio

    // Time within current cycle
    const cycleElapsedMs = now - cycleStartTime

    // Determine phase
    let newPhase: BreathPhase
    let phaseProgress: number

    if (cycleElapsedMs < inhaleDurationMs) {
      newPhase = 'inhale'
      phaseProgress = cycleElapsedMs / inhaleDurationMs
    } else if (cycleElapsedMs < inhaleDurationMs + exhaleDurationMs) {
      newPhase = 'exhale'
      phaseProgress = (cycleElapsedMs - inhaleDurationMs) / exhaleDurationMs
    } else {
      // Cycle complete, start new cycle
      cycleStartTime = now
      cycleNumber++
      config.onCycleComplete(cycleNumber)
      newPhase = 'inhale'
      phaseProgress = 0
    }

    // Emit phase change if changed
    if (newPhase !== currentPhase) {
      currentPhase = newPhase
      const phaseDuration = newPhase === 'inhale' ? inhaleDurationMs : exhaleDurationMs
      config.onPhaseChange(newPhase, phaseDuration)
    }

    animationId = requestAnimationFrame(tick)
  }

  function start() {
    if (isRunning) return
    isRunning = true
    isPaused = false
    startTime = performance.now()
    cycleStartTime = startTime
    totalPausedMs = 0
    cycleNumber = 0
    currentPhase = 'inhale'

    config.onPhaseChange(
      'inhale',
      getCycleDurationMs(config.initialBreathsPerMinute) * config.inhaleRatio
    )
    animationId = requestAnimationFrame(tick)
  }

  function stop() {
    isRunning = false
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function pause() {
    if (!isRunning || isPaused) return
    isPaused = true
    pauseTime = performance.now()
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }

  function resume() {
    if (!isRunning || !isPaused) return
    isPaused = false
    totalPausedMs += performance.now() - pauseTime
    animationId = requestAnimationFrame(tick)
  }

  function getCurrentPhase(): BreathPhase {
    return currentPhase
  }

  function getPhaseProgress(): number {
    if (!isRunning) return 0
    const now = performance.now()
    const bpm = getCurrentBpm((now - startTime - totalPausedMs) / config.sessionDurationMs)
    const cycleDurationMs = getCycleDurationMs(bpm)
    const cycleElapsedMs = now - cycleStartTime

    if (currentPhase === 'inhale') {
      return Math.min(1, cycleElapsedMs / (cycleDurationMs * config.inhaleRatio))
    } else {
      const exhaleElapsed = cycleElapsedMs - cycleDurationMs * config.inhaleRatio
      return Math.min(1, exhaleElapsed / (cycleDurationMs * config.exhaleRatio))
    }
  }

  function getCycleProgress(): number {
    if (!isRunning) return 0
    const now = performance.now()
    const bpm = getCurrentBpm((now - startTime - totalPausedMs) / config.sessionDurationMs)
    const cycleDurationMs = getCycleDurationMs(bpm)
    return Math.min(1, (now - cycleStartTime) / cycleDurationMs)
  }

  function getTargetAmplitude(): number {
    // Returns 0-1 value for visual scaling
    // 0 at inhale start, 1 at exhale peak
    const phaseProgress = getPhaseProgress()

    if (currentPhase === 'inhale') {
      // Contracting: 1 → 0
      return 1 - phaseProgress
    } else {
      // Expanding: 0 → 1
      return phaseProgress
    }
  }

  return {
    start,
    stop,
    pause,
    resume,
    getCurrentPhase,
    getPhaseProgress,
    getCycleProgress,
    getCurrentBpm: () => {
      if (!isRunning) return config.initialBreathsPerMinute
      const elapsed = performance.now() - startTime - totalPausedMs
      return getCurrentBpm(elapsed / config.sessionDurationMs)
    },
    getTargetAmplitude,
  }
}
```

---

## 6. Implementation Specifications

### 6.1 Voice Analysis Hook

```typescript
// hooks/useVoiceAnalysis.ts

import { useState, useCallback, useRef, useEffect } from 'react'
import { YIN } from 'pitchfinder'

export interface VoiceAnalysisState {
  isListening: boolean
  isHumming: boolean
  pitchHz: number | null
  amplitude: number // 0-1 normalized
  stability: number // 0-100 (rolling pitch stability)
}

interface UseVoiceAnalysisOptions {
  minAmplitude?: number // Threshold to detect humming (default 0.02)
  minPitchHz?: number // Filter out noise below this (default 60)
  maxPitchHz?: number // Filter out noise above this (default 400)
  stabilityWindow?: number // Samples for stability calc (default 10)
}

export function useVoiceAnalysis(options: UseVoiceAnalysisOptions = {}) {
  const { minAmplitude = 0.02, minPitchHz = 60, maxPitchHz = 400, stabilityWindow = 10 } = options

  const [state, setState] = useState<VoiceAnalysisState>({
    isListening: false,
    isHumming: false,
    pitchHz: null,
    amplitude: 0,
    stability: 0,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const pitchHistoryRef = useRef<number[]>([])
  const animationIdRef = useRef<number | null>(null)

  const detectPitch = YIN({ sampleRate: 44100, threshold: 0.1 })

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      })

      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      setState((s) => ({ ...s, isListening: true }))

      // Start analysis loop
      const bufferLength = analyser.fftSize
      const dataArray = new Float32Array(bufferLength)

      function analyze() {
        if (!analyserRef.current) return

        analyserRef.current.getFloatTimeDomainData(dataArray)

        // Calculate amplitude (RMS)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i]
        }
        const rms = Math.sqrt(sum / bufferLength)
        const amplitude = Math.min(1, rms * 5) // Normalize

        // Detect pitch
        const pitch = detectPitch(dataArray)
        let pitchHz: number | null = null
        let isHumming = false

        if (pitch && pitch > minPitchHz && pitch < maxPitchHz && amplitude > minAmplitude) {
          pitchHz = pitch
          isHumming = true

          // Track pitch history for stability
          pitchHistoryRef.current.push(pitch)
          if (pitchHistoryRef.current.length > stabilityWindow) {
            pitchHistoryRef.current.shift()
          }
        }

        // Calculate stability (inverse of coefficient of variation)
        let stability = 0
        if (pitchHistoryRef.current.length >= 3) {
          const history = pitchHistoryRef.current
          const mean = history.reduce((a, b) => a + b, 0) / history.length
          const variance =
            history.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / history.length
          const cv = Math.sqrt(variance) / mean // Coefficient of variation
          stability = Math.max(0, Math.min(100, (1 - cv * 10) * 100))
        }

        setState({
          isListening: true,
          isHumming,
          pitchHz,
          amplitude,
          stability,
        })

        animationIdRef.current = requestAnimationFrame(analyze)
      }

      animationIdRef.current = requestAnimationFrame(analyze)

      return true
    } catch (error) {
      console.error('[VoiceAnalysis] Failed to start:', error)
      return false
    }
  }, [minAmplitude, minPitchHz, maxPitchHz, stabilityWindow, detectPitch])

  const stopListening = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    pitchHistoryRef.current = []

    setState({
      isListening: false,
      isHumming: false,
      pitchHz: null,
      amplitude: 0,
      stability: 0,
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return {
    ...state,
    startListening,
    stopListening,
  }
}
```

### 6.2 Haptic Feedback Hook

```typescript
// hooks/useHapticFeedback.ts

import { useCallback, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export interface HapticFeedbackControls {
  // Core patterns
  startResonance: () => void // Continuous resonance feel
  stopResonance: () => void

  // Texture control
  setStability: (stability: number) => void // 0-100, affects pattern smoothness

  // Ghost anchor
  startGhostAnchor: () => void // Begin decay pattern
  stopGhostAnchor: () => void

  // Platform info
  isSupported: boolean
}

export function useHapticFeedback(): HapticFeedbackControls {
  const resonanceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const ghostIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentStabilityRef = useRef(50)
  const ghostStepRef = useRef(0)

  const isNative = Capacitor.isNativePlatform()
  const hasWebVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator
  const isSupported = isNative || hasWebVibrate

  /**
   * Trigger a single haptic pulse
   */
  const pulse = useCallback(
    async (durationMs: number = 10) => {
      if (isNative) {
        await Haptics.impact({ style: ImpactStyle.Light })
      } else if (hasWebVibrate) {
        navigator.vibrate(durationMs)
      }
    },
    [isNative, hasWebVibrate]
  )

  /**
   * Start resonance pattern - continuous micro-pulses
   */
  const startResonance = useCallback(() => {
    if (!isSupported) return
    stopResonance()

    const tick = () => {
      const stability = currentStabilityRef.current

      if (stability > 70) {
        // Smooth resonance - regular pulses
        pulse(8)
      } else if (stability > 40) {
        // Slightly irregular
        pulse(Math.random() > 0.8 ? 15 : 8)
      } else {
        // Unstable - skip some pulses
        if (Math.random() > 0.3) {
          pulse(Math.random() > 0.5 ? 5 : 12)
        }
      }
    }

    // Pulse every 16ms (~60Hz) for resonance feel
    resonanceIntervalRef.current = setInterval(tick, 16)
  }, [isSupported, pulse])

  const stopResonance = useCallback(() => {
    if (resonanceIntervalRef.current) {
      clearInterval(resonanceIntervalRef.current)
      resonanceIntervalRef.current = null
    }
    if (hasWebVibrate) {
      navigator.vibrate(0) // Stop any ongoing vibration
    }
  }, [hasWebVibrate])

  const setStability = useCallback((stability: number) => {
    currentStabilityRef.current = Math.max(0, Math.min(100, stability))
  }, [])

  /**
   * Ghost anchor - progressively slower pulses
   */
  const startGhostAnchor = useCallback(() => {
    if (!isSupported) return
    stopResonance()
    stopGhostAnchor()

    ghostStepRef.current = 0

    const tick = () => {
      ghostStepRef.current++

      // Pulse
      pulse(15)

      // Calculate next delay (logarithmic increase)
      const baseDelay = 50
      const delay = Math.min(baseDelay * Math.pow(1.1, ghostStepRef.current), 3000)

      // Stop after ~30 seconds or when delay exceeds 3s
      if (delay < 3000) {
        ghostIntervalRef.current = setTimeout(tick, delay)
      }
    }

    tick()
  }, [isSupported, pulse])

  const stopGhostAnchor = useCallback(() => {
    if (ghostIntervalRef.current) {
      clearTimeout(ghostIntervalRef.current)
      ghostIntervalRef.current = null
    }
  }, [])

  return {
    startResonance,
    stopResonance,
    setStability,
    startGhostAnchor,
    stopGhostAnchor,
    isSupported,
  }
}
```

### 6.3 Main Practice Component

```typescript
// components/ResonanceAnchor/ResonanceAnchorPractice.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResonanceOrb } from './ResonanceOrb';
import { createBreathEngine, BreathPhase } from '../../lib/breathEngine';
import { useVoiceAnalysis } from '../../hooks/useVoiceAnalysis';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface ResonanceAnchorPracticeProps {
  durationSeconds: number;
  onComplete: (metrics: SessionMetrics) => void;
  onCancel: () => void;
}

interface SessionMetrics {
  totalHummingMs: number;
  averageStability: number;
  cyclesCompleted: number;
}

export function ResonanceAnchorPractice({
  durationSeconds,
  onComplete,
  onCancel,
}: ResonanceAnchorPracticeProps) {
  const [phase, setPhase] = useState<'intro' | 'active' | 'anchor' | 'complete'>('intro');
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [targetAmplitude, setTargetAmplitude] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);

  const breathEngineRef = useRef<ReturnType<typeof createBreathEngine> | null>(null);
  const metricsRef = useRef<SessionMetrics>({
    totalHummingMs: 0,
    averageStability: 0,
    cyclesCompleted: 0,
  });
  const stabilityHistoryRef = useRef<number[]>([]);
  const lastHummingTimeRef = useRef<number | null>(null);

  const voiceAnalysis = useVoiceAnalysis();
  const haptics = useHapticFeedback();

  // Initialize breath engine
  useEffect(() => {
    breathEngineRef.current = createBreathEngine({
      initialBreathsPerMinute: 8,      // Start at 8 bpm (7.5s cycles)
      targetBreathsPerMinute: 5.5,     // End at 5.5 bpm (10.9s cycles)
      inhaleRatio: 0.4,                // 40% inhale
      exhaleRatio: 0.6,                // 60% exhale (parasympathetic bias)
      sessionDurationMs: durationSeconds * 1000,
      progressionCurve: 'easeOut',

      onPhaseChange: (newPhase, durationMs) => {
        setBreathPhase(newPhase);

        // Haptic feedback follows breath phase
        if (newPhase === 'exhale') {
          // User should be humming - enable haptics if they are
          // (actual start is controlled by voice detection)
        } else {
          // Inhale phase - stop haptics
          haptics.stopResonance();
        }
      },

      onCycleComplete: (cycleNumber) => {
        metricsRef.current.cyclesCompleted = cycleNumber;
      },

      onProgress: (progress) => {
        setSessionProgress(progress);

        // Check for session complete
        if (progress >= 1 && phase === 'active') {
          transitionToAnchor();
        }
      },
    });

    return () => {
      breathEngineRef.current?.stop();
    };
  }, [durationSeconds, haptics]);

  // Start session after intro
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(async () => {
        const started = await voiceAnalysis.startListening();
        if (started) {
          breathEngineRef.current?.start();
          setPhase('active');
        }
      }, 3000); // 3s intro

      return () => clearTimeout(timer);
    }
  }, [phase, voiceAnalysis]);

  // Update orb amplitude from breath engine
  useEffect(() => {
    if (phase !== 'active') return;

    const updateAmplitude = () => {
      if (breathEngineRef.current) {
        setTargetAmplitude(breathEngineRef.current.getTargetAmplitude());
      }
      requestAnimationFrame(updateAmplitude);
    };

    const id = requestAnimationFrame(updateAmplitude);
    return () => cancelAnimationFrame(id);
  }, [phase]);

  // Link voice detection to haptics
  useEffect(() => {
    if (phase !== 'active') return;

    if (voiceAnalysis.isHumming && breathPhase === 'exhale') {
      // User is humming during exhale phase - activate haptics
      haptics.setStability(voiceAnalysis.stability);
      haptics.startResonance();

      // Track humming time
      if (lastHummingTimeRef.current === null) {
        lastHummingTimeRef.current = performance.now();
      }

      // Track stability
      stabilityHistoryRef.current.push(voiceAnalysis.stability);
    } else {
      // Not humming or wrong phase
      haptics.stopResonance();

      // Calculate humming duration
      if (lastHummingTimeRef.current !== null) {
        metricsRef.current.totalHummingMs += performance.now() - lastHummingTimeRef.current;
        lastHummingTimeRef.current = null;
      }
    }
  }, [voiceAnalysis.isHumming, voiceAnalysis.stability, breathPhase, phase, haptics]);

  const transitionToAnchor = useCallback(() => {
    // Finalize humming time
    if (lastHummingTimeRef.current !== null) {
      metricsRef.current.totalHummingMs += performance.now() - lastHummingTimeRef.current;
      lastHummingTimeRef.current = null;
    }

    // Calculate average stability
    if (stabilityHistoryRef.current.length > 0) {
      const sum = stabilityHistoryRef.current.reduce((a, b) => a + b, 0);
      metricsRef.current.averageStability = sum / stabilityHistoryRef.current.length;
    }

    breathEngineRef.current?.stop();
    voiceAnalysis.stopListening();
    haptics.stopResonance();

    // Start ghost anchor
    haptics.startGhostAnchor();
    setPhase('anchor');

    // Ghost anchor lasts 30 seconds
    setTimeout(() => {
      haptics.stopGhostAnchor();
      setPhase('complete');
      onComplete(metricsRef.current);
    }, 30000);
  }, [voiceAnalysis, haptics, onComplete]);

  const handleCancel = useCallback(() => {
    breathEngineRef.current?.stop();
    voiceAnalysis.stopListening();
    haptics.stopResonance();
    haptics.stopGhostAnchor();
    onCancel();
  }, [voiceAnalysis, haptics, onCancel]);

  return (
    <div className="fixed inset-0 bg-[#0A0A12] flex flex-col">
      {/* Cancel button */}
      {phase !== 'complete' && (
        <button
          onClick={handleCancel}
          className="absolute top-safe-top left-4 mt-4 text-white/50 text-sm"
        >
          Cancel
        </button>
      )}

      {/* Resonance Orb */}
      <div className="flex-1 flex items-center justify-center">
        <ResonanceOrb
          targetAmplitude={targetAmplitude}
          breathPhase={breathPhase}
          isHumming={voiceAnalysis.isHumming}
          stability={voiceAnalysis.stability}
          isActive={phase === 'active'}
        />
      </div>

      {/* Instructional text */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.p
            key="intro"
            className="absolute bottom-24 left-0 right-0 text-center text-white/70 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Hold your phone to your chest...
          </motion.p>
        )}

        {phase === 'active' && breathPhase === 'exhale' && !voiceAnalysis.isHumming && (
          <motion.p
            key="prompt"
            className="absolute bottom-24 left-0 right-0 text-center text-white/50 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Hum along with the orb...
          </motion.p>
        )}

        {phase === 'anchor' && (
          <motion.p
            key="anchor"
            className="absolute bottom-24 left-0 right-0 text-center text-white/70 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Let the resonance settle...
          </motion.p>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {phase === 'active' && (
        <div className="absolute bottom-8 left-8 right-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/30"
              style={{ width: `${sessionProgress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Session Duration & Progression

### 7.1 Duration Options

| Duration   | Target User                     | Breath Progression |
| ---------- | ------------------------------- | ------------------ |
| **5 min**  | Quick reset, first-timers       | 8 bpm → 6 bpm      |
| **10 min** | Standard practice (hero option) | 8 bpm → 5.5 bpm    |
| **15 min** | Deep practice                   | 8 bpm → 5 bpm      |

### 7.2 Breath Timing Per Duration

```typescript
const DURATION_CONFIGS = {
  5: {
    initialBpm: 8,
    targetBpm: 6,
    inhaleRatio: 0.4,
    exhaleRatio: 0.6,
  },
  10: {
    initialBpm: 8,
    targetBpm: 5.5,
    inhaleRatio: 0.4,
    exhaleRatio: 0.6,
  },
  15: {
    initialBpm: 8,
    targetBpm: 5,
    inhaleRatio: 0.35, // Slightly longer exhales for deeper practice
    exhaleRatio: 0.65,
  },
}
```

### 7.3 Cycle Counts

| Duration | Start Cycle | End Cycle | Total Cycles |
| -------- | ----------- | --------- | ------------ |
| 5 min    | 7.5 sec     | 10 sec    | ~35-40       |
| 10 min   | 7.5 sec     | 10.9 sec  | ~60-70       |
| 15 min   | 7.5 sec     | 12 sec    | ~85-95       |

---

## 8. Metrics & Validation

### 8.1 What We Measure

| Metric                    | What It Is                                   | What It Means           |
| ------------------------- | -------------------------------------------- | ----------------------- |
| **Humming Time**          | Total ms voice detected during exhale phases | Engagement / compliance |
| **Steadiness Score**      | Average pitch stability (0-100)              | Breath control quality  |
| **Cycles Completed**      | Number of full breath cycles                 | Session completion      |
| **Pre/Post Score Change** | Mental noise rating delta                    | Perceived benefit       |

### 8.2 What We DON'T Claim

- ❌ "Stress level detected" (vocal jitter is not validated for this)
- ❌ "Vagal tone measured" (we can't measure this)
- ❌ "Brain waves shifted" (we can't measure this)

### 8.3 Results Display

```
┌─────────────────────────────────────────────────────────────────┐
│                      Practice Complete                          │
│                                                                 │
│                    Mental noise: 7 → 4                          │
│                                                                 │
│          ┌─────────────────────────────────────────┐            │
│          │ You found 8m 12s of resonance           │            │
│          │ Your steadiness: 73%                    │            │
│          └─────────────────────────────────────────┘            │
│                                                                 │
│          Next time: let the hum rise from your chest,           │
│          not your throat.                                       │
│                                                                 │
│          [       Meditate Now       ]                           │
│          [       Practice Again     ]                           │
│          [           Done           ]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Platform Constraints & Workarounds

### 9.1 iOS Safari: No Vibration API

**Problem**: `navigator.vibrate()` is completely unsupported in Safari.

**Solution**: Build as Capacitor app for App Store distribution.

```typescript
// plugins/haptics.ts
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (Capacitor.isNativePlatform()) {
    const impactStyle = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }[style]

    await Haptics.impact({ style: impactStyle })
  } else if ('vibrate' in navigator) {
    // Android web fallback
    navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 30)
  }
  // iOS web: no haptics available - visual feedback only
}
```

### 9.2 Microphone Permissions

**iOS**: Requires `NSMicrophoneUsageDescription` in `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Listen to your voice to provide resonance feedback</string>
```

**Android**: Requires `RECORD_AUDIO` permission in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 9.3 Graceful Degradation

```typescript
// Detect capabilities
const capabilities = {
  haptics: Capacitor.isNativePlatform() || 'vibrate' in navigator,
  microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
}

// Feature availability
if (!capabilities.microphone) {
  // Show "microphone required" screen
}

if (!capabilities.haptics) {
  // Visual-only mode: orb glow responds to voice, no vibration
  // Still valuable for articulatory suppression benefit
}
```

---

## 10. Future Extensions

### 10.1 The Design Pattern

All "disguised breath" tools share:

1. **Visual metaphor** responding to breath phases
2. **Sound/breath detection** during exhale
3. **Breath Engine** controlling timing
4. **Feedback loop** rewarding steadiness

### 10.2 Floating Feather (Concept)

```
User exhales → Sound detected → Feather rises
User inhales → Silence → Feather drifts down

Physics rules (hidden breath timing):
- Feather fall rate calibrated to optimal inhale duration
- "Danger zone" near ground appears when inhale phase should end
- Feather stability = breath steadiness
```

### 10.3 Other Possibilities

- **Candle Flame**: Breath makes flame flicker without going out
- **Water Ripples**: Voice creates ripples that must stay within a circle
- **Singing Bowl**: Match the drone to keep bowl "ringing"
- **Color Fade**: Screen color shifts with breath phase

All share the same `breathEngine.ts` core.

---

## 11. Appendix: Code Snippets

### 11.1 YIN Pitch Detection (Reference)

Using the `pitchfinder` library:

```bash
npm install pitchfinder
```

```typescript
import * as Pitchfinder from 'pitchfinder'

const detectPitch = Pitchfinder.YIN({
  threshold: 0.1, // Lower = more sensitive, more false positives
  sampleRate: 44100, // Match your AudioContext sample rate
  probabilityThreshold: 0.1,
})

// Usage with Float32Array from AnalyserNode
const pitch = detectPitch(audioSamples) // Returns Hz or null
```

### 11.2 Resonance Orb Animation (PixiJS)

```typescript
// Orb visual states based on breath phase and voice detection

interface OrbState {
  scale: number // 0.7 (contracted) to 1.3 (expanded)
  glowIntensity: number // 0 (dim) to 1 (bright)
  glowColor: string // Base indigo to cyan when "locked in"
}

function getOrbState(
  breathPhase: BreathPhase,
  phaseProgress: number,
  isHumming: boolean,
  stability: number
): OrbState {
  // Base scale follows breath phase
  const baseScale =
    breathPhase === 'inhale'
      ? 1.3 - 0.6 * phaseProgress // Contract from 1.3 to 0.7
      : 0.7 + 0.6 * phaseProgress // Expand from 0.7 to 1.3

  // Glow intensity: bright during exhale, dim during inhale
  // Boosted when humming detected
  let glowIntensity = breathPhase === 'exhale' ? 0.6 : 0.2
  if (isHumming) {
    glowIntensity = Math.min(1, glowIntensity + 0.4)
  }

  // Color shifts to cyan when stability is high
  const glowColor =
    stability > 70 && isHumming
      ? '#00CED1' // Cyan - "locked in"
      : '#4B0082' // Indigo - base state

  return {
    scale: baseScale,
    glowIntensity,
    glowColor,
  }
}
```

### 11.3 Session Hook Integration

```typescript
// hooks/useResonanceSession.ts
// Follows same pattern as useRacingMindSession.ts

import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { addSession } from '../lib/db/sessions'
import { useHourBankStore } from '../stores/useHourBankStore'

export interface ResonanceSessionMetrics {
  totalHummingMs: number
  averageStability: number
  cyclesCompleted: number
  preSessionScore: number | null
  postSessionScore: number | null
}

export function useResonanceSession() {
  // ... similar lifecycle management to useRacingMindSession

  const endSession = useCallback(async (metrics: ResonanceSessionMetrics) => {
    const session = {
      uuid: sessionUuidRef.current,
      startTime: wallClockStartRef.current,
      endTime: Date.now(),
      durationSeconds: Math.round((performance.now() - startTimeRef.current) / 1000),
      sessionType: 'practice' as const,
      practiceToolId: 'resonance-anchor' as const,
      resonanceMetrics: {
        totalHummingSeconds: Math.round(metrics.totalHummingMs / 1000),
        averageStability: Math.round(metrics.averageStability),
        cyclesCompleted: metrics.cyclesCompleted,
        preSessionScore: metrics.preSessionScore,
        postSessionScore: metrics.postSessionScore,
      },
    }

    await addSession(session)
    // ... cleanup
  }, [])

  return { startSession, endSession, cancelSession /* ... */ }
}
```

---

## Summary

The Resonance Anchor is not a "frequency matching" tool or a "vagal nerve stimulator." It's a **cleverly disguised breathing exercise** that:

1. Forces optimal exhale timing through sustained vocalization
2. Provides engaging feedback that holds attention
3. Occupies the verbal mind through articulatory suppression
4. Progressively slows breathing rate over the session
5. Trains the association between stillness and calm

The scientific foundation is honest: exhale-dominant slow breathing reliably activates the parasympathetic nervous system. Everything else—the haptics, the orb, the "resonance" framing—is UX that makes users actually do the breathing without feeling like they're doing a breathing exercise.

---

_PRD Version 1.0 — Ready for Implementation_
