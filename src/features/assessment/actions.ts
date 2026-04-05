'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { runGapAnalysis } from '@/lib/ai/agents'
import { cacheGet, cacheSet, cacheKey } from '@/lib/cache/redis'
import { LEADERS } from '@/data/leaders'
import type { GapAnalysisOutput } from '@/lib/ai/types'

export async function runAssessmentAction(formData: FormData) {
  const user = await getUser()
  if (!user) redirect('/login')

  const profileText = formData.get('profileText') as string
  if (!profileText?.trim()) throw new Error('Profile text is required')

  const admin = getSupabaseAdminClient()

  // Get user's chosen mentor
  const { data: profile } = await admin
    .from('profiles')
    .select('mentor_id')
    .eq('id', user.id)
    .single()

  if (!profile?.mentor_id) redirect('/onboarding')

  const mentor = LEADERS.find(l => l.id === profile.mentor_id)
  if (!mentor) throw new Error('Leader not found')

  // Check cache
  const ck = cacheKey.assessment(user.id, mentor.id)
  const cached = await cacheGet<GapAnalysisOutput>(ck)

  const result = cached ?? await runGapAnalysis({ profileText, mentor })

  if (!cached) await cacheSet(ck, result, 3600)

  // Persist to DB
  await admin.from('assessments').insert({
    user_id: user.id,
    mentor_id: mentor.id,
    profile_text: profileText,
    headline: result.headline,
    current_level: result.currentLevel,
    target_level: result.targetLevel,
    gaps: result.gaps,
    strengths: result.strengths,
    year_one_action: result.yearOneAction,
    mentor_parallel: result.mentorParallel,
  })

  // Seed skill scores if none exist
  const { count } = await admin
    .from('skill_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (!count) {
    const { SKILL_CATALOG } = await import('@/types')
    const rows = Object.entries(SKILL_CATALOG).flatMap(([dim, skills]) =>
      skills.map(skill => ({
        user_id: user.id,
        dimension: dim,
        skill_name: skill,
        current_pct: 20,
        target_pct: 80,
      }))
    )
    await admin.from('skill_scores').insert(rows)
  }

  revalidatePath('/assessment')
  revalidatePath('/dashboard')
}

export async function toggleChecklistItemAction(itemId: string, completed: boolean) {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  await admin
    .from('checklist_items')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', itemId)
    .eq('user_id', user.id)

  revalidatePath('/readiness')
  revalidatePath('/dashboard')
}
