/**
 * Attribution Notification Tests
 *
 * Tests that attribution notifications respect user settings.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase first - must be before any imports that use it
vi.mock('../supabase', () => ({
  supabase: null,
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
}))

// Mock db
vi.mock('../db', () => ({
  addNotification: vi.fn().mockResolvedValue(undefined),
  getSettings: vi.fn().mockResolvedValue({
    id: 1,
    hideTimeDisplay: false,
    skipInsightCapture: false,
    themeMode: 'auto',
    visualEffects: 'calm',
    audioFeedbackEnabled: false,
    notificationPreferences: {
      milestoneEnabled: true,
      attributionEnabled: true,
      gentleRemindersEnabled: false,
      reminderMinutesBefore: 30,
    },
  }),
}))

import { addNotification, getSettings } from '../db'

describe('generateAttributionNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should NOT create notification when attributionEnabled is false', async () => {
    // Mock settings with attributionEnabled: false
    vi.mocked(getSettings).mockResolvedValueOnce({
      id: 1,
      hideTimeDisplay: false,
      skipInsightCapture: false,
      themeMode: 'auto',
      visualEffects: 'calm',
      audioFeedbackEnabled: false,
      notificationPreferences: {
        milestoneEnabled: true,
        attributionEnabled: false, // Disabled!
        gentleRemindersEnabled: false,
        reminderMinutesBefore: 30,
      },
    })

    const { generateAttributionNotification } = await import('../attribution')

    // This should return false and NOT create a notification
    const result = await generateAttributionNotification('test-user-id')

    expect(result).toBe(false)
    expect(addNotification).not.toHaveBeenCalled()
  })

  it('should respect attributionEnabled setting when true', async () => {
    // This test verifies the function at least checks settings
    // Since supabase is mocked to return no data, it will return false anyway
    // but it should check settings first

    vi.mocked(getSettings).mockResolvedValueOnce({
      id: 1,
      hideTimeDisplay: false,
      skipInsightCapture: false,
      themeMode: 'auto',
      visualEffects: 'calm',
      audioFeedbackEnabled: false,
      notificationPreferences: {
        milestoneEnabled: true,
        attributionEnabled: true, // Enabled
        gentleRemindersEnabled: false,
        reminderMinutesBefore: 30,
      },
    })

    const { generateAttributionNotification } = await import('../attribution')

    // With supabase not configured, this returns false (no stats)
    // but it should have checked settings
    await generateAttributionNotification('test-user-id')

    // Settings should have been checked
    expect(getSettings).toHaveBeenCalled()
  })
})
