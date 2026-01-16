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
import { getLocalTemplateById } from '../lib/recommendations'
import { updateAffinities } from '../lib/affinities'

interface InsightModalProps {
  sessionId: string
  sessionDuration?: number | null
  milestoneMessage?: string | null
  sourceTemplateId?: string | null // If session was from a recommendation
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
  sourceTemplateId,
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

  // Feedback state for recommendation resonance
  const [feedbackGiven, setFeedbackGiven] = useState<1 | -1 | null>(null)

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

  // Handle recommendation feedback
  const handleFeedback = useCallback(
    async (value: 1 | -1) => {
      if (!sourceTemplateId || feedbackGiven !== null) return

      haptic.light()
      setFeedbackGiven(value)

      try {
        const template = getLocalTemplateById(sourceTemplateId)
        if (template) {
          // Create a minimal session object for the affinity update
          // The actual session has already been saved, this is just for the feedback signal
          const sessionForFeedback = {
            uuid: sessionId,
            startTime: Date.now() - (sessionDuration || 0) * 1000,
            endTime: Date.now(),
            durationSeconds: sessionDuration || 0,
            discipline: template.discipline,
          }

          // Apply explicit feedback: +0.8 for resonated, -0.5 for not for me
          const feedbackScore = value === 1 ? 0.8 : -0.5
          await updateAffinities(sessionForFeedback, template, feedbackScore)
        }
      } catch (err) {
        console.warn('Failed to record feedback:', err)
      }
    },
    [sourceTemplateId, feedbackGiven, haptic, sessionId, sessionDuration]
  )

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

            {/* Recommendation feedback - only shows for sessions from recommendations */}
            {sourceTemplateId && (
              <div className="mb-6">
                {feedbackGiven === null ? (
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => handleFeedback(1)}
                      className="flex items-center gap-2 text-sm text-ink/40 hover:text-ink/70
                        transition-colors active:scale-[0.98] touch-manipulation"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <span>This resonated</span>
                    </button>
                    <span className="w-px h-4 bg-ink/10" />
                    <button
                      onClick={() => handleFeedback(-1)}
                      className="flex items-center gap-2 text-sm text-ink/40 hover:text-ink/70
                        transition-colors active:scale-[0.98] touch-manipulation"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Not for me</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-sm text-ink/30 italic">
                    {feedbackGiven === 1
                      ? "Noted — we'll find more like this"
                      : "Understood — we'll adjust"}
                  </p>
                )}
              </div>
            )}

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
