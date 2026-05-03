import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand — LevelUp pink-to-purple ──────────────────────
        brand: {
          pink:   '#E040FB',
          purple: '#7B2FFF',
        },
        // ── Surface (light mode) — replaces old cinema-* ────────
        cinema: {
          bg:     '#FFFFFF',
          card:   '#F5F5F7',
          hover:  '#EBEBF0',
          border: 'rgba(0,0,0,0.08)',
          glow:   'rgba(123,47,255,0.20)',
        },
        // ── Accent — Brand Purple ────────────────────────────────
        accent: {
          DEFAULT: '#7B2FFF',
          mid:     '#9B5FFF',
          soft:    'rgba(123,47,255,0.10)',
          glow:    'rgba(123,47,255,0.30)',
        },
        // ── Text / ink scale ────────────────────────────────────
        ink: {
          DEFAULT: '#0F0F0F',
          mid:     '#6E6E73',
          faint:   '#AEAEB2',
        },
        mist:    '#F5F5F7',
        white:   '#FFFFFF',
        emerald: { DEFAULT: '#10B981' },
        amber:   { DEFAULT: '#F59E0B' },
        violet:  { DEFAULT: '#8B5CF6' },
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
        sm:     '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        md:     '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        lg:     '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        accent: '0 0 24px rgba(123,47,255,0.35), 0 0 48px rgba(123,47,255,0.15)',
        card:   '0 2px 12px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
        glow:   '0 0 40px rgba(123,47,255,0.5)',
        poster: '0 8px 40px rgba(0,0,0,0.15)',
        brand:  '0 4px 24px rgba(224,64,251,0.25), 0 2px 8px rgba(123,47,255,0.20)',
      },
      borderRadius: {
        'sm':  '4px',
        DEFAULT: '6px',
        'md':  '8px',
        'lg':  '10px',
        'xl':  '12px',
        '2xl': '14px',
        '3xl': '18px',
        'full': '9999px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        // Brand gradient
        'gradient-brand':    'linear-gradient(135deg, #E040FB 0%, #7B2FFF 100%)',
        'gradient-brand-r':  'linear-gradient(135deg, #7B2FFF 0%, #E040FB 100%)',
        // Light surface gradients
        'gradient-hero':     'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(123,47,255,0.08) 0%, transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
        'gradient-card':     'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,247,0.6) 100%)',
        'gradient-cinema':   'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
        // Legacy / preserved
        'gradient-dark-up':  'linear-gradient(0deg, rgba(245,245,247,1) 0%, transparent 50%)',
        'gradient-poster':   'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
        'gradient-overlay':  'linear-gradient(135deg, #E040FB 0%, #7B2FFF 100%)',
        'gradient-indigo':   'linear-gradient(135deg, #7B2FFF 0%, #E040FB 100%)',
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
