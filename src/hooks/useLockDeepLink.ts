/**
 * useLockDeepLink - Hook to handle stillhours://lock-session deep links
 *
 * Listens for deep links from the MeditationLock shield extension
 * and creates a PlannedSession when a lock-session URL is received.
 */

import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useNavigationStore } from '../stores/useNavigationStore'
import { parseLockSessionUrl, createLockSession } from '../lib/deepLinkHandler'

export function useLockDeepLink(): void {
  const { setView } = useNavigationStore()
  const listenerRef = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    // Only set up listener on native platforms
    if (!Capacitor.isNativePlatform()) {
      return
    }

    // Handler for deep link events
    const handleDeepLink = async (event: { url: string }) => {
      console.debug('[useLockDeepLink] Received URL:', event.url)

      // Parse the URL
      const params = parseLockSessionUrl(event.url)
      if (!params) {
        console.debug('[useLockDeepLink] Not a lock-session URL, ignoring')
        return
      }

      console.debug('[useLockDeepLink] Parsed lock-session params:', params)

      // Create the planned session
      const session = await createLockSession(params)
      if (!session) {
        console.error('[useLockDeepLink] Failed to create lock session')
        return
      }

      console.debug('[useLockDeepLink] Created session, navigating to timer')

      // Navigate to timer
      setView('timer')
    }

    // Register the listener
    App.addListener('appUrlOpen', handleDeepLink).then((handle) => {
      listenerRef.current = handle
    })

    // Cleanup on unmount
    return () => {
      if (listenerRef.current) {
        listenerRef.current.remove()
      }
    }
  }, [setView])
}
