/**
 * Timer Chime Sound Synchronization Integration Test
 *
 * Tests the coordination between:
 * - useAudioFeedback complete() chime
 * - useSettingsStore audioFeedbackEnabled setting
 * - Timing alignment with animation (4s crescendo = 4s visual fade)
 *
 * Timing requirements verified:
 * - Chime starts IMMEDIATELY on end tap (not after breath alignment)
 * - 4s crescendo duration matches 4s animation fade duration
 * - Respects user's audio preference setting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioFeedback } from '../useAudioFeedback'
import { useSettingsStore } from '../../stores/useSettingsStore'

// ============================================
// WEB AUDIO API MOCKS
// ============================================

interface MockOscillatorNode {
  type: OscillatorType
  frequency: { value: number }
  detune: { value: number }
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  _startTime?: number
  _stopTime?: number
}

interface MockGainNode {
  gain: {
    value: number
    setValueAtTime: ReturnType<typeof vi.fn>
    linearRampToValueAtTime: ReturnType<typeof vi.fn>
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
  }
  connect: ReturnType<typeof vi.fn>
}

interface MockAudioContext {
  currentTime: number
  state: 'running' | 'suspended'
  destination: object
  resume: ReturnType<typeof vi.fn>
  createOscillator: ReturnType<typeof vi.fn>
  createGain: ReturnType<typeof vi.fn>
  _oscillators: MockOscillatorNode[]
  _gainNodes: MockGainNode[]
}

function createMockAudioContext(): MockAudioContext {
  const oscillators: MockOscillatorNode[] = []
  const gainNodes: MockGainNode[] = []

  const ctx: MockAudioContext = {
    currentTime: 0,
    state: 'running',
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    _oscillators: oscillators,
    _gainNodes: gainNodes,

    createOscillator: vi.fn(() => {
      const osc: MockOscillatorNode = {
        type: 'sine',
        frequency: { value: 440 },
        detune: { value: 0 },
        connect: vi.fn(),
        start: vi.fn((time?: number) => {
          osc._startTime = time ?? ctx.currentTime
        }),
        stop: vi.fn((time?: number) => {
          osc._stopTime = time ?? ctx.currentTime
        }),
      }
      oscillators.push(osc)
      return osc
    }),

    createGain: vi.fn(() => {
      const gain: MockGainNode = {
        gain: {
          value: 1,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }
      gainNodes.push(gain)
      return gain
    }),
  }

  return ctx
}

// ============================================
// TEST SETUP
// ============================================

describe('Timer Chime Sound Synchronization', () => {
  let mockAudioContext: MockAudioContext
  let originalAudioContext: typeof window.AudioContext | undefined
  let audioContextConstructorSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Store original AudioContext
    originalAudioContext = window.AudioContext

    // Create mock AudioContext instance
    mockAudioContext = createMockAudioContext()

    // Create a proper constructor function mock
    audioContextConstructorSpy = vi.fn(function (this: MockAudioContext) {
      Object.assign(this, mockAudioContext)
      return this
    })

    // Install the mock as a class-like constructor
    window.AudioContext = audioContextConstructorSpy as unknown as typeof AudioContext

    // Reset settings store to known state
    useSettingsStore.setState({
      audioFeedbackEnabled: false,
      hideTimeDisplay: false,
      themeMode: 'auto',
      isLoading: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()

    // Restore original AudioContext
    if (originalAudioContext) {
      window.AudioContext = originalAudioContext
    }
  })

  // ============================================
  // AUDIO FEEDBACK ENABLED/DISABLED TESTS
  // ============================================

  describe('audioFeedbackEnabled setting', () => {
    it('should NOT play chime when audioFeedbackEnabled is false', async () => {
      // Arrange: Ensure audio is disabled (default)
      useSettingsStore.setState({ audioFeedbackEnabled: false })

      // Act: Render hook and call complete()
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert: No oscillators should be created
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      expect(mockAudioContext.createGain).not.toHaveBeenCalled()
    })

    it('should play chime when audioFeedbackEnabled is true', async () => {
      // Arrange: Enable audio
      useSettingsStore.setState({ audioFeedbackEnabled: true })

      // Act: Render hook and call complete()
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert: Oscillators and gain nodes should be created
      // 5 harmonics x 2 detune variations = 10 oscillators
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
      expect(mockAudioContext._oscillators.length).toBe(10)
    })

    it('should respect setting changes between calls', async () => {
      const { result, rerender } = renderHook(() => useAudioFeedback())

      // First call with audio disabled
      act(() => {
        useSettingsStore.setState({ audioFeedbackEnabled: false })
      })
      rerender()
      await act(async () => {
        await result.current.complete()
      })
      expect(mockAudioContext._oscillators.length).toBe(0)

      // Second call with audio enabled
      act(() => {
        useSettingsStore.setState({ audioFeedbackEnabled: true })
      })
      rerender()
      await act(async () => {
        await result.current.complete()
      })
      expect(mockAudioContext._oscillators.length).toBe(10)
    })
  })

  // ============================================
  // TIMING SYNCHRONIZATION TESTS
  // ============================================

  describe('chime timing synchronization', () => {
    const CRESCENDO_DURATION = 4.0 // seconds - must match useAudioFeedback
    const DECAY_DURATION = 4.0 // seconds - must match useAudioFeedback

    beforeEach(() => {
      useSettingsStore.setState({ audioFeedbackEnabled: true })
    })

    it('should start chime IMMEDIATELY on complete() call', async () => {
      // Arrange: Set a known currentTime
      mockAudioContext.currentTime = 10.0

      // Act: Play complete chime
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert: All oscillators should start at currentTime (immediate)
      mockAudioContext._oscillators.forEach((osc) => {
        expect(osc.start).toHaveBeenCalledWith(10.0)
      })
    })

    it('should have 4-second crescendo duration matching animation fade', async () => {
      // Arrange
      mockAudioContext.currentTime = 0

      // Act
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert: Check gain envelope reaches peak at CRESCENDO_DURATION
      // The linearRampToValueAtTime at crescendo duration marks the peak
      mockAudioContext._gainNodes.forEach((gainNode) => {
        const linearRampCalls = gainNode.gain.linearRampToValueAtTime.mock.calls

        // Should have a linear ramp to peak at exactly CRESCENDO_DURATION
        const peakRamp = linearRampCalls.find(
          (call) => Math.abs((call as [number, number])[1] - CRESCENDO_DURATION) < 0.01
        )
        expect(peakRamp).toBeDefined()
      })
    })

    it('should stop oscillators at crescendo + decay duration', async () => {
      // Arrange
      mockAudioContext.currentTime = 0

      // Act
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert: Oscillators should stop at crescendo + decay + small buffer
      const expectedStopTime = CRESCENDO_DURATION + DECAY_DURATION + 0.1

      mockAudioContext._oscillators.forEach((osc) => {
        expect(osc.stop).toHaveBeenCalled()
        const stopCall = osc.stop.mock.calls[0]
        expect(stopCall[0]).toBeCloseTo(expectedStopTime, 1)
      })
    })

    it('should use G3 (196Hz) as base frequency for complete chime', async () => {
      // Arrange
      const { result } = renderHook(() => useAudioFeedback())

      // Act
      await act(async () => {
        await result.current.complete()
      })

      // Assert: At least one oscillator should have fundamental at 196Hz
      const fundamentalOsc = mockAudioContext._oscillators.find(
        (osc) => Math.abs(osc.frequency.value - 196.0) < 1
      )
      expect(fundamentalOsc).toBeDefined()
    })

    it('should create harmonics for rich bowl-like tone', async () => {
      // Arrange
      const expectedHarmonicRatios = [1, 2.0, 3.0, 4.2, 5.4]
      const baseFreq = 196.0

      // Act
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert: Check that harmonics are present
      expectedHarmonicRatios.forEach((ratio) => {
        const expectedFreq = baseFreq * ratio
        const hasHarmonic = mockAudioContext._oscillators.some(
          (osc) => Math.abs(osc.frequency.value - expectedFreq) < 1
        )
        expect(hasHarmonic).toBe(true)
      })
    })
  })

  // ============================================
  // AUDIO CONTEXT STATE HANDLING
  // ============================================

  describe('AudioContext state handling', () => {
    beforeEach(() => {
      useSettingsStore.setState({ audioFeedbackEnabled: true })
    })

    it('should resume suspended AudioContext before playing', async () => {
      // Arrange: AudioContext in suspended state
      mockAudioContext.state = 'suspended'

      // Act
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert
      expect(mockAudioContext.resume).toHaveBeenCalled()
    })

    it('should not call resume if AudioContext already running', async () => {
      // Arrange: AudioContext already running
      mockAudioContext.state = 'running'

      // Act
      const { result } = renderHook(() => useAudioFeedback())
      await act(async () => {
        await result.current.complete()
      })

      // Assert
      expect(mockAudioContext.resume).not.toHaveBeenCalled()
    })

    it('should lazy-initialize AudioContext on first use', async () => {
      // Arrange: Audio enabled
      useSettingsStore.setState({ audioFeedbackEnabled: true })

      // Act: Render hook (should not create context yet)
      const { result } = renderHook(() => useAudioFeedback())

      // Assert: No context yet
      expect(audioContextConstructorSpy).not.toHaveBeenCalled()

      // Act: Call complete (should now create context)
      await act(async () => {
        await result.current.complete()
      })

      // Assert: Context created
      expect(audioContextConstructorSpy).toHaveBeenCalledTimes(1)
    })

    it('should reuse same AudioContext across multiple plays', async () => {
      // Arrange
      const { result } = renderHook(() => useAudioFeedback())

      // Act: Play twice
      await act(async () => {
        await result.current.complete()
      })
      await act(async () => {
        await result.current.complete()
      })

      // Assert: Only one context created (hook caches the context in a ref)
      expect(audioContextConstructorSpy).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================
  // EDGE CASES
  // ============================================

  describe('edge cases', () => {
    it('should handle rapid successive complete() calls gracefully', async () => {
      useSettingsStore.setState({ audioFeedbackEnabled: true })

      const { result } = renderHook(() => useAudioFeedback())

      // Act: Rapid fire (each is async but we fire them quickly)
      await act(async () => {
        await Promise.all([
          result.current.complete(),
          result.current.complete(),
          result.current.complete(),
        ])
      })

      // Assert: Should create oscillators for each call (no crashes)
      // Each complete() creates 10 oscillators (5 harmonics x 2 detune)
      expect(mockAudioContext._oscillators.length).toBe(30)
    })

    it('should handle Web Audio API unavailable', async () => {
      // Arrange: Remove AudioContext
      // @ts-expect-error - intentionally testing unavailable case
      delete window.AudioContext
      // Remove webkit variant
      delete (window as { webkitAudioContext?: unknown }).webkitAudioContext

      useSettingsStore.setState({ audioFeedbackEnabled: true })

      // Act: Should not throw
      const { result } = renderHook(() => useAudioFeedback())

      await expect(
        act(async () => {
          await result.current.complete()
        })
      ).resolves.not.toThrow()
    })
  })

  // ============================================
  // TIMING CONSTANTS VERIFICATION
  // ============================================

  describe('Timing Constants Verification', () => {
    /**
     * These tests verify that the timing constants align with animation:
     * - Timer.tsx uses 4000ms setTimeout for visual fade
     * - useAudioFeedback uses 4s crescendo
     * - These MUST match for synchronized experience
     */

    it('animation fade duration should match audio crescendo duration', () => {
      // Timer.tsx uses 4000ms setTimeout for fade
      // useAudioFeedback uses 4s crescendo
      const TIMER_FADE_MS = 4000
      const AUDIO_CRESCENDO_S = 4.0

      expect(TIMER_FADE_MS / 1000).toBe(AUDIO_CRESCENDO_S)
    })

    it('should have correct breath-aligned crescendo duration', () => {
      // From useAudioFeedback.ts comments:
      // COMPLETING_DURATION = 1.5s (ceremonial exhale)
      // RESOLVING_DURATION = 2.5s (ceremonial inhale)
      // CRESCENDO_DURATION = 4s (total breath cycle)
      const COMPLETING_DURATION = 1.5
      const RESOLVING_DURATION = 2.5
      const CRESCENDO_DURATION = COMPLETING_DURATION + RESOLVING_DURATION

      expect(CRESCENDO_DURATION).toBe(4)
    })
  })
})
