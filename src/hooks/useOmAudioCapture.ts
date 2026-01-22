/**
 * useOmAudioCapture - Microphone stream and AudioContext for Aum Coach
 *
 * Provides raw audio data for pitch and phoneme detection.
 * Critical: Uses refs for continuous audio data - NOT React state.
 * This is essential for 60fps Canvas rendering without re-render overhead.
 *
 * Based on patterns from useAudioLevel.ts and voiceRecording.ts
 */

import { useRef, useCallback, useEffect, useState } from 'react'

export interface OmAudioCaptureResult {
  isCapturing: boolean
  error: string | null
  // Access raw audio data via these getters (NOT React state)
  getTimeDomainData: () => Uint8Array | null
  getFrequencyData: () => Float32Array | null
  getAnalyser: () => AnalyserNode | null
  getAudioContext: () => AudioContext | null
  getSampleRate: () => number
  // Control methods
  startCapture: () => Promise<void>
  stopCapture: () => void
}

// Buffer size for sub-50ms latency (1024 samples @ 48kHz = ~21ms)
const FFT_SIZE = 2048
const NOISE_GATE_THRESHOLD = 0.01 // RMS below this = silence

export function useOmAudioCapture(): OmAudioCaptureResult {
  // isCapturing and error use React state for re-renders
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // All mutable audio state in refs - NOT React state
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const isCapturingRef = useRef(false) // Keep ref for sync checks in callbacks

  // Pre-allocated buffers for zero-allocation reads
  const timeDomainDataRef = useRef<Uint8Array | null>(null)
  const frequencyDataRef = useRef<Float32Array | null>(null)

  /**
   * Get current time-domain audio data
   * Returns null if not capturing or below noise gate
   */
  const getTimeDomainData = useCallback((): Uint8Array | null => {
    const analyser = analyserRef.current
    const data = timeDomainDataRef.current
    if (!analyser || !data || !isCapturingRef.current) return null

    analyser.getByteTimeDomainData(data as Uint8Array<ArrayBuffer>)
    return data
  }, [])

  /**
   * Get current frequency data (for pitch detection)
   * Returns null if not capturing
   */
  const getFrequencyData = useCallback((): Float32Array | null => {
    const analyser = analyserRef.current
    const data = frequencyDataRef.current
    if (!analyser || !data || !isCapturingRef.current) return null

    analyser.getFloatTimeDomainData(data as Float32Array<ArrayBuffer>)
    return data
  }, [])

  /**
   * Get the AnalyserNode for advanced audio processing
   */
  const getAnalyser = useCallback((): AnalyserNode | null => {
    return analyserRef.current
  }, [])

  /**
   * Get the AudioContext for sample rate access
   */
  const getAudioContext = useCallback((): AudioContext | null => {
    return audioContextRef.current
  }, [])

  /**
   * Get the sample rate (varies by device - iOS uses 48kHz)
   */
  const getSampleRate = useCallback((): number => {
    return audioContextRef.current?.sampleRate ?? 44100
  }, [])

  /**
   * Start audio capture from microphone
   */
  const startCapture = useCallback(async (): Promise<void> => {
    if (isCapturingRef.current) return

    try {
      setError(null)

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Disabled for pitch accuracy
          noiseSuppression: false, // Disabled for pitch accuracy
          autoGainControl: false, // Disabled for consistent levels
        },
      })
      streamRef.current = stream

      // Create AudioContext with webkit fallback for iOS Safari
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext

      // Resume context if suspended (required for iOS)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // Create and configure AnalyserNode
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0.3 // Lower = more responsive
      analyserRef.current = analyser

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      sourceRef.current = source

      // Pre-allocate buffers
      timeDomainDataRef.current = new Uint8Array(analyser.fftSize)
      frequencyDataRef.current = new Float32Array(analyser.fftSize)

      isCapturingRef.current = true
      setIsCapturing(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied'
      setError(message)
      throw err
    }
  }, [])

  /**
   * Stop audio capture and clean up resources
   */
  const stopCapture = useCallback((): void => {
    isCapturingRef.current = false
    setIsCapturing(false)

    // Stop all tracks on the media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Disconnect source node
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    timeDomainDataRef.current = null
    frequencyDataRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture()
    }
  }, [stopCapture])

  return {
    isCapturing,
    error,
    getTimeDomainData,
    getFrequencyData,
    getAnalyser,
    getAudioContext,
    getSampleRate,
    startCapture,
    stopCapture,
  }
}

/**
 * Calculate RMS (root mean square) for noise gating
 * Returns a value from 0-1 indicating signal strength
 */
export function calculateRMS(data: Uint8Array): number {
  let sumSquares = 0
  for (let i = 0; i < data.length; i++) {
    const deviation = (data[i] - 128) / 128
    sumSquares += deviation * deviation
  }
  return Math.sqrt(sumSquares / data.length)
}

/**
 * Check if audio level is above noise gate threshold
 */
export function isAboveNoiseGate(data: Uint8Array): boolean {
  return calculateRMS(data) > NOISE_GATE_THRESHOLD
}
