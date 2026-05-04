import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import ProgressAssessmentView from '@/features/progress/components/ProgressAssessmentView'
import ProfileUploadStep from '@/features/onboarding/components/ProfileUploadStep'
import AssessmentReuploadButton from '@/features/assessment/components/AssessmentReuploadButton'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveLeaderById } from '@/lib/leaders/catalog'

export default async function ProgressPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  const [
    { data: profile },
    { data: assessment },
    { data: checklistItems },
    { data: progressRows },
  ] = await Promise.all([
    admin.from('profiles').select('mentor_id').eq('id', user.id).single(),
    admin.from('assessments')
      .select('id, headline, current_level, target_level, gaps, strengths, year_one_action, mentor_parallel')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('checklist_items')
      .select('id, dimension, label, custom_label, completed')
      .eq('user_id', user.id),
    admin.from('progress').select('*').eq('user_id', user.id),
  ])

  const mentor = profile?.mentor_id ? await resolveLeaderById(profile.mentor_id) : null
  const mentorName = mentor?.name ?? 'your mentor'

  return (
    <PageShell>
      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-black/[0.07] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-body font-600 tracking-[0.20em] text-mckinsey-blue uppercase mb-2">
            Progress &amp; Assessment
          </p>
          <h1 className="font-display italic text-ink" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
            Your development plan
          </h1>
          {mentor && (
            <p className="font-body text-sm text-ink-mid mt-1">
              Tracking your path toward <span className="font-600 text-ink">{mentorName}</span>&apos;s career level
            </p>
          )}
        </div>
        {assessment && (
          <div className="shrink-0">
            <AssessmentReuploadButton />
          </div>
        )}
      </div>

      {/* Main content */}
      {assessment ? (
        <ProgressAssessmentView
          assessment={assessment as {
            id: string
            headline: string
            current_level: string
            target_level: string
            gaps: Array<{ skill: string; why: string; category: string }>
            strengths: string[]
            year_one_action: string
            mentor_parallel: string | null
          }}
          checklistItems={(checklistItems ?? []).map(i => ({
            id: i.id,
            dimension: i.dimension,
            label: i.label,
            custom_label: i.custom_label ?? null,
            completed: i.completed,
          }))}
          mentor={mentor}
          progressRows={progressRows ?? []}
        />
      ) : profile?.mentor_id ? (
        <div className="max-w-xl">
          <div className="mb-6 p-5 border-l-4 border-mckinsey-blue bg-mckinsey-light rounded-r-lg">
            <p className="font-body text-sm text-ink leading-relaxed">
              Upload your CV or describe your background so our AI can map your gaps against{' '}
              <span className="font-600">{mentorName}</span>&apos;s career path and build your personalised journey.
            </p>
          </div>
          <ProfileUploadStep mentorName={mentorName} />
        </div>
      ) : (
        <div className="glass-card p-8 text-center max-w-md">
          <p className="font-body text-sm text-ink-mid mb-4">
            Choose a mentor first to activate your assessment.
          </p>
          <a href="/onboarding" className="text-sm font-body font-600 text-mckinsey-blue hover:underline">
            Go to onboarding →
          </a>
        </div>
      )}
    </PageShell>
  )
}
