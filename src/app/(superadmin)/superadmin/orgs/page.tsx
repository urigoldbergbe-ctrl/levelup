import Link from 'next/link'
import { ConfirmSubmitButton } from '@/components/ui/ConfirmSubmitButton'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { deleteOrgAction } from '@/features/superadmin/actions'

export default async function OrgsPage() {
  const admin = getSupabaseAdminClient()

  const [{ data: orgs }, { data: memberships }] = await Promise.all([
    admin.from('organizations').select('id, name, slug, created_at').order('created_at', { ascending: false }),
    admin.from('org_memberships').select('org_id'),
  ])

  const memberCount: Record<string, number> = {}
  for (const m of memberships ?? []) {
    memberCount[m.org_id] = (memberCount[m.org_id] ?? 0) + 1
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-500 text-white mb-1">Organizations</h1>
          <p className="font-body text-sm text-white/40">{orgs?.length ?? 0} organizations on the platform</p>
        </div>
        <Link
          href="/superadmin/orgs/new"
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-body rounded-xl transition-colors"
        >
          + New organization
        </Link>
      </div>

      <div className="border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/2">
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Name</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Slug</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Members</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(orgs ?? []).map(org => (
              <tr key={org.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/superadmin/orgs/${org.id}`} className="font-body text-white/80 hover:text-white transition-colors">
                    {org.name}
                  </Link>
                </td>
                <td className="font-mono text-xs text-white/40 px-5 py-3">{org.slug}</td>
                <td className="font-body text-white/50 px-5 py-3">{memberCount[org.id] ?? 0}</td>
                <td className="font-body text-xs text-white/40 px-5 py-3">
                  {new Date(org.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/superadmin/orgs/${org.id}`}
                      className="px-3 py-1.5 text-xs font-body text-white/40 border border-white/10 rounded-lg hover:text-white/70 hover:border-white/20 transition-colors"
                    >
                      View
                    </Link>
                    <form action={deleteOrgAction.bind(null, org.id)}>
                      <ConfirmSubmitButton
                        confirmMessage={`Delete ${org.name}?`}
                        className="px-3 py-1.5 text-xs font-body text-red-400 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!orgs || orgs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center font-body text-sm text-white/30">
                  No organizations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
