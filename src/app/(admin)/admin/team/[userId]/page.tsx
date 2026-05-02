import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import EmployeeProgressEditor from '@/features/admin/components/EmployeeProgressEditor'

export default async function EmployeeDetailPage({ params }: { params: { userId: string } }) {
  const currentUser = await getUser()
  if (!currentUser) redirect('/login')

  const admin = getSupabaseAdminClient()

  // Verify the viewer has manager/admin access
  const { data: membership } = await admin
    .from('org_memberships')
    .select('org_id, role')
    .eq('user_id', currentUser.id)
    .in('role', ['hr_admin', 'owner', 'manager'])
    .limit(1)
    .maybeSingle()

  if (!membership) redirect('/admin')

  const targetUserId = params.userId

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
  const lastSession = sessionRes.data

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/team" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Team</Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {profile?.name ?? targetUser?.email ?? 'Employee'}
          </h1>
          {targetUser?.email && <p className="text-sm text-white/40">{targetUser.email}</p>}
        </div>
      </div>

      {/* Assessment summary */}
      {assessment ? (
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] space-y-3">
          <h2 className="text-sm font-body font-600 text-white/60 uppercase tracking-wide">Assessment</h2>
          <p className="text-white font-body">{assessment.headline}</p>
          {assessment.year_one_action && (
            <p className="text-sm text-white/50">Year-one focus: {assessment.year_one_action}</p>
          )}
          <p className="text-xs text-white/25">
            Completed {new Date(assessment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <p className="text-sm text-white/30">No assessment completed yet.</p>
        </div>
      )}

      {/* Progress editor */}
      <EmployeeProgressEditor
        targetUserId={targetUserId}
        progressRows={progressRows}
        lastSessionTasks={Array.isArray(lastSession?.tasks) ? (lastSession!.tasks as unknown[]).map(String) : []}
      />
    </div>
  )
}