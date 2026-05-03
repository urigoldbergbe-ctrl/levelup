import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import AssessmentReport from '@/features/assessment/components/AssessmentReport'
import AssessmentReuploadButton from '@/features/assessment/components/AssessmentReuploadButton'
import ProfileUploadStep from '@/features/onboarding/components/ProfileUploadStep'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveLeaderById } from '@/lib/leaders/catalog'

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const user = await getUser()
  if (!user) redirect('/login')

  const leaderChange =
    searchParams?.leader_change === '1' || searchParams?.leader_change === 'true'

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
  const mentorName = mentor?.name ?? 'your chosen mentor'

  return (
    <PageShell>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-xs font-body font-600 tracking-[0.20em] text-brand-purple uppercase mb-2">
            AI Gap Analysis
          </p>
          <h1 className="font-body font-800 text-ink" style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.02em' }}>
            Your career assessment
          </h1>
        </div>
        {assessment ? (
          <div className="flex justify-end sm:pt-1">
            <AssessmentReuploadButton />
          </div>
        ) : null}
      </div>

      {assessment ? (
        <AssessmentReport assessment={assessment} mentor={mentor} />
      ) : profile?.mentor_id ? (
        <div className="max-w-xl mx-auto space-y-6">
          {leaderChange ? (
            <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/5 px-5 py-4">
              <p className="font-body text-sm text-ink leading-relaxed">
                You switched your primary mentor. Your completed books, courses, and milestones from the last journey
                will be credited to your skill scores after you run a new gap analysis. Upload your CV or paste your
                profile again so we can map fresh gaps and rebuild your learning journey for{' '}
                <span className="font-600 text-brand-purple">{mentorName}</span>.
              </p>
            </div>
          ) : null}
          <ProfileUploadStep mentorName={mentorName} />
        </div>
      ) : (
        <div className="max-w-md glass-card rounded-2xl p-8 text-center">
          <p className="font-body text-sm text-ink-mid mb-4">
            Choose a mentor first before running your assessment.
          </p>
          <a href="/onboarding" className="text-sm font-body font-600 text-brand-purple hover:underline">
            Go to onboarding →
          </a>
        </div>
      )}
    </PageShell>
  )
}
