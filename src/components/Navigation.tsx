/**
 * Navigation - Bottom navigation bar
 *
 * Minimal tab bar for main app sections.
 * Only visible when not in timer running state.
 * Now fully theme-aware using CSS variables.
 */

import { useSessionStore } from '../stores/useSessionStore'
import { useTapFeedback } from '../hooks/useTapFeedback'

type NavItem = {
  view: 'timer' | 'journey' | 'explore' | 'progress' | 'profile'
  label: string
  icon: JSX.Element
}

const navItems: NavItem[] = [
  {
    view: 'timer',
    label: 'Timer',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeWidth={1.5} d="M12 6v6l4 2" />
      </svg>
    )
  },
  {
    view: 'journey',
    label: 'Journey',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )
  },
  {
    view: 'explore',
    label: 'Explore',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    view: 'progress',
    label: 'Progress',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    view: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
]

export function Navigation() {
  const { view, timerPhase, setView } = useSessionStore()
  const haptic = useTapFeedback()

  // Hide during active meditation phases
  const isTimerActive = timerPhase === 'preparing' || timerPhase === 'running' || timerPhase === 'capture' || timerPhase === 'enlightenment'

  if (isTimerActive) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-sm safe-area-bottom"
      style={{
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--border-subtle)'
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = view === item.view ||
            // Legacy view mappings for backwards compatibility during transition
            (item.view === 'progress' && view === 'calendar') ||
            (item.view === 'explore' && (view === 'pearls' || view === 'saved-pearls')) ||
            (item.view === 'journey' && view === 'insights') ||
            (item.view === 'profile' && view === 'settings')

          return (
            <button
              key={item.view}
              onClick={() => {
                haptic.light()
                setView(item.view)
              }}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center flex-1 py-2 transition-colors active:scale-95"
              style={{
                color: isActive ? 'var(--nav-active)' : 'var(--nav-inactive)'
              }}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
