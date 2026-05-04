import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import TopNav from '@/components/layout/TopNav'
import AppTour from '@/features/tour/components/AppTour'
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

async function needsOnboarding(userId: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdminClient()
    const { data } = await admin
      .from('profiles')
      .select('mentor_id')
      .eq('id', userId)
      .single()
    return !data?.mentor_id
  } catch { return false }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? ''

  const [isAdmin, shouldOnboard] = await Promise.all([
    checkIsAdmin(user.id),
    needsOnboarding(user.id),
  ])

  // Send new users straight to onboarding — but don't loop if already there
  if (shouldOnboard && !pathname.includes('/onboarding') && !pathname.includes('/mentors')) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <TopNav authenticated isAdmin={isAdmin} />
      {children}
      <AppTour />
    </div>
  )
}
