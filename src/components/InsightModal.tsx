/**
 * InsightModal - Post-meditation insight capture modal
 *
 * Unified modal that appears after session ends and stats animate.
 * Offers three choices: Skip, Remind me later, Capture.
 *
 * States:
 * - prompt: Shows body awareness + three buttons
 * - capture: Voice recording in progress
 * - complete: Saving/done (brief)
 */

import { useState, useCallback, useEffect } from 'react'
import { useVoiceCapture } from '../hooks/useVoiceCapture'
import { useAudioLevel } from '../hooks/useAudioLevel'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { addInsight } from '../lib/db'
import { formatDuration } from '../lib/format'

interface InsightModalProps {
  sessionId: string
  sessionDuration?: number | null
  milestoneMessage?: string | null
  onComplete: () => void
  onSkip: () => void
  onRemindLater: () => void
}

// Body awareness prompts - gentle, non-demanding
const BODY_AWARENESS_PROMPTS = [
  'Notice how your body feels right now.',
  'Take a moment to feel your breath.',
  'Observe any sensations in your body.',
  'Notice where you hold tension.',
  'Feel the weight of your body.',
  'Sense the space around you.',
]

// Stretch suggestions for long sessions (30+ minutes)
const STRETCH_SUGGESTIONS = [
  'Consider a gentle neck roll.',
  'Perhaps stretch your shoulders.',
  'Maybe stand and stretch your legs.',
  'A slow, mindful stretch may feel good.',
]

type ModalState = 'prompt' | 'capture' | 'saving'

// Claude-style horizontal waveform visualizer
function AudioWaveform({ level }: { level: number }) {
  const barCount = 32

  return (
    <div className="flex items-center justify-center gap-0.5 h-12 w-64">
      {Array.from({ length: barCount }).map((_, i) => {
        const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2)
        const sensitivity = 1 - centerDistance * 0.5
        const minHeight = 12
        const maxHeight = 100
        const height = minHeight + level * sensitivity * (maxHeight - minHeight)

        return (
          <div
            key={i}
            className="w-1 rounded-full transition-all duration-75"
            style={{
              height: `${height}%`,
              opacity: 0.6 + level * sensitivity * 0.4,
              background: 'var(--accent)',
            }}
          />
        )
      })}
    </div>
  )
}

