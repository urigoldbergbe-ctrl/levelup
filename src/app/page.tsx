import Link from 'next/link'
import TopNav from '@/components/layout/TopNav'

const STATS = [
  { value: '40+', label: 'Real Leaders' },
  { value: '5-Year', label: 'Structured Journey' },
  { value: '7', label: 'Semester Curriculum' },
  { value: '3D', label: 'Skill Analysis' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose your leader',
    body: 'Pick a real leader whose career you want to follow. Bezos, Cagan, Sandberg — or add anyone from LinkedIn.',
  },
  {
    step: '02',
    title: 'Upload your profile',
    body: 'Drop your CV or LinkedIn PDF. Claude analyses the gap between where you are and where they started.',
  },
  {
    step: '03',
    title: 'Get your career map',
    body: 'See the exact role titles, qualifications, and milestones at their company — mapped to your 5-year plan.',
  },
  {
    step: '04',
    title: 'Follow the semester plan',
    body: "Books, podcasts, courses, and coaching — structured in 7 semesters. Starting with the leader's own book.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink pt-24 pb-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-ink to-ink" />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-6">
            The career operating system
          </p>
          <h1 className="font-display font-300 italic text-white leading-none mb-6"
            style={{ fontSize: 'clamp(48px, 8vw, 84px)' }}>
            Build your career<br />
            <span className="bg-gradient-to-r from-accent via-violet to-accent-mid bg-clip-text text-transparent">
              like a leader
            </span>
          </h1>
          <p className="font-body text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Pick a leader whose path you want to follow. Get a personalised 5-year career map,
            a structured semester curriculum, and coaching tied to real milestones.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-4 bg-accent text-white font-body font-500 text-sm rounded-xl shadow-accent hover:bg-accent-mid transition-colors"
            >
              Choose your leader →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 text-white font-body font-500 text-sm rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-ink/5">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-600 text-ink">{s.value}</p>
              <p className="font-body text-xs text-ink-mid mt-1 tracking-[0.06em]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-mist">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-4 text-center">
            How it works
          </p>
          <h2 className="font-display text-section font-300 text-ink text-center mb-16">
            Four steps to your next role
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-8 border border-ink/5 shadow-sm">
                <span className="font-display text-6xl font-300 text-accent/20 leading-none block mb-4">
                  {item.step}
                </span>
                <h3 className="font-body font-600 text-ink text-lg mb-2">{item.title}</h3>
                <p className="font-body text-sm text-ink-mid leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-ink text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-section font-300 italic text-white mb-6">
            Ready to level up?
          </h2>
          <p className="font-body text-sm text-white/50 mb-8">
            Free to start. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-accent text-white font-body font-500 text-sm rounded-xl shadow-accent hover:bg-accent-mid transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-ink/5 text-center">
        <p className="font-body text-xs text-ink-faint">
          © {new Date().getFullYear()} LevelUp. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
