/**
 * useVoiceCapture - Combined voice recording + transcription hook
 *
 * Handles the complete flow:
 * 1. Request microphone permission
 * 2. Start recording audio (for storage)
 * 3. Start real-time transcription (for display)
 * 4. Stop and return both audio blob and transcript
 */

import { useState, useCallback, useRef } from 'react'
import {
  isVoiceRecordingSupported,
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  cancelRecording
} from '../services/voiceRecording'
import {
  isWebSpeechSupported,
  startTranscription,
  stopTranscription,
  compileTranscription,
  TranscriptionResult
} from '../services/transcription'

export type CaptureState = 'idle' | 'requesting' | 'recording' | 'processing' | 'error'

export interface CaptureResult {
  transcript: string
  audioBlob: Blob | null
  durationMs: number
}

export function useVoiceCapture() {
  const [state, setState] = useState<CaptureState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [interimText, setInterimText] = useState<string>('')
  const [durationMs, setDurationMs] = useState<number>(0)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  // Refs to track recording state
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const transcriptionResultsRef = useRef<TranscriptionResult[]>([])
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<number | null>(null)

  // Check browser support
  const isSupported = isVoiceRecordingSupported() && isWebSpeechSupported()

  /**
   * Start voice capture (recording + transcription)
   */
  const startCapture = useCallback(async () => {
    setError(null)
    setTranscript('')
    setInterimText('')
    setDurationMs(0)
    transcriptionResultsRef.current = []

    try {
      setState('requesting')

      // Request microphone permission
      const stream = await requestMicrophonePermission()
      mediaStreamRef.current = stream
      setMediaStream(stream) // Set state to trigger re-render for audio level hook

      setState('recording')
      startTimeRef.current = Date.now()

      // Start duration counter
      durationIntervalRef.current = window.setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current)
      }, 100)

      // Start audio recording
      await startRecording(stream)

      // Start real-time transcription
      startTranscription({
        onResult: (result) => {
          if (result.isFinal) {
            transcriptionResultsRef.current.push(result)
            // Update transcript with all final results
            const compiled = compileTranscription(transcriptionResultsRef.current)
            setTranscript(compiled)
            setInterimText('')
          } else {
            // Show interim text
            setInterimText(result.text)
          }
        },
        onError: (errorMsg) => {
          console.warn('Transcription error:', errorMsg)
          // Don't stop recording on transcription error
          // User can still record, just won't see real-time text
        },
        onEnd: () => {
          // Transcription ended (might restart automatically)
        }
      })
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      cleanup()
    }
  }, [])

  /**
   * Stop capture and return results
   */
  const stopCapture = useCallback(async (): Promise<CaptureResult | null> => {
    if (state !== 'recording') {
      return null
    }

    setState('processing')

    try {
      // Stop transcription first
      stopTranscription()

      // Stop audio recording
      const result = await stopRecording()

      // Compile final transcript
      const finalTranscript = compileTranscription(transcriptionResultsRef.current)

      // Cleanup
      cleanup()

      setState('idle')

      return {
        transcript: finalTranscript || interimText, // Use interim if no final
        audioBlob: result?.audioBlob || null,
        durationMs: result?.durationMs || Date.now() - startTimeRef.current
      }
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
      cleanup()
      return null
    }
  }, [state, interimText])

  /**
   * Cancel capture without saving
   */
  const cancelCapture = useCallback(() => {
    stopTranscription()
    cancelRecording()
    cleanup()
    setState('idle')
    setTranscript('')
    setInterimText('')
  }, [])

  /**
   * Cleanup function
   */
  const cleanup = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    setMediaStream(null)
    transcriptionResultsRef.current = []
  }

  return {
    state,
    error,
    transcript,
    interimText,
    durationMs,
    isSupported,
    isRecording: state === 'recording',
    mediaStream, // Now using state instead of ref for proper React dependency tracking
    startCapture,
    stopCapture,
    cancelCapture,
    // Combined display text (final + interim)
    displayText: transcript + (interimText ? (transcript ? ' ' : '') + interimText : '')
  }
}
