import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import SemesterMap from '@/features/journey/components/SemesterMap'
import JourneyAutoRegen from '@/features/journey/components/JourneyAutoRegen'
import { mapStoredCurriculumToSemesters } from '@/features/journey/curriculumMap'
import { buildSemesters } from '@/features/journey/utils'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { resolveLeaderById } from '@/lib/leaders/catalog'

export default async function JourneyPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await getSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('mentor_id, current_semester, curriculum_stale')
    .eq('id', user.id)
    .single()

  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)

  const { data: assessment } = await supabase
    .from('assessments')
    .select('gaps')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: assignRow } = await supabase
    .from('user_coach_assignments')
    .select('coach_id')
    .eq('user_id', user.id)
    .maybeSingle()

  let coach: { name: string; photo_url: string | null } | null = null
  if (assignRow?.coach_id) {
    const { data: c } = await supabase
      .from('coaches')
      .select('name, photo_url')
      .eq('id', assignRow.coach_id)
      .eq('active', true)
      .maybeSingle()
    coach = c
  }

  const mentor = await resolveLeaderById(profile?.mentor_id ?? null)

  // User's thumbs feedback — gracefully degrades to empty map if table not yet migrated
  const feedbackMap: Record<string, 'up' | 'down'> = {}
  try {
    const { data: feedbackRows, error: fbErr } = await supabase
      .from('recommendation_feedback')
      .select('resource_type, resource_title, feedback')
      .eq('user_id', user.id)
    if (!fbErr && feedbackRows) {
      for (const row of feedbackRows) {
        feedbackMap[`${row.resource_type}::${row.resource_title}`] = row.feedback as 'up' | 'down'
      }
    }
  } catch {
    // Silently ignore — table may not exist in this environment yet
  }

  const gaps = assessment?.gaps ?? []
  const fallbackSemesters = buildSemesters(mentor, gaps)

  let semesters = fallbackSemesters

  // 1. Try per-user personalised curriculum (generated after assessment, keyed to user+gaps)
  const { data: userCurriculumRow } = await supabase
    .from('user_curriculum')
    .select('content')
    .eq('user_id', user.id)
    .maybeSingle()

  if (userCurriculumRow?.content) {
    const fromUser = mapStoredCurriculumToSemesters(userCurriculumRow.content)
    if (fromUser) semesters = fromUser
  } else if (profile?.mentor_id) {
    // 2. Fall back to admin-generated leader curriculum (same for all users of this mentor)
    const { data: curriculumRow } = await supabase
      .from('leader_curriculum')
      .select('content, status')
      .eq('leader_id', profile.mentor_id)
      .maybeSingle()

    if (curriculumRow?.status === 'done' && curriculumRow.content) {
      const fromAi = mapStoredCurriculumToSemesters(curriculumRow.content)
      if (fromAi) semesters = fromAi
    }
    // 3. Static buildSemesters fallback is already set as default
  }

  const isStale = !!profile?.curriculum_stale

  return (
    <PageShell>
      {isStale && <JourneyAutoRegen />}
      <div className="mb-10 pb-6 border-b border-black/[0.07]">
        <p className="text-xs font-body font-600 tracking-[0.20em] text-mckinsey-blue uppercase mb-2">
          Learning journey
        </p>
        <h1 className="font-display italic text-ink" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
          Your learning journey
        </h1>
        {mentor && (
          <p className="font-body text-sm text-ink-mid mt-2">
            Tailored to your gaps and{' '}
            <span className="text-ink font-600">{mentor.name}</span>&apos;s career path.
          </p>
        )}
      </div>
      <SemesterMap
        mentor={mentor}
        semesters={semesters}
        currentSemester={profile?.current_semester ?? 1}
        progress={progress ?? []}
        gaps={gaps}
        coach={coach}
        feedback={feedbackMap}
      />
    </PageShell>
  )
}
