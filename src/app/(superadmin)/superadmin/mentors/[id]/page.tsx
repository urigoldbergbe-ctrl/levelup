import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import CatalogEditor from '@/features/admin/components/CatalogEditor'
import NewsAlertComposer from '@/features/admin/components/NewsAlertComposer'

type Tab = 'catalog' | 'alerts'

export default async function SuperAdminLeaderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tab?: Tab }
}) {
  const admin = getSupabaseAdminClient()
  const tab: Tab = searchParams.tab ?? 'catalog'

  const { data: leader } = await admin
    .from('leader_profiles')
    .select('id, name, title, company, org_id, is_custom, catalog_books, catalog_podcasts, catalog_courses, news_alerts')
    .eq('id', params.id)
    .single()

  if (!leader) redirect('/superadmin/mentors')

  const { data: alertLogs } = await admin
    .from('news_alert_logs')
    .select('id, subject, sent_at, recipient_count')
    .eq('leader_id', params.id)
    .order('sent_at', { ascending: false })
    .limit(20)

  const emailConfigured = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder')

  const TABS = [
    { id: 'catalog', label: 'Catalog (books, podcasts, courses)' },
    { id: 'alerts', label: 'News alerts' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/superadmin/mentors" className="font-body text-xs text-white/30 hover:text-white/50 mb-2 block">
          ← Mentors
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-500 text-white">{leader.name}</h1>
            <p className="font-body text-sm text-white/40 mt-0.5">{leader.title} · {leader.company}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-body ${
            leader.is_custom ? 'bg-amber-500/15 text-amber-300' : 'bg-violet-500/15 text-violet-300'
          }`}>
            {leader.is_custom ? 'Org mentor' : 'Global'}
          </span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-white/3 rounded-xl p-1 mb-8 w-fit border border-white/6">
        {TABS.map(t => (
          <Link
            key={t.id}
            href={`/superadmin/mentors/${params.id}?tab=${t.id}`}
            className={`px-4 py-2 rounded-lg text-xs font-body font-500 transition-colors ${
              tab === t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
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
          orgId={leader.org_id as string | null}
          leaderName={leader.name}
          alertLogs={alertLogs ?? []}
          keywords={(leader.news_alerts as string[]) ?? []}
          emailConfigured={emailConfigured}
        />
      )}
    </div>
  )
}
