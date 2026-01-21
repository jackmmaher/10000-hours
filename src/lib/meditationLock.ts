/**
 * Meditation Lock Service
 *
 * Handles Screen Time API integration for blocking apps until meditation is complete.
 * Uses FamilyControls, ManagedSettings, and DeviceActivity frameworks on iOS.
 *
 * This is the TypeScript wrapper that communicates with the native Swift plugin.
 * Falls back to no-op behavior for web/PWA builds.
 */

import { Capacitor, registerPlugin } from '@capacitor/core'

// Authorization status from FamilyControls
export type AuthorizationStatus = 'authorized' | 'denied' | 'notDetermined'

// Lock state from shared container
export interface LockState {
  isLockActive: boolean
  isSessionInProgress: boolean
  lockActivatedAt: number // Unix timestamp
  lastSessionTimestamp: number // Unix timestamp
  lastSessionDurationSeconds: number
  streakFreezesRemaining: number
  streakDays: number
  totalUnlocks: number
}

// Session completion result
export interface SessionCompletionResult {
  success: boolean
  unlocked: boolean
  streakDays?: number
  reason?: string
}

// Emergency skip result
export interface EmergencySkipResult {
  success: boolean
  skipsRemaining?: number
  reason?: string
}

// Settings to sync to native layer
export interface MeditationLockSyncSettings {
  enabled: boolean
  anchorRoutine: string
  anchorLocation: string
  anchorTimeHour: number
  anchorTimeMinute: number
  unlockDurationMinutes: number
  minimumFallbackMinutes: number
  celebrationRitual: string
  identityStatement: string
  streakFreezesRemaining: number
  streakFreezesPerMonth: number
  gracePeriodMinutes: number
  safetyAutoUnlockHours: number
  blockedAppTokens: string[]
  obstacles: Array<{ obstacle: string; copingResponse: string }>
  scheduleWindows: Array<{
    startHour: number
    startMinute: number
    endHour: number
    endMinute: number
  }>
  activeDays: boolean[]
}

// Native plugin interface
interface MeditationLockPluginInterface {
  // Authorization
  requestAuthorization(): Promise<{ status: AuthorizationStatus }>
  getAuthorizationStatus(): Promise<{ status: AuthorizationStatus }>

  // App Selection
  showAppPicker(): Promise<{ tokens: string[] }>

  // Blocking
  blockApps(options: { tokens: string[] }): Promise<{ success: boolean }>
  unblockApps(): Promise<{ success: boolean }>
  getBlockedApps(): Promise<{ tokens: string[] }>

  // Phase 3: Schedule & Shield
  syncSettings(options: { settings: MeditationLockSyncSettings }): Promise<{ success: boolean }>
  setSchedule(): Promise<{ success: boolean }>
  clearSchedule(): Promise<{ success: boolean }>
  getLockState(): Promise<LockState>
  sessionStarted(): Promise<{ success: boolean }>
  sessionCompleted(options: {
    durationSeconds: number
    isFallback: boolean
  }): Promise<SessionCompletionResult>
  useEmergencySkip(): Promise<EmergencySkipResult>
}

// Register native plugin
const MeditationLockPlugin = registerPlugin<MeditationLockPluginInterface>('MeditationLock')

/**
 * Check if we're on a native platform that supports Screen Time
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Check if we're on iOS (Screen Time is iOS-only)
 */
export function isIOSPlatform(): boolean {
  return Capacitor.getPlatform() === 'ios'
}

/**
 * Request FamilyControls authorization
 * Must be called before any other Screen Time operations
 *
 * @returns The authorization status after the request
 */
export async function requestAuthorization(): Promise<AuthorizationStatus> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping authorization - not on native platform')
    return 'notDetermined'
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping authorization - not on iOS')
    return 'notDetermined'
  }

  try {
    const result = await MeditationLockPlugin.requestAuthorization()
    console.debug('[MeditationLock] Authorization result:', result.status)
    return result.status
  } catch (error) {
    console.error('[MeditationLock] Authorization request failed:', error)
    return 'notDetermined'
  }
}

