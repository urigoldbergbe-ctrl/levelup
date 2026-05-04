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
        <div className="mb-6 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 font-body text-sm text-amber-800">
          Coaching data isn&apos;t available yet. Ask your admin to apply migration{' '}
          <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">00012_coaching.sql</code>.
        </div>
      )}

      <div className="mb-8 pb-6 border-b border-black/[0.07]">
        <p className="text-xs font-body font-600 tracking-[0.20em] text-mckinsey-blue uppercase mb-2">Coaching</p>
        <h1 className="font-display italic text-ink" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
          Your coach &amp; goals
        </h1>
        <p className="font-body text-sm text-ink-mid mt-2 max-w-2xl">
          Goals from your assessment, actions from your last session, and scheduling — in one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Goals from assessment */}
        <section className="glass-card p-6">
          <h2 className="text-[10px] font-body font-600 tracking-[0.20em] text-ink-faint uppercase mb-4">
            Current goals
          </h2>
          {!assessment ? (
            <p className="font-body text-sm text-ink-mid">
              Complete your{' '}
              <Link href="/assessment" className="text-mckinsey-blue hover:underline">
                assessment
              </Link>{' '}
              to see personalised goals here.
            </p>
          ) : (
            <div className="space-y-4">
              {assessment.headline && (
                <p className="font-body text-sm text-ink leading-relaxed border-l-2 border-mckinsey-blue/40 pl-4">
                  {assessment.headline}
                </p>
              )}
              {assessment.year_one_action && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-1">Year-one focus</p>
                  <p className="font-body text-sm text-ink-mid">{assessment.year_one_action}</p>
                </div>
              )}
              {gaps.length > 0 && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-2">Skill gaps to close</p>
                  <ul className="space-y-1.5">
                    {gaps.slice(0, 8).map(g => (
                      <li key={g.skill} className="font-body text-sm text-ink-mid">
                        <span className="font-600 text-ink">{g.skill}</span>
                        <span className="text-ink-faint"> · {g.category}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {strengths.length > 0 && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-2">Strengths to leverage</p>
                  <div className="flex flex-wrap gap-2">
                    {strengths.slice(0, 10).map(s => (
                      <span key={s} className="text-xs font-body px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {assessment.mentor_parallel && (
                <div>
                  <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-1">Parallel to your mentor</p>
                  <p className="font-body text-xs text-ink-mid italic leading-relaxed">{assessment.mentor_parallel}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Last session tasks */}
        <section className="glass-card p-6">
          <h2 className="text-[10px] font-body font-600 tracking-[0.20em] text-ink-faint uppercase mb-4">
            Coach tasks
          </h2>
          <p className="font-body text-xs text-ink-faint mb-4">
            Specific actions from your most recent coaching session.
          </p>
          {sessionTasks.length === 0 ? (
            <p className="font-body text-sm text-ink-faint">No current tasks.</p>
          ) : (
            <ul className="space-y-3">
              {sessionTasks.map((t, i) => (
                <li key={i} className="flex gap-3 font-body text-sm text-ink border-b border-black/[0.05] pb-3 last:border-0 last:pb-0">
                  <span className="text-mckinsey-blue font-700 tabular-nums shrink-0">{i + 1}.</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
          {lastSession?.session_at && (
            <p className="text-[10px] font-body text-ink-faint mt-4">
              Last updated {new Date(lastSession.session_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          )}
        </section>
      </div>

      {/* Coach card + Calendly */}
      <section className="mt-8">
        <h2 className="text-[10px] font-body font-600 tracking-[0.20em] text-ink-faint uppercase mb-4">
          Book your next session
        </h2>
        {coachingSchemaMissing ? (
          <p className="font-body text-sm text-ink-mid">
            Booking will work after migration{' '}
            <code className="text-xs bg-mist px-1.5 py-0.5 rounded text-ink-mid">00012_coaching.sql</code>{' '}
            is applied and a coach is assigned to you.
          </p>
        ) : !coach ? (
          <div className="glass-card p-8 text-center">
            <p className="font-body text-sm text-ink-mid">
              You don&apos;t have a coach assigned yet. When your programme admin assigns one, their calendar will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center glass-card p-5">
              <div className="w-16 h-16 overflow-hidden bg-mist shrink-0 border border-black/[0.07]" style={{ borderRadius: '2px' }}>
                {coach.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coach.photo_url} alt={coach.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-xl text-ink-faint">
                    {coach.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-700 text-ink">{coach.name}</p>
                {coach.bio && <p className="font-body text-sm text-ink-mid mt-1 line-clamp-3">{coach.bio}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-body text-ink-faint">
                  <a href={`mailto:${coach.email}`} className="hover:text-mckinsey-blue transition-colors">{coach.email}</a>
                  {coach.phone && (
                    <a href={`tel:${coach.phone}`} className="hover:text-mckinsey-blue transition-colors">{coach.phone}</a>
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
