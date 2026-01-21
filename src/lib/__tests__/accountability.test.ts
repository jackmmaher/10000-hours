/**
 * Tests for Accountability Message Service
 *
 * Tests the service that sends accountability messages via SMS or WhatsApp
 * when a meditation lock session is completed or skipped.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Capacitor Share
vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
    canShare: vi.fn().mockResolvedValue({ value: true }),
  },
}))

import {
  formatCompletionMessage,
  formatSkipMessage,
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
      expect(message).toContain('10 minute')
      expect(message).toContain('Still Hours')
      expect(message).toContain('stillhours.app/share')
    })

    it('should use singular minute for 1 minute', () => {
      const message = formatCompletionMessage('Alex', 1)
      expect(message).toContain('1 minute')
      expect(message).not.toContain('1 minutes')
    })

    it('should use plural minutes for multiple minutes', () => {
      const message = formatCompletionMessage('Alex', 15)
      expect(message).toContain('15 minute')
    })

    it('should include checkmark emoji', () => {
      const message = formatCompletionMessage('Jack', 10)
      expect(message).toContain('✓')
    })
  })

  describe('formatSkipMessage', () => {
    it('should format skip message with user name', () => {
      const message = formatSkipMessage('Jack')
      expect(message).toContain('Jack')
      expect(message).toContain('emergency skip')
      expect(message).toContain('Still Hours')
      expect(message).toContain('stillhours.app/share')
    })

    it('should include warning emoji', () => {
      const message = formatSkipMessage('Jack')
      expect(message).toContain('⚠️')
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
        type: 'completion',
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
        type: 'completion',
        phone: '+1234567890',
        method: 'sms',
        durationMinutes: 15,
        userName: 'Jack',
      })

      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('15 minute'),
        })
      )
    })

    it('should format skip message differently', async () => {
      vi.mocked(Share.share).mockResolvedValue({ activityType: 'sms' })

      await sendAccountabilityMessage({
        type: 'skip',
        phone: '+1234567890',
        method: 'sms',
        userName: 'Jack',
      })

      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('emergency skip'),
        })
      )
    })

    it('should return success when share completes', async () => {
      vi.mocked(Share.share).mockResolvedValue({ activityType: 'sms' })

      const result = await sendAccountabilityMessage({
        type: 'completion',
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
        type: 'completion',
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
