/**
 * Transcription Service - Real-time voice-to-text
 *
 * Uses Web Speech API (free, browser-based) for FREE tier.
 * Premium tier would use Whisper API (better accuracy).
 */

export type TranscriptionState = 'idle' | 'listening' | 'processing' | 'error'

export interface TranscriptionResult {
  text: string
  confidence: number
  isFinal: boolean
}

export interface TranscriptionCallbacks {
  onResult: (result: TranscriptionResult) => void
  onError: (error: string) => void
  onEnd: () => void
}

// Type declaration for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

let recognition: SpeechRecognition | null = null

/**
 * Check if Web Speech API is supported
 */
export function isWebSpeechSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Start real-time transcription
 */
export function startTranscription(callbacks: TranscriptionCallbacks): void {
  if (!isWebSpeechSupported()) {
    callbacks.onError('Speech recognition is not supported in this browser')
    return
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognitionClass) {
    callbacks.onError('Speech recognition is not available')
    return
  }

  recognition = new SpeechRecognitionClass()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'
  recognition.maxAlternatives = 1

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const results = event.results

    for (let i = event.resultIndex; i < results.length; i++) {
      const result = results[i]
      const alternative = result[0]

      callbacks.onResult({
        text: alternative.transcript,
        confidence: alternative.confidence || 0.9,
        isFinal: result.isFinal
      })
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    let errorMessage = 'Transcription error'

    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected'
        break
      case 'audio-capture':
        errorMessage = 'No microphone found'
        break
      case 'not-allowed':
        errorMessage = 'Microphone permission denied'
        break
      case 'network':
        errorMessage = 'Network error during transcription'
        break
      case 'aborted':
        // User cancelled - not an error
        return
      default:
        errorMessage = `Transcription error: ${event.error}`
    }

    callbacks.onError(errorMessage)
  }

  recognition.onend = () => {
    callbacks.onEnd()
  }

  recognition.start()
}

/**
 * Stop transcription
 */
export function stopTranscription(): void {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}

/**
 * Get current transcription state
 */
export function getTranscriptionState(): TranscriptionState {
  return recognition ? 'listening' : 'idle'
}

/**
 * Compile all interim results into final text
 * Used when stopping to get the complete transcription
 */
export function compileTranscription(results: TranscriptionResult[]): string {
  // Get all final results
  const finalTexts = results
    .filter(r => r.isFinal)
    .map(r => r.text.trim())

  // If no final results, use the last interim result
  if (finalTexts.length === 0 && results.length > 0) {
    const lastResult = results[results.length - 1]
    return lastResult.text.trim()
  }

  return finalTexts.join(' ')
}
