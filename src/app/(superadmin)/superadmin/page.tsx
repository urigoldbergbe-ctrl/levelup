import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

async function getStats(orgFilter?: string) {
  const admin = getSupabaseAdminClient()

  const [
    { count: totalUsers },
    { count: totalAssessments },
    { data: leaderUsage },
    { data: recentAssessments },
    { data: orgs },
    { data: orgStats },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('assessments').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('mentor_id').not('mentor_id', 'is', null),
    admin.from('assessments')
      .select('id, headline, mentor_id, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    admin.from('organizations').select('id, name, slug').order('name'),
    admin.from('org_memberships').select('org_id'),
  ])

  const tally: Record<string, number> = {}
  for (const p of leaderUsage ?? []) {
    if (p.mentor_id) tally[p.mentor_id] = (tally[p.mentor_id] ?? 0) + 1
  }
  const leaderRanking = Object.entries(tally).sort((a, b) => b[1] - a[1])

  const orgMemberCount: Record<string, number> = {}
  for (const m of orgStats ?? []) {
    orgMemberCount[m.org_id] = (orgMemberCount[m.org_id] ?? 0) + 1
  }

  return {
    totalUsers: totalUsers ?? 0,
    totalAssessments: totalAssessments ?? 0,
    leaderRanking,
    recentAssessments: recentAssessments ?? [],
    orgs: (orgs ?? []).map(o => ({ ...o, members: orgMemberCount[o.id] ?? 0 })),
  }
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass-card px-6 py-5">
      <p className="font-body text-xs text-ink-faint tracking-wider uppercase mb-1">{label}</p>
      <p className="font-display text-3xl font-500 text-ink">{value}</p>
      {sub && <p className="font-body text-xs text-ink-mid mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function SuperAdminOverview() {
  const stats = await getStats()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-display text-2xl font-500 text-ink mb-1">Platform overview</h1>
      <p className="font-body text-sm text-ink-mid mb-8">All activity across LevelUp.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Assessments run" value={stats.totalAssessments} />
        <StatCard label="Organizations" value={stats.orgs.length} />
        <StatCard
          label="Top mentor"
          value={stats.leaderRanking[0]?.[0] ?? '—'}
          sub={stats.leaderRanking[0] ? `${stats.leaderRanking[0][1]} followers` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mentor popularity */}
        <div className="glass-card p-6">
          <h2 className="font-display text-base font-500 text-ink mb-4">Mentor popularity</h2>
          {stats.leaderRanking.length === 0 ? (
            <p className="font-body text-sm text-ink-faint">No mentor selections yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.leaderRanking.slice(0, 6).map(([id, count]) => (
                <li key={id} className="flex items-center justify-between">
                  <span className="font-body text-sm text-ink-mid capitalize">{id}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-black/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mckinsey-blue rounded-full"
                        style={{ width: `${(count / (stats.leaderRanking[0]?.[1] ?? 1)) * 100}%` }}
                      />
                    </div>
                    <span className="font-body text-xs text-ink-faint w-4 text-right">{count}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent assessments */}
        <div className="glass-card p-6">
          <h2 className="font-display text-base font-500 text-ink mb-4">Recent assessments</h2>
          {stats.recentAssessments.length === 0 ? (
            <p className="font-body text-sm text-ink-faint">No assessments yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentAssessments.map(a => (
                <li key={a.id} className="flex items-start justify-between gap-2">
                  <span className="font-body text-sm text-ink-mid line-clamp-1 flex-1">{a.headline ?? 'Assessment'}</span>
                  <span className="font-body text-xs text-ink-faint shrink-0">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Organizations */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-500 text-ink">Organizations</h2>
            <Link href="/superadmin/orgs/new" className="text-xs font-body text-mckinsey-blue hover:underline">+ New</Link>
          </div>
          {stats.orgs.length === 0 ? (
            <p className="font-body text-sm text-ink-faint">No organizations yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.orgs.map(org => (
                <li key={org.id}>
                  <Link
                    href={`/superadmin/orgs/${org.id}`}
                    className="flex items-center justify-between py-1.5 hover:opacity-80 transition-opacity"
                  >
                    <span className="font-body text-sm text-ink-mid">{org.name}</span>
                    <span className="font-body text-xs text-ink-faint">{org.members} members</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/superadmin/orgs"
            className="mt-3 block text-xs font-body text-ink-faint hover:text-mckinsey-blue transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>
    </div>
  )
}
