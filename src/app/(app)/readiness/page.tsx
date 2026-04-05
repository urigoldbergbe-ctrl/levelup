import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import ReadinessView from '@/features/readiness/components/ReadinessView'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { LEADERS } from '@/data/leaders'

export default async function ReadinessPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await getSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('mentor_id')
    .eq('id', user.id)
    .single()

  const { data: items } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('user_id', user.id)

  const mentor = LEADERS.find(l => l.id === profile?.mentor_id) ?? null
  const nextRole = mentor?.career_ladder[1] ?? null

  const total = items?.length ?? 0
  const done = items?.filter(i => i.completed).length ?? 0
  const readinessPct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Next step readiness
        </p>
        <h1 className="font-display text-display font-300 text-ink">
          Ready for promotion?
        </h1>
        {nextRole && (
          <p className="font-body text-sm text-ink-mid mt-2">
            Target role: <span className="text-ink font-500">{nextRole.title} at {nextRole.co}</span>
          </p>
        )}
      </div>
      <ReadinessView
        items={items ?? []}
        readinessPct={readinessPct}
        nextRole={nextRole}
        userId={user.id}
      />
    </PageShell>
  )
}
