import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import AssessmentReport from '@/features/assessment/components/AssessmentReport'
import ProfileUploadStep from '@/features/onboarding/components/ProfileUploadStep'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveLeaderById } from '@/lib/leaders/catalog'

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

  const mentor = profile?.mentor_id ? await resolveLeaderById(profile.mentor_id) : null
  const mentorName = mentor?.name ?? 'your chosen leader'

  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          AI Gap Analysis
        </p>
        <h1 className="font-display font-300 text-white" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
          Your career assessment
        </h1>
      </div>

      {assessment ? (
        <AssessmentReport assessment={assessment} mentor={mentor} />
      ) : profile?.mentor_id ? (
        <ProfileUploadStep mentorName={mentorName} />
      ) : (
        <div className="max-w-md glass-card rounded-2xl p-8 text-center">
          <p className="font-body text-sm text-white/50 mb-4">
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
