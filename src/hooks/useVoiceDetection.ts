/**
 * useVoiceDetection - Simplified hum detection for Resonance Anchor
 *
 * Uses Web Audio API to detect whether the user is humming.
 * Much simpler than Aum Coach — only needs:
 * - Is the user humming? (RMS amplitude above threshold)
 * - Optional pitch stability (rolling coefficient of variation)
 *
 * Independent implementation — does not import from Aum Coach hooks.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface VoiceDetectionState {
  isListening: boolean
  isHumming: boolean
  stability: number // 0-100 pitch stability score
  amplitude: number // 0-1 normalized RMS
}

interface UseVoiceDetectionOptions {
  /** RMS threshold to consider as humming (default 0.015) */
  minAmplitude?: number
  /** Number of samples for stability calc (default 12) */
  stabilityWindow?: number
}

export function useVoiceDetection(options: UseVoiceDetectionOptions = {}) {
  const { minAmplitude = 0.015, stabilityWindow = 12 } = options

  const [state, setState] = useState<VoiceDetectionState>({
    isListening: false,
    isHumming: false,
    stability: 0,
    amplitude: 0,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const amplitudeHistoryRef = useRef<number[]>([])

  const startListening = useCallback(async (): Promise<boolean> => {
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

      // Start analysis loop
      const bufferLength = analyser.fftSize
      const dataArray = new Float32Array(bufferLength)

      function analyze() {
        if (!analyserRef.current) return

        analyserRef.current.getFloatTimeDomainData(dataArray)

        // Calculate RMS amplitude
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i]
        }
        const rms = Math.sqrt(sum / bufferLength)
        const amplitude = Math.min(1, rms * 5) // Normalize to 0-1

        const isHumming = amplitude > minAmplitude

        // Track amplitude history for stability measurement
        // Stability = how consistent the amplitude is (steady hum vs choppy)
        if (isHumming) {
          amplitudeHistoryRef.current.push(amplitude)
          if (amplitudeHistoryRef.current.length > stabilityWindow) {
            amplitudeHistoryRef.current.shift()
          }
        }

        // Calculate stability from amplitude consistency
        let stability = 0
        const history = amplitudeHistoryRef.current
        if (history.length >= 3 && isHumming) {
          const mean = history.reduce((a, b) => a + b, 0) / history.length
          const variance = history.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / history.length
          const cv = Math.sqrt(variance) / mean // Coefficient of variation
          // Lower CV = more stable. Map to 0-100 score.
          stability = Math.max(0, Math.min(100, (1 - cv * 5) * 100))
        }

        setState({
          isListening: true,
          isHumming,
          stability,
          amplitude,
        })

        animationIdRef.current = requestAnimationFrame(analyze)
      }

      setState((s) => ({ ...s, isListening: true }))
      animationIdRef.current = requestAnimationFrame(analyze)

      return true
    } catch (error) {
      console.error('[VoiceDetection] Failed to start:', error)
      return false
    }
  }, [minAmplitude, stabilityWindow])

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
    amplitudeHistoryRef.current = []

    setState({
      isListening: false,
      isHumming: false,
      stability: 0,
      amplitude: 0,
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
