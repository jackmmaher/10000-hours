/**
 * Tests for LockCelebrationModal
 *
 * Tests the celebration modal that appears after completing
 * a meditation lock session.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock haptic feedback
vi.mock('../../hooks/useTapFeedback', () => ({
  useTapFeedback: () => ({
    light: vi.fn(),
    medium: vi.fn(),
    success: vi.fn(),
  }),
}))

import { LockCelebrationModal } from '../LockCelebrationModal'

describe('LockCelebrationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    streakDays: 7,
    sessionDuration: 600, // 10 minutes
    celebrationRitual: 'smile',
    nextUnlockWindow: new Date('2026-01-21T07:00:00'),
    isFallback: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<LockCelebrationModal {...defaultProps} />)
      expect(screen.getByText('You showed up')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<LockCelebrationModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('You showed up')).not.toBeInTheDocument()
    })

    it('should display streak days dynamically', () => {
      render(<LockCelebrationModal {...defaultProps} streakDays={14} />)
      expect(screen.getByText('14 days straight')).toBeInTheDocument()
    })

    it('should display session duration in minutes', () => {
      render(<LockCelebrationModal {...defaultProps} sessionDuration={900} />) // 15 min
      expect(screen.getByText('15 minutes')).toBeInTheDocument()
    })

    it('should display celebration ritual dynamically', () => {
      render(<LockCelebrationModal {...defaultProps} celebrationRitual="take a deep breath" />)
      expect(screen.getByText(/"take a deep breath"/)).toBeInTheDocument()
    })

    it('should display next unlock window time', () => {
      const tomorrow7am = new Date()
      tomorrow7am.setDate(tomorrow7am.getDate() + 1)
      tomorrow7am.setHours(7, 0, 0, 0)

      render(<LockCelebrationModal {...defaultProps} nextUnlockWindow={tomorrow7am} />)
      // Should show time like "7:00 AM tomorrow"
      expect(screen.getByText(/Apps unlocked until/)).toBeInTheDocument()
    })
  })

  describe('fallback mode', () => {
    it('should show fallback message when isFallback is true', () => {
      render(<LockCelebrationModal {...defaultProps} isFallback={true} />)
      expect(screen.getByText('You showed up anyway')).toBeInTheDocument()
      expect(screen.getByText(/builds the habit/i)).toBeInTheDocument()
    })

    it('should not show ritual in fallback mode', () => {
      render(<LockCelebrationModal {...defaultProps} isFallback={true} />)
      // Ritual should not be shown in fallback mode
      expect(screen.queryByText(/"smile"/)).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when Continue button is clicked', () => {
      const onClose = vi.fn()
      render(<LockCelebrationModal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Continue'))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('dynamic bindings', () => {
    it('should handle 1 day streak correctly (singular)', () => {
      render(<LockCelebrationModal {...defaultProps} streakDays={1} />)
      expect(screen.getByText('1 day straight')).toBeInTheDocument()
    })

    it('should handle missing celebration ritual', () => {
      render(<LockCelebrationModal {...defaultProps} celebrationRitual={null} />)
      // Should not show ritual section when null
      expect(screen.queryByText(/"/)).not.toBeInTheDocument()
    })

    it('should handle missing next unlock window', () => {
      render(<LockCelebrationModal {...defaultProps} nextUnlockWindow={null} />)
      // Should show generic message when no next window
      expect(screen.queryByText(/Apps unlocked until/)).not.toBeInTheDocument()
    })
  })
})
