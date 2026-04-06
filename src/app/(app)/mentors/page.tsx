import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import MentorGrid from '@/features/mentors/components/MentorGrid'
import { LEADERS } from '@/data/leaders'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
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

    return (leaders ?? []).map(l => ({
      id: l.id,
      name: l.name,
      title: l.title ?? '',
      company: l.company ?? '',
      category: (l.category ?? 'Strategy') as Leader['category'],
      category2: (l.category2 as Leader['category2']) ?? null,
      category3: (l.category3 as Leader['category3']) ?? null,
      quote: l.quote ?? '',
      bio: (l as any).bio ?? undefined,
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

export default async function MentorsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('mentor_id, mentor_id_2')
    .eq('id', user.id)
    .single()

  const orgLeaders = await getOrgLeadersForUser(user.id)

  const hasLeader = !!profile?.mentor_id

  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Leader catalog
        </p>
        <h1 className="font-display text-display font-300 text-ink">
          {hasLeader ? 'Your leaders' : 'Choose your leader'}
        </h1>
        <p className="font-body text-sm text-ink-mid mt-2 max-w-xl">
          {hasLeader
            ? 'You can follow up to two leaders. Your skill targets are blended from both, giving you a richer career map.'
            : 'Pick a leader whose career path you want to follow. Your gap analysis and journey will be personalised to match their trajectory.'}
        </p>
      </div>
      <MentorGrid
        leaders={LEADERS}
        orgLeaders={orgLeaders}
        currentMentorId={profile?.mentor_id ?? null}
        currentMentorId2={(profile as any)?.mentor_id_2 ?? null}
      />
    </PageShell>
  )
}
