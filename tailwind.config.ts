import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base
        white: '#FFFFFF',
        mist: '#F5F5F7',
        // Ink scale
        ink: {
          DEFAULT: '#1D1D1F',
          mid: '#6E6E73',
          faint: '#AEAEB2',
        },
        // Accent — Electric Indigo
        accent: {
          DEFAULT: '#4F46E5',
          mid: '#6366F1',
          soft: 'rgba(79,70,229,0.08)',
          glow: 'rgba(79,70,229,0.18)',
        },
        // Semantic
        emerald: { DEFAULT: '#059669' },
        amber: { DEFAULT: '#D97706' },
        violet: { DEFAULT: '#7C3AED' },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['84px', { lineHeight: '1.0', letterSpacing: '-0.01em' }],
        'display': ['52px', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'section': ['40px', { lineHeight: '1.1' }],
        'subsection': ['28px', { lineHeight: '1.2' }],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        md: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
        lg: '0 8px 16px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.12)',
        accent: '0 8px 32px rgba(79,70,229,0.28)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        'gradient-indigo': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)',
        'gradient-dark': 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, transparent 60%, rgba(0,0,0,0.95) 100%)',
      },
    },
  },
  plugins: [],
}

export default config
