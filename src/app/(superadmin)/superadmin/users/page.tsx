import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import UserInvitePanel from '@/features/superadmin/components/UserInvitePanel'

export default async function UsersPage() {
  const admin = getSupabaseAdminClient()

  const [{ data: { users } }, { data: profiles }, { data: orgs }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 500 }),
    admin.from('profiles').select('id, mentor_id, current_semester, is_admin, created_at'),
    admin.from('organizations').select('id, name').order('name'),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-500 text-white mb-1">Users</h1>
          <p className="font-body text-sm text-white/40">{users.length} registered accounts</p>
        </div>
      </div>

      {/* Invite panel */}
      <div className="mb-8">
        <UserInvitePanel
          orgs={(orgs ?? []).map(o => ({ id: o.id, name: o.name }))}
          isSuperAdmin
        />
      </div>

      <div className="border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/2">
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Email</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Leader</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Semester</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Joined</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const profile = profileMap[u.id]
              return (
                <tr key={u.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="font-body text-white/70 px-5 py-3">{u.email}</td>
                  <td className="font-body text-white/50 px-5 py-3 capitalize">{profile?.mentor_id ?? '—'}</td>
                  <td className="font-body text-white/50 px-5 py-3">{profile?.current_semester ? `S${profile.current_semester}` : '—'}</td>
                  <td className="font-body text-white/40 px-5 py-3 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    {profile?.is_admin ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-body">
                        Super Admin
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-xs font-body">
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
    </div>
  )
}
