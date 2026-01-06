/**
 * InsightCapture - Post-meditation voice note capture
 *
 * Shown after meditation session completes.
 * Flow:
 * 1. Tap to start recording
 * 2. Speak your insight (real-time transcription shown)
 * 3. Tap to stop and save
 * 4. Option to skip
 *
 * Design: Minimal, no prompts, just capture
 */

import { useState, useCallback, useEffect } from 'react'
import { useVoiceCapture } from '../hooks/useVoiceCapture'
import { addInsight } from '../lib/db'
import { formatDuration } from '../lib/format'

interface InsightCaptureProps {
  sessionId?: string
  onComplete: () => void
  onSkip: () => void
}

export function InsightCapture({ sessionId, onComplete, onSkip }: InsightCaptureProps) {
  const {
    state,
    error,
    displayText,
    durationMs,
    isSupported,
    isRecording,
    startCapture,
    stopCapture,
    cancelCapture
  } = useVoiceCapture()

  const [isSaving, setIsSaving] = useState(false)

  // Auto-start recording on mount (after brief delay for UI to settle)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSupported && state === 'idle') {
        startCapture()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [isSupported, state, startCapture])

  // Handle stop and save
  const handleStopAndSave = useCallback(async () => {
    if (!isRecording) return

    setIsSaving(true)
    try {
      const result = await stopCapture()

      // Save insight - use transcript or placeholder if empty
      const textToSave = result?.transcript?.trim() || displayText?.trim() || '[Voice note captured]'
      await addInsight({
        sessionId: sessionId || null,
        rawText: textToSave
      })

      onComplete()
    } catch (err) {
      console.error('Failed to save insight:', err)
      onComplete() // Continue anyway
    } finally {
      setIsSaving(false)
    }
  }, [isRecording, stopCapture, sessionId, onComplete, displayText])

  // Handle skip
  const handleSkip = useCallback(() => {
    if (isRecording) {
      cancelCapture()
    }
    onSkip()
  }, [isRecording, cancelCapture, onSkip])

  // Not supported fallback
  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream p-8">
        <p className="font-serif text-xl text-ink mb-4">
          Voice capture not supported
        </p>
        <p className="text-sm text-ink/50 mb-8 text-center">
          Your browser doesn't support voice recording. Try Chrome or Safari.
        </p>
        <button
          onClick={onSkip}
          className="py-3 px-6 text-ink/60 hover:text-ink transition-colors"
        >
          Continue
        </button>
      </div>
    )
  }

  // Error state
  if (state === 'error' && error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream p-8">
        <p className="font-serif text-xl text-ink mb-4">
          Couldn't access microphone
        </p>
        <p className="text-sm text-ink/50 mb-8 text-center max-w-xs">
          {error}
        </p>
        <button
          onClick={onSkip}
          className="py-3 px-6 text-ink/60 hover:text-ink transition-colors"
        >
          Skip
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      {/* Header */}
      <div className="flex-none px-6 pt-8 pb-4">
        <button
          onClick={handleSkip}
          className="text-sm text-ink/40 hover:text-ink/60 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32">
        {/* Recording indicator */}
        <div className="mb-8">
          {isRecording ? (
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-rose-400/20 animate-ping" />
              {/* Center dot */}
              <div className="relative w-20 h-20 rounded-full bg-rose-400 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-cream" />
              </div>
            </div>
          ) : state === 'requesting' ? (
            <div className="w-20 h-20 rounded-full bg-ink/10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-ink/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          )}
        </div>

        {/* Duration */}
        {isRecording && (
          <p className="text-sm text-ink/40 tabular-nums mb-6">
            {formatDuration(Math.floor(durationMs / 1000))}
          </p>
        )}

        {/* Prompt text */}
        <p className="font-serif text-xl text-ink mb-8 text-center">
          {isRecording
            ? 'Speak your insight...'
            : state === 'requesting'
              ? 'Requesting microphone...'
              : 'Capture a thought'}
        </p>

        {/* Transcription display */}
        <div className="w-full max-w-md min-h-[120px] mb-8">
          {displayText ? (
            <p className="text-ink/70 leading-relaxed text-center">
              {displayText}
            </p>
          ) : isRecording ? (
            <p className="text-ink/30 text-center italic">
              Listening...
            </p>
          ) : null}
        </div>
      </div>

      {/* Bottom action */}
      <div className="flex-none pb-12 px-8">
        {isRecording && (
          <button
            onClick={handleStopAndSave}
            disabled={isSaving}
            className={`
              w-full py-4 rounded-xl font-medium transition-all
              ${isSaving
                ? 'bg-ink/20 text-ink/40'
                : 'bg-ink text-cream active:scale-[0.98]'
              }
            `}
          >
            {isSaving ? 'Saving...' : 'Done'}
          </button>
        )}
      </div>
    </div>
  )
}
