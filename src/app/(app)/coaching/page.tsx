import Link from 'next/link'
import { redirect } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import CalendlyEmbed from '@/features/coaching/components/CalendlyEmbed'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { isMissingTableError } from '@/lib/supabase/schema-errors'
import type { SkillGap } from '@/types'

export default async function CoachingPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await getSupabaseServerClient()

  const [assRes, assignRes, sessRes] = await Promise.all([
    supabase
      .from('assessments')
      .select('headline, year_one_action, gaps, strengths, mentor_parallel')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('user_coach_assignments').select('coach_id').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('coach_sessions')
      .select('tasks, session_at, notes')
      .eq('user_id', user.id)
      .order('session_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const assessment = assRes.data
  const assignRow = assignRes.data
  const lastSession = sessRes.data

  const coachingSchemaMissing =
    isMissingTableError(assignRes.error) ||
    isMissingTableError(sessRes.error)

  let coach: {
    id: string
    name: string
    email: string
    phone: string | null
    bio: string | null
    calendly_url: string
    photo_url: string | null
  } | null = null

  if (!coachingSchemaMissing && assignRow?.coach_id) {
    const { data: c, error: coachErr } = await supabase
      .from('coaches')
      .select('id, name, email, phone, bio, calendly_url, photo_url')
      .eq('id', assignRow.coach_id)
      .eq('active', true)
      .maybeSingle()
    if (!coachErr) coach = c
  }

  const gaps = (assessment?.gaps ?? []) as SkillGap[]
  const strengths = (assessment?.strengths ?? []) as string[]
  const sessionTasks = Array.isArray(lastSession?.tasks)
    ? (lastSession!.tasks as unknown[]).map(String).filter(Boolean)
    : []

  return (
    <PageShell>
      {coachingSchemaMissing && (
        <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 font-body text-sm text-amber-100/90">
          Coaching data isn&apos;t available yet. Ask your admin to apply Supabase migration{' '}
          <code className="text-xs bg-black/25 px-1.5 py-0.5 rounded">00012_coaching.sql</code>. Until then,
          assignment and scheduling won&apos;t appear here.
        </div>
      )}

      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.2em] text-accent uppercase mb-2">Coaching</p>
        <h1 className="font-display font-300 text-white" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
          Your coach &amp; goals
        </h1>
        <p className="font-body text-sm text-white/40 mt-2 max-w-2xl">
          Goals from your assessment, actions from your last session, and scheduling — in one place.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Goals from assessment */}
        <section className="glass-card rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xs font-body font-600 tracking-[0.2em] text-white/35 uppercase mb-4">
            Current goals
          </h2>
          {!assessment ? (
            <p className="font-body text-sm text-white/40">
              Complete your{' '}
              <Link href="/assessment" className="text-accent hover:text-accent-mid transition-colors">
                assessment
              </Link>{' '}
              to see personalised goals here.
            </p>
          ) : (
            <div className="space-y-4">
              {assessment.headline && (
                <p className="font-body text-sm text-white/80 leading-relaxed border-l-2 border-accent/40 pl-4">
                  {assessment.headline}
                </p>
              )}
              {assessment.year_one_action && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-wider text-white/30 mb-1">
                    Year-one focus
                  </p>
                  <p className="font-body text-sm text-white/60">{assessment.year_one_action}</p>
                </div>
              )}
              {gaps.length > 0 && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-wider text-white/30 mb-2">
                    Skill gaps to close
                  </p>
                  <ul className="space-y-2">
                    {gaps.slice(0, 8).map(g => (
                      <li key={g.skill} className="font-body text-sm text-white/70">
                        <span className="text-white font-500">{g.skill}</span>
                        <span className="text-white/35"> · {g.category}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {strengths.length > 0 && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-wider text-white/30 mb-2">
                    Strengths to leverage
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {strengths.slice(0, 10).map(s => (
                      <span
                        key={s}
                        className="text-xs font-body px-2.5 py-1 rounded-full bg-white/[0.06] text-white/50 border border-white/10"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {assessment.mentor_parallel && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-wider text-white/30 mb-1">
                    Parallel to your leader
                  </p>
                  <p className="font-body text-xs text-white/45 italic leading-relaxed">{assessment.mentor_parallel}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Last session tasks */}
        <section className="glass-card rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xs font-body font-600 tracking-[0.2em] text-white/35 uppercase mb-4">
            Coach tasks
          </h2>
          <p className="font-body text-xs text-white/30 mb-4">
            Specific actions from your most recent coaching session.
          </p>
          {sessionTasks.length === 0 ? (
            <p className="font-body text-sm text-white/45">No current tasks.</p>
          ) : (
            <ul className="space-y-3">
              {sessionTasks.map((t, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-body text-sm text-white/75 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-accent font-600 tabular-nums">{i + 1}.</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
          {lastSession?.session_at && (
            <p className="text-[10px] font-body text-white/25 mt-4">
              Last updated {new Date(lastSession.session_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </section>
      </div>

      {/* Coach card + Calendly */}
      <section className="mt-10">
        <h2 className="text-xs font-body font-600 tracking-[0.2em] text-white/35 uppercase mb-4">
          Book your next session
        </h2>
        {coachingSchemaMissing ? (
          <p className="font-body text-sm text-white/40">
            Booking will work after migration <code className="text-xs text-white/50">00012_coaching.sql</code> is
            applied and a coach is assigned to you.
          </p>
        ) : !coach ? (
          <div className="glass-card rounded-2xl p-8 border border-amber/20 text-center">
            <p className="font-body text-sm text-white/50">
              You don&apos;t have a coach assigned yet. When your programme admin assigns one, their calendar
              will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center glass-card rounded-2xl p-5 border border-white/[0.08]">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                {coach.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coach.photo_url}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-xl text-white/40">
                    {coach.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-600 text-white">{coach.name}</p>
                {coach.bio && <p className="font-body text-sm text-white/45 mt-1 line-clamp-3">{coach.bio}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-body text-white/35">
                  <a href={`mailto:${coach.email}`} className="hover:text-accent transition-colors">
                    {coach.email}
                  </a>
                  {coach.phone && (
                    <a href={`tel:${coach.phone}`} className="hover:text-accent transition-colors">
                      {coach.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <CalendlyEmbed url={coach.calendly_url} />
          </div>
        )}
      </section>
    </PageShell>
  )
}
