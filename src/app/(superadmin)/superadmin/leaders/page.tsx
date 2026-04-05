import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export default async function SuperAdminLeadersPage() {
  const admin = getSupabaseAdminClient()

  const [{ data: leaders }, { data: profiles }] = await Promise.all([
    admin.from('leader_profiles')
      .select('id, name, title, company, is_custom, org_id, catalog_books, catalog_podcasts, catalog_courses, created_at')
      .order('is_custom')
      .order('name'),
    admin.from('profiles').select('mentor_id').not('mentor_id', 'is', null),
  ])

  const tally: Record<string, number> = {}
  for (const p of profiles ?? []) tally[p.mentor_id] = (tally[p.mentor_id] ?? 0) + 1

  const globalLeaders = (leaders ?? []).filter(l => !l.is_custom)
  const localLeaders = (leaders ?? []).filter(l => l.is_custom)

  function LeaderTable({ items }: { items: typeof leaders }) {
    return (
      <div className="border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/2">
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Leader</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Catalog</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Followers</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map(l => (
              <tr key={l.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-body text-white/80">{l.name}</p>
                  <p className="font-body text-xs text-white/40">{l.title} · {l.company}</p>
                </td>
                <td className="px-5 py-3 font-body text-xs text-white/40">
                  {(l.catalog_books as any[])?.length ?? 0}B · {(l.catalog_podcasts as any[])?.length ?? 0}P · {(l.catalog_courses as any[])?.length ?? 0}C
                </td>
                <td className="font-body text-white/50 px-5 py-3">{tally[l.id] ?? 0}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/superadmin/leaders/${l.id}`}
                    className="px-3 py-1.5 text-xs font-body text-white/50 border border-white/10 rounded-lg hover:text-white/80 hover:border-white/20 transition-colors"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {(!items || items.length === 0) && (
              <tr><td colSpan={4} className="px-5 py-8 text-center font-body text-sm text-white/30">None yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Global leaders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-500 text-white">Global leaders</h2>
            <p className="font-body text-xs text-white/40 mt-0.5">Visible to all users on the platform</p>
          </div>
          <Link
            href="/superadmin/leaders/new"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-body rounded-xl transition-colors"
          >
            + Add global leader
          </Link>
        </div>
        <LeaderTable items={globalLeaders} />
      </div>

      {/* Local / org leaders */}
      <div>
        <div className="mb-4">
          <h2 className="font-display text-xl font-500 text-white">Organization leaders</h2>
          <p className="font-body text-xs text-white/40 mt-0.5">Created by org admins, visible only within their org</p>
        </div>
        <LeaderTable items={localLeaders} />
      </div>
    </div>
  )
}
