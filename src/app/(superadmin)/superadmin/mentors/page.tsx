import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export default async function SuperAdminLeadersPage() {
  const admin = getSupabaseAdminClient()

  const [{ data: leaders }, { data: profiles }] = await Promise.all([
    admin.from('leader_profiles')
      .select('id, name, title, company, category, category2, category3, org_id, is_custom, created_at')
      .order('name'),
    admin.from('profiles').select('mentor_id').not('mentor_id', 'is', null),
  ])

  const tally: Record<string, number> = {}
  for (const p of profiles ?? []) tally[p.mentor_id] = (tally[p.mentor_id] ?? 0) + 1

  const rows = leaders ?? []
  const globalLeaders = rows.filter(l => l.org_id == null)
  const orgLeaders = rows.filter(l => l.org_id != null)

  function LeaderTable({ items }: { items: typeof rows }) {
    return (
      <div className="border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/2">
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Mentor</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Categories</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Followers</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(l => (
              <tr key={l.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-body text-white/80">{l.name}</p>
                  <p className="font-body text-xs text-white/40">{l.title} · {l.company}</p>
                </td>
                <td className="px-5 py-3 font-body text-xs text-white/50">
                  {[l.category, l.category2, l.category3].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="font-body text-white/50 px-5 py-3">{tally[l.id] ?? 0}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/superadmin/mentors/${l.id}`}
                    className="px-3 py-1.5 text-xs font-body text-white/50 border border-white/10 rounded-lg hover:text-white/80 hover:border-white/20 transition-colors"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center font-body text-sm text-white/30">None yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <p className="font-body text-sm text-white/40 -mt-4 mb-2">
        Books, podcasts, and courses for learners come from the{' '}
        <Link href="/superadmin/library" className="text-accent hover:underline">Content Library</Link>
        . Mentor profiles here are metadata only (name, title, company, categories, bio, photo).
      </p>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-500 text-white">Global mentors</h2>
            <p className="font-body text-xs text-white/40 mt-0.5">No organization — visible to every user on /mentors</p>
          </div>
          <Link
            href="/superadmin/mentors/new"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-body rounded-xl transition-colors"
          >
            + Add global mentor
          </Link>
        </div>
        <LeaderTable items={globalLeaders} />
      </div>

      <div>
        <div className="mb-4">
          <h2 className="font-display text-xl font-500 text-white">Organization mentors</h2>
          <p className="font-body text-xs text-white/40 mt-0.5">Tied to an org — visible only to members of that org</p>
        </div>
        <LeaderTable items={orgLeaders} />
      </div>
    </div>
  )
}
