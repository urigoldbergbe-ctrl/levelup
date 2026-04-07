import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Cinema dark palette (Disney+ DNA) ──────────────────
        cinema: {
          bg:     '#0E141F',   // deep navy — the signature Disney+ dark
          card:   '#151D2C',   // slightly lighter card surface
          hover:  '#1C2840',   // hover state for cards
          border: 'rgba(255,255,255,0.08)',
          glow:   'rgba(79,130,255,0.35)',
        },
        // ── Accent — Streaming Blue ─────────────────────────────
        accent: {
          DEFAULT: '#4F82FF',
          mid:     '#6B9AFF',
          soft:    'rgba(79,130,255,0.12)',
          glow:    'rgba(79,130,255,0.35)',
        },
        // ── Legacy compatibility ────────────────────────────────
        white: '#FFFFFF',
        mist:  '#F5F5F7',
        ink: {
          DEFAULT: '#1D1D1F',
          mid:     '#6E6E73',
          faint:   '#AEAEB2',
        },
        emerald: { DEFAULT: '#10B981' },
        amber:   { DEFAULT: '#F59E0B' },
        violet:  { DEFAULT: '#8B5CF6' },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body:    ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero':       ['84px', { lineHeight: '1.0',  letterSpacing: '-0.01em' }],
        'display':    ['52px', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'section':    ['40px', { lineHeight: '1.1' }],
        'subsection': ['28px', { lineHeight: '1.2' }],
      },
      boxShadow: {
        sm:    '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
        md:    '0 4px 8px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.3)',
        lg:    '0 8px 24px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.4)',
        accent:'0 0 32px rgba(79,130,255,0.45), 0 0 64px rgba(79,130,255,0.20)',
        card:  '0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        glow:  '0 0 40px rgba(79,130,255,0.6)',
        poster:'0 8px 40px rgba(0,0,0,0.7)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        // Cinematic gradients
        'gradient-cinema':   'linear-gradient(180deg, #0E141F 0%, #070D16 100%)',
        'gradient-hero':     'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(79,130,255,0.18) 0%, transparent 60%), linear-gradient(180deg, #0E141F 0%, #060B14 100%)',
        'gradient-card':     'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-dark-up':  'linear-gradient(0deg, #0E141F 0%, transparent 50%)',
        'gradient-poster':   'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)',
        'gradient-overlay':  'linear-gradient(135deg, #4F82FF 0%, #8B5CF6 50%, #4F82FF 100%)',
        'gradient-indigo':   'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)',
      },
      animation: {
        'ken-burns':  'kenBurns 20s ease-in-out infinite alternate',
        'breathe':    'breathe 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        kenBurns: {
          '0%':   { transform: 'scale(1.0) translateX(0%)' },
          '100%': { transform: 'scale(1.12) translateX(-2%)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,130,255,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(79,130,255,0.6), 0 0 80px rgba(79,130,255,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
