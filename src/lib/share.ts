/**
 * Social Sharing Utilities
 *
 * Provides native sharing capabilities for milestones and achievements.
 * Uses the Web Share API when available, falls back to clipboard.
 */

import { Capacitor } from '@capacitor/core'

interface ShareOptions {
  title?: string
  text: string
  url?: string
}

/**
 * Check if native sharing is available
 */
export function canShare(): boolean {
  return navigator.share !== undefined
}

/**
 * Share content using native share sheet or clipboard fallback
 */
export async function share(options: ShareOptions): Promise<boolean> {
  const shareData: ShareData = {
    title: options.title,
    text: options.text,
    url: options.url,
  }

  // Use native share if available
  if (canShare()) {
    try {
      await navigator.share(shareData)
      return true
    } catch (error) {
      // User cancelled or share failed
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('[Share] Native share failed:', error)
      }
      return false
    }
  }

  // Fallback to clipboard
  try {
    const textToShare = options.url ? `${options.text}\n\n${options.url}` : options.text
    await navigator.clipboard.writeText(textToShare)
    return true
  } catch (error) {
    console.warn('[Share] Clipboard fallback failed:', error)
    return false
  }
}

/**
 * Share a milestone achievement
 */
export async function shareMilestone(hours: number, milestoneName: string): Promise<boolean> {
  const text = `I just reached ${milestoneName} of meditation practice with Still Hours. ${hours} hours down, working toward 10,000.`

  return share({
    title: `${milestoneName} - Still Hours`,
    text,
    url: 'https://stillhours.app',
  })
}

/**
 * Share progress update
 */
export async function shareProgress(totalHours: number, sessionCount: number): Promise<boolean> {
  const text = `My meditation journey: ${totalHours.toFixed(1)} hours across ${sessionCount} sessions with Still Hours.`

  return share({
    title: 'My Meditation Progress - Still Hours',
    text,
    url: 'https://stillhours.app',
  })
}

/**
 * Share a pearl (insight)
 */
export async function sharePearl(pearlText: string): Promise<boolean> {
  const text = `"${pearlText}"\n\n— From my meditation practice with Still Hours`

  return share({
    title: 'A Moment of Wisdom - Still Hours',
    text,
    url: 'https://stillhours.app',
  })
}

/**
 * Check if running on iOS (for share sheet styling considerations)
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios'
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android'
}
