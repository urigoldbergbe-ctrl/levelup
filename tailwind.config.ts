import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── McKinsey brand palette ───────────────────────────────
        mckinsey: {
          navy:  '#051C2C',   // primary — almost-black navy
          blue:  '#002F6C',   // CTA / link accent
          hover: '#001A3E',   // button hover
          teal:  '#2D7D9A',   // secondary accent
          light: '#E8F4FD',   // very light tint
        },
        // ── Surfaces ────────────────────────────────────────────
        cinema: {
          bg:     '#FFFFFF',
          card:   '#F7F7F7',
          hover:  '#EFEFEF',
          border: 'rgba(0,0,0,0.08)',
          glow:   'rgba(0,47,108,0.15)',
        },
        // ── Accent maps to McKinsey blue ─────────────────────────
        accent: {
          DEFAULT: '#002F6C',
          mid:     '#0A4DA1',
          soft:    'rgba(0,47,108,0.08)',
          glow:    'rgba(0,47,108,0.20)',
        },
        // ── Text / ink scale (navy-based) ────────────────────────
        ink: {
          DEFAULT: '#051C2C',
          mid:     '#475569',
          faint:   '#94A3B8',
        },
        mist:    '#F7F7F7',
        white:   '#FFFFFF',
        emerald: { DEFAULT: '#10B981' },
        amber:   { DEFAULT: '#F59E0B' },
        violet:  { DEFAULT: '#6366F1' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      fontSize: {
        'hero':       ['84px', { lineHeight: '1.0',  letterSpacing: '-0.02em' }],
        'display':    ['52px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'section':    ['40px', { lineHeight: '1.1',  letterSpacing: '-0.01em' }],
        'subsection': ['28px', { lineHeight: '1.2' }],
      },
        boxShadow: {
        sm:     '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        md:     '0 4px 12px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05)',
        lg:     '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)',
        accent: '0 4px 16px rgba(0,47,108,0.25)',
        card:   '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        glow:   '0 0 32px rgba(0,47,108,0.30)',
        poster: '0 8px 32px rgba(0,0,0,0.14)',
        brand:  '0 4px 16px rgba(0,47,108,0.20)',
      },
      borderRadius: {
        'sm':  '2px',
        DEFAULT: '2px',
        'md':  '4px',
        'lg':  '6px',
        'xl':  '8px',
        '2xl': '10px',
        '3xl': '12px',
        'full': '9999px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
        backgroundImage: {
        // McKinsey navy accent — used for top-border rules
        'gradient-brand':    'linear-gradient(90deg, #002F6C 0%, #2D7D9A 100%)',
        'gradient-brand-r':  'linear-gradient(90deg, #2D7D9A 0%, #002F6C 100%)',
        // Surfaces
        'gradient-hero':     'linear-gradient(180deg, #FFFFFF 0%, #F7F7F7 100%)',
        'gradient-card':     'linear-gradient(180deg, #FFFFFF 0%, #F7F7F7 100%)',
        'gradient-cinema':   'linear-gradient(180deg, #FFFFFF 0%, #F7F7F7 100%)',
        // Preserved for poster overlays
        'gradient-dark-up':  'linear-gradient(0deg, rgba(247,247,247,1) 0%, transparent 50%)',
        'gradient-poster':   'linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
        'gradient-overlay':  'linear-gradient(135deg, #051C2C 0%, #002F6C 100%)',
        'gradient-indigo':   'linear-gradient(135deg, #002F6C 0%, #2D7D9A 100%)',
      },
      animation: {
        'ken-burns':    'kenBurns 20s ease-in-out infinite alternate',
        'breathe':      'breathe 6s ease-in-out infinite',
        'shimmer':      'shimmer 2s ease-in-out infinite',
        'fade-up':      'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'rise-slow':    'riseUp 28s linear infinite',
        'rise-medium':  'riseUp 20s linear infinite',
        'rise-fast':    'riseUp 14s linear infinite',
        'drift-up':     'driftUp 18s ease-in-out infinite',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(123,47,255,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(123,47,255,0.5), 0 0 80px rgba(224,64,251,0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        riseUp: {
          '0%':   { transform: 'translateY(110vh)', opacity: '0' },
          '5%':   { opacity: '1' },
          '95%':  { opacity: '1' },
          '100%': { transform: 'translateY(-10vh)', opacity: '0' },
        },
        driftUp: {
          '0%':   { backgroundPosition: '0% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
