/**
 * InsightCapture - Post-meditation voice note capture
 *
 * Shown after meditation session completes.
 * Features audio level visualization for feedback.
 */

import { useState, useCallback, useEffect } from 'react'
import { useVoiceCapture } from '../hooks/useVoiceCapture'
import { useAudioLevel } from '../hooks/useAudioLevel'
import { addInsight } from '../lib/db'
import { formatDuration } from '../lib/format'

interface InsightCaptureProps {
  sessionId?: string
  onComplete: () => void
  onSkip: () => void
}

// Claude-style horizontal waveform visualizer
function AudioWaveform({ level }: { level: number }) {
  const barCount = 32

  return (
    <div className="flex items-center justify-center gap-0.5 h-12 w-64">
      {Array.from({ length: barCount }).map((_, i) => {
        // Create wave pattern - bars in middle respond more to audio
        const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2)
        const sensitivity = 1 - centerDistance * 0.5
        // Base height + audio-responsive height
        const minHeight = 12
        const maxHeight = 100
        const height = minHeight + (level * sensitivity * (maxHeight - minHeight))

        return (
          <div
            key={i}
            className="w-1 bg-rose-500 rounded-full transition-all duration-75"
            style={{
              height: `${height}%`,
              opacity: 0.6 + (level * sensitivity * 0.4),
            }}
          />
        )
      })}
    </div>
  )
}

export function InsightCapture({ sessionId, onComplete, onSkip }: InsightCaptureProps) {
  const {
    state,
    error,
    displayText,
    durationMs,
    isSupported,
    isRecording,
    mediaStream,
    startCapture,
    stopCapture,
    cancelCapture
  } = useVoiceCapture()

  const { audioLevel, startAnalyzing, stopAnalyzing } = useAudioLevel()
  const [isSaving, setIsSaving] = useState(false)

  // Auto-start recording on mount (after brief delay for UI to settle)
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      if (isSupported && state === 'idle') {
        startCapture()
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isSupported, state, startCapture])

  // Start audio level analysis when recording begins
  useEffect(() => {
    if (isRecording && mediaStream) {
      startAnalyzing(mediaStream)
    }
  }, [isRecording, mediaStream, startAnalyzing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzing()
    }
  }, [stopAnalyzing])

  // Handle stop and save
  const handleStopAndSave = useCallback(async () => {
    if (!isRecording) return

    stopAnalyzing()
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
  }, [isRecording, stopCapture, sessionId, onComplete, displayText, stopAnalyzing])

  // Handle skip
  const handleSkip = useCallback(() => {
    stopAnalyzing()
    if (isRecording) {
      cancelCapture()
    }
    onSkip()
  }, [isRecording, cancelCapture, onSkip, stopAnalyzing])

  // Block swipe navigation when modal is open
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  // Not supported fallback
  if (!isSupported) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream p-8"
        onTouchStart={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
        onTouchMove={handleTouchEvent}
      >
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
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream p-8"
        onTouchStart={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
        onTouchMove={handleTouchEvent}
      >
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
    <div
      className="fixed inset-0 z-50 flex flex-col bg-cream"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
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
        {/* Recording indicator with audio visualization */}
        <div className="mb-8">
          {isRecording ? (
            <div className="flex flex-col items-center">
              {/* Small recording dot */}
              <div className="w-3 h-3 rounded-full bg-rose-500 mb-6 animate-pulse" />

              {/* Claude-style waveform - the main visual */}
              <AudioWaveform level={audioLevel} />
            </div>
          ) : state === 'requesting' ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          )}
        </div>

        {/* Duration */}
        {isRecording && (
          <p className="text-lg text-ink/60 tabular-nums mb-4 font-medium">
            {formatDuration(Math.floor(durationMs / 1000))}
          </p>
        )}

        {/* Prompt text */}
        <p className="font-serif text-xl text-ink mb-6 text-center">
          {isRecording
            ? 'Recording...'
            : state === 'requesting'
              ? 'Requesting microphone...'
              : 'Capture a thought'}
        </p>

        {/* Transcription display */}
        <div className="w-full max-w-md min-h-[100px] mb-6">
          {displayText ? (
            <p className="text-ink/70 leading-relaxed text-center">
              {displayText}
            </p>
          ) : isRecording ? (
            <p className="text-ink/30 text-center text-sm">
              Speak now — your voice is being captured
              <br />
              <span className="text-ink/20 text-xs">
                (Transcription may vary by device)
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Bottom action */}
      <div className="flex-none pb-12 px-8 safe-area-bottom">
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
