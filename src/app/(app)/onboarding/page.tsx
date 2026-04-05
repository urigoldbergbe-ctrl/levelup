import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import OnboardingFlow from '@/features/onboarding/components/OnboardingFlow'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Leader } from '@/types'

async function getOrgLeadersForUser(userId: string): Promise<Leader[]> {
  const admin = getSupabaseAdminClient()
  try {
    // Find user's org
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

    return (leaders ?? []).map(l => ({
      id: l.id,
      name: l.name,
      title: l.title ?? '',
      company: l.company ?? '',
      category: (l.category ?? 'Strategy') as Leader['category'],
      quote: l.quote ?? '',
      photo_url: l.photo_url ?? undefined,
      g1: l.g1 ?? '#1a1a2e',
      g2: l.g2 ?? '#16213e',
      own_book: l.own_book ?? { title: '', url: '', why: '' },
      skills: (l.skills as string[]) ?? [],
      career_ladder: (l.career_ladder as Leader['career_ladder']) ?? [],
      spotify_url: l.spotify_url ?? undefined,
      isOrgLeader: true,
    }))
  } catch {
    return []
  }
}

export default async function OnboardingPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(user.id)

  // Check if they already have an assessment — send them to results
  const supabase = await getSupabaseServerClient()
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (assessment) redirect('/assessment')

  const initialStep = profile?.mentor_id ? 2 : 1
  const orgLeaders = await getOrgLeadersForUser(user.id)

  return (
    <PageShell className="max-w-3xl">
      <div className="mb-10 text-center">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Getting started
        </p>
        <h1 className="font-display text-display font-300 text-ink">
          Set up your journey
        </h1>
        <p className="font-body text-sm text-ink-mid mt-2">
          Two steps. Five minutes. A personalised 5-year career map.
        </p>
      </div>
      <OnboardingFlow
        key={initialStep}
        initialStep={initialStep}
        mentorId={profile?.mentor_id ?? null}
        orgLeaders={orgLeaders}
      />
    </PageShell>
  )
}
