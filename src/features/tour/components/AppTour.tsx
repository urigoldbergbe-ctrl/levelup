'use client'

import { useState, useEffect } from 'react'

interface TourStep {
  title: string
  body: string
  href: string
  position: 'bottom-left' | 'bottom-center' | 'bottom-right'
  navLabel: string
}

const TOUR_STEPS: TourStep[] = [
  {
    navLabel: 'Home',
    href: '/home',
    title: '🏠 Home — your launchpad',
    body: 'Every time you log in, start here. You\'ll see articles curated to your chosen leader and quick links to continue your journey.',
    position: 'bottom-left',
  },
  {
    navLabel: 'Journey',
    href: '/journey',
    title: '◷ Journey — your learning map',
    body: 'Your personalised 7-semester curriculum. Books, podcasts, and courses tailored to close the gap between you and your role model. Check off items as you complete them.',
    position: 'bottom-center',
  },
  {
    navLabel: 'Assessment',
    href: '/assessment',
    title: '◎ Assessment — your gap analysis',
    body: 'See your AI-generated skill gap report based on your CV. Re-run it any time you update your profile to track growth.',
    position: 'bottom-center',
  },
  {
    navLabel: 'Coaching',
    href: '/coaching',
    title: '◇ Coaching — your coach & goals',
    body: 'Book sessions with your assigned coach, review your goals, and see the tasks from your last session. Your accountability partner lives here.',
    position: 'bottom-center',
  },
  {
    navLabel: 'Progress',
    href: '/readiness',
    title: '◉ Progress — are you ready?',
    body: 'Track your readiness for your next role. See which milestones you\'ve hit and what\'s left to do before your promotion.',
    position: 'bottom-right',
  },
]

const STORAGE_KEY = 'levelup_tour_done'

export default function AppTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      // Small delay so the page loads first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function next() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = TOUR_STEPS[step]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={finish}
      />

      {/* Tour card */}
      <div
        className={`fixed z-[9999] bottom-20 md:bottom-6 w-[min(360px,calc(100vw-32px))] transition-all duration-300 ${
          current.position === 'bottom-left' ? 'left-4 md:left-16'
          : current.position === 'bottom-right' ? 'right-4 md:right-16'
          : 'left-1/2 -translate-x-1/2'
        }`}
      >
        {/* Pointer upward toward nav */}
        <div className={`absolute -top-2 w-4 h-4 bg-white rotate-45 rounded-sm ${
          current.position === 'bottom-left' ? 'left-8'
          : current.position === 'bottom-right' ? 'right-8'
          : 'left-1/2 -translate-x-1/2'
        }`} />

        <div className="relative bg-white rounded-2xl p-5 shadow-2xl">
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-5 bg-accent' : i < step ? 'w-1.5 bg-accent/30' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <h3 className="text-sm font-body font-700 text-gray-900 mb-1.5">{current.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{current.body}</p>

          <div className="flex items-center justify-between mt-5">
            <button
              onClick={finish}
              className="text-xs text-gray-300 hover:text-gray-500 transition-colors font-body"
            >
              Skip tour
            </button>
            <button
              onClick={next}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-body font-600 hover:bg-accent/90 transition-all"
            >
              {step < TOUR_STEPS.length - 1 ? 'Next →' : 'Let\'s go →'}
            </button>
          </div>
        </div>
      </div>

      {/* Highlight ring on the active nav item */}
      <style>{`
        [data-tour-nav="${current.navLabel}"] {
          position: relative;
          z-index: 9999;
          border-radius: 8px;
          box-shadow: 0 0 0 3px rgba(79, 130, 255, 0.6), 0 0 20px rgba(79, 130, 255, 0.3);
          background: rgba(79, 130, 255, 0.1) !important;
        }
      `}</style>
    </>
  )
}
