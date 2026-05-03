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

  // Step 1 = pick mentor, Step 2 = why, Step 3 = profile upload
  // Resume at the right step if returning mid-flow
  const initialStep = !profile?.mentor_id
    ? 1
    : (profile as any)?.leader_choice_reason
    ? 3
    : 2
  const [globalLeaders, orgLeaders] = await Promise.all([
    getGlobalLeadersCatalog(),
    getOrgLeadersForUser(user.id),
  ])

  return (
    <PageShell className="max-w-4xl">
      <div className="mb-10 text-center">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Welcome to LevelUp
        </p>
        <h1 className="font-display font-300 text-white" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
          Let&apos;s build your career map
        </h1>
        <p className="font-body text-sm text-white/40 mt-2 max-w-md mx-auto">
          Three quick steps — then you&apos;ll have a personalised 7-semester learning journey, skill gap analysis, and coaching goals.
        </p>

        {/* Journey preview trail */}
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {[
            { icon: '◈', label: 'Pick role model' },
            { icon: '→', label: null },
            { icon: '💬', label: 'Your why' },
            { icon: '→', label: null },
            { icon: '📄', label: 'Upload profile' },
            { icon: '→', label: null },
            { icon: '◎', label: 'AI assessment' },
            { icon: '→', label: null },
            { icon: '◷', label: 'Your journey' },
          ].map((item, i) =>
            item.label ? (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-base">{item.icon}</span>
                <span className="text-[9px] font-body text-white/30 whitespace-nowrap">{item.label}</span>
              </div>
            ) : (
              <span key={i} className="text-white/15 text-xs mt-[-6px]">{item.icon}</span>
            )
          )}
        </div>
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
