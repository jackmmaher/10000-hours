/**
 * Accountability Message Service
 *
 * Handles sending accountability messages via SMS or WhatsApp
 * when a commitment session is completed.
 *
 * Message format:
 * - Completion: "{name} just finished a {duration}-minute meditation. Day {day} of their commitment.\n\nstillhours.app/share"
 *
 * Implementation:
 * - SMS uses native share sheet (user still taps "Send")
 * - WhatsApp uses URL scheme (whatsapp://send?phone={phone}&text={encodedMessage})
 */

import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'

const SHARE_URL = 'stillhours.app/share'

export type AccountabilityMethod = 'sms' | 'whatsapp' | 'choose'

interface SendMessageParams {
  phone: string
  method: AccountabilityMethod
  durationMinutes: number
  userName: string
  dayNumber?: number
}

interface SendMessageResult {
  success: boolean
  error?: string
}

/**
 * Format the completion message with user name, duration, and day number
 */
export function formatCompletionMessage(
  userName: string,
  durationMinutes: number,
  dayNumber?: number
): string {
  const dayInfo = dayNumber ? ` Day ${dayNumber} of their commitment.` : ''
  return `${userName} just finished a ${durationMinutes}-minute meditation.${dayInfo}\n\n${SHARE_URL}`
}

/**
 * Generate a WhatsApp URL for direct messaging
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `whatsapp://send?phone=${phone}&text=${encodedMessage}`
}

/**
 * Generate an SMS URL for direct messaging
 */
export function getSmsUrl(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `sms:${phone}?body=${encodedMessage}`
}

/**
 * Generate a mailto URL as fallback
 */
export function getMailtoUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message)
  const subject = encodeURIComponent('Still Hours Accountability')
  return `mailto:?subject=${subject}&body=${encodedMessage}`
}

/**
 * Send an accountability message via the specified method
 *
 * Priority chain for web:
 * 1. navigator.share (Web Share API)
 * 2. WhatsApp URL scheme / SMS URL scheme
 * 3. mailto: fallback
 */
export async function sendAccountabilityMessage(
  params: SendMessageParams
): Promise<SendMessageResult> {
  const { phone, method, durationMinutes, userName, dayNumber } = params

  const message = formatCompletionMessage(userName, durationMinutes, dayNumber)

  try {
    if (method === 'whatsapp') {
      // Open WhatsApp with pre-filled message
      const url = getWhatsAppUrl(phone, message)

      if (Capacitor.isNativePlatform()) {
        await Share.share({
          text: message,
          url: undefined,
          dialogTitle: 'Share via WhatsApp',
        })
      } else {
        // On web, try to open WhatsApp URL
        window.open(url, '_blank')
      }
    } else if (method === 'sms') {
      if (Capacitor.isNativePlatform()) {
        // Use native share sheet on native platforms
        await Share.share({
          text: message,
          url: undefined,
          dialogTitle: 'Send accountability message',
        })
      } else {
        // Web: try navigator.share first, then SMS URL, then mailto fallback
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({ text: message })
          } catch {
            // User cancelled or share failed - try SMS URL
            window.open(getSmsUrl(phone, message), '_self')
          }
        } else {
          // No Web Share API - try SMS URL scheme directly
          window.open(getSmsUrl(phone, message), '_self')
        }
      }
    } else {
      // 'choose' method - use native share sheet or Web Share API
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          text: message,
          url: undefined,
          dialogTitle: 'Send accountability message',
        })
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ text: message })
        } catch {
          // Fallback to mailto
          window.open(getMailtoUrl(message), '_self')
        }
      } else {
        // Final fallback: mailto
        window.open(getMailtoUrl(message), '_self')
      }
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
