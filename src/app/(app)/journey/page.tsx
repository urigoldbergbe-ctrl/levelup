import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import SemesterMap from '@/features/journey/components/SemesterMap'
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
    .select('mentor_id, current_semester')
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

  const gaps = assessment?.gaps ?? []
  const fallbackSemesters = buildSemesters(mentor, gaps)

  let semesters = fallbackSemesters
  if (profile?.mentor_id) {
    const { data: curriculumRow } = await supabase
      .from('leader_curriculum')
      .select('content, status')
      .eq('leader_id', profile.mentor_id)
      .maybeSingle()

    if (curriculumRow?.status === 'done' && curriculumRow.content) {
      const fromAi = mapStoredCurriculumToSemesters(curriculumRow.content)
      if (fromAi) semesters = fromAi
    }
  }

  return (
    <PageShell>
      <div className="mb-10 relative">
        <div
          className="absolute -top-4 -left-4 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(79,130,255,0.6) 0%, transparent 70%)' }}
        />
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Learning journey
        </p>
        <h1 className="font-display font-300 text-white relative" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
          Your learning journey
        </h1>
        {mentor && (
          <p className="font-body text-sm text-white/40 mt-2 relative">
            Picks are tailored to your gaps and what{' '}
            <span className="text-white/70 font-500">{mentor.name}</span> would likely recommend — drawn from the platform library.
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
      />
    </PageShell>
  )
}
