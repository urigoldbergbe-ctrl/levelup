import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import AssessmentReport from '@/features/assessment/components/AssessmentReport'
import ProfileUploader from '@/features/assessment/components/ProfileUploader'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { LEADERS } from '@/data/leaders'

export default async function AssessmentPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await getSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('mentor_id')
    .eq('id', user.id)
    .single()

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const mentor = LEADERS.find(l => l.id === profile?.mentor_id)

  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          AI Gap Analysis
        </p>
        <h1 className="font-display text-display font-300 text-ink">
          Your career assessment
        </h1>
      </div>

      {assessment ? (
        <AssessmentReport assessment={assessment} mentor={mentor ?? null} />
      ) : (
        <ProfileUploader mentorId={profile?.mentor_id ?? null} />
      )}
    </PageShell>
  )
}
