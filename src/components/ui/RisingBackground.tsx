'use client'

/**
 * Subtle rising-particle background — brand-coloured dots floating upward.
 * Very low opacity, very slow, mathematically spread to feel alive not chaotic.
 * Uses CSS animations only — no canvas/WebGL, safe for all browsers.
 */

interface Particle {
  id: number
  left: string
  size: number
  delay: string
  duration: string
  color: string
  opacity: number
}

// Pre-computed particle data (static — avoids hydration mismatch)
const PARTICLES: Particle[] = [
  { id:  1, left:  '5%',  size: 4,  delay: '0s',    duration: '26s', color: '#7B2FFF', opacity: 0.18 },
  { id:  2, left: '12%',  size: 3,  delay: '4s',    duration: '22s', color: '#E040FB', opacity: 0.14 },
  { id:  3, left: '20%',  size: 5,  delay: '8s',    duration: '30s', color: '#7B2FFF', opacity: 0.12 },
  { id:  4, left: '28%',  size: 2,  delay: '2s',    duration: '18s', color: '#E040FB', opacity: 0.20 },
  { id:  5, left: '35%',  size: 4,  delay: '14s',   duration: '25s', color: '#7B2FFF', opacity: 0.15 },
  { id:  6, left: '42%',  size: 3,  delay: '6s',    duration: '20s', color: '#C264FF', opacity: 0.13 },
  { id:  7, left: '50%',  size: 5,  delay: '10s',   duration: '28s', color: '#E040FB', opacity: 0.10 },
  { id:  8, left: '58%',  size: 2,  delay: '0s',    duration: '16s', color: '#7B2FFF', opacity: 0.22 },
  { id:  9, left: '65%',  size: 4,  delay: '18s',   duration: '24s', color: '#E040FB', opacity: 0.14 },
  { id: 10, left: '72%',  size: 3,  delay: '7s',    duration: '21s', color: '#7B2FFF', opacity: 0.16 },
  { id: 11, left: '80%',  size: 5,  delay: '12s',   duration: '29s', color: '#C264FF', opacity: 0.11 },
  { id: 12, left: '88%',  size: 2,  delay: '3s',    duration: '17s', color: '#E040FB', opacity: 0.18 },
  { id: 13, left: '94%',  size: 4,  delay: '9s',    duration: '23s', color: '#7B2FFF', opacity: 0.13 },
  { id: 14, left: '16%',  size: 3,  delay: '20s',   duration: '27s', color: '#E040FB', opacity: 0.10 },
  { id: 15, left: '47%',  size: 2,  delay: '16s',   duration: '19s', color: '#7B2FFF', opacity: 0.20 },
  { id: 16, left: '75%',  size: 3,  delay: '5s',    duration: '24s', color: '#C264FF', opacity: 0.12 },
]

export default function RisingBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Very subtle gradient wash that drifts upward */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 110%, rgba(123,47,255,0.04) 0%, transparent 70%),' +
            'radial-gradient(ellipse 50% 30% at 80% 80%, rgba(224,64,251,0.03) 0%, transparent 60%)',
          animation: 'driftUp 22s ease-in-out infinite alternate',
        }}
      />

      {/* Rising particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            animationName: 'riseUp',
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  )
}
