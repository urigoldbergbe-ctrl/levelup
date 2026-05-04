import Link from 'next/link'
import Image from 'next/image'
import TopNav from '@/components/layout/TopNav'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const STEPS = [
  {
    num: '01',
    title: 'Choose your mentor',
    body: "Pick a real executive whose career path you want to follow — or add your own company's role-model mentors.",
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
  { label: 'Career Map',  desc: 'Step-by-step role progression',  color: '#002F6C' },
  { label: 'Skill Gaps',  desc: 'AI-powered gap analysis',         color: '#2D7D9A' },
  { label: 'Curriculum',  desc: '7-semester learning journey',     color: '#10B981' },
  { label: 'Coaching',    desc: 'Milestone-tied accountability',   color: '#F59E0B' },
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
    <div className="min-h-screen bg-white text-ink overflow-x-hidden">
      <TopNav authenticated={signedIn} isAdmin={isAdmin} />

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="bg-white">
        {/* McKinsey top rule */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #002F6C 0%, #2D7D9A 100%)' }} />
        <div className="max-w-5xl mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-20 md:pb-28">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-mckinsey-blue/20 bg-mckinsey-light mb-8" style={{ borderRadius: '1px' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-mckinsey-blue" />
            <span className="text-[10px] font-body font-600 tracking-[0.20em] text-mckinsey-blue uppercase">
              The career development platform
            </span>
          </div>

          <h1 className="font-display italic text-ink leading-[1.0] mb-6" style={{ fontSize: 'clamp(44px, 7.5vw, 84px)', letterSpacing: '-0.01em' }}>
            Build your career<br />
            <span className="gradient-text not-italic">like a leader</span>
          </h1>

          <div className="section-rule mb-8 max-w-sm" />

          <p className="font-body text-lg text-ink-mid max-w-xl mb-12 leading-relaxed">
            Pick a real mentor whose path you want to follow. Get a personalised career map,
            a structured semester curriculum, and coaching tied to real milestones.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            {!signedIn && (
              <Link href="/login" className="px-8 py-3 text-white font-body font-600 text-sm btn-brand" style={{ borderRadius: '2px' }}>
                Sign in →
              </Link>
            )}
            {signedIn && !mentorId && (
              <Link href="/mentors" className="px-8 py-3 text-white font-body font-600 text-sm btn-brand" style={{ borderRadius: '2px' }}>
                Choose your mentor →
              </Link>
            )}
            {signedIn && mentorId && (
              <>
                <Link href="/home" className="px-8 py-3 text-white font-body font-600 text-sm btn-brand" style={{ borderRadius: '2px' }}>
                  Go to home →
                </Link>
                <Link href="/mentors" className="px-6 py-3 border border-mckinsey-blue/30 text-mckinsey-blue font-body font-500 text-sm hover:bg-mckinsey-light transition-colors" style={{ borderRadius: '2px' }}>
                  {mentorName ? `Following ${mentorName} · Change` : 'Change mentor'}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══ PILLAR TILES ════════════════════════════════════════ */}
      <section className="py-6 px-6 border-y border-black/[0.07] bg-mist">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {PILLARS.map(p => (
            <div key={p.label} className="bg-white p-5 text-center border border-black/[0.06]" style={{ borderRadius: '2px' }}>
              <div
                className="w-8 h-8 mx-auto mb-3 flex items-center justify-center text-sm font-bold"
                style={{ background: `${p.color}12`, color: p.color, borderRadius: '2px' }}
              >
                {p.label[0]}
              </div>
              <p className="font-body font-700 text-ink text-sm">{p.label}</p>
              <p className="font-body text-xs text-ink-mid mt-0.5 leading-snug">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '20+', label: 'Global mentors',      sub: 'to model your path after' },
            { value: '7',   label: 'Semester Curriculum', sub: 'structured learning plan' },
            { value: '60+', label: 'Curated Resources',   sub: 'books, podcasts & courses' },
            { value: '3D',  label: 'Skill Analysis',      sub: 'technical, comms, thinking' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="gradient-text font-body font-800 text-5xl leading-none mb-1">{s.value}</p>
              <p className="font-body text-sm font-600 text-ink mt-2">{s.label}</p>
              <p className="font-body text-xs text-ink-mid mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-mist">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-body font-600 tracking-[0.25em] text-mckinsey-blue uppercase mb-4">How it works</p>
            <h2 className="font-display italic text-ink" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)' }}>
              Four steps to your next role
            </h2>
            <div className="section-rule mt-4 max-w-xs" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {STEPS.map((item) => (
              <div key={item.num} className="bg-white p-8 border border-black/[0.06] hover:border-mckinsey-blue/20 hover:shadow-sm transition-all duration-200 relative" style={{ borderRadius: '2px' }}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-mckinsey-blue" />
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(0,47,108,0.08)', color: '#002F6C', borderRadius: '2px' }}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-body font-700 text-2xl leading-none block mb-1 gradient-text">{item.num}</span>
                    <h3 className="font-body font-700 text-ink text-base mb-2">{item.title}</h3>
                    <p className="font-body text-sm text-ink-mid leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ══════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-mckinsey-navy">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Image src="/logo.png" alt="LevelUp" width={64} height={64} style={{ borderRadius: '4px' }} />
          </div>
          <h2 className="font-display italic text-white mb-6" style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}>
            Ready to level up?
          </h2>
          <div className="h-px bg-white/10 mb-8 max-w-xs mx-auto" />
          {signedIn ? (
            <Link href={mentorId ? '/home' : '/mentors'} className="inline-block px-10 py-3 bg-white text-mckinsey-navy font-body font-700 text-sm hover:bg-mckinsey-light transition-colors" style={{ borderRadius: '2px' }}>
              {mentorId ? 'Go to home →' : 'Choose your mentor →'}
            </Link>
          ) : (
            <Link href="/login" className="inline-block px-10 py-3 bg-white text-mckinsey-navy font-body font-700 text-sm hover:bg-mckinsey-light transition-colors" style={{ borderRadius: '2px' }}>
              Sign in →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/[0.07] text-center bg-mist">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/logo.png" alt="LevelUp" width={20} height={20} style={{ borderRadius: '2px', opacity: 0.6 }} />
          <span className="font-body text-xs font-600 text-ink-mid">LevelUp</span>
        </div>
        <p className="font-body text-xs text-ink-faint">
          © {new Date().getFullYear()} LevelUp · All rights reserved.
        </p>
      </footer>
    </div>
  )
}
