/**
 * InsightCapture - Post-meditation voice note capture
 *
 * Shown after meditation session completes.
 * Features audio level visualization for feedback.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useVoiceCapture } from '../hooks/useVoiceCapture'
import { useAudioLevel } from '../hooks/useAudioLevel'
import { addInsight } from '../lib/db'
import { formatDuration } from '../lib/format'

interface InsightCaptureProps {
  sessionId?: string
  onComplete: () => void
  onSkip: () => void
}

// Audio level bars component
function AudioLevelBars({ level }: { level: number }) {
  const barCount = 5
  const bars = []

  for (let i = 0; i < barCount; i++) {
    // Each bar activates at different thresholds
    const threshold = (i + 1) / barCount
    const isActive = level >= threshold * 0.7
    const heightPercent = isActive ? 40 + (level * 60) : 20

    bars.push(
      <div
        key={i}
        className="w-1 rounded-full transition-all duration-75"
        style={{
          height: `${heightPercent}%`,
          backgroundColor: isActive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 0, 0, 0.1)',
          transform: isActive ? 'scaleY(1)' : 'scaleY(0.5)',
        }}
      />
    )
  }

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {bars}
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
    startCapture,
    stopCapture,
    cancelCapture
  } = useVoiceCapture()

  const { audioLevel, startAnalyzing, stopAnalyzing } = useAudioLevel()
  const [isSaving, setIsSaving] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  // Auto-start recording on mount (after brief delay for UI to settle)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isSupported && state === 'idle') {
        // Get stream for audio level analysis
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          streamRef.current = stream
          startAnalyzing(stream)
        } catch (err) {
          console.error('Failed to get audio stream for visualization:', err)
        }
        startCapture()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [isSupported, state, startCapture, startAnalyzing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzing()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
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
        {/* Recording indicator with audio visualization */}
        <div className="mb-6">
          {isRecording ? (
            <div className="relative flex flex-col items-center">
              {/* Main recording circle with dynamic glow */}
              <div
                className="relative w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center transition-all duration-100"
                style={{
                  boxShadow: `0 0 ${20 + audioLevel * 40}px ${10 + audioLevel * 20}px rgba(239, 68, 68, ${0.2 + audioLevel * 0.3})`,
                  transform: `scale(${1 + audioLevel * 0.1})`,
                }}
              >
                {/* Inner microphone icon */}
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>

              {/* Audio level bars below */}
              <div className="mt-4">
                <AudioLevelBars level={audioLevel} />
              </div>
            </div>
          ) : state === 'requesting' ? (
            <div className="w-24 h-24 rounded-full bg-ink/10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-ink/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
