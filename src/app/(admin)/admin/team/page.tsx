import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

type MemberRow = {
  userId: string
  email: string
  name: string | null
  mentorId: string | null
  mentorName: string | null
  hasAssessment: boolean
  currentSemester: number
  semesterPct: number
  managerId: string | null
}

async function getTeamData(userId: string, role: string, orgId: string): Promise<MemberRow[]> {
  const admin = getSupabaseAdminClient()

  // Get all org members
  const { data: members } = await admin
    .from('org_memberships')
    .select('user_id')
    .eq('org_id', orgId)
    .neq('role', 'hr_admin')
    .neq('role', 'owner')

  if (!members?.length) return []

  // Get manager assignments
  const { data: assignments } = await admin
    .from('manager_assignments')
    .select('manager_id, employee_id')
    .eq('org_id', orgId)

  const assignmentMap = Object.fromEntries(
    (assignments ?? []).map(a => [a.employee_id, a.manager_id])
  )

  // Filter to only this manager's employees if role is manager
  const relevantIds =
    role === 'manager'
      ? (assignments ?? []).filter(a => a.manager_id === userId).map(a => a.employee_id)
      : members.map(m => m.user_id)

  if (!relevantIds.length) return []

  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, name, mentor_id')
    .in('id', relevantIds)

  const { data: assessments } = await admin
    .from('assessments')
    .select('user_id')
    .in('user_id', relevantIds)

  const { data: progressRows } = await admin
    .from('progress')
    .select('user_id, semester, books_completed, course_completed, podcast_scheduled, coach_assignment_completed')
    .in('user_id', relevantIds)

  const assessedIds = new Set((assessments ?? []).map(a => a.user_id))
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  // Compute progress pct per user (current semester = max semester with any activity)
  function computePct(uid: string) {
    const rows = (progressRows ?? []).filter(r => r.user_id === uid)
    if (!rows.length) return { semester: 1, pct: 0 }
    const latest = rows.reduce((a, b) => (a.semester > b.semester ? a : b))
    const items = [
      ...(latest.books_completed as string[] ?? []),
      latest.course_completed ? 'course' : null,
      latest.podcast_scheduled ? 'podcast' : null,
      latest.coach_assignment_completed ? 'coach' : null,
    ].filter(Boolean)
    const pct = Math.min(100, Math.round((items.length / 6) * 100))
    return { semester: latest.semester, pct }
  }

  return relevantIds.map(uid => {
    const { semester, pct } = computePct(uid)
    const profile = profileMap[uid]
    return {
      userId: uid,
      email: userMap[uid]?.email ?? '—',
      name: profile?.name ?? null,
      mentorId: profile?.mentor_id ?? null,
      mentorName: null,
      hasAssessment: assessedIds.has(uid),
      currentSemester: semester,
      semesterPct: pct,
      managerId: assignmentMap[uid] ?? null,
    }
  })
}

async function getManagersInOrg(orgId: string) {
  const admin = getSupabaseAdminClient()
  const { data } = await admin
    .from('org_memberships')
    .select('user_id, role')
    .eq('org_id', orgId)
    .in('role', ['manager', 'hr_admin', 'owner'])

  if (!data?.length) return []
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const uMap = Object.fromEntries(users.map(u => [u.id, u]))
  return (data ?? []).map(m => ({ userId: m.user_id, email: uMap[m.user_id]?.email ?? '—', role: m.role }))
}

export default async function TeamPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  const { data: membership } = await admin
    .from('org_memberships')
    .select('org_id, role')
    .eq('user_id', user.id)
    .in('role', ['hr_admin', 'owner', 'manager'])
    .limit(1)
    .maybeSingle()

  if (!membership) redirect('/admin')

  const { org_id: orgId, role } = membership
  const [rows, managers] = await Promise.all([
    getTeamData(user.id, role, orgId),
    getManagersInOrg(orgId),
  ])

  const isAdmin = role === 'hr_admin' || role === 'owner'

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          {isAdmin ? 'All employees' : 'My team'}
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {isAdmin ? 'Monitor and assign managers to team members.' : 'Track your direct reports\' progress.'}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-white/40 text-sm">
          {isAdmin ? 'No members found. Invite members first.' : 'No employees assigned to you yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.userId} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-500 text-white truncate">{row.name ?? row.email}</p>
                {row.name && <p className="text-xs text-white/35 truncate">{row.email}</p>}
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-body ${row.hasAssessment ? 'bg-emerald/15 text-emerald' : 'bg-white/[0.06] text-white/30'}`}>
                  {row.hasAssessment ? 'Assessed' : 'No assessment'}
                </span>
                <span className="text-xs text-white/30">Sem {row.currentSemester}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${row.semesterPct}%` }} />
                  </div>
                  <span className="text-xs text-white/40">{row.semesterPct}%</span>
                </div>
              </div>

              <Link
                href={`/admin/team/${row.userId}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-all font-body"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
