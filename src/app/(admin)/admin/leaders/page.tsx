import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/ui/ConfirmSubmitButton'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { deleteLeaderAction, generateCurriculumAction } from '@/features/admin/actions'

async function getOrgLeaders(userId: string) {
  const admin = getSupabaseAdminClient()
  const { data: membership } = await admin
    .from('org_memberships')
    .select('org_id')
    .eq('user_id', userId)
    .in('role', ['hr_admin', 'owner'])
    .limit(1)
    .maybeSingle()

  if (!membership) return []

  const { data } = await admin
    .from('leader_profiles')
    .select('id, name, title, company, category, category2, category3, bio, photo_url, skills, spotify_url, news_alerts, book_recommendations')
    .eq('org_id', membership.org_id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function AdminLeadersPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const leaders = await getOrgLeaders(user.id)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-300 text-ink">Leaders</h1>
          <p className="font-body text-sm text-ink-mid mt-1">
            Your organisation&apos;s senior leadership role models.
          </p>
        </div>
        <Link
          href="/admin/leaders/new"
          className="px-5 py-2.5 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors shadow-accent"
        >
          + Add leader
        </Link>
      </div>

      {leaders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-accent/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="font-body font-600 text-ink mb-2">No leaders yet</h2>
          <p className="font-body text-sm text-ink-mid mb-6 max-w-sm mx-auto">
            Add your first senior leader. The AI will build a full 7-semester curriculum from their profile.
          </p>
          <Link
            href="/admin/leaders/new"
            className="inline-block px-6 py-3 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors"
          >
            Add your first leader →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaders.map(leader => (
            <LeaderRow key={leader.id} leader={leader} />
          ))}
        </div>
      )}
    </div>
  )
}

type LeaderRow = {
  id: string
  name: string
  title: string | null
  company: string | null
  category: string | null
  category2: string | null
  category3: string | null
  bio: string | null
  photo_url: string | null
  skills: string[] | null
  spotify_url: string | null
  news_alerts: string[] | null
  book_recommendations: Array<{ title: string; author: string; url: string; why: string }> | null
}

function LeaderRow({ leader }: { leader: LeaderRow }) {
  const skillCount = leader.skills?.filter(Boolean).length ?? 0
  const bookCount = leader.book_recommendations?.filter((b: { title: string }) => b.title).length ?? 0
  const alertCount = leader.news_alerts?.filter(Boolean).length ?? 0

  return (
    <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6 flex items-center gap-6">
      {/* Avatar */}
      <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-violet/20 flex items-center justify-center shrink-0 overflow-hidden">
        {leader.photo_url ? (
          <Image
            src={leader.photo_url}
            alt={leader.name}
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="font-display text-xl font-300 text-accent">
            {leader.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-body font-600 text-ink">{leader.name}</h3>
          {[leader.category, leader.category2, leader.category3]
            .filter(Boolean)
            .map((cat, i) => (
            <span
              key={`${leader.id}-cat-${i}`}
              className="px-2 py-0.5 bg-accent/8 text-accent text-xs font-body rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>
        <p className="font-body text-sm text-ink-mid mt-0.5">
          {[leader.title, leader.company].filter(Boolean).join(' · ')}
        </p>
        {leader.bio ? (
          <p className="font-body text-xs text-ink-faint mt-2 line-clamp-2 leading-relaxed max-w-2xl">
            {leader.bio}
          </p>
        ) : null}
        {/* Metadata chips */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <Chip icon="📚" count={bookCount} label="book" />
          <Chip icon="🎯" count={skillCount} label="skill" />
          <Chip icon="📰" count={alertCount} label="alert" />
          {leader.spotify_url && (
            <a
              href={leader.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-body text-green-600 hover:underline"
            >
              🎵 Spotify linked
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/admin/leaders/${leader.id}/catalog`}
          className="px-4 py-2 text-xs font-body font-500 text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
        >
          Catalog
        </Link>
        <form action={generateCurriculumAction.bind(null, leader.id)}>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-body font-500 text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
          >
            Regen curriculum
          </button>
        </form>
        <Link
          href={`/admin/leaders/${leader.id}/edit`}
          className="px-4 py-2 text-xs font-body font-500 text-ink-mid border border-ink/15 rounded-lg hover:text-ink hover:border-ink/30 transition-colors"
        >
          Edit
        </Link>
        <form action={deleteLeaderAction.bind(null, leader.id)}>
          <ConfirmSubmitButton
            confirmMessage={`Delete ${leader.name}? This cannot be undone.`}
            className="px-4 py-2 text-xs font-body font-500 text-red-400 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  )
}

function Chip({ icon, count, label }: { icon: string; count: number; label: string }) {
  if (!count) return null
  return (
    <span className="text-xs font-body text-ink-mid">
      {icon} {count} {label}{count !== 1 ? 's' : ''}
    </span>
  )
}
