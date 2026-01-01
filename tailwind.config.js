/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F7F5F2',
        'cream-dark': '#F0EDE8',
        indigo: {
          deep: '#1a1a2e',
        }
      },
      fontFamily: {
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'timer': ['2.5rem', { lineHeight: '1', letterSpacing: '0.02em' }],
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out forwards',
        'fade-out': 'fadeOut 400ms ease-out forwards',
        'breathe': 'breathe 4s ease-in-out infinite',
        'word-fade': 'wordFade 400ms ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        wordFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}
