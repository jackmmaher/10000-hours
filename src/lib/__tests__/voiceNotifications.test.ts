/**
 * Voice Notification Tests
 *
 * Tests for voice growth notification logic.
 *
 * Key behaviors to test:
 * 1. Notifications should only be created when explicitly called (singleton)
 * 2. Notifications should respect milestoneEnabled setting
 * 3. Notifications should not duplicate (DB check)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserSettings } from '../db'

// Helper to create partial settings for mocking
const mockSettings = (overrides: Partial<UserSettings> = {}): UserSettings => ({
  id: 1 as const,
  hideTimeDisplay: false,
  skipInsightCapture: false,
  themeMode: 'auto',
  audioFeedbackEnabled: false,
  notificationPreferences: {
    milestoneEnabled: true,
    attributionEnabled: true,
    gentleRemindersEnabled: false,
    reminderMinutesBefore: 30,
  },
  ...overrides,
})

// Mock the database
vi.mock('../db', () => ({
  addNotification: vi.fn().mockResolvedValue(undefined),
  hasNotificationWithTitle: vi.fn().mockResolvedValue(false),
  getSettings: vi.fn().mockResolvedValue({
    id: 1,
    hideTimeDisplay: false,
    skipInsightCapture: false,
    themeMode: 'auto',
    audioFeedbackEnabled: false,
    notificationPreferences: {
      milestoneEnabled: true,
      attributionEnabled: true,
      gentleRemindersEnabled: false,
      reminderMinutesBefore: 30,
    },
  }),
}))

import { addNotification, hasNotificationWithTitle, getSettings } from '../db'

// The function we're testing
describe('checkVoiceGrowthNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be exported from voice module', async () => {
    const voiceModule = await import('../voice')
    expect(voiceModule.checkVoiceGrowthNotification).toBeDefined()
    expect(typeof voiceModule.checkVoiceGrowthNotification).toBe('function')
  })

  it('should NOT create notification when milestoneEnabled is false', async () => {
    // Mock settings with milestoneEnabled: false
    vi.mocked(getSettings).mockResolvedValueOnce(
      mockSettings({
        notificationPreferences: {
          milestoneEnabled: false,
          attributionEnabled: true,
          gentleRemindersEnabled: false,
          reminderMinutesBefore: 30,
        },
      })
    )

    const { checkVoiceGrowthNotification } = await import('../voice')

    await checkVoiceGrowthNotification({
      previousScore: 15,
      currentScore: 25,
    })

    // Should NOT create notification because milestoneEnabled is false
    expect(addNotification).not.toHaveBeenCalled()
  })

  it('should create notification when crossing threshold 20 and milestoneEnabled is true', async () => {
    // Mock settings with milestoneEnabled: true
    vi.mocked(getSettings).mockResolvedValueOnce(
      mockSettings({
        notificationPreferences: {
          milestoneEnabled: true,
          attributionEnabled: true,
          gentleRemindersEnabled: false,
          reminderMinutesBefore: 30,
        },
      })
    )

    // Mock no existing notification
    vi.mocked(hasNotificationWithTitle).mockResolvedValueOnce(false)

    const { checkVoiceGrowthNotification } = await import('../voice')

    await checkVoiceGrowthNotification({
      previousScore: 15,
      currentScore: 25,
    })

    // Should check for existing notification
    expect(hasNotificationWithTitle).toHaveBeenCalledWith('Voice: 20')

    // Should create notification with voice_growth type (distinct styling)
    expect(addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'voice_growth',
        title: 'Voice: 20',
        body: 'Your voice carries further now.',
      })
    )
  })

  it('should NOT create notification if one already exists in DB', async () => {
    vi.mocked(getSettings).mockResolvedValueOnce(
      mockSettings({
        notificationPreferences: {
          milestoneEnabled: true,
          attributionEnabled: true,
          gentleRemindersEnabled: false,
          reminderMinutesBefore: 30,
        },
      })
    )

    // Mock existing notification
    vi.mocked(hasNotificationWithTitle).mockResolvedValueOnce(true)

    const { checkVoiceGrowthNotification } = await import('../voice')

    await checkVoiceGrowthNotification({
      previousScore: 15,
      currentScore: 25,
    })

    // Should check for existing notification
    expect(hasNotificationWithTitle).toHaveBeenCalledWith('Voice: 20')

    // Should NOT create notification (already exists)
    expect(addNotification).not.toHaveBeenCalled()
  })

  it('should NOT create notification when score does not cross threshold', async () => {
    vi.mocked(getSettings).mockResolvedValueOnce(
      mockSettings({
        notificationPreferences: {
          milestoneEnabled: true,
          attributionEnabled: true,
          gentleRemindersEnabled: false,
          reminderMinutesBefore: 30,
        },
      })
    )

    const { checkVoiceGrowthNotification } = await import('../voice')

    await checkVoiceGrowthNotification({
      previousScore: 22,
      currentScore: 25,
    })

    // Should NOT create notification (didn't cross 20, already past it)
    expect(addNotification).not.toHaveBeenCalled()
  })

  it('should create notification for each threshold crossed', async () => {
    vi.mocked(getSettings).mockResolvedValue(
      mockSettings({
        notificationPreferences: {
          milestoneEnabled: true,
          attributionEnabled: true,
          gentleRemindersEnabled: false,
          reminderMinutesBefore: 30,
        },
      })
    )
    vi.mocked(hasNotificationWithTitle).mockResolvedValue(false)

    const { checkVoiceGrowthNotification } = await import('../voice')

    // Jump from 10 to 50 - crosses both 20 and 45
    await checkVoiceGrowthNotification({
      previousScore: 10,
      currentScore: 50,
    })

    // Should create notifications for both thresholds
    expect(addNotification).toHaveBeenCalledTimes(2)
    expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'Voice: 20' }))
    expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'Voice: 45' }))
  })
})
