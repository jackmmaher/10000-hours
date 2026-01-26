/**
 * Navigation - Bottom navigation bar
 *
 * Minimal tab bar for main app sections.
 * Fades out smoothly when timer starts, fades back when timer ends.
 * Now fully theme-aware using CSS variables.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useTrialStore } from '../stores/useTrialStore'
import { useTapFeedback } from '../hooks/useTapFeedback'

type NavItem = {
  view: 'timer' | 'journey' | 'explore' | 'progress' | 'exercises'
  label: string
  description: string // Accessibility context for screen readers
  icon: JSX.Element
}

// Left side tabs (discovery/planning)
const leftNavItems: NavItem[] = [
  {
    view: 'journey',
    label: 'Journey',
    description: 'where you plan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    view: 'explore',
    label: 'Explore',
    description: 'where you discover',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
]

// Center tab (the core action)
const centerNavItem: NavItem = {
  view: 'timer',
  label: 'Timer',
  description: 'where you practice',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeWidth={1.5} d="M12 6v6l4 2" />
    </svg>
  ),
}

// Right side tabs (reflection/personal)
const rightNavItems: NavItem[] = [
  {
    view: 'progress',
    label: 'Progress',
    description: 'where you reflect',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    view: 'exercises',
    label: 'Exercises',
    description: 'where you prepare',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 12h1m14 0h1m-8-4v8m-4-4h8M6 8v8m12-8v8"
        />
      </svg>
    ),
  },
]

export function Navigation() {
  const { view, setView } = useNavigationStore()
  const { timerPhase } = useSessionStore()
  const { trialPhase } = useTrialStore()
  const haptic = useTapFeedback()

  // Hide during active meditation phases (with smooth fade)
  // Check both regular timer and trial timer phases
  const isTimerActive =
    timerPhase === 'preparing' ||
    timerPhase === 'running' ||
    trialPhase === 'pending' ||
    trialPhase === 'active'

  // Helper to check if a nav item is active
  const isItemActive = (item: NavItem) =>
    view === item.view ||
    // Legacy view mappings for backwards compatibility during transition
    (item.view === 'progress' && view === 'calendar') ||
    (item.view === 'explore' && (view === 'pearls' || view === 'saved-pearls')) ||
    (item.view === 'journey' && view === 'insights')

  // Render a standard nav button
  const renderNavButton = (item: NavItem) => {
    const isActive = isItemActive(item)
    return (
      <button
        key={item.view}
        onClick={() => {
          haptic.light()
          setView(item.view)
        }}
        aria-label={`Navigate to ${item.label} — ${item.description}`}
        aria-current={isActive ? 'page' : undefined}
        className="flex flex-col items-center justify-center flex-1 py-2 transition-colors active:scale-95"
        style={{
          color: isActive ? 'var(--nav-active)' : 'var(--nav-inactive)',
        }}
      >
        {item.icon}
        <span className="text-caption mt-1 font-medium">{item.label}</span>
      </button>
    )
  }

  const isTimerTabActive = isItemActive(centerNavItem)

  return (
    <AnimatePresence>
      {!isTimerActive && (
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
          style={{
            background: 'var(--nav-bg)',
          }}
        >
          {/* Main nav bar with arch cutout effect */}
          <div className="relative h-16 max-w-lg mx-auto">
            {/* Background layer - flat bar */}
            <div
              className="absolute inset-0 backdrop-blur-sm"
              style={{
                background: 'var(--nav-bg)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            />

            {/* Center arch - rises above the bar */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-3 w-[76px] h-[52px] backdrop-blur-sm"
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: '38px 38px 0 0',
                boxShadow: 'var(--shadow-elevation-2)',
              }}
            >
              {/* Border around arch - visible in both light and dark modes */}
              <div
                className="absolute inset-0 rounded-t-full pointer-events-none"
                style={{
                  border: '1px solid var(--border)',
                  borderBottom: 'none',
                  borderRadius: '38px 38px 0 0',
                }}
              />
            </div>

            {/* Nav content */}
            <div className="relative flex items-center h-full px-2">
              {/* Left group: Journey, Explore */}
              <div className="flex flex-1">{leftNavItems.map(renderNavButton)}</div>

              {/* Center: Timer (positioned in the arch) */}
              <div className="relative flex items-center justify-center w-[76px]">
                <button
                  onClick={() => {
                    haptic.light()
                    setView(centerNavItem.view)
                  }}
                  aria-label={`Navigate to ${centerNavItem.label} — ${centerNavItem.description}`}
                  aria-current={isTimerTabActive ? 'page' : undefined}
                  className="flex flex-col items-center justify-center pt-0 pb-2 -mt-3 transition-colors active:scale-95"
                  style={{
                    color: isTimerTabActive ? 'var(--nav-active)' : 'var(--nav-inactive)',
                  }}
                >
                  {centerNavItem.icon}
                  <span className="text-caption mt-1 font-medium">{centerNavItem.label}</span>
                </button>
              </div>

              {/* Right group: Progress, Exercises */}
              <div className="flex flex-1">{rightNavItems.map(renderNavButton)}</div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
