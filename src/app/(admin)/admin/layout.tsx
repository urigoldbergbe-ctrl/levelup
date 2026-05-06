import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import AdminNav from '@/features/admin/components/AdminNav'

async function getAdminOrg(userId: string) {
  const admin = getSupabaseAdminClient()
  try {
    const { data } = await admin
      .from('org_memberships')
      .select('org_id, role, organizations(id, name, slug)')
      .eq('user_id', userId)
      .in('role', ['hr_admin', 'owner', 'manager'])
      .limit(1)
      .maybeSingle()
    return data
  } catch {
    return null
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const membership = await getAdminOrg(user.id)
  if (!membership) redirect('/home?msg=admin-required')

  const org = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations as { id: string; name: string; slug: string } | null

  return (
    <div className="min-h-screen bg-mist flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-black/[0.07] min-h-screen flex flex-col">
        <div className="px-6 py-5 border-b border-black/[0.07]">
          <Link href="/home" className="font-display text-xl font-500 text-ink block">
            LevelUp
          </Link>
          <p className="font-body text-xs text-ink-faint mt-0.5">Admin Console</p>
        </div>

        {org && (
          <div className="px-6 py-4 border-b border-black/[0.07]">
            <p className="font-body text-xs text-ink-faint uppercase tracking-wider mb-1">Organisation</p>
            <p className="font-body text-sm font-500 text-ink">{org.name}</p>
          </div>
        )}

        <AdminNav role={membership.role} />

        <div className="px-6 py-4 border-t border-black/[0.07]">
          <Link href="/home" className="font-body text-xs text-ink-faint hover:text-mckinsey-blue transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}

