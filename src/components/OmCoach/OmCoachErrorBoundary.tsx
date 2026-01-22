/**
 * OmCoachErrorBoundary - Error boundary with audio cleanup
 *
 * Wraps OmCoach to catch errors during practice and cleanly
 * recover without crashing the entire app.
 */

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class OmCoachErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[OmCoach] Error caught:', error, errorInfo)
    }
    // Call optional cleanup handler
    this.props.onError?.()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-full bg-base">
          {/* Header */}
          <div className="flex-none flex items-center justify-center px-4 py-3 border-b border-border-subtle">
            <h2 className="text-sm font-medium text-ink">Aum Coach</h2>
          </div>

          {/* Error content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <span className="text-2xl">!</span>
            </div>

            <h3 className="text-lg font-medium text-ink mb-2">Something went wrong</h3>
            <p className="text-sm text-ink/60 mb-6 max-w-xs">
              The audio processing encountered an error. Your meditation data is safe.
            </p>

            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-accent text-white rounded-xl font-medium"
            >
              Try Again
            </button>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 text-xs text-red-500 text-left max-w-full overflow-auto p-4 bg-red-50 rounded">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
