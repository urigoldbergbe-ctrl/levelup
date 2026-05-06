import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import EmployeeProgressEditor from '@/features/admin/components/EmployeeProgressEditor'

export default async function EmployeeDetailPage({ params }: { params: { userId: string } }) {
  const currentUser = await getUser()
  if (!currentUser) redirect('/login')

  const admin = getSupabaseAdminClient()
  const targetUserId = params.userId

  const { data: targetMembership } = await admin
    .from('org_memberships')
    .select('org_id')
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (!targetMembership?.org_id) redirect('/admin/team')

  const { data: actorMembership } = await admin
    .from('org_memberships')
    .select('role')
    .eq('user_id', currentUser.id)
    .eq('org_id', targetMembership.org_id)
    .in('role', ['hr_admin', 'owner', 'manager'])
    .maybeSingle()

  if (!actorMembership) redirect('/admin/team')

  if (actorMembership.role === 'manager') {
    const { data: link } = await admin
      .from('manager_assignments')
      .select('id')
      .eq('org_id', targetMembership.org_id)
      .eq('manager_id', currentUser.id)
      .eq('employee_id', targetUserId)
      .maybeSingle()
    if (!link) redirect('/admin/team')
  }

  // Load employee data
  const [profileRes, assessmentRes, progressRes, sessionRes] = await Promise.all([
    admin.from('profiles').select('name, mentor_id').eq('id', targetUserId).single(),
    admin.from('assessments')
      .select('headline, year_one_action, gaps, strengths, created_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('progress')
      .select('*')
      .eq('user_id', targetUserId)
      .order('semester', { ascending: true }),
    admin.from('coach_sessions')
      .select('tasks, session_at, notes')
      .eq('user_id', targetUserId)
      .order('session_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const targetUser = users.find(u => u.id === targetUserId)

  const profile = profileRes.data
  const assessment = assessmentRes.data
  const progressRows = progressRes.data ?? []
  void sessionRes // unused but kept for API completeness

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/team" className="text-ink-faint hover:text-ink text-sm transition-colors">← Team</Link>
        <div>
          <h1 className="font-display italic text-2xl text-ink">
            {profile?.name ?? targetUser?.email ?? 'Employee'}
          </h1>
          {targetUser?.email && <p className="font-body text-sm text-ink-faint">{targetUser.email}</p>}
        </div>
      </div>

      {/* Assessment summary */}
      {assessment ? (
        <div className="glass-card p-5 space-y-3">
          <h2 className="text-xs font-body font-600 text-ink-mid uppercase tracking-wide">Assessment</h2>
          <p className="text-ink font-body">{assessment.headline}</p>
          {assessment.year_one_action && (
            <p className="text-sm text-ink-mid">Year-one focus: {assessment.year_one_action}</p>
          )}
          <p className="text-xs text-ink-faint">
            Completed {new Date(assessment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div className="glass-card p-5">
          <p className="text-sm text-ink-faint">No assessment completed yet.</p>
        </div>
      )}

      {/* Progress editor */}
      <EmployeeProgressEditor
        employeeId={params.userId}
        progressRows={progressRows}
      />
    </div>
  )
}