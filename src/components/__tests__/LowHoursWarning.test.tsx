/**
 * LowHoursWarning Component Tests
 *
 * Tests for the low hours warning modal: rendering, formatting,
 * and user interactions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { LowHoursWarning } from '../LowHoursWarning'

describe('LowHoursWarning', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onContinue: vi.fn(),
    onTopUp: vi.fn(),
    availableHours: 0.5, // 30 minutes
  }

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<LowHoursWarning {...defaultProps} />)

      expect(screen.getByText('Running Low')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<LowHoursWarning {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Running Low')).not.toBeInTheDocument()
    })

    it('displays available time correctly - 30 minutes', () => {
      render(<LowHoursWarning {...defaultProps} availableHours={0.5} />)

      expect(screen.getByText(/You have 30m remaining/)).toBeInTheDocument()
    })

    it('displays available time correctly - 24 minutes', () => {
      render(<LowHoursWarning {...defaultProps} availableHours={0.4} />)

      expect(screen.getByText(/You have 24m remaining/)).toBeInTheDocument()
    })

    it('displays available time correctly - 45 minutes', () => {
      render(<LowHoursWarning {...defaultProps} availableHours={0.75} />)

      expect(screen.getByText(/You have 45m remaining/)).toBeInTheDocument()
    })

    it('shows deficit warning message', () => {
      render(<LowHoursWarning {...defaultProps} />)

      expect(
        screen.getByText(/Top up now to avoid losing meditation time to deficit/)
      ).toBeInTheDocument()
    })

    it('displays Continue button', () => {
      render(<LowHoursWarning {...defaultProps} />)

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })

    it('displays Top Up button', () => {
      render(<LowHoursWarning {...defaultProps} />)

      expect(screen.getByRole('button', { name: /top up/i })).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('Continue button triggers onContinue', () => {
      const onContinue = vi.fn()
      render(<LowHoursWarning {...defaultProps} onContinue={onContinue} />)

      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      expect(onContinue).toHaveBeenCalledTimes(1)
    })

    it('Top Up button triggers onTopUp', () => {
      const onTopUp = vi.fn()
      render(<LowHoursWarning {...defaultProps} onTopUp={onTopUp} />)

      fireEvent.click(screen.getByRole('button', { name: /top up/i }))

      expect(onTopUp).toHaveBeenCalledTimes(1)
    })

    it('clicking backdrop triggers onClose', () => {
      const onClose = vi.fn()
      render(<LowHoursWarning {...defaultProps} onClose={onClose} />)

      // The backdrop is the outer div with onClick={onClose}
      // We need to find and click it - it's the fixed inset-0 element
      const backdrop = screen.getByText('Running Low').closest('.fixed')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('clicking modal content does not close (stopPropagation)', () => {
      const onClose = vi.fn()
      render(<LowHoursWarning {...defaultProps} onClose={onClose} />)

      // Click on the modal content itself
      fireEvent.click(screen.getByText('Running Low'))

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles very low hours (1 minute)', () => {
      render(<LowHoursWarning {...defaultProps} availableHours={1 / 60} />)

      expect(screen.getByText(/You have 1m remaining/)).toBeInTheDocument()
    })

    it('handles hours just under 1 hour', () => {
      render(<LowHoursWarning {...defaultProps} availableHours={0.99} />)

      // 0.99 * 60 = 59.4 minutes, rounds to 59m
      expect(screen.getByText(/You have 59m remaining/)).toBeInTheDocument()
    })
  })
})
