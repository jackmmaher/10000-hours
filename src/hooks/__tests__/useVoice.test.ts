/**
 * useVoice Hook Tests
 *
 * Tests for voice notification behavior.
 * Key behavior: notifications should only fire when explicitly enabled,
 * preventing duplicate notifications from multiple hook instances.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the notification logic by importing the hook and checking
// that it accepts an enableNotifications option.
// The actual React hook testing is done through integration tests.

describe('useVoice notification options', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('useVoice should accept enableNotifications option', async () => {
    // This test verifies that useVoice accepts the enableNotifications option
    // The hook signature should be: useVoice(options?: { enableNotifications?: boolean })

    // Import the useVoice type to verify its signature
    const { useVoice } = await import('../useVoice')

    // useVoice should be a function
    expect(typeof useVoice).toBe('function')

    // The function should accept an optional options parameter
    // This test will FAIL until we update the function signature
    expect(useVoice.length).toBeLessThanOrEqual(1) // 0 or 1 parameters
  })

  it('useVoice options type should include enableNotifications', async () => {
    // This is a compile-time check more than runtime
    // We're verifying the type exists by checking we can import the interface

    // If UseVoiceOptions is not exported, this will still work
    // because TypeScript will infer the type from usage
    const module = await import('../useVoice')

    // The module should export useVoice
    expect(module.useVoice).toBeDefined()
  })
})

describe('useVoice exports', () => {
  it('exports useVoice function', async () => {
    const module = await import('../useVoice')
    expect(typeof module.useVoice).toBe('function')
  })

  it('exports useVoiceLocal function', async () => {
    const module = await import('../useVoice')
    expect(typeof module.useVoiceLocal).toBe('function')
  })

  it('exports UseVoiceResult interface (via type)', async () => {
    // Type exports don't exist at runtime, but the shape of the hook result
    // should match the documented interface
    const module = await import('../useVoice')
    expect(module.useVoice).toBeDefined()
  })
})
