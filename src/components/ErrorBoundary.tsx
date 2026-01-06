import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-cream flex flex-col items-center justify-center p-8 text-center">
          <div className="text-ink-soft text-lg font-serif mb-4">
            Something went wrong
          </div>
          <p className="text-ink-soft/60 text-sm mb-6 max-w-xs">
            The app encountered an unexpected error. Your meditation data is safe.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-2 bg-moss/20 text-moss rounded-full text-sm font-medium"
          >
            Try again
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 text-xs text-red-500 text-left max-w-full overflow-auto p-4 bg-red-50 rounded">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
