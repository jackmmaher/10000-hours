/**
 * Logger - Development/Production logging utility
 *
 * Provides console.log-like functionality that:
 * - Only outputs in development mode
 * - Is silenced in production builds
 * - Satisfies ESLint no-console rule
 */

const isDev = import.meta.env.DEV

/**
 * Development-only logging functions
 * These are no-ops in production builds
 */
export const logger = {
  /** Log general information (dev only) */
  log: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },

  /** Log debug information (dev only) */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args)
    }
  },

  /** Log informational messages (dev only) */
  info: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(...args)
    }
  },

  /** Log warnings - these appear in both dev and prod */
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },

  /** Log errors - these appear in both dev and prod */
  error: (...args: unknown[]) => {
    console.error(...args)
  },

  /** Log with grouping (dev only) */
  group: (label: string) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.group(label)
    }
  },

  groupEnd: () => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.groupEnd()
    }
  },

  /** Log a table (dev only) */
  table: (data: unknown) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.table(data)
    }
  },
}

export default logger
