import { redirect } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

async function checkIsAdmin(userId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
    return !!data?.is_admin
  } catch { return false }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const isAdmin = await checkIsAdmin(user.id)

  return (
    <div className="min-h-screen bg-mist">
      <TopNav authenticated isAdmin={isAdmin} />
      {children}
    </div>
  )
}
