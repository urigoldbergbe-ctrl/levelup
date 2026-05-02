import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { resolveLeaderById } from '@/lib/leaders/catalog'
import { getCuratedWiredArticles } from '@/lib/wired/curated'

export default async function HomePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(user.id)
  const supabase = await getSupabaseServerClient()

  const { data: assessment } = await supabase
    .from('assessments')
    .select('profile_text, gaps, headline')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const mentor = profile?.mentor_id ? await resolveLeaderById(profile.mentor_id) : null

  const gapsText =
    assessment?.gaps != null
      ? (assessment.gaps as { skill?: string; why?: string }[])
          .map(g => `${g.skill ?? ''} ${g.why ?? ''}`)
          .join(' ')
      : ''

  const profileSnippet = [
    typeof assessment?.profile_text === 'string' ? assessment.profile_text.slice(0, 1200) : '',
    typeof assessment?.headline === 'string' ? assessment.headline : '',
    gapsText,
  ]
    .filter(Boolean)
    .join(' ')

  const articles = await getCuratedWiredArticles(
    {
      leaderName: mentor?.name,
      leaderCompany: mentor?.company,
      leaderCategory: mentor?.category,
      profileAndGapsText: profileSnippet || null,
    },
    12,
  )

  const firstName = profile?.name?.split(' ')[0]

  return (
    <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-64px)] pb-24 md:pb-10">
      {/* Disney+-inspired hero: deep blue gradient, soft glow */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(165deg, #020617 0%, #0f172a 25%, #1e1b4b 55%, #0c4a6e 85%, #020617 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.35) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.04%22%2F%3E%3C%2Fsvg%3E')] opacity-60 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-16 md:pb-24 text-center">
          <p className="text-[11px] md:text-xs font-body font-600 tracking-[0.35em] text-sky-300/90 uppercase mb-6">
            Welcome{firstName ? `, ${firstName}` : ''}
          </p>
          <h1
            className="font-display font-400 text-white tracking-tight mb-8"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)', lineHeight: 1.08 }}
          >
            Grow into who you want to become
          </h1>
          <div className="max-w-2xl mx-auto space-y-5 text-left md:text-center">
            <p className="font-body text-base md:text-lg text-slate-300/95 leading-relaxed">
              The people you admire got there by what they <span className="text-white font-500">read</span>,{' '}
              <span className="text-white font-500">listen to</span>, and{' '}
              <span className="text-white font-500">how they think</span>. LevelUp lines up books, podcasts, and courses
              in the spirit of the mentor you choose—so you are not guessing what to study next.
            </p>
            <p className="font-body text-sm md:text-base text-slate-400/90 leading-relaxed">
              Coaching ties it to <span className="text-sky-200/90">your real milestones</span>: someone in your corner
              while you close the gap between today and your next role.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-12">
            <Link
              href="/journey"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-slate-950 text-sm font-body font-600 hover:bg-sky-100 transition-colors shadow-lg shadow-sky-500/10"
            >
              Open your journey
            </Link>
            <Link
              href="/coaching"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/20 text-white text-sm font-body font-500 hover:bg-white/10 transition-colors"
            >
              Coaching
            </Link>
          </div>
        </div>
      </div>

      {/* Content rails — Disney+ style rows */}
      <div className="relative z-10 -mt-6 md:-mt-10 px-4 md:px-10 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between gap-4 mb-4 px-2">
          <div>
            <h2 className="font-display text-lg md:text-xl font-500 text-white tracking-tight">
              Reads picked for your path
            </h2>
            <p className="font-body text-xs text-white/40 mt-1 max-w-xl">
              {mentor
                ? `Stories from WIRED ranked for overlap with ${mentor.name}, ${mentor.company}, and your latest profile context.`
                : 'Choose a mentor and complete your assessment to sharpen these picks. Until then, here is the latest from WIRED.'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto scroll-x pb-4 snap-x snap-mandatory -mx-1 px-1 scrollbar-thin">
          {articles.length === 0 ? (
            <p className="font-body text-sm text-white/35 px-3 py-8">
              We could not load WIRED right now. Try again in a moment.
            </p>
          ) : (
            articles.map(item => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-start shrink-0 w-[240px] sm:w-[280px] group rounded-xl overflow-hidden bg-slate-900/80 border border-white/[0.08] hover:border-sky-500/30 hover:shadow-[0_0_32px_rgba(14,165,233,0.12)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] bg-slate-800">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-body font-600 uppercase tracking-wider text-white/50">
                    WIRED
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-body text-sm font-600 text-white leading-snug line-clamp-3 group-hover:text-sky-200 transition-colors">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="font-body text-xs text-white/40 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  ) : null}
                </div>
              </a>
            ))
          )}
        </div>

        <p className="font-body text-[10px] text-white/25 px-2 mt-2 mb-10">
          Article titles and images are from WIRED (Condé Nast). Links open wired.com in a new tab. LevelUp does not
          endorse or own this content.
        </p>
      </div>
    </div>
  )
}