/**
 * Get current FamilyControls authorization status
 *
 * @returns Current authorization status
 */
export async function getAuthorizationStatus(): Promise<AuthorizationStatus> {
  if (!isNativePlatform()) {
    return 'notDetermined'
  }

  if (!isIOSPlatform()) {
    return 'notDetermined'
  }

  try {
    const result = await MeditationLockPlugin.getAuthorizationStatus()
    return result.status
  } catch (error) {
    console.error('[MeditationLock] Failed to get authorization status:', error)
    return 'notDetermined'
  }
}

/**
 * Show native FamilyActivityPicker for app selection
 * User selects which apps to block. Returns opaque tokens.
 *
 * @returns Array of opaque app tokens (base64 encoded)
 */
export async function showAppPicker(): Promise<string[]> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping app picker - not on native platform')
    return []
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping app picker - not on iOS')
    return []
  }

  try {
    const result = await MeditationLockPlugin.showAppPicker()
    console.debug('[MeditationLock] App picker returned', result.tokens.length, 'apps')
    return result.tokens
  } catch (error) {
    console.error('[MeditationLock] App picker failed:', error)
    return []
  }
}

/**
 * Block the specified apps using ManagedSettings
 *
 * @param tokens Array of app tokens from showAppPicker
 * @returns true if blocking was successful
 */
export async function blockApps(tokens: string[]): Promise<boolean> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping block - not on native platform')
    return false
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping block - not on iOS')
    return false
  }

  if (tokens.length === 0) {
    console.debug('[MeditationLock] No apps to block')
    return false
  }

  try {
    const result = await MeditationLockPlugin.blockApps({ tokens })
    console.debug('[MeditationLock] Block result:', result.success)
    return result.success
  } catch (error) {
    console.error('[MeditationLock] Block failed:', error)
    return false
  }
}

/**
 * Unblock all currently blocked apps
 *
 * @returns true if unblocking was successful
 */
export async function unblockApps(): Promise<boolean> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping unblock - not on native platform')
    return false
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping unblock - not on iOS')
    return false
  }

  try {
    const result = await MeditationLockPlugin.unblockApps()
    console.debug('[MeditationLock] Unblock result:', result.success)
    return result.success
  } catch (error) {
    console.error('[MeditationLock] Unblock failed:', error)
    return false
  }
}

/**
 * Get list of currently blocked apps
 *
 * @returns Array of app tokens currently being blocked
 */
export async function getBlockedApps(): Promise<string[]> {
  if (!isNativePlatform()) {
    return []
  }

  if (!isIOSPlatform()) {
    return []
  }

  try {
    const result = await MeditationLockPlugin.getBlockedApps()
    return result.tokens
  } catch (error) {
    console.error('[MeditationLock] Failed to get blocked apps:', error)
    return []
  }
}

// ============================================================================
// Phase 3: Schedule & Shield Functions
// ============================================================================

/**
 * Sync all settings from the app to the native shared container
 * This makes settings available to the DeviceActivity and Shield extensions
 *
 * @param settings Settings to sync
 * @returns true if sync was successful
 */
export async function syncSettings(settings: MeditationLockSyncSettings): Promise<boolean> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping sync - not on native platform')
    return false
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping sync - not on iOS')
    return false
  }

  try {
    const result = await MeditationLockPlugin.syncSettings({ settings })
    console.debug('[MeditationLock] Settings synced:', result.success)
    return result.success
  } catch (error) {
    console.error('[MeditationLock] Sync failed:', error)
    return false
  }
}

/**
 * Set the DeviceActivity schedule based on synced settings
 * The lock will automatically activate/deactivate at scheduled times
 *
 * @returns true if schedule was set successfully
 */
export async function setSchedule(): Promise<boolean> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping schedule - not on native platform')
    return false
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping schedule - not on iOS')
    return false
  }

  try {
    const result = await MeditationLockPlugin.setSchedule()
    console.debug('[MeditationLock] Schedule set:', result.success)
    return result.success
  } catch (error) {
    console.error('[MeditationLock] Failed to set schedule:', error)
    return false
  }
}

