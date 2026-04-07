import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import OnboardingFlow from '@/features/onboarding/components/OnboardingFlow'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getGlobalLeadersCatalog, leaderFromProfileRow } from '@/lib/leaders/catalog'
import type { Leader } from '@/types'

async function getOrgLeadersForUser(userId: string): Promise<Leader[]> {
  const admin = getSupabaseAdminClient()
  try {
    const { data: membership } = await admin
      .from('org_memberships')
      .select('org_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    if (!membership) return []

    const { data: leaders } = await admin
      .from('leader_profiles')
      .select('*')
      .eq('org_id', membership.org_id)
      .eq('approved', true)
      .order('created_at', { ascending: false })

    return (leaders ?? []).map(l =>
      leaderFromProfileRow(l as Record<string, unknown>, { isOrgLeader: true }),
    )
  } catch {
    return []
  }
}

export default async function OnboardingPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(user.id)

  const supabase = await getSupabaseServerClient()
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (assessment) redirect('/assessment')

  const initialStep = profile?.mentor_id ? 2 : 1
  const [globalLeaders, orgLeaders] = await Promise.all([
    getGlobalLeadersCatalog(),
    getOrgLeadersForUser(user.id),
  ])

  return (
    <PageShell className="max-w-3xl">
      <div className="mb-10 text-center">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Getting started
        </p>
        <h1 className="font-display font-300 text-white" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
          Set up your journey
        </h1>
        <p className="font-body text-sm text-white/40 mt-2">
          Two steps. Five minutes. A personalised career map.
        </p>
      </div>
      <OnboardingFlow
        key={initialStep}
        initialStep={initialStep}
        mentorId={profile?.mentor_id ?? null}
        globalLeaders={globalLeaders}
        orgLeaders={orgLeaders}
      />
    </PageShell>
  )
}
