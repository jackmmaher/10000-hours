/**
 * Analytics - Event tracking wrapper
 *
 * In production: Uses RevenueCat custom events
 * In development: Console logs for debugging
 *
 * Events tracked:
 * - Day31TriggerShown: Paywall displayed on Day 31
 * - PaywallDismissed: User dismisses paywall
 * - PaywallConverted: User completes purchase
 * - StatsTapWhenLocked: User taps locked stats window
 * - CalendarFadeTapped: User taps faded calendar area
 * - HideTimeToggled: User toggles hide time setting
 */

// Set to false when RevenueCat is configured
const MOCK_MODE = true

type AnalyticsEvent =
  | 'Day31TriggerShown'
  | 'PaywallDismissed'
  | 'PaywallConverted'
  | 'StatsTapWhenLocked'
  | 'CalendarFadeTapped'
  | 'HideTimeToggled'
  | 'SessionStarted'
  | 'SessionCompleted'

interface EventProperties {
  [key: string]: string | number | boolean
}

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  if (MOCK_MODE) {
    // Dev-only logging - silenced in production
    if (import.meta.env.DEV) {
      console.debug(`[Analytics] ${event}`, properties ?? '')
    }
    return
  }

  // TODO: Real RevenueCat implementation
  // Purchases.logEvent(event, properties)
}

/**
 * Track Day 31 paywall shown
 */
export function trackDay31Trigger(daysSinceFirstSession: number): void {
  trackEvent('Day31TriggerShown', { daysSinceFirstSession })
}

/**
 * Track paywall dismissed without purchase
 */
export function trackPaywallDismissed(
  source: 'day31' | 'settings' | 'progress' | 'calendar'
): void {
  trackEvent('PaywallDismissed', { source })
}

/**
 * Track successful purchase
 */
export function trackPaywallConverted(
  source: 'day31' | 'settings' | 'progress' | 'calendar'
): void {
  trackEvent('PaywallConverted', { source })
}

/**
 * Track tap on locked stats window
 */
export function trackLockedStatsTap(window: string): void {
  trackEvent('StatsTapWhenLocked', { window })
}

/**
 * Track tap on faded calendar area
 */
export function trackCalendarFadeTap(monthAge: number): void {
  trackEvent('CalendarFadeTapped', { monthAge })
}

/**
 * Track hide time toggle
 */
export function trackHideTimeToggle(enabled: boolean): void {
  trackEvent('HideTimeToggled', { enabled })
}

/**
 * Track session started
 */
export function trackSessionStarted(): void {
  trackEvent('SessionStarted')
}

/**
 * Track session completed
 */
export function trackSessionCompleted(durationSeconds: number): void {
  trackEvent('SessionCompleted', { durationSeconds })
}
