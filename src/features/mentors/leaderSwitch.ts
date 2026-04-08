import type { SupabaseClient } from '@supabase/supabase-js'

export function computeLearningCarryoverPointsFromProgress(
  rows: Array<{
    books_completed?: unknown
    course_completed?: boolean
    podcast_scheduled?: boolean
    milestone_achieved?: boolean
  }>,
): number {
  let weight = 0
  for (const row of rows) {
    const books = (row.books_completed as string[] | null) ?? []
    weight += books.length * 2
    if (row.course_completed) weight += 6
    if (row.podcast_scheduled) weight += 2
    if (row.milestone_achieved) weight += 5
  }
  return weight
}

/** Clears semester progress and assessments; returns carryover weight from deleted progress. */
export async function resetJourneyAndAssessmentForLeaderChange(
  admin: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data: progressRows } = await admin.from('progress').select('*').eq('user_id', userId)
  const weight = computeLearningCarryoverPointsFromProgress(progressRows ?? [])
  await admin.from('progress').delete().eq('user_id', userId)
  await admin.from('assessments').delete().eq('user_id', userId)
  return weight
}

/**
 * After a new gap analysis writes skill_scores, add carryover from prior journey completions
 * (from switching leaders). Then clears the pending carryover on the profile.
 */
export async function applyPendingLearningCarryoverToSkillScores(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: prof } = await admin
    .from('profiles')
    .select('learning_carryover_points')
    .eq('id', userId)
    .maybeSingle()

  const pts = (prof as { learning_carryover_points?: number } | null)?.learning_carryover_points ?? 0
  if (pts <= 0) return

  const { data: scores } = await admin
    .from('skill_scores')
    .select('id, current_pct, target_pct')
    .eq('user_id', userId)

  if (!scores?.length) {
    await admin.from('profiles').update({ learning_carryover_points: 0 }).eq('id', userId)
    return
  }

  const perSkill = Math.min(8, Math.max(1, Math.floor(pts / 18)))
  await Promise.all(
    scores.map(s => {
      const next = Math.min(s.target_pct, s.current_pct + perSkill)
      if (next <= s.current_pct) return Promise.resolve()
      return admin.from('skill_scores').update({ current_pct: next }).eq('id', s.id)
    }),
  )

  await admin.from('profiles').update({ learning_carryover_points: 0 }).eq('id', userId)
}
