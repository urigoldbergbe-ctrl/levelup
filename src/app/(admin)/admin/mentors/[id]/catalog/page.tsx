import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import CatalogEditor from '@/features/admin/components/CatalogEditor'
import NewsAlertComposer from '@/features/admin/components/NewsAlertComposer'

type Tab = 'catalog' | 'alerts'

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tab?: Tab }
}) {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  const tab: Tab = searchParams.tab ?? 'catalog'

  // Verify admin belongs to the same org as this mentor profile
  const { data: membership } = await admin
    .from('org_memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .in('role', ['hr_admin', 'owner'])
    .limit(1)
    .maybeSingle()

  const { data: leader } = await admin
    .from('leader_profiles')
    .select('id, name, title, catalog_books, catalog_podcasts, catalog_courses, news_alerts')
    .eq('id', params.id)
    .single()

  if (!leader) redirect('/admin/mentors')

  const { data: alertLogs } = await admin
    .from('news_alert_logs')
    .select('id, subject, sent_at, recipient_count')
    .eq('leader_id', params.id)
    .order('sent_at', { ascending: false })
    .limit(20)

  const emailConfigured = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder')

  const TABS = [
    { id: 'catalog', label: 'Catalog' },
    { id: 'alerts', label: 'News alerts' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/mentors" className="font-body text-xs text-ink-faint hover:text-ink-mid mb-2 block">
          ← Mentors
        </Link>
        <h1 className="font-display text-2xl font-300 text-ink">
          {leader.name}
        </h1>
        <p className="font-body text-sm text-ink-mid mt-0.5">{leader.title}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-mist rounded-xl p-1 mb-8 w-fit">
        {TABS.map(t => (
          <Link
            key={t.id}
            href={`/admin/mentors/${params.id}/catalog?tab=${t.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-body font-500 transition-colors ${
              tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-ink-mid hover:text-ink'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'catalog' && (
        <CatalogEditor
          leaderId={leader.id}
          defaultCatalog={{
            books: (leader.catalog_books as any[]) ?? [],
            podcasts: (leader.catalog_podcasts as any[]) ?? [],
            courses: (leader.catalog_courses as any[]) ?? [],
            newsAlerts: (leader.news_alerts as string[]) ?? [],
          }}
        />
      )}

      {tab === 'alerts' && (
        <NewsAlertComposer
          leaderId={leader.id}
          orgId={membership?.org_id ?? null}
          leaderName={leader.name}
          alertLogs={alertLogs ?? []}
          keywords={(leader.news_alerts as string[]) ?? []}
          emailConfigured={emailConfigured}
        />
      )}
    </div>
  )
}
