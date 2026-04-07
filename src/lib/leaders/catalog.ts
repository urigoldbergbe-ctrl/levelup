import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { LEADERS } from '@/data/leaders'
import type { Leader } from '@/types'

/** Map a `leader_profiles` row to the app `Leader` type */
export function leaderFromProfileRow(
  l: Record<string, unknown>,
  opts?: { isOrgLeader?: boolean },
): Leader {
  return {
    id: String(l.id),
    name: String(l.name ?? ''),
    title: String(l.title ?? ''),
    company: String(l.company ?? ''),
    category: (l.category ?? 'Strategy') as Leader['category'],
    category2: (l.category2 as Leader['category2']) ?? null,
    category3: (l.category3 as Leader['category3']) ?? null,
    quote: String(l.quote ?? ''),
    bio: l.bio != null ? String(l.bio) : undefined,
    photo_url: l.photo_url != null ? String(l.photo_url) : undefined,
    g1: String(l.g1 ?? '#1a1a2e'),
    g2: String(l.g2 ?? '#16213e'),
    own_book: (l.own_book as Leader['own_book']) ?? { title: '', url: '', why: '' },
    skills: (l.skills as string[]) ?? [],
    career_ladder: (l.career_ladder as Leader['career_ladder']) ?? [],
    spotify_url: l.spotify_url != null ? String(l.spotify_url) : undefined,
    isOrgLeader: opts?.isOrgLeader,
  }
}

/**
 * Global catalog: approved leaders with no org (platform-wide).
 * If the database has none (or query fails), falls back to static `LEADERS`.
 * Static entries whose id is not in DB are appended so demos still work.
 */
export async function getGlobalLeadersCatalog(): Promise<Leader[]> {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await admin
      .from('leader_profiles')
      .select('*')
      .is('org_id', null)
      .eq('approved', true)
      .order('name', { ascending: true })

    if (error || !data?.length) {
      return LEADERS
    }

    const fromDb = data.map(row => leaderFromProfileRow(row as Record<string, unknown>))
    const dbIds = new Set(fromDb.map(x => x.id))
    const onlyStatic = LEADERS.filter(s => !dbIds.has(s.id))
    return [...fromDb, ...onlyStatic]
  } catch {
    return LEADERS
  }
}
