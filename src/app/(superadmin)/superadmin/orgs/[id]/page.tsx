import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import UserInvitePanel from '@/features/superadmin/components/UserInvitePanel'

export default async function OrgDetailPage({ params }: { params: { id: string } }) {
  const admin = getSupabaseAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug, created_at')
    .eq('id', params.id)
    .single()

  if (!org) redirect('/superadmin/orgs')

  const [{ data: memberships }, { data: leaders }, { data: invites }] = await Promise.all([
    admin.from('org_memberships').select('user_id, role, joined_at').eq('org_id', params.id),
    admin.from('leader_profiles').select('id, name, title').eq('org_id', params.id),
    admin.from('pending_invites').select('email, name, role, invited_at, accepted_at').eq('org_id', params.id).order('invited_at', { ascending: false }),
  ])

  // Get auth users for the membership list
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const memberIds = new Set((memberships ?? []).map(m => m.user_id))
  const memberUsers = users.filter(u => memberIds.has(u.id))

  const roleMap = Object.fromEntries((memberships ?? []).map(m => [m.user_id, m.role]))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/superadmin/orgs" className="font-body text-xs text-white/30 hover:text-white/50 mb-2 block">
            ← Organizations
          </Link>
          <h1 className="font-display text-2xl font-500 text-white">{org.name}</h1>
          <p className="font-body text-sm text-white/40 mt-0.5">
            {memberUsers.length} members · {leaders?.length ?? 0} custom mentors
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Members', value: memberUsers.length },
          { label: 'Custom mentors', value: leaders?.length ?? 0 },
          { label: 'Pending invites', value: (invites ?? []).filter(i => !i.accepted_at).length },
        ].map(s => (
          <div key={s.label} className="border border-white/8 rounded-2xl bg-white/2 px-6 py-4">
            <p className="font-body text-xs text-white/40 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-display text-2xl font-500 text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Invite panel */}
      <UserInvitePanel orgId={params.id} orgName={org.name} isSuperAdmin />

      {/* Members table */}
      <div>
        <h2 className="font-display text-base font-500 text-white mb-4">Members</h2>
        <div className="border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/2">
                <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Email</th>
                <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody>
              {memberUsers.map(u => (
                <tr key={u.id} className="border-b border-white/4">
                  <td className="font-body text-white/70 px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-body ${
                      roleMap[u.id] === 'owner' ? 'bg-amber-500/15 text-amber-300' :
                      roleMap[u.id] === 'hr_admin' ? 'bg-violet-500/15 text-violet-300' :
                      'bg-white/5 text-white/30'
                    }`}>
                      {roleMap[u.id] ?? 'member'}
                    </span>
                  </td>
                </tr>
              ))}
              {memberUsers.length === 0 && (
                <tr><td colSpan={2} className="px-5 py-6 text-center font-body text-sm text-white/30">No members yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending invites */}
      {(invites ?? []).length > 0 && (
        <div>
          <h2 className="font-display text-base font-500 text-white mb-4">Pending invites</h2>
          <div className="border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Email</th>
                  <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Name</th>
                  <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Status</th>
                  <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Invited</th>
                </tr>
              </thead>
              <tbody>
                {(invites ?? []).map(inv => (
                  <tr key={inv.email} className="border-b border-white/4">
                    <td className="font-body text-white/70 px-5 py-3">{inv.email}</td>
                    <td className="font-body text-white/50 px-5 py-3">{inv.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-body ${
                        inv.accepted_at ? 'bg-green-500/15 text-green-300' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {inv.accepted_at ? 'Accepted' : 'Pending'}
                      </span>
                    </td>
                    <td className="font-body text-xs text-white/40 px-5 py-3">
                      {new Date(inv.invited_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
