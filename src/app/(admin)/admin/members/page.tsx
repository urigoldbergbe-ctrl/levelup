import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import UserInvitePanel from '@/features/superadmin/components/UserInvitePanel'

async function getOrgInfo(userId: string) {
  const admin = getSupabaseAdminClient()
  const { data: membership } = await admin
    .from('org_memberships')
    .select('org_id, organizations(id, name)')
    .eq('user_id', userId)
    .in('role', ['hr_admin', 'owner'])
    .limit(1)
    .maybeSingle()

  if (!membership) return null

  const { data: members } = await admin
    .from('org_memberships')
    .select('id, role, joined_at, user_id')
    .eq('org_id', membership.org_id)
    .order('joined_at', { ascending: false })

  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const memberIds = new Set((members ?? []).map(m => m.user_id))
  const memberUsers = users.filter(u => memberIds.has(u.id))
  const roleMap = Object.fromEntries((members ?? []).map(m => [m.user_id, m.role]))

  const org = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations

  return {
    orgId: membership.org_id as string,
    orgName: (org as any)?.name ?? 'Your org',
    memberUsers,
    roleMap,
  }
}

export default async function AdminMembersPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const info = await getOrgInfo(user.id)
  if (!info) redirect('/admin')

  const { orgId, orgName, memberUsers, roleMap } = info

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-300 text-ink">Members</h1>
          <p className="font-body text-sm text-ink-mid mt-1">
            {memberUsers.length} people in <strong>{orgName}</strong>
          </p>
        </div>
      </div>

      <div className="mb-6">
        <UserInvitePanel orgId={orgId} orgName={orgName} />
      </div>

      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm overflow-hidden">
        {memberUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-body text-sm text-ink-mid">No members yet. Use the invite tool above to add people.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/5 bg-mist/50">
                <th className="px-6 py-4 text-left text-xs font-body font-500 text-ink-mid uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-body font-500 text-ink-mid uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody>
              {memberUsers.map(u => (
                <tr key={u.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-6 py-4 font-body text-sm text-ink">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-body rounded-full ${
                      roleMap[u.id] === 'owner' ? 'bg-accent/8 text-accent' :
                      roleMap[u.id] === 'hr_admin' ? 'bg-violet/10 text-violet' :
                      'bg-mist text-ink-mid'
                    }`}>
                      {roleMap[u.id] ?? 'member'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
