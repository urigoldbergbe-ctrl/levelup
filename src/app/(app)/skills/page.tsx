import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import SkillsView from '@/features/skills/components/SkillsView'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { LEADERS } from '@/data/leaders'

export default async function SkillsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await getSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('mentor_id')
    .eq('id', user.id)
    .single()

  const { data: scores } = await supabase
    .from('skill_scores')
    .select('*')
    .eq('user_id', user.id)

  const mentor = LEADERS.find(l => l.id === profile?.mentor_id) ?? null

  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Skill radar
        </p>
        <h1 className="font-display text-display font-300 text-ink">
          Your skill profile
        </h1>
        <p className="font-body text-sm text-ink-mid mt-2">
          Track Technical, Communication, and Thinking skills against your target.
        </p>
      </div>
      <SkillsView scores={scores ?? []} mentor={mentor} userId={user.id} />
    </PageShell>
  )
}
