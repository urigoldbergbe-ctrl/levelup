import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import EmployeeProgressEditor from '@/features/admin/components/EmployeeProgressEditor'

async function getManagerTeam(managerId: string) {
  const admin = getSupabaseAdminClient()

  // Get employees assigned to this manager
  const { data: assignments } = await admin
    .from('manager_assignments')
    .select('employee_id')
    .eq('manager_id', managerId)

  if (!assignments?.length) return []

  const employeeIds = assignments.map(a => a.employee_id)
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const employees = users.filter(u => employeeIds.includes(u.id))

  // Get assessment + progress for each employee
  const results = await Promise.all(employees.map(async emp => {
    const [{ data: assessment }, { data: progress }, { data: profile }] = await Promise.all([
      admin.from('assessments').select('headline, gaps, current_level, target_level')
        .eq('user_id', emp.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      admin.from('progress').select('*').eq('user_id', emp.id),
      admin.from('profiles').select('mentor_id, name').eq('id', emp.id).maybeSingle(),
    ])
    return { user: emp, assessment, progress: progress ?? [], profile }
  }))

  return results
}

export default async function TeamPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const team = await getManagerTeam(user.id)

  return (
    <div className="p-8">
      <div className="mb-8 pb-6 border-b border-black/[0.07]">
        <h1 className="font-display italic text-3xl text-ink">My Team</h1>
        <p className="font-body text-sm text-ink-mid mt-1">
          {team.length} direct report{team.length !== 1 ? 's' : ''} — view and edit their progress
        </p>
      </div>

      {team.length === 0 ? (
        <div className="glass-card p-10 text-center max-w-sm">
          <p className="font-body text-sm text-ink-mid mb-3">No direct reports assigned to you yet.</p>
          <p className="font-body text-xs text-ink-faint">Ask your HR admin to assign employees in the Members page.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {team.map(({ user: emp, assessment, progress, profile }) => (
            <div key={emp.id} className="glass-card overflow-hidden">
              {/* Employee header */}
              <div className="px-6 py-4 border-b border-black/[0.06] bg-mist/40 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-600 text-sm text-ink">{profile?.name ?? emp.email}</p>
                  <p className="font-body text-xs text-ink-faint">{emp.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {assessment ? (
                    <span className="text-xs font-body font-600 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Assessment done
                    </span>
                  ) : (
                    <span className="text-xs font-body px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                      No assessment
                    </span>
                  )}
                  <span className="text-xs font-body text-ink-faint">{progress.length} semester{progress.length !== 1 ? 's' : ''} active</span>
                </div>
              </div>

              {/* Assessment snapshot */}
              {assessment && (
                <div className="px-6 py-3 border-b border-black/[0.04] bg-white">
                  <p className="font-body text-xs text-ink-mid italic">&ldquo;{assessment.headline}&rdquo;</p>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-[10px] font-body text-ink-faint">Now: {assessment.current_level}</span>
                    <span className="text-ink-faint">→</span>
                    <span className="text-[10px] font-body text-ink-faint">Target: {assessment.target_level}</span>
                  </div>
                </div>
              )}

              {/* Editable progress */}
              <div className="px-6 py-5">
                <EmployeeProgressEditor employeeId={emp.id} progressRows={progress} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
