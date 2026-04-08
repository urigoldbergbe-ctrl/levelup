import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { LEADERS } from '@/data/leaders'
import { normalizeLeaderPhotoUrl } from '@/lib/leaders/photo'
import type { Leader } from '@/types'

/** Map a `leader_profiles` row to the app `Leader` type */
export function leaderFromProfileRow(
  l: Record<string, unknown>,
  opts?: { isOrgLeader?: boolean },
): Leader {
  const id = String(l.id)
  return {
    id,
    name: String(l.name ?? ''),
    title: String(l.title ?? ''),
    company: String(l.company ?? ''),
    category: (l.category ?? 'Strategy') as Leader['category'],
    category2: (l.category2 as Leader['category2']) ?? null,
    category3: (l.category3 as Leader['category3']) ?? null,
    quote: String(l.quote ?? ''),
    bio: l.bio != null ? String(l.bio) : undefined,
    photo_url: normalizeLeaderPhotoUrl(id, l.photo_url != null ? String(l.photo_url) : null),
    g1: String(l.g1 ?? '#1a1a2e'),
    g2: String(l.g2 ?? '#16213e'),
    own_book: (l.own_book as Leader['own_book']) ?? { title: '', url: '', why: '' },
    skills: (l.skills as string[]) ?? [],
    career_ladder: (l.career_ladder as Leader['career_ladder']) ?? [],
    spotify_url: l.spotify_url != null ? String(l.spotify_url) : undefined,
    isOrgLeader: opts?.isOrgLeader,
  }
}

function isGlobalOrgId(orgId: unknown): boolean {
  return orgId == null || orgId === ''
}

/**
 * Platform-wide leaders: approved and not tied to an organization.
 * Fetches all approved rows and filters in JS so `org_id` null always matches
 * (avoids edge cases with PostgREST `.is('org_id', null)`).
 */
export async function getGlobalLeadersCatalog(): Promise<Leader[]> {
  try {
    const admin = getSupabaseAdminClient()
    const { data: raw, error } = await admin
      .from('leader_profiles')
      .select('*')
      .eq('approved', true)
      .order('name', { ascending: true })

    if (error || !raw?.length) {
      return LEADERS.map(s => ({
        ...s,
        photo_url: normalizeLeaderPhotoUrl(s.id, s.photo_url),
      }))
    }

    const globals = raw.filter(row => isGlobalOrgId((row as { org_id?: unknown }).org_id))
    if (!globals.length) {
      return LEADERS.map(s => ({
        ...s,
        photo_url: normalizeLeaderPhotoUrl(s.id, s.photo_url),
      }))
    }

    const fromDb = globals.map(row => leaderFromProfileRow(row as Record<string, unknown>))
    const dbIds = new Set(fromDb.map(x => x.id))
    const onlyStatic = LEADERS.filter(s => !dbIds.has(s.id)).map(s => ({
      ...s,
      photo_url: normalizeLeaderPhotoUrl(s.id, s.photo_url),
    }))
    return [...fromDb, ...onlyStatic]
  } catch {
    return LEADERS.map(s => ({
      ...s,
      photo_url: normalizeLeaderPhotoUrl(s.id, s.photo_url),
    }))
  }
}

/** Resolve a mentor for journey / readiness / UI when they may exist only in the database */
export async function resolveLeaderById(mentorId: string | null | undefined): Promise<Leader | null> {
  if (!mentorId) return null
  const s = LEADERS.find(l => l.id === mentorId)
  if (s) {
    return {
      ...s,
      photo_url: normalizeLeaderPhotoUrl(s.id, s.photo_url),
    }
  }
  try {
    const admin = getSupabaseAdminClient()
    const { data } = await admin
      .from('leader_profiles')
      .select('*')
      .eq('id', mentorId)
      .eq('approved', true)
      .maybeSingle()
    if (!data) return null
    return leaderFromProfileRow(data as Record<string, unknown>)
  } catch {
    return null
  }
}
