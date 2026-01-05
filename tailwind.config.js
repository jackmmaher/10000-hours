/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ghibli-inspired warm palette
        cream: '#FAF8F3',
        'cream-warm': '#F5F1E8',
        'cream-deep': '#EDE8DC',
        // Legacy alias for backward compatibility
        'cream-dark': '#F5F1E8',
        // Ink tones (replacing indigo)
        ink: '#2D3436',
        'ink-soft': '#4A5568',
        // Accent colors
        moss: '#7C9A6E',
        bark: '#8B7355',
        // Legacy alias
        indigo: {
          deep: '#2D3436',
        }
      },
      fontFamily: {
        // Ghibli typography
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'timer': ['2.5rem', { lineHeight: '1', letterSpacing: '0.02em' }],
      },
      animation: {
        'fade-in': 'fadeIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-out': 'fadeOut 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'breathe': 'breathe 6s ease-in-out infinite',
        'breathe-slow': 'breatheSlow 8s ease-in-out infinite',
        'word-fade': 'wordFade 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
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
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
