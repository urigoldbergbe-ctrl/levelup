import Link from 'next/link'
import TopNav from '@/components/layout/TopNav'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const STEPS = [
  {
    num: '01',
    title: 'Choose your mentor',
    body: 'Pick a real executive whose career path you want to follow — or add your own company\'s role-model mentors.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Upload your profile',
    body: 'Drop your CV. Our AI measures the gap between where you are and where your chosen mentor is.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Get your career map',
    body: 'See the exact role titles, skills, and milestones you need — mapped step by step to your goal.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Follow the plan',
    body: 'Books, podcasts, courses, and coaching — structured into 7 clear semesters aligned to your gaps.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
]

const PILLARS = [
  { label: 'Career Map', desc: 'Step-by-step role progression', color: '#4F82FF', hoverGlow: 'hover:shadow-[0_0_32px_rgba(79,130,255,0.35)]' },
  { label: 'Skill Gaps', desc: 'AI-powered gap analysis', color: '#8B5CF6', hoverGlow: 'hover:shadow-[0_0_32px_rgba(139,92,246,0.35)]' },
  { label: 'Curriculum', desc: '7-semester learning journey', color: '#10B981', hoverGlow: 'hover:shadow-[0_0_32px_rgba(16,185,129,0.35)]' },
  { label: 'Coaching', desc: 'Milestone-tied accountability', color: '#F59E0B', hoverGlow: 'hover:shadow-[0_0_32px_rgba(245,158,11,0.35)]' },
]

export default async function HomePage() {
  const user = await getUser()

  let mentorId: string | null = null
  let mentorName: string | null = null
  let isAdmin = false

  if (user) {
    const admin = getSupabaseAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('mentor_id, is_admin')
      .eq('id', user.id)
      .single()

    mentorId = profile?.mentor_id ?? null
    isAdmin = profile?.is_admin ?? false

    if (mentorId) {
      const { data: lp } = await admin
        .from('leader_profiles')
        .select('name')
        .eq('id', mentorId)
        .maybeSingle()
      mentorName = lp?.name ?? null
    }
  }

  const signedIn = !!user

  return (
    <div className="min-h-screen bg-cinema-bg text-white overflow-x-hidden">
      <TopNav authenticated={signedIn} isAdmin={isAdmin} />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Animated background */}
        <div className="absolute inset-0">
          {/* Deep gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060B14] via-cinema-bg to-cinema-bg" />

          {/* Atmospheric glow orbs */}
          <div
            className="absolute top-[-20%] left-[15%] w-[600px] h-[600px] rounded-full opacity-20 animate-breathe"
            style={{ background: 'radial-gradient(circle, rgba(79,130,255,0.6) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full opacity-15 animate-breathe"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.7) 0%, transparent 70%)', animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-[-10%] left-[40%] w-[500px] h-[500px] rounded-full opacity-10 animate-breathe"
            style={{ background: 'radial-gradient(circle, rgba(79,130,255,0.5) 0%, transparent 70%)', animationDelay: '4s' }}
          />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/25 bg-accent/8 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-body font-500 tracking-[0.18em] text-accent uppercase">
              The career operating system
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-300 italic text-white leading-[0.95] mb-8" style={{ fontSize: 'clamp(52px, 8.5vw, 96px)' }}>
            Build your career<br />
            <span className="gradient-text not-italic">
              like a mentor
            </span>
          </h1>

          {/* Sub */}
          <p className="font-body text-lg text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Pick a real mentor whose path you want to follow. Get a personalised career map,
            a structured semester curriculum, and coaching tied to real milestones.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {!signedIn && (
              <Link
                href="/login"
                className="group relative px-8 py-4 bg-accent text-white font-body font-600 text-sm rounded-xl transition-all duration-300 hover:shadow-accent hover:scale-105"
              >
                <span className="relative z-10">Sign in →</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent via-accent-mid to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            )}

            {signedIn && !mentorId && (
              <Link
                href="/mentors"
                className="group relative px-8 py-4 bg-accent text-white font-body font-600 text-sm rounded-xl transition-all duration-300 hover:shadow-accent hover:scale-105"
              >
                Choose your mentor →
              </Link>
            )}

            {signedIn && mentorId && (
              <>
                <Link
                  href="/home"
                  className="px-8 py-4 bg-accent text-white font-body font-600 text-sm rounded-xl hover:shadow-accent hover:scale-105 transition-all duration-300"
                >
                  Go to home →
                </Link>
                <Link
                  href="/mentors"
                  className="px-8 py-4 bg-white/[0.06] text-white/80 font-body font-500 text-sm rounded-xl border border-white/10 hover:bg-white/[0.10] hover:border-white/20 transition-all duration-300"
                >
                  {mentorName ? `Following ${mentorName} · Change` : 'Change mentor'}
                </Link>
              </>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="mt-20 flex flex-col items-center gap-2 opacity-30 animate-float">
            <span className="text-xs font-body text-white/50 tracking-widest uppercase">Explore</span>
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══ PILLAR TILES ════════════════════════════════════= */}
      <section className="py-6 px-6 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {PILLARS.map(p => (
            <div
              key={p.label}
              className={`glass-card rounded-2xl p-5 text-center cursor-default transition-shadow duration-300 ${p.hoverGlow}`}
            >
              <div
                className="w-8 h-8 rounded-lg mx-auto mb-3 flex items-center justify-center text-sm font-bold"
                style={{ background: `${p.color}22`, color: p.color }}
              >
                {p.label[0]}
              </div>
              <p className="font-body font-600 text-white text-sm">{p.label}</p>
              <p className="font-body text-xs text-white/40 mt-0.5 leading-snug">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '20+',  label: 'Global mentors',     sub: 'to model your path after' },
            { value: '7',    label: 'Semester Curriculum', sub: 'structured learning plan' },
            { value: '60+',  label: 'Curated Resources',  sub: 'books, podcasts & courses' },
            { value: '3D',   label: 'Skill Analysis',     sub: 'technical, comms, thinking' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="gradient-text font-display text-5xl font-300 leading-none mb-1">{s.value}</p>
              <p className="font-body text-sm font-500 text-white/70 mt-2">{s.label}</p>
              <p className="font-body text-xs text-white/30 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* bg accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(79,130,255,0.03)] to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-4">
              How it works
            </p>
            <h2 className="font-display font-300 text-white" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
              Four steps to your next role
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {STEPS.map((item, i) => (
              <div
                key={item.num}
                className="glass-card-hover rounded-2xl p-8"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-display text-3xl font-300 text-white/10 leading-none block mb-1">
                      {item.num}
                    </span>
                    <h3 className="font-body font-600 text-white text-base mb-2">{item.title}</h3>
                    <p className="font-body text-sm text-white/45 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ══════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Cinematic glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-cinema-bg to-cinema-bg" />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(79,130,255,0.8) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display font-300 italic text-white mb-6" style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}>
            Ready to level up?
          </h2>
          {signedIn ? (
            <Link
              href={mentorId ? '/home' : '/mentors'}
              className="inline-block px-10 py-4 bg-accent text-white font-body font-600 text-sm rounded-xl hover:shadow-accent hover:scale-105 transition-all duration-300"
            >
              {mentorId ? 'Go to home →' : 'Choose your mentor →'}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block px-10 py-4 bg-accent text-white font-body font-600 text-sm rounded-xl hover:shadow-accent hover:scale-105 transition-all duration-300"
            >
              Sign in →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.05] text-center">
        <p className="font-body text-xs text-white/20">
          © {new Date().getFullYear()} LevelUp · All rights reserved.
        </p>
      </footer>
    </div>
  )
}
