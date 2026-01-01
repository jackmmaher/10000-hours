import { useEffect } from 'react'
import { useSessionStore } from './stores/useSessionStore'
import { Timer } from './components/Timer'
import { Stats } from './components/Stats'
import { Calendar } from './components/Calendar'

function App() {
  const { view, isLoading, hydrate } = useSessionStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (isLoading) {
    return (
      <div className="h-full bg-cream flex items-center justify-center">
        <div className="w-1 h-1 bg-indigo-deep/30 rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <div className="h-full">
      {view === 'timer' && <Timer />}
      {view === 'stats' && <Stats />}
      {view === 'calendar' && <Calendar />}
    </div>
  )
}

export default App
