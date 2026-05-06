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
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.07] bg-mckinsey-light">
              <th className="text-left font-body text-xs text-ink-faint px-5 py-3 font-400 uppercase tracking-wider">Mentor</th>
              <th className="text-left font-body text-xs text-ink-faint px-5 py-3 font-400 uppercase tracking-wider">Categories</th>
              <th className="text-left font-body text-xs text-ink-faint px-5 py-3 font-400 uppercase tracking-wider">Followers</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(l => (
              <tr key={l.id} className="border-b border-black/[0.05] hover:bg-mckinsey-light transition-colors">
                <td className="px-5 py-3">
                  <p className="font-body text-ink">{l.name}</p>
                  <p className="font-body text-xs text-ink-faint">{l.title} · {l.company}</p>
                </td>
                <td className="px-5 py-3 font-body text-xs text-ink-mid">
                  {[l.category, l.category2, l.category3].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="font-body text-ink-mid px-5 py-3">{tally[l.id] ?? 0}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/superadmin/mentors/${l.id}`}
                    className="px-3 py-1.5 text-xs font-body text-ink-faint border border-black/[0.1] rounded-lg hover:text-mckinsey-blue hover:border-mckinsey-blue/30 transition-colors"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center font-body text-sm text-ink-faint">None yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <p className="font-body text-sm text-ink-mid -mt-4 mb-2">
        Books, podcasts, and courses for learners come from the{' '}
        <Link href="/superadmin/library" className="text-mckinsey-blue hover:underline">Content Library</Link>
        . Mentor profiles here are metadata only (name, title, company, categories, bio, photo).
      </p>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-500 text-ink">Global mentors</h2>
            <p className="font-body text-xs text-ink-faint mt-0.5">No organization — visible to every user on /mentors</p>
          </div>
          <Link
            href="/superadmin/mentors/new"
            className="px-4 py-2 btn-brand text-white text-xs font-body rounded-xl transition-colors"
          >
            + Add global mentor
          </Link>
        </div>
        <LeaderTable items={globalLeaders} />
      </div>

      <div>
        <div className="mb-4">
          <h2 className="font-display text-xl font-500 text-ink">Organization mentors</h2>
          <p className="font-body text-xs text-ink-faint mt-0.5">Tied to an org — visible only to members of that org</p>
        </div>
        <LeaderTable items={orgLeaders} />
      </div>
    </div>
  )
}
