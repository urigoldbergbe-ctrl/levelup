import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const user = await getUser()
  const profile = user ? await getUserProfile(user.id) : null

  const supabase = await getSupabaseServerClient()

  // Latest assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Progress rows
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user!.id)

  // Checklist completion
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

  return (
    <PageShell>
      <div className="mb-8">
        <p className="font-body text-sm text-ink-mid">
          Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
        </p>
        <h1 className="font-display text-display font-300 text-ink mt-1">
          Your career dashboard
        </h1>
      </div>

      {/* Setup checklist if not onboarded */}
      {(!hasMentor || !hasAssessment) && (
        <div className="mb-8 bg-accent/5 border border-accent/20 rounded-2xl p-6">
          <h2 className="font-body font-600 text-ink mb-4">Complete your setup</h2>
          <div className="space-y-3">
            <SetupItem done={hasMentor} href="/onboarding" label="Choose your leader" />
            <SetupItem done={hasAssessment} href="/assessment" label="Run your AI gap analysis" />
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Readiness score"
          value={`${readinessPct}%`}
          color={readinessPct >= 80 ? 'emerald' : readinessPct >= 50 ? 'amber' : 'indigo'}
          href="/readiness"
        />
        <StatCard
          label="Semesters completed"
          value={`${completedSemesters} / 7`}
          color="indigo"
          href="/journey"
        />
        <StatCard
          label="Current semester"
          value={`Semester ${profile?.current_semester ?? 1}`}
          color="violet"
          href="/journey"
        />
      </div>

      {/* Quick links */}
      {assessment && (
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
          <h2 className="font-body font-600 text-ink mb-2">Latest assessment</h2>
          <p className="font-body text-sm text-ink-mid mb-4">{assessment.headline}</p>
          <div className="flex flex-wrap gap-2">
            {(assessment.gaps as { skill: string; category: string }[])?.map(gap => (
              <span
                key={gap.skill}
                className="px-3 py-1 text-xs font-body rounded-full bg-accent/8 text-accent"
              >
                {gap.skill}
              </span>
            ))}
          </div>
          <Link href="/assessment" className="block mt-4 text-sm font-body text-accent hover:underline">
            View full analysis →
          </Link>
        </div>
      )}
    </PageShell>
  )
}

function SetupItem({ done, href, label }: { done: boolean; href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 group">
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 ${done ? 'bg-emerald border-emerald text-white' : 'border-accent'}`}>
        {done ? '✓' : ''}
      </span>
      <span className={`font-body text-sm ${done ? 'text-ink-mid line-through' : 'text-ink group-hover:text-accent transition-colors'}`}>
        {label}
      </span>
    </Link>
  )
}

function StatCard({ label, value, color, href }: { label: string; value: string; color: string; href: string }) {
  const colors: Record<string, string> = {
    indigo: 'text-accent',
    emerald: 'text-emerald',
    amber: 'text-amber',
    violet: 'text-violet',
  }
  return (
    <Link href={href} className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6 hover:shadow-md transition-shadow block">
      <p className="font-body text-xs text-ink-mid mb-2">{label}</p>
      <p className={`font-display text-4xl font-300 ${colors[color] ?? 'text-ink'}`}>{value}</p>
    </Link>
  )
}
