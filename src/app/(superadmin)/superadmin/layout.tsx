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
  if (!isAdmin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/6 flex flex-col">
        <div className="px-6 py-5 border-b border-white/6">
          <Link href="/dashboard" className="font-display text-xl font-500 text-white block">
            LevelUp
          </Link>
          <p className="font-body text-xs text-white/30 mt-0.5 tracking-wider uppercase">Platform Admin</p>
        </div>

        <SuperAdminNav />

        <div className="px-6 py-4 border-t border-white/6 mt-auto">
          <Link href="/dashboard" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-2">
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
