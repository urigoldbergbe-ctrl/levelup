import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import UserInvitePanel from '@/features/superadmin/components/UserInvitePanel'
import MembersTable from '@/features/admin/components/MembersTable'
import OrgNameForm from '@/features/admin/components/OrgNameForm'

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

  // Manager assignments for this org (counts + checkboxes)
  const { data: assignments } = await admin
    .from('manager_assignments')
    .select('manager_id, employee_id')
    .eq('org_id', membership.org_id)

  const reportCountMap: Record<string, number> = {}
  for (const a of assignments ?? []) {
    reportCountMap[a.manager_id] = (reportCountMap[a.manager_id] ?? 0) + 1
  }

  const org = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations

  return {
    orgId: membership.org_id as string,
    orgName: (org as any)?.name ?? 'Your org',
    memberUsers,
    roleMap,
    reportCountMap,
    allAssignments: assignments ?? [],
  }
}

export default async function AdminMembersPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const info = await getOrgInfo(user.id)
  if (!info) redirect('/admin')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display italic text-3xl text-ink">Members</h1>
          <p className="font-body text-sm text-ink-mid mt-1">
            {info.memberUsers.length} people in <strong>{info.orgName}</strong>
          </p>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <OrgNameForm orgId={info.orgId} initialName={info.orgName} />
      </div>

      <div className="mb-6">
        <UserInvitePanel orgId={info.orgId} orgName={info.orgName} />
      </div>

      <MembersTable
        orgId={info.orgId}
        memberUsers={info.memberUsers.map(u => ({ id: u.id, email: u.email ?? '' }))}
        roleMap={info.roleMap}
        reportCountMap={info.reportCountMap}
        allAssignments={info.allAssignments}
      />
    </div>
  )
}
