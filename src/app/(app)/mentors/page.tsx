import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import MentorGrid from '@/features/mentors/components/MentorGrid'
import { getUser } from '@/lib/supabase/server'
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

export default async function MentorsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  const [globalLeaders, orgLeaders] = await Promise.all([
    getGlobalLeadersCatalog(),
    getOrgLeadersForUser(user.id),
  ])

  const { data: profile } = await admin
    .from('profiles')
    .select('mentor_id, mentor_id_2')
    .eq('id', user.id)
    .single()

  const hasLeader = !!profile?.mentor_id

  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Leader catalog
        </p>
        <h1 className="font-display font-300 text-white" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
          {hasLeader ? 'Your leaders' : 'Choose your leader'}
        </h1>
        <p className="font-body text-sm text-white/40 mt-2 max-w-xl">
          {hasLeader
            ? 'You can follow up to two leaders. Your skill targets are blended from both, giving you a richer career map.'
            : 'Pick a leader whose career path you want to follow. Your gap analysis and journey will be personalised to match their trajectory.'}
        </p>
      </div>
      <MentorGrid
        leaders={globalLeaders}
        orgLeaders={orgLeaders}
        currentMentorId={profile?.mentor_id ?? null}
        currentMentorId2={(profile as { mentor_id_2?: string | null })?.mentor_id_2 ?? null}
      />
    </PageShell>
  )
}
