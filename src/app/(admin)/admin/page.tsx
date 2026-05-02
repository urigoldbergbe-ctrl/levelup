import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

async function getAdminStats(userId: string) {
  const admin = getSupabaseAdminClient()
  try {
    const { data: membership } = await admin
      .from('org_memberships')
      .select('org_id, organizations(name)')
      .eq('user_id', userId)
      .in('role', ['hr_admin', 'owner'])
      .limit(1)
      .maybeSingle()

    if (!membership) return null

    const orgId = membership.org_id
    const org = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations

    const [
      { count: leaderCount },
      { count: memberCount },
      { count: assessmentCount },
      { data: recentAssessments },
    ] = await Promise.all([
      admin.from('leader_profiles').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
      admin.from('org_memberships').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
      admin.from('assessments').select('*', { count: 'exact', head: true }),
      admin.from('assessments')
        .select('id, headline, mentor_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return {
      orgId,
      orgName: (org as any)?.name ?? 'Your organisation',
      leaderCount: leaderCount ?? 0,
      memberCount: memberCount ?? 0,
      assessmentCount: assessmentCount ?? 0,
      recentAssessments: recentAssessments ?? [],
    }
  } catch {
    return null
  }
}

export default async function AdminDashboardPage() {
  const user = await getUser()
  const stats = user ? await getAdminStats(user.id) : null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-300 text-ink">
          {stats?.orgName ?? 'Admin dashboard'}
        </h1>
        <p className="font-body text-sm text-ink-mid mt-1">
          Manage your organisation&apos;s mentor profiles and team members.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Role-model mentors"
          value={stats?.leaderCount ?? 0}
          href="/admin/mentors"
          cta="Manage mentors"
          color="accent"
        />
        <StatCard
          label="Team members"
          value={stats?.memberCount ?? 0}
          href="/admin/members"
          cta="Manage members"
          color="violet"
        />
        <StatCard
          label="Assessments run"
          value={stats?.assessmentCount ?? 0}
          href="/admin/members"
          cta="View members"
          color="emerald"
        />
      </div>

      {/* Recent assessments */}
      {(stats?.recentAssessments.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6 mb-6">
          <h2 className="font-body font-600 text-ink mb-4">Recent assessments</h2>
          <ul className="space-y-2">
            {stats!.recentAssessments.map(a => (
              <li key={a.id} className="flex items-center justify-between py-1.5 border-b border-ink/5 last:border-0">
                <span className="font-body text-sm text-ink line-clamp-1 flex-1">{a.headline ?? '—'}</span>
                <span className="font-body text-xs text-ink-faint shrink-0 ml-4">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
        <h2 className="font-body font-600 text-ink mb-4">Quick actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <QuickAction
            href="/admin/mentors/new"
            title="Add a new mentor"
            description="Upload a senior executive profile as a role model for your team"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            }
          />
          <QuickAction
            href="/admin/members"
            title="Invite team members"
            description="Add HR managers or employees to your organisation"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            }
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, href, cta, color,
}: {
  label: string
  value: number
  href: string
  cta: string
  color: 'accent' | 'violet' | 'emerald'
}) {
  const colorMap = {
    accent: 'text-accent',
    violet: 'text-violet',
    emerald: 'text-emerald',
  }
  return (
    <Link href={href} className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6 hover:shadow-md transition-shadow block">
      <p className="font-body text-xs text-ink-mid mb-2">{label}</p>
      <p className={`font-display text-5xl font-300 ${colorMap[color]}`}>{value}</p>
      <p className="font-body text-xs text-accent mt-3">{cta} →</p>
    </Link>
  )
}

function QuickAction({
  href, title, description, icon,
}: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 rounded-xl border border-ink/8 hover:border-accent/30 hover:bg-accent/3 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <p className="font-body font-600 text-sm text-ink">{title}</p>
        <p className="font-body text-xs text-ink-mid mt-0.5">{description}</p>
      </div>
    </Link>
  )
}
