/**
 * Voice Recording Service - Browser-based audio capture
 *
 * Uses MediaRecorder API to capture voice notes after meditation.
 * Handles permissions, recording state, and audio blob output.
 */

export type RecordingState = 'idle' | 'requesting' | 'recording' | 'processing' | 'error'

export interface RecordingResult {
  audioBlob: Blob
  durationMs: number
}

export interface VoiceRecorder {
  state: RecordingState
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<RecordingResult | null>
  cancelRecording: () => void
}

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingStartTime: number = 0

/**
 * Check if voice recording is supported in this browser
 */
export function isVoiceRecordingSupported(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder === 'function'
  )
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<MediaStream> {
  if (!isVoiceRecordingSupported()) {
    throw new Error('Voice recording is not supported in this browser')
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
    return stream
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Please allow access in your browser settings.')
      }
      if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone.')
      }
    }
    throw new Error('Failed to access microphone')
  }
}

/**
 * Start recording audio
 */
export async function startRecording(stream: MediaStream): Promise<void> {
  // Determine best supported audio format
  const mimeType = getSupportedMimeType()

  mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    audioBitsPerSecond: 128000
  })

  audioChunks = []
  recordingStartTime = Date.now()

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data)
    }
  }

  mediaRecorder.start(1000) // Capture in 1-second chunks
}

/**
 * Stop recording and return audio blob
 */
export function stopRecording(): Promise<RecordingResult | null> {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      resolve(null)
      return
    }

    mediaRecorder.onstop = () => {
      const durationMs = Date.now() - recordingStartTime
      const mimeType = mediaRecorder?.mimeType || 'audio/webm'
      const audioBlob = new Blob(audioChunks, { type: mimeType })

      // Stop all tracks to release microphone
      mediaRecorder?.stream.getTracks().forEach(track => track.stop())

      resolve({
        audioBlob,
        durationMs
      })

      // Cleanup
      mediaRecorder = null
      audioChunks = []
    }

    mediaRecorder.stop()
  })
}

/**
 * Cancel recording without saving
 */
export function cancelRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
    mediaRecorder.stop()
  }
  mediaRecorder = null
  audioChunks = []
}

/**
 * Get the best supported MIME type for audio recording
 */
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mpeg'
  ]

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  // Fallback - let browser choose
  return ''
}

/**
 * Check current recording state
 */
export function getRecordingState(): RecordingState {
  if (!mediaRecorder) return 'idle'
  if (mediaRecorder.state === 'recording') return 'recording'
  if (mediaRecorder.state === 'paused') return 'recording'
  return 'idle'
}
