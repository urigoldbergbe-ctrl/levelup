'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export type FeedbackValue = 'up' | 'down'

/**
 * Upserts a thumbs feedback for a single recommendation.
 * If the user clicks the same direction again, it removes the vote (toggle).
 */
export async function saveRecommendationFeedbackAction(
  resourceType: 'book' | 'podcast' | 'course',
  resourceTitle: string,
  feedback: FeedbackValue,
): Promise<{ ok: boolean }> {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  try {
    // Check if same vote already exists → toggle off
    const { data: existing } = await admin
      .from('recommendation_feedback')
      .select('id, feedback')
      .eq('user_id', user.id)
      .eq('resource_type', resourceType)
      .eq('resource_title', resourceTitle)
      .maybeSingle()

    if (existing?.feedback === feedback) {
      await admin.from('recommendation_feedback').delete().eq('id', existing.id)
    } else {
      await admin.from('recommendation_feedback').upsert(
        { user_id: user.id, resource_type: resourceType, resource_title: resourceTitle, feedback },
        { onConflict: 'user_id,resource_type,resource_title' },
      )
    }

    revalidatePath('/journey')
    return { ok: true }
  } catch (err) {
    // Table may not exist in this environment yet — fail silently so UI stays functional
    console.error('[saveRecommendationFeedbackAction]', err)
    return { ok: false }
  }
}

/**
 * Returns the aggregated feedback scores across ALL users for use in AI prompts.
 * Returns top N up-voted and top N down-voted items per type.
 */
export async function getGlobalFeedbackSummary(limit = 20): Promise<{
  topRated: Array<{ resource_type: string; resource_title: string; score: number }>
  poorRated: Array<{ resource_type: string; resource_title: string; score: number }>
}> {
  const admin = getSupabaseAdminClient()

  const { data } = await admin
    .from('recommendation_feedback')
    .select('resource_type, resource_title, feedback')

  if (!data?.length) return { topRated: [], poorRated: [] }

  // Aggregate: net score = ups - downs per item
  const scoreMap = new Map<string, { resource_type: string; resource_title: string; score: number }>()
  for (const row of data) {
    const key = `${row.resource_type}::${row.resource_title}`
    const existing = scoreMap.get(key) ?? { resource_type: row.resource_type, resource_title: row.resource_title, score: 0 }
    existing.score += row.feedback === 'up' ? 1 : -1
    scoreMap.set(key, existing)
  }

  const sorted = [...scoreMap.values()].sort((a, b) => b.score - a.score)
  return {
    topRated: sorted.filter(i => i.score > 0).slice(0, limit),
    poorRated: sorted.filter(i => i.score < 0).slice(0, limit),
  }
}