/**
 * Clear the DeviceActivity schedule and deactivate any active locks
 *
 * @returns true if schedule was cleared successfully
 */
export async function clearSchedule(): Promise<boolean> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping clear - not on native platform')
    return false
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping clear - not on iOS')
    return false
  }

  try {
    const result = await MeditationLockPlugin.clearSchedule()
    console.debug('[MeditationLock] Schedule cleared:', result.success)
    return result.success
  } catch (error) {
    console.error('[MeditationLock] Failed to clear schedule:', error)
    return false
  }
}

/**
 * Get current lock state from the shared container
 *
 * @returns Current lock state
 */
export async function getLockState(): Promise<LockState> {
  const defaultState: LockState = {
    isLockActive: false,
    isSessionInProgress: false,
    lockActivatedAt: 0,
    lastSessionTimestamp: 0,
    lastSessionDurationSeconds: 0,
    streakFreezesRemaining: 3,
    streakDays: 0,
    totalUnlocks: 0,
  }

  if (!isNativePlatform()) {
    return defaultState
  }

  if (!isIOSPlatform()) {
    return defaultState
  }

  try {
    const state = await MeditationLockPlugin.getLockState()
    return state
  } catch (error) {
    console.error('[MeditationLock] Failed to get lock state:', error)
    return defaultState
  }
}

/**
 * Mark a meditation session as started
 * Updates shared container so shield shows "Session in progress"
 *
 * @returns true if successful
 */
export async function sessionStarted(): Promise<boolean> {
  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping sessionStarted - not on native platform')
    return false
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping sessionStarted - not on iOS')
    return false
  }

  try {
    const result = await MeditationLockPlugin.sessionStarted()
    console.debug('[MeditationLock] Session started:', result.success)
    return result.success
  } catch (error) {
    console.error('[MeditationLock] Failed to mark session started:', error)
    return false
  }
}

/**
 * Mark a meditation session as completed
 * If session meets duration requirement, deactivates the lock
 *
 * @param durationSeconds Duration of the completed session in seconds
 * @param isFallback Whether this was a fallback (minimum) duration session
 * @returns Completion result with unlock status
 */
export async function sessionCompleted(
  durationSeconds: number,
  isFallback: boolean = false
): Promise<SessionCompletionResult> {
  const defaultResult: SessionCompletionResult = {
    success: false,
    unlocked: false,
  }

  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping sessionCompleted - not on native platform')
    return defaultResult
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping sessionCompleted - not on iOS')
    return defaultResult
  }

  try {
    const result = await MeditationLockPlugin.sessionCompleted({
      durationSeconds,
      isFallback,
    })
    console.debug('[MeditationLock] Session completed:', result)
    return result
  } catch (error) {
    console.error('[MeditationLock] Failed to mark session completed:', error)
    return defaultResult
  }
}

/**
 * Use an emergency skip to bypass the lock
 * Decrements the skip count and deactivates the lock
 *
 * @returns Skip result with remaining count
 */
export async function consumeEmergencySkip(): Promise<EmergencySkipResult> {
  const defaultResult: EmergencySkipResult = {
    success: false,
    reason: 'Not available on this platform',
  }

  if (!isNativePlatform()) {
    console.debug('[MeditationLock] Skipping consumeEmergencySkip - not on native platform')
    return defaultResult
  }

  if (!isIOSPlatform()) {
    console.debug('[MeditationLock] Skipping consumeEmergencySkip - not on iOS')
    return defaultResult
  }

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- This is a Capacitor plugin method, not a React Hook
    const result = await MeditationLockPlugin.useEmergencySkip()
    console.debug('[MeditationLock] Emergency skip result:', result)
    return result
  } catch (error) {
    console.error('[MeditationLock] Failed to consume emergency skip:', error)
    return defaultResult
  }
}
