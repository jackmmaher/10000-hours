/**
 * Accountability Message Service
 *
 * Handles sending accountability messages via SMS or WhatsApp
 * when a meditation lock session is completed or skipped.
 *
 * Message format (branded for virality):
 * - Completion: "{userName} completed his {duration} minute Still Hours meditation today ✓\n\nstillhours.app/share"
 * - Skip: "{userName} used an emergency skip on Still Hours today ⚠️\n\nstillhours.app/share"
 *
 * Implementation:
 * - SMS uses native share sheet (user still taps "Send")
 * - WhatsApp uses URL scheme (whatsapp://send?phone={phone}&text={encodedMessage})
 */

import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'

const SHARE_URL = 'stillhours.app/share'

export type AccountabilityMessageType = 'completion' | 'skip'
export type AccountabilityMethod = 'sms' | 'whatsapp' | 'choose'

interface SendMessageParams {
  type: AccountabilityMessageType
  phone: string
  method: AccountabilityMethod
  durationMinutes?: number
  userName: string
}

interface SendMessageResult {
  success: boolean
  error?: string
}

/**
 * Format the completion message with user name and duration
 */
export function formatCompletionMessage(userName: string, durationMinutes: number): string {
  const minuteWord = durationMinutes === 1 ? 'minute' : 'minute'
  return `${userName} completed his ${durationMinutes} ${minuteWord} Still Hours meditation today ✓\n\n${SHARE_URL}`
}

/**
 * Format the skip message with user name
 */
export function formatSkipMessage(userName: string): string {
  return `${userName} used an emergency skip on Still Hours today ⚠️\n\n${SHARE_URL}`
}

/**
 * Generate a WhatsApp URL for direct messaging
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `whatsapp://send?phone=${phone}&text=${encodedMessage}`
}

/**
 * Send an accountability message via the specified method
 */
export async function sendAccountabilityMessage(
  params: SendMessageParams
): Promise<SendMessageResult> {
  const { type, phone, method, durationMinutes, userName } = params

  // Format the message based on type
  const message =
    type === 'completion' && durationMinutes !== undefined
      ? formatCompletionMessage(userName, durationMinutes)
      : formatSkipMessage(userName)

  try {
    if (method === 'whatsapp') {
      // Open WhatsApp with pre-filled message
      const url = getWhatsAppUrl(phone, message)

      if (Capacitor.isNativePlatform()) {
        // Use App.openUrl on native
        await Share.share({
          text: message,
          url: undefined,
          dialogTitle: 'Share via WhatsApp',
        })
      } else {
        // On web, try to open WhatsApp URL
        window.open(url, '_blank')
      }
    } else {
      // Use native share sheet for SMS
      // User still manually taps "Send" in their messaging app
      await Share.share({
        text: message,
        url: undefined,
        dialogTitle: 'Send accountability message',
      })
    }

    return { success: true }
  } catch (error) {
    console.error('[Accountability] Failed to send message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}

/**
 * Check if sharing is available on this device
 */
export async function canShareMessage(): Promise<boolean> {
  try {
    const result = await Share.canShare()
    return result.value
  } catch {
    return false
  }
}
