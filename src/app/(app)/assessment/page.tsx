import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import AssessmentReport from '@/features/assessment/components/AssessmentReport'
import ProfileUploadStep from '@/features/onboarding/components/ProfileUploadStep'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { LEADERS } from '@/data/leaders'

export default async function AssessmentPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  const [{ data: profile }, { data: assessment }] = await Promise.all([
    admin.from('profiles').select('mentor_id').eq('id', user.id).single(),
    admin.from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Resolve mentor for the report header
  let mentorName = 'your chosen leader'
  if (profile?.mentor_id) {
    const staticMentor = LEADERS.find(l => l.id === profile.mentor_id)
    if (staticMentor) {
      mentorName = staticMentor.name
    } else {
      const { data: dbMentor } = await admin
        .from('leader_profiles')
        .select('name')
        .eq('id', profile.mentor_id)
        .maybeSingle()
      if (dbMentor) mentorName = dbMentor.name
    }
  }

  const mentor = profile?.mentor_id
    ? LEADERS.find(l => l.id === profile.mentor_id) ?? null
    : null

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
      ) : profile?.mentor_id ? (
        <ProfileUploadStep mentorName={mentorName} />
      ) : (
        <div className="max-w-md bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <p className="font-body text-sm text-ink-mid mb-4">
            Choose a leader first before running your assessment.
          </p>
          <a href="/onboarding" className="text-sm font-body font-500 text-accent hover:underline">
            Go to onboarding →
          </a>
        </div>
      )}
    </PageShell>
  )
}
