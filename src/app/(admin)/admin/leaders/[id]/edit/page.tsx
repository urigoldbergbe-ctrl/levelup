import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import LeaderForm from '@/features/admin/components/LeaderForm'
import type { LeaderFormData, LeaderSkillScore } from '@/features/admin/actions'

async function getLeader(leaderId: string, userId: string) {
  const admin = getSupabaseAdminClient()

  const { data: membership } = await admin
    .from('org_memberships')
    .select('org_id')
    .eq('user_id', userId)
    .in('role', ['hr_admin', 'owner'])
    .limit(1)
    .maybeSingle()

  if (!membership) return null

  const { data } = await admin
    .from('leader_profiles')
    .select('*')
    .eq('id', leaderId)
    .eq('org_id', membership.org_id)
    .maybeSingle()

  return data
}

export default async function EditLeaderPage({ params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const leader = await getLeader(params.id, user.id)
  if (!leader) redirect('/admin/leaders')

  const defaultValues: Partial<LeaderFormData> = {
    name: leader.name ?? '',
    title: leader.title ?? '',
    company: leader.company ?? '',
    category: leader.category ?? 'Strategy',
    category2: (leader as { category2?: string | null }).category2 ?? '',
    category3: (leader as { category3?: string | null }).category3 ?? '',
    bio: (leader as { bio?: string | null }).bio ?? '',
    quote: leader.quote ?? '',
    photoUrl: leader.photo_url ?? '',
    spotifyUrl: leader.spotify_url ?? '',
    skills: (leader.skills as string[]) ?? [],
    skillScores: ((leader as any).leader_skill_scores as LeaderSkillScore[]) ?? [],
    books: (leader.book_recommendations as LeaderFormData['books']) ?? [],
    newsAlerts: (leader.news_alerts as string[]) ?? [],
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <a href="/admin/leaders" className="text-xs font-body text-ink-mid hover:text-ink transition-colors flex items-center gap-1.5 mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to leaders
        </a>
        <h1 className="font-display text-4xl font-300 text-ink">Edit leader</h1>
        <p className="font-body text-sm text-ink-mid mt-1">
          Update <span className="font-500 text-ink">{leader.name}</span>&apos;s profile.
          Changes will trigger a new curriculum generation.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-8">
        <LeaderForm leaderId={leader.id} defaultValues={defaultValues} />
      </div>
    </div>
  )
}
