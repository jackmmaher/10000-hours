/**
 * Tests for Accountability Message Service
 *
 * Tests the service that sends accountability messages via SMS or WhatsApp
 * when a commitment session is completed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Capacitor Core (native platform detection)
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(true),
  },
}))

// Mock Capacitor Share
vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
    canShare: vi.fn().mockResolvedValue({ value: true }),
  },
}))

import {
  formatCompletionMessage,
  sendAccountabilityMessage,
  getWhatsAppUrl,
} from '../accountability'
import { Share } from '@capacitor/share'

describe('accountability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatCompletionMessage', () => {
    it('should format completion message with user name and duration', () => {
      const message = formatCompletionMessage('Jack', 10)
      expect(message).toContain('Jack')
      expect(message).toContain('10-minute')
      expect(message).toContain('meditation')
      expect(message).toContain('stillhours.app/share')
    })

    it('should include day number when provided', () => {
      const message = formatCompletionMessage('Jack', 20, 14)
      expect(message).toContain('Jack just finished a 20-minute meditation.')
      expect(message).toContain('Day 14 of their commitment.')
    })

    it('should omit day info when no day number is provided', () => {
      const message = formatCompletionMessage('Alex', 15)
      expect(message).not.toContain('Day')
      expect(message).toContain('Alex just finished a 15-minute meditation.')
    })

    it('should handle 1-minute duration', () => {
      const message = formatCompletionMessage('Alex', 1)
      expect(message).toContain('1-minute')
    })
  })

  describe('getWhatsAppUrl', () => {
    it('should return properly formatted WhatsApp URL', () => {
      const url = getWhatsAppUrl('+1234567890', 'Hello world')
      expect(url).toBe('whatsapp://send?phone=+1234567890&text=Hello%20world')
    })

    it('should encode special characters in message', () => {
      const url = getWhatsAppUrl('+1234567890', 'Hello & goodbye!')
      expect(url).toContain('Hello%20%26%20goodbye!')
    })

    it('should handle phone numbers without plus sign', () => {
      const url = getWhatsAppUrl('1234567890', 'Test')
      expect(url).toBe('whatsapp://send?phone=1234567890&text=Test')
    })
  })

  describe('sendAccountabilityMessage', () => {
    it('should call Share.share for SMS method', async () => {
      vi.mocked(Share.share).mockResolvedValue({ activityType: 'sms' })

      await sendAccountabilityMessage({
        phone: '+1234567890',
        method: 'sms',
        durationMinutes: 10,
        userName: 'Jack',
      })

      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Jack'),
        })
      )
    })

    it('should include duration in completion message', async () => {
      vi.mocked(Share.share).mockResolvedValue({ activityType: 'sms' })

      await sendAccountabilityMessage({
        phone: '+1234567890',
        method: 'sms',
        durationMinutes: 15,
        userName: 'Jack',
      })

      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('15-minute'),
        })
      )
    })

    it('should include day number when provided', async () => {
      vi.mocked(Share.share).mockResolvedValue({ activityType: 'sms' })

      await sendAccountabilityMessage({
        phone: '+1234567890',
        method: 'sms',
        durationMinutes: 10,
        userName: 'Jack',
        dayNumber: 14,
      })

      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Day 14'),
        })
      )
    })

    it('should return success when share completes', async () => {
      vi.mocked(Share.share).mockResolvedValue({ activityType: 'sms' })

      const result = await sendAccountabilityMessage({
        phone: '+1234567890',
        method: 'sms',
        durationMinutes: 10,
        userName: 'Jack',
      })

      expect(result.success).toBe(true)
    })

    it('should return failure when share fails', async () => {
      vi.mocked(Share.share).mockRejectedValue(new Error('Share failed'))

      const result = await sendAccountabilityMessage({
        phone: '+1234567890',
        method: 'sms',
        durationMinutes: 10,
        userName: 'Jack',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
