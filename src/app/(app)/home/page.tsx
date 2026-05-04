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
    <div className="min-h-[calc(100vh-64px)] pb-24 md:pb-10 bg-white">
      {/* Hero banner — McKinsey style */}
      <div className="bg-white border-b border-black/[0.07]">
        {/* Top accent rule */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #002F6C 0%, #2D7D9A 100%)' }} />
        <div className="max-w-4xl mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-16 md:pb-20">
          <p className="text-[10px] md:text-xs font-body font-600 tracking-[0.30em] text-mckinsey-blue uppercase mb-5">
            Welcome{firstName ? `, ${firstName}` : ''}
          </p>
          <h1
            className="font-display italic text-ink tracking-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 3.5rem)', lineHeight: 1.1 }}
          >
            Grow into who you{' '}
            <span className="gradient-text not-italic">want to become</span>
          </h1>
          <div className="section-rule mb-6" />
          <div className="max-w-2xl space-y-4">
            <p className="font-body text-base text-ink-mid leading-relaxed">
              The people you admire got there by what they <span className="text-ink font-600">read</span>,{' '}
              <span className="text-ink font-600">listen to</span>, and{' '}
              <span className="text-ink font-600">how they think</span>. LevelUp lines up books, podcasts, and courses
              in the spirit of the mentor you choose — so you&apos;re never guessing what to study next.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/journey"
              className="inline-flex items-center justify-center px-7 py-2.5 text-white text-sm font-body font-600 btn-brand"
              style={{ borderRadius: '2px' }}
            >
              Open your journey
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center justify-center px-7 py-2.5 border border-mckinsey-blue/30 text-mckinsey-blue text-sm font-body font-500 hover:bg-mckinsey-light transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Progress &amp; assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Content rails */}
      <div className="relative z-10 px-4 md:px-10 max-w-[1600px] mx-auto pt-10">
        <div className="flex items-end justify-between gap-4 mb-4 px-2">
          <div>
            <h2 className="font-body text-lg md:text-xl font-700 text-ink tracking-tight">
              Reads picked for your path
            </h2>
            <p className="font-body text-xs text-ink-mid mt-1 max-w-xl">
              {mentor
                ? `Stories from WIRED ranked for overlap with ${mentor.name}, ${mentor.company}, and your latest profile context.`
                : 'Choose a mentor and complete your assessment to sharpen these picks. Until then, here is the latest from WIRED.'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto scroll-x pb-4 snap-x snap-mandatory -mx-1 px-1">
          {articles.length === 0 ? (
            <p className="font-body text-sm text-ink-faint px-3 py-8">
              We could not load WIRED right now. Try again in a moment.
            </p>
          ) : (
            articles.map(item => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-start shrink-0 w-[240px] sm:w-[280px] group overflow-hidden bg-white border border-black/[0.07] hover:border-mckinsey-blue/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] bg-mist">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,47,108,0.06), rgba(45,125,154,0.06))' }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-body font-700 uppercase tracking-wider text-white/80">
                    WIRED
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-body text-sm font-600 text-ink leading-snug line-clamp-3 group-hover:text-mckinsey-blue transition-colors">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="font-body text-xs text-ink-mid mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  ) : null}
                </div>
              </a>
            ))
          )}
        </div>

        <p className="font-body text-[10px] text-ink-faint px-2 mt-2 mb-10">
          Article titles and images are from WIRED (Condé Nast). Links open wired.com in a new tab. LevelUp does not
          endorse or own this content.
        </p>
      </div>
    </div>
  )
}
