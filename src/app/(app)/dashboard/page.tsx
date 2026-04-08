import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const user = await getUser()
  const profile = user ? await getUserProfile(user.id) : null

  const supabase = await getSupabaseServerClient()

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user!.id)

  const { count: totalItems } = await supabase
    .from('checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const { count: completedItems } = await supabase
    .from('checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('completed', true)

  const readinessPct = totalItems ? Math.round(((completedItems ?? 0) / totalItems) * 100) : 0
  const completedSemesters = progress?.filter(p => p.milestone_achieved).length ?? 0

  const hasAssessment = !!assessment
  const hasMentor = !!profile?.mentor_id
  const firstName = profile?.name?.split(' ')[0] ?? null

  return (
    <PageShell>
      {/* ── Cinematic welcome header ──────────────────────── */}
      <div className="relative mb-10 py-10 px-8 rounded-3xl overflow-hidden">
        {/* bg glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-cinema-card to-cinema-card rounded-3xl" />
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(79,130,255,0.8) 0%, transparent 70%)' }}
        />
        <div className="relative z-10">
          <p className="font-body text-sm text-white/40 mb-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display font-300 italic text-white leading-tight" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
            {firstName ? `Welcome back, ${firstName}` : 'Your career dashboard'}
          </h1>
          <p className="font-body text-sm text-white/40 mt-2">
            {hasAssessment
              ? 'Your AI analysis is ready — keep momentum.'
              : 'Complete your setup to unlock your personalised career map.'}
          </p>
        </div>
      </div>

      {/* ── Setup checklist ───────────────────────────────── */}
      {(!hasMentor || !hasAssessment) && (
        <div className="mb-8 rounded-2xl border border-accent/20 bg-accent/[0.06] p-6">
          <h2 className="font-body font-600 text-white mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Complete your setup
          </h2>
          <div className="space-y-4">
            <SetupItem done={hasMentor}    href="/onboarding"  label="Choose your leader" />
            <SetupItem done={hasAssessment} href="/assessment" label="Run your AI gap analysis" />
          </div>
        </div>
      )}

      {/* ── KPI cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Readiness"
          value={`${readinessPct}%`}
          sub="of milestones achieved"
          accent="#10B981"
          tone="emerald"
          href="/readiness"
        />
        <StatCard
          label="Semesters"
          value={`${completedSemesters} / 7`}
          sub="completed semesters"
          accent="#4F82FF"
          tone="accent"
          href="/journey"
        />
        <StatCard
          label="Current Semester"
          value={`Sem ${profile?.current_semester ?? 1}`}
          sub="where you are now"
          accent="#8B5CF6"
          tone="violet"
          href="/journey"
        />
      </div>

      {/* ── Quick navigation row ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { href: '/mentors',    label: 'Leaders',    icon: '◈', desc: 'Choose or change' },
          { href: '/assessment', label: 'Assessment', icon: '◎', desc: 'AI gap analysis' },
          { href: '/journey',    label: 'Journey',    icon: '◷', desc: 'Semester curriculum' },
          { href: '/coaching',   label: 'Coaching',   icon: '◇', desc: 'Coach & sessions' },
          { href: '/readiness',  label: 'Progress',   icon: '◉', desc: 'Promotion readiness' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="glass-card-hover rounded-2xl p-5 flex flex-col gap-2"
          >
            <span className="text-2xl text-white/40">{item.icon}</span>
            <p className="font-body font-600 text-white text-sm">{item.label}</p>
            <p className="font-body text-xs text-white/30">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── Latest assessment ─────────────────────────────── */}
      {assessment && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body font-600 text-white">Latest assessment</h2>
            <Link href="/assessment" className="text-xs font-body text-accent hover:text-accent-mid transition-colors">
              View full analysis →
            </Link>
          </div>
          {assessment.headline && (
            <p className="font-body text-sm text-white/50 mb-5 leading-relaxed border-l-2 border-accent/30 pl-4">
              {assessment.headline}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {(assessment.gaps as { skill: string; category: string }[])?.slice(0, 8).map(gap => (
              <span
                key={gap.skill}
                className="px-3 py-1 text-xs font-body rounded-full bg-accent/10 text-accent/80 border border-accent/15"
              >
                {gap.skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}

function SetupItem({ done, href, label }: { done: boolean; href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 group">
      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
        done
          ? 'bg-emerald border-emerald text-white'
          : 'border-accent/40 group-hover:border-accent'
      }`}>
        {done ? '✓' : ''}
      </span>
      <span className={`font-body text-sm transition-colors ${
        done ? 'text-white/30 line-through' : 'text-white/70 group-hover:text-white'
      }`}>
        {label}
      </span>
      {!done && (
        <span className="ml-auto text-xs text-accent/60 group-hover:text-accent transition-colors">
          Start →
        </span>
      )}
    </Link>
  )
}

const STAT_HOVER: Record<'emerald' | 'accent' | 'violet', string> = {
  emerald:
    'hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(16,185,129,0.35),0_12px_40px_rgba(0,0,0,0.45)]',
  accent:
    'hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(79,130,255,0.35),0_12px_40px_rgba(0,0,0,0.45)]',
  violet:
    'hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(139,92,246,0.35),0_12px_40px_rgba(0,0,0,0.45)]',
}

function StatCard({
  label, value, sub, accent, tone, href,
}: {
  label: string
  value: string
  sub: string
  accent: string
  tone: keyof typeof STAT_HOVER
  href: string
}) {
  return (
    <Link
      href={href}
      className={`glass-card rounded-2xl p-6 block transition-all duration-300 ease-spring ${STAT_HOVER[tone]}`}
    >
      <p className="font-body text-xs text-white/40 mb-3 tracking-wide uppercase">{label}</p>
      <p className="font-display text-4xl font-300 leading-none mb-2" style={{ color: accent }}>
        {value}
      </p>
      <p className="font-body text-xs text-white/30">{sub}</p>
    </Link>
  )
}
