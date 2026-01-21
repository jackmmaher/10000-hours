/**
 * LockSimulator - Dev mode component to test shield modal flow
 *
 * Simulates the locked home screen and shield modal states
 * so developers can test the lock → timer flow without iOS permissions.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMeditationLockSettings } from '../lib/db/meditationLockSettings'
import { createLockSession } from '../lib/deepLinkHandler'
import { useNavigationStore } from '../stores/useNavigationStore'
import { Button } from './Button'
import type { MeditationLockSettings } from '../lib/db/types'

// Simulated blocked apps
const BLOCKED_APPS = [
  { name: 'Instagram', icon: '📷', color: '#E4405F' },
  { name: 'TikTok', icon: '🎵', color: '#000000' },
  { name: 'X', icon: '𝕏', color: '#000000' },
  { name: 'YouTube', icon: '▶️', color: '#FF0000' },
  { name: 'Reddit', icon: '🤖', color: '#FF4500' },
  { name: 'Threads', icon: '@', color: '#000000' },
  { name: 'Snapchat', icon: '👻', color: '#FFFC00' },
  { name: 'Facebook', icon: 'f', color: '#1877F2' },
]

type ShieldState = 'locked' | 'flexibility' | 'in-progress' | null

interface LockSimulatorProps {
  onClose: () => void
}

export function LockSimulator({ onClose }: LockSimulatorProps) {
  const [settings, setSettings] = useState<MeditationLockSettings | null>(null)
  const [shieldState, setShieldState] = useState<ShieldState>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setView } = useNavigationStore()

  // Load settings from DB
  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await getMeditationLockSettings()
        setSettings(s)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  // Handle CTA click - create session and navigate to timer
  const handleOpenStillHours = async (useFallback: boolean) => {
    if (!settings) return

    const duration = useFallback ? settings.minimumFallbackMinutes : settings.unlockDurationMinutes

    // Create the planned session
    await createLockSession({
      duration,
      fallback: useFallback,
      anchor: settings.anchorRoutine || undefined,
    })

    // Navigate to timer
    setView('timer')
    onClose()
  }

  // Handle emergency skip
  const handleEmergencySkip = () => {
    // In production this would decrement streakFreezesRemaining
    // For dev mode, just close and show confirmation
    alert(
      `Emergency skip used. ${(settings?.streakFreezesRemaining ?? 3) - 1} remaining this month.`
    )
    onClose()
  }

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: 'var(--border-subtle)',
            borderTopColor: 'var(--accent)',
          }}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-area-top">
        <h1 className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>
          Lock Simulator
        </h1>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>✕</span>
        </button>
      </div>

      {/* Instructions */}
      <div
        className="mx-4 mb-4 p-3 rounded-xl"
        style={{
          background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <strong>Dev Mode:</strong> Tap any app to see the shield modal. This simulates what users
          see when trying to open blocked apps during lock hours.
        </p>
      </div>

      {/* Simulated Home Screen */}
      <div className="flex-1 px-4 overflow-y-auto">
        <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Blocked Apps (tap to trigger shield)
        </p>
        <div className="grid grid-cols-4 gap-4">
          {BLOCKED_APPS.map((app) => (
            <button
              key={app.name}
              onClick={() => setShieldState('locked')}
              className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-150 active:scale-95"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{
                  background: app.color,
                  color: app.color === '#FFFC00' ? '#000' : '#fff',
                }}
              >
                {app.icon}
              </div>
              <span
                className="text-xs truncate w-full text-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                {app.name}
              </span>
            </button>
          ))}
        </div>

        {/* Direct state triggers for testing */}
        <div className="mt-8">
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Test Shield States Directly
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setShieldState('locked')}
              className="w-full p-3 rounded-xl text-left text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              Shield: Locked State
            </button>
            <button
              onClick={() => setShieldState('flexibility')}
              className="w-full p-3 rounded-xl text-left text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              Shield: Flexibility Mode
            </button>
            <button
              onClick={() => setShieldState('in-progress')}
              className="w-full p-3 rounded-xl text-left text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              Shield: Session In Progress
            </button>
          </div>
        </div>

        {/* Settings summary */}
        {settings && (
          <div className="mt-8 mb-8">
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Current Settings
            </p>
            <div
              className="p-4 rounded-xl space-y-2 text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Anchor: </span>
                {settings.anchorRoutine || '(not set)'}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Unlock duration: </span>
                {settings.unlockDurationMinutes} min
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Minimum fallback: </span>
                {settings.minimumFallbackMinutes} min
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Emergency skips: </span>
                {settings.streakFreezesRemaining}/{settings.streakFreezesPerMonth}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>First obstacle: </span>
                {settings.obstacles?.[0]?.obstacle || '(none)'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shield Modal Overlay */}
      <AnimatePresence>
        {shieldState && settings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShieldState(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-8 text-center"
              style={{ background: 'var(--bg-base)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* LOCKED STATE */}
              {shieldState === 'locked' && (
                <>
                  {/* Logo placeholder */}
                  <div
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}
                  >
                    <span className="text-2xl text-white">⏱</span>
                  </div>

                  {/* Anchor reference */}
                  <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    After {settings.anchorRoutine || 'your anchor'}
                  </p>

                  {/* Duration */}
                  <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                    {settings.unlockDurationMinutes} minutes to unlock
                  </p>

                  {/* CTA */}
                  <Button variant="primary" fullWidth onClick={() => handleOpenStillHours(false)}>
                    Open Still Hours
                  </Button>

                  {/* Flexibility link */}
                  <button
                    onClick={() => setShieldState('flexibility')}
                    className="mt-6 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Need flexibility today?
                  </button>
                </>
              )}

              {/* FLEXIBILITY MODE */}
              {shieldState === 'flexibility' && (
                <>
                  {/* Header */}
                  <h2 className="text-xl font-serif mb-4" style={{ color: 'var(--text-primary)' }}>
                    Showing up matters most
                  </h2>

                  {/* Minimum duration */}
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Your minimum today:
                  </p>
                  <p className="text-2xl font-medium mb-6" style={{ color: 'var(--accent)' }}>
                    {settings.minimumFallbackMinutes} minutes
                  </p>

                  {/* Obstacle/coping display */}
                  {settings.obstacles?.[0] && (
                    <div
                      className="p-4 rounded-xl mb-6 text-left"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        If I'm {settings.obstacles[0].obstacle}, I will...
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {settings.obstacles[0].copingResponse}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <Button variant="primary" fullWidth onClick={() => handleOpenStillHours(true)}>
                    Open Still Hours ({settings.minimumFallbackMinutes} min)
                  </Button>

                  {/* Skip option */}
                  <button
                    onClick={handleEmergencySkip}
                    className="mt-6 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Use emergency skip ({settings.streakFreezesRemaining} left)
                  </button>

                  {/* Back to locked */}
                  <button
                    onClick={() => setShieldState('locked')}
                    className="mt-4 text-xs block w-full"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    ← Back
                  </button>
                </>
              )}

              {/* SESSION IN PROGRESS */}
              {shieldState === 'in-progress' && (
                <>
                  {/* Logo placeholder */}
                  <div
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}
                  >
                    <span className="text-2xl text-white">⏱</span>
                  </div>

                  {/* Status */}
                  <p className="text-lg font-medium mb-8" style={{ color: 'var(--text-primary)' }}>
                    Session in progress
                  </p>

                  {/* CTA */}
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setView('timer')
                      onClose()
                    }}
                  >
                    Return to Still Hours
                  </Button>
                </>
              )}

              {/* Dismiss hint */}
              <p className="mt-6 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                (Tap outside to dismiss)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
