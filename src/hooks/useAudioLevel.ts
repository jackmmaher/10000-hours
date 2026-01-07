/**
 * useAudioLevel - Real-time audio level visualization
 *
 * Uses Web Audio API to analyze microphone input and return
 * a normalized audio level (0-1) for visual feedback.
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export function useAudioLevel() {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startAnalyzing = useCallback(async (stream: MediaStream) => {
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext

      // Resume audio context - required for iOS Safari where context starts suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // Create analyser
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      // Connect stream to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      streamRef.current = stream

      // Start animation loop - use time domain data for iOS Safari compatibility
      // (getByteFrequencyData returns zeros on iOS Safari)
      const dataArray = new Uint8Array(analyser.fftSize)

      const updateLevel = () => {
        if (!analyserRef.current) return

        // Use time domain data - more reliable across browsers including iOS Safari
        analyserRef.current.getByteTimeDomainData(dataArray)

        // Calculate RMS (root mean square) for audio level
        // Time domain values are centered at 128, deviation indicates amplitude
        let sumSquares = 0
        for (let i = 0; i < dataArray.length; i++) {
          const deviation = (dataArray[i] - 128) / 128 // Normalize to -1 to 1
          sumSquares += deviation * deviation
        }
        const rms = Math.sqrt(sumSquares / dataArray.length)

        // Boost for visibility (voice typically has low RMS values)
        const normalized = Math.min(1, rms * 4)
        setAudioLevel(normalized)

        animationRef.current = requestAnimationFrame(updateLevel)
      }

      setIsActive(true)
      updateLevel()
    } catch (err) {
      console.error('Failed to start audio analysis:', err)
    }
  }, [])

  const stopAnalyzing = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    streamRef.current = null
    setIsActive(false)
    setAudioLevel(0)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzing()
    }
  }, [stopAnalyzing])

  return {
    audioLevel,
    isActive,
    startAnalyzing,
    stopAnalyzing
  }
}
