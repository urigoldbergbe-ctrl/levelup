import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import LibraryManager from '@/features/superadmin/components/LibraryManager'

export default async function GlobalLibraryPage() {
  const admin = getSupabaseAdminClient()
  const { data: items } = await admin
    .from('global_library')
    .select('*')
    .order('type')
    .order('title')

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-mckinsey-blue uppercase mb-2">
          Content library
        </p>
        <h1 className="font-display text-3xl font-300 text-ink">Global library</h1>
        <p className="font-body text-sm text-ink-mid mt-1 max-w-xl">
          A curated collection of books, podcasts, and courses. The AI uses this library to
          recommend content for users based on their specific skill gaps — not tied to any single mentor.
        </p>
      </div>

      <LibraryManager initialItems={items ?? []} />
    </div>
  )
}
