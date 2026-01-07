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

      // Start animation loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average level
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const average = sum / dataArray.length

        // Normalize to 0-1 range with some boost for visibility
        const normalized = Math.min(1, (average / 128) * 1.5)
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