export function InsightModal({
  sessionId,
  sessionDuration,
  milestoneMessage,
  onComplete,
  onSkip,
  onRemindLater,
}: InsightModalProps) {
  const [modalState, setModalState] = useState<ModalState>('prompt')
  const [bodyAwarenessPrompt] = useState(() => {
    const isLongSession = sessionDuration && sessionDuration >= 1800
    const prompts = isLongSession
      ? [...BODY_AWARENESS_PROMPTS, ...STRETCH_SUGGESTIONS]
      : BODY_AWARENESS_PROMPTS
    return prompts[Math.floor(Math.random() * prompts.length)]
  })

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
    cancelCapture,
  } = useVoiceCapture()

  const { audioLevel, startAnalyzing, stopAnalyzing } = useAudioLevel()
  const haptic = useTapFeedback()

  // Start audio analysis when recording
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

  // Handle capture button click
  const handleStartCapture = useCallback(() => {
    haptic.medium()
    setModalState('capture')
    startCapture()
  }, [haptic, startCapture])

  // Handle done - save and close
  const handleDone = useCallback(async () => {
    if (!isRecording) return

    haptic.success()
    stopAnalyzing()
    setModalState('saving')

    try {
      const result = await stopCapture()
      const textToSave =
        result?.transcript?.trim() || displayText?.trim() || '[Voice note captured]'

      await addInsight({
        sessionId: sessionId,
        rawText: textToSave,
      })

      onComplete()
    } catch (err) {
      console.error('Failed to save insight:', err)
      onComplete()
    }
  }, [isRecording, stopCapture, sessionId, displayText, stopAnalyzing, haptic, onComplete])

  // Handle skip
  const handleSkip = useCallback(() => {
    haptic.light()
    stopAnalyzing()
    if (isRecording) {
      cancelCapture()
    }
    onSkip()
  }, [haptic, stopAnalyzing, isRecording, cancelCapture, onSkip])

  // Handle remind later
  const handleRemindLater = useCallback(() => {
    haptic.light()
    onRemindLater()
  }, [haptic, onRemindLater])

  // Block swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  // Voice not supported - show simplified modal
  if (!isSupported) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm"
        onClick={handleSkip}
        onTouchStart={handleTouchEvent}
        onTouchMove={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
      >
        <div
          className="bg-cream rounded-t-3xl w-full max-w-lg p-6 pb-safe shadow-xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-serif text-lg text-ink text-center mb-2">
            Voice capture not supported
          </p>
          <p className="text-sm text-ink/50 text-center mb-6">
            Try Chrome or Safari for voice notes
          </p>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-ink/60 hover:text-ink transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (modalState === 'capture' && state === 'error' && error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm"
        onClick={handleSkip}
        onTouchStart={handleTouchEvent}
        onTouchMove={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
      >
        <div
          className="bg-cream rounded-t-3xl w-full max-w-lg p-6 pb-safe shadow-xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-serif text-lg text-ink text-center mb-2">Couldn't access microphone</p>
          <p className="text-sm text-ink/50 text-center mb-6">{error}</p>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-ink/60 hover:text-ink transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm"
      onClick={handleSkip}
      onTouchStart={handleTouchEvent}
      onTouchMove={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
    >
      <div
        className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[calc(90vh-env(safe-area-inset-top,0px))] flex flex-col shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prompt state */}
        {modalState === 'prompt' && (
          <div className="p-6 pb-safe">
            {/* Milestone or body awareness header */}
            <div className="text-center mb-6">
              {milestoneMessage ? (
                <>
                  <p className="font-serif text-lg text-ink mb-1">{milestoneMessage}</p>
                  <p className="text-ink/50">{bodyAwarenessPrompt}</p>
                </>
              ) : (
                <p className="font-serif text-lg text-ink/70">{bodyAwarenessPrompt}</p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-ink/10 mb-6" />

            {/* Call to action */}
            <p className="text-center text-ink/60 mb-6">
              Consider capturing this moment while it's fresh
            </p>

            {/* Three buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-ink/5 text-ink/60 hover:bg-ink/10 transition-colors active:scale-[0.98]"
              >
                Skip
              </button>
              <button
                onClick={handleRemindLater}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-ink/5 text-ink/60 hover:bg-ink/10 transition-colors active:scale-[0.98]"
              >
                Remind me later
              </button>
              <button
                onClick={handleStartCapture}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-ink text-cream hover:bg-ink/90 transition-colors active:scale-[0.98]"
              >
                Capture
              </button>
            </div>
          </div>
        )}

        {/* Capture state */}
        {modalState === 'capture' && (
          <div className="p-6 pb-safe">
            <div className="flex flex-col items-center">
              {/* Recording indicator */}
              {isRecording ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full mb-4 animate-pulse"
                    style={{ background: 'var(--accent)' }}
                  />
                  <AudioWaveform level={audioLevel} />
                  <p className="text-lg text-ink/60 tabular-nums mt-4 mb-2 font-medium">
                    {formatDuration(Math.floor(durationMs / 1000))}
                  </p>
                </>
              ) : state === 'requesting' ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-8 h-8 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  <p className="text-sm text-ink/50 mt-4">Requesting microphone...</p>
                </div>
              ) : null}

              {/* Transcription */}
              {isRecording && (
                <div className="w-full min-h-[80px] mb-4">
                  {displayText ? (
                    <p className="text-ink/70 leading-relaxed text-center">{displayText}</p>
                  ) : (
                    <p className="text-ink/30 text-center text-sm">
                      Speak now — your voice is being captured
                    </p>
                  )}
                </div>
              )}

              {/* Done button */}
              {isRecording && (
                <button
                  onClick={handleDone}
                  className="w-full py-4 rounded-xl font-medium bg-ink text-cream active:scale-[0.98] transition-all"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}

        {/* Saving state */}
        {modalState === 'saving' && (
          <div className="p-6 pb-safe flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            <p className="text-sm text-ink/50 mt-4">Saving...</p>
          </div>
        )}
      </div>
    </div>
  )
}
