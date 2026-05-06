import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import SuperAdminNav from '@/features/superadmin/components/SuperAdminNav'

async function isSuperAdmin(userId: string) {
  const admin = getSupabaseAdminClient()
  try {
    const { data } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
    return !!data?.is_admin
  } catch { return false }
}

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const isAdmin = await isSuperAdmin(user.id)
  if (!isAdmin) redirect('/home')

  return (
    <div className="min-h-screen bg-mist flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-black/[0.07] flex flex-col">
        <div className="px-6 py-5 border-b border-black/[0.07]">
          <Link href="/home" className="font-display text-xl font-500 text-ink block">
            LevelUp
          </Link>
          <p className="font-body text-xs text-ink-faint mt-0.5 tracking-wider uppercase">Platform Admin</p>
        </div>

        <SuperAdminNav />

        <div className="px-6 py-4 border-t border-black/[0.07] mt-auto">
          <Link href="/home" className="font-body text-xs text-ink-faint hover:text-mckinsey-blue transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to app
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
