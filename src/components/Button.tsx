/**
 * Button - Design system button with complete interactive states
 *
 * Implements Human-Crafted Design skill requirements:
 * - All states: default, hover, active, focus-visible, disabled
 * - Semantic variants: primary, secondary, ghost, danger
 * - Consistent timing (150ms transitions)
 */

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { useTapFeedback } from '../hooks/useTapFeedback'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Full width button */
  fullWidth?: boolean
  /** Loading state - shows spinner, disables interaction */
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]
    hover:brightness-110
    active:brightness-95 active:scale-[0.98]
  `,
  secondary: `
    bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)]
    border border-[var(--border)]
    hover:bg-[var(--bg-deep)]
    active:bg-[var(--bg-base)] active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-[var(--text-secondary)]
    hover:text-[var(--text-primary)] hover:bg-[var(--bg-deep)]
    active:bg-[var(--bg-base)] active:scale-[0.98]
  `,
  danger: `
    bg-red-500 text-white
    hover:bg-red-600
    active:bg-red-700 active:scale-[0.98]
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-caption rounded-lg',
  md: 'px-4 py-2.5 text-body rounded-xl',
  lg: 'px-6 py-3.5 text-body rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const haptic = useTapFeedback()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return
      haptic.light()
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium
          transition-all duration-150 ease-out
          touch-manipulation
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
