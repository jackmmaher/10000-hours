/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic theme colors (reference CSS variables for theming)
        cream: 'var(--bg-base, #FAF8F3)',
        'cream-warm': 'var(--bg-warm, #F7F3EA)',
        'cream-deep': 'var(--bg-deep, #EBE6D9)',
        // Legacy alias for backward compatibility
        'cream-dark': 'var(--bg-warm, #F7F3EA)',
        // Ink tones - dynamic text colors
        ink: 'var(--text-primary, #2C3E50)',
        'ink-soft': 'var(--text-secondary, #5D6D7E)',
        // Accent colors - seasonal
        moss: 'var(--accent, #87A878)',
        bark: 'var(--accent-warm, #A08060)',
        // Legacy alias
        indigo: {
          deep: 'var(--text-primary, #2C3E50)',
        },
        // Direct theme token mappings
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-muted': 'var(--accent-muted)',
        // Text on colored backgrounds
        'on-accent': 'var(--text-on-accent)',
        // Semantic backgrounds
        'elevated': 'var(--bg-elevated)',
        'deep': 'var(--bg-deep)',
        // Borders
        'border-theme': 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        // Card backgrounds (glassmorphism-ready)
        'card': 'var(--card-bg)',
      },
      spacing: {
        // Design system spacing (prefer these)
        'ds-1': 'var(--space-1)',   // 4px
        'ds-2': 'var(--space-2)',   // 8px
        'ds-3': 'var(--space-3)',   // 12px
        'ds-4': 'var(--space-4)',   // 16px
        'ds-6': 'var(--space-6)',   // 24px
        'ds-8': 'var(--space-8)',   // 32px
        'ds-12': 'var(--space-12)', // 48px
        'ds-16': 'var(--space-16)', // 64px
        'ds-24': 'var(--space-24)', // 96px
        'ds-32': 'var(--space-32)', // 128px
      },
      fontFamily: {
        // Pair 1: Palatino + Raleway (from font-pairs.html)
        serif: ['Palatino Linotype', 'Book Antiqua', 'Palatino', 'Georgia', 'serif'],
        sans: ['Raleway', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Semantic typography scale (5 styles - per Human-Crafted Design)
        'display': ['var(--text-display-size)', {
          lineHeight: 'var(--text-display-line)',
          letterSpacing: 'var(--text-display-tracking)'
        }],
        'heading': ['var(--text-heading-size)', {
          lineHeight: 'var(--text-heading-line)',
          letterSpacing: 'var(--text-heading-tracking)'
        }],
        'subheading': ['var(--text-subheading-size)', {
          lineHeight: 'var(--text-subheading-line)',
          letterSpacing: 'var(--text-subheading-tracking)'
        }],
        'body': ['var(--text-body-size)', {
          lineHeight: 'var(--text-body-line)',
          letterSpacing: 'var(--text-body-tracking)'
        }],
        'caption': ['var(--text-caption-size)', {
          lineHeight: 'var(--text-caption-line)',
          letterSpacing: 'var(--text-caption-tracking)'
        }],
        // Legacy - keep for backward compatibility during migration
        'display-sm': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'timer': ['2.5rem', { lineHeight: '1', letterSpacing: '0.02em' }],
      },
      letterSpacing: {
        'label': 'var(--tracking-wide)', // For uppercase labels
      },
      animation: {
        'fade-in': 'fadeIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-out': 'fadeOut 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'breathe': 'breathe 6s ease-in-out infinite',
        'breathe-slow': 'breatheSlow 8s ease-in-out infinite',
        'word-fade': 'wordFade 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'orb-breathe': 'orbBreathe 4s ease-in-out infinite',
        'orb-glow': 'orbGlow 4s ease-in-out infinite',
        'box-breathe': 'boxBreathe 16s ease-in-out infinite',
        'spotlight-breathe': 'spotlightBreathe 16s ease-in-out infinite',
        // Timer transitions now handled by Framer Motion
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-4px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(0.98)' },
        },
        breatheSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.96)' },
        },
        wordFade: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.6' },
        },
        // Luminous orb breathing - gentle, organic pulse
        orbBreathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.92)', opacity: '0.85' },
        },
        // Outer glow pulse - offset timing for layered effect
        orbGlow: {
          '0%, 100%': { transform: 'scale(1.3)', opacity: '0.3' },
          '50%': { transform: 'scale(1)', opacity: '0.1' },
        },
        // Box breathing - 16s 4-4-4-4 cycle for idle state
        boxBreathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '25%, 50%': { transform: 'scale(1.03)', opacity: '1' },
          '75%': { transform: 'scale(1)', opacity: '1' },
        },
        // Spotlight breathing - synced to box-breathe, gentle contraction draws eye in
        spotlightBreathe: {
          '0%': { backgroundSize: '200% 200%', backgroundPosition: 'center 45%' },
          '12.5%': { backgroundSize: '192% 192%', backgroundPosition: 'center 45%' },
          '25%': { backgroundSize: '185% 185%', backgroundPosition: 'center 45%' },
          '37.5%': { backgroundSize: '182% 182%', backgroundPosition: 'center 45%' },
          '50%': { backgroundSize: '185% 185%', backgroundPosition: 'center 45%' },
          '62.5%': { backgroundSize: '192% 192%', backgroundPosition: 'center 45%' },
          '75%': { backgroundSize: '200% 200%', backgroundPosition: 'center 45%' },
          '87.5%': { backgroundSize: '200% 200%', backgroundPosition: 'center 45%' },
          '100%': { backgroundSize: '200% 200%', backgroundPosition: 'center 45%' },
        },
        // Timer transitions now handled by Framer Motion (see src/lib/motion.ts)
      },
      transitionDuration: {
        // Semantic durations (prefer these)
        'fast': '150ms',   // Micro-interactions, hover states
        'base': '200ms',   // Standard transitions
        'slow': '300ms',   // Emphasis, complex motion
        // Legacy (keep for backward compatibility)
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        // Semantic easings (from CSS variables)
        'out': 'var(--ease-out)',           // Default for most transitions
        'in-out': 'var(--ease-in-out)',     // Reversible actions
        'organic': 'var(--ease-organic)',   // Playful/delightful
        // Legacy
        'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
