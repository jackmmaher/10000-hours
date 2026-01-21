/**
 * Tests for useLockDeepLink hook
 *
 * Tests the hook that listens for stillhours://lock-session deep links
 * and creates a PlannedSession when received.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Store for listener callback
let lastAppUrlOpenCallback: ((data: { url: string }) => void) | null = null
const mockRemoveListener = vi.fn()

// Mock Capacitor App - using inline vi.fn() to avoid hoisting issues
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn((event: string, callback: (data: { url: string }) => void) => {
      if (event === 'appUrlOpen') {
        lastAppUrlOpenCallback = callback
      }
      return Promise.resolve({ remove: mockRemoveListener })
    }),
  },
}))

// Mock Capacitor core
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => true),
  },
}))

// Mock navigation store
const mockSetView = vi.fn()
vi.mock('../../stores/useNavigationStore', () => ({
  useNavigationStore: () => ({
    setView: mockSetView,
  }),
}))

// Mock deep link handler
vi.mock('../../lib/deepLinkHandler', () => ({
  parseLockSessionUrl: vi.fn(),
  createLockSession: vi.fn(),
}))

// Import after mocks
import { useLockDeepLink } from '../useLockDeepLink'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { parseLockSessionUrl, createLockSession } from '../../lib/deepLinkHandler'

describe('useLockDeepLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    lastAppUrlOpenCallback = null
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should register appUrlOpen listener on native platform', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)

    renderHook(() => useLockDeepLink())

    // Wait for the async listener registration
    await waitFor(() => {
      expect(App.addListener).toHaveBeenCalledWith('appUrlOpen', expect.any(Function))
    })
  })

  it('should not register listener on web platform', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)

    renderHook(() => useLockDeepLink())

    expect(App.addListener).not.toHaveBeenCalled()
  })

  it('should cleanup listener on unmount', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)

    const { unmount } = renderHook(() => useLockDeepLink())

    // Wait for listener to be registered
    await waitFor(() => {
      expect(lastAppUrlOpenCallback).not.toBeNull()
    })

    unmount()

    expect(mockRemoveListener).toHaveBeenCalled()
  })

  it('should create session and navigate to timer when receiving lock-session URL', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
    vi.mocked(parseLockSessionUrl).mockReturnValue({
      duration: 10,
      fallback: false,
      anchor: 'morning coffee',
    })
    vi.mocked(createLockSession).mockResolvedValue({
      id: 1,
      date: Date.now(),
      duration: 10,
      title: 'Lock Session',
      enforceGoal: true,
      createdAt: Date.now(),
    })

    renderHook(() => useLockDeepLink())

    // Wait for listener to be registered
    await waitFor(() => {
      expect(lastAppUrlOpenCallback).not.toBeNull()
    })

    // Simulate deep link event
    await act(async () => {
      if (lastAppUrlOpenCallback) {
        lastAppUrlOpenCallback({
          url: 'stillhours://lock-session?duration=10&fallback=false&anchor=morning%20coffee',
        })
      }
    })

    await waitFor(() => {
      expect(parseLockSessionUrl).toHaveBeenCalledWith(
        'stillhours://lock-session?duration=10&fallback=false&anchor=morning%20coffee'
      )
      expect(createLockSession).toHaveBeenCalledWith({
        duration: 10,
        fallback: false,
        anchor: 'morning coffee',
      })
      expect(mockSetView).toHaveBeenCalledWith('timer')
    })
  })

  it('should not create session for non-lock-session URLs', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
    vi.mocked(parseLockSessionUrl).mockReturnValue(null)

    renderHook(() => useLockDeepLink())

    // Wait for listener to be registered
    await waitFor(() => {
      expect(lastAppUrlOpenCallback).not.toBeNull()
    })

    // Simulate deep link event
    await act(async () => {
      if (lastAppUrlOpenCallback) {
        lastAppUrlOpenCallback({ url: 'stillhours://settings' })
      }
    })

    expect(createLockSession).not.toHaveBeenCalled()
    expect(mockSetView).not.toHaveBeenCalled()
  })
})
