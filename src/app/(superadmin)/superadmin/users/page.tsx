import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { isMissingTableError } from '@/lib/supabase/schema-errors'
import UserInvitePanel from '@/features/superadmin/components/UserInvitePanel'
import { assignUserCoachAction, recordCoachSessionAction } from '@/features/superadmin/coachActions'

export default async function UsersPage() {
  const admin = getSupabaseAdminClient()

  const [
    { data: { users } },
    { data: profiles },
    { data: orgs },
    { data: coaches, error: coachesError },
    { data: assignments, error: assignmentsError },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 500 }),
    admin.from('profiles').select('id, mentor_id, current_semester, is_admin, created_at'),
    admin.from('organizations').select('id, name').order('name'),
    admin.from('coaches').select('id, name').eq('active', true).order('name'),
    admin.from('user_coach_assignments').select('user_id, coach_id'),
  ])

  const coachingSchemaMissing =
    isMissingTableError(coachesError) || isMissingTableError(assignmentsError)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const assignMap = Object.fromEntries((assignments ?? []).map(a => [a.user_id, a.coach_id]))

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-500 text-ink mb-1">Users</h1>
          <p className="font-body text-sm text-ink-mid">{users.length} registered accounts</p>
        </div>
      </div>

      {coachingSchemaMissing && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 font-body text-sm text-amber-800">
          Coaching tables are missing. Apply migration{' '}
          <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">00012_coaching.sql</code> in Supabase, then
          refresh. Coach assignment and session logging are disabled until then.
        </div>
      )}

      <div className="mb-8">
        <UserInvitePanel
          orgs={(orgs ?? []).map(o => ({ id: o.id, name: o.name }))}
          isSuperAdmin
        />
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="border-b border-black/[0.07] bg-mckinsey-light">
              <th className="text-left font-body text-xs text-ink-faint px-4 py-3 font-400 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left font-body text-xs text-ink-faint px-4 py-3 font-400 uppercase tracking-wider">
                Mentor
              </th>
              <th className="text-left font-body text-xs text-ink-faint px-4 py-3 font-400 uppercase tracking-wider">
                Coach
              </th>
              <th className="text-left font-body text-xs text-ink-faint px-4 py-3 font-400 uppercase tracking-wider w-[280px]">
                Log session tasks
              </th>
              <th className="text-left font-body text-xs text-ink-faint px-4 py-3 font-400 uppercase tracking-wider">
                Semester
              </th>
              <th className="text-left font-body text-xs text-ink-faint px-4 py-3 font-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="text-left font-body text-xs text-ink-faint px-4 py-3 font-400 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const profile = profileMap[u.id]
              const currentCoachId = assignMap[u.id] ?? ''
              return (
                <tr key={u.id} className="border-b border-black/[0.05] hover:bg-mckinsey-light transition-colors align-top">
                  <td className="font-body text-ink-mid px-4 py-3">{u.email}</td>
                  <td className="font-body text-ink-faint px-4 py-3 capitalize">{profile?.mentor_id ?? '—'}</td>
                  <td className="px-4 py-3">
                    <form action={assignUserCoachAction.bind(null, u.id)} className="flex flex-col gap-2">
                      <select
                        name="coach_id"
                        defaultValue={currentCoachId}
                        className="bg-white border border-black/[0.1] rounded-lg px-2 py-1.5 text-xs text-ink max-w-[180px]"
                      >
                        <option value="">— None —</option>
                        {(coaches ?? []).map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-[10px] font-body px-2 py-1 rounded-md bg-mckinsey-blue/10 text-mckinsey-blue hover:bg-mckinsey-blue/20 w-fit"
                      >
                        Save assignment
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={recordCoachSessionAction.bind(null, u.id)} className="space-y-2">
                      <textarea
                        name="tasks"
                        rows={3}
                        placeholder="One task per line…"
                        className="w-full bg-white border border-black/[0.1] rounded-lg px-2 py-1.5 text-xs text-ink placeholder:text-ink-faint resize-y min-h-[72px]"
                      />
                      <input
                        type="text"
                        name="notes"
                        placeholder="Optional notes"
                        className="w-full bg-white border border-black/[0.1] rounded-lg px-2 py-1 text-xs text-ink placeholder:text-ink-faint"
                      />
                      <button
                        type="submit"
                        className="text-[10px] font-body px-2 py-1 rounded-md bg-mckinsey-blue/10 text-mckinsey-blue hover:bg-mckinsey-blue/20"
                      >
                        Save session
                      </button>
                    </form>
                  </td>
                  <td className="font-body text-ink-mid px-4 py-3">{profile?.current_semester ? `S${profile.current_semester}` : '—'}</td>
                  <td className="font-body text-ink-faint px-4 py-3 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {profile?.is_admin ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-mckinsey-blue/10 text-mckinsey-blue text-xs font-body">
                        Super Admin
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-black/[0.04] text-ink-faint text-xs font-body">
                        User
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="font-body text-xs text-ink-faint mt-4 max-w-2xl">
        Assigning a coach lets them see this member on Journey thumbnails and unlocks Calendly on the Coaching tab.
        &quot;Save session&quot; appends tasks from the latest coaching call (shown as the member&apos;s current coach
        tasks).
      </p>
    </div>
  )
}
