'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { runGapAnalysis, runSkillScoring } from '@/lib/ai/agents'
import { cacheGet, cacheSet, cacheKey } from '@/lib/cache/redis'
import { LEADERS } from '@/data/leaders'
import type { GapAnalysisOutput } from '@/lib/ai/types'

async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  // Dynamic import keeps pdf-parse out of the edge runtime bundle
  const pdfParse = (await import('pdf-parse')).default
  const parsed = await pdfParse(buffer)
  return parsed.text
}

export async function runAssessmentAction(formData: FormData) {
  const user = await getUser()
  if (!user) redirect('/login')

  // Resolve profile text — either from pasted text or uploaded PDF
  let profileText = (formData.get('profileText') as string | null)?.trim() ?? ''

  const pdfFile = formData.get('profilePdf') as File | null
  if (pdfFile && pdfFile.size > 0) {
    profileText = await extractTextFromPdf(pdfFile)
  }

  if (!profileText) throw new Error('Please provide your profile text or upload a PDF.')

  // Block if the only content is a URL — Claude has nothing real to analyse
  const strippedText = profileText.replace(/^LinkedIn:\s*https?:\/\/\S+\s*/i, '').trim()
  const wordCount = strippedText.split(/\s+/).filter(Boolean).length
  if (wordCount < 30) {
    throw new Error(
      'Not enough profile information to analyse. ' +
      'Please paste your LinkedIn About section and job history (or upload your CV as a PDF).'
    )
  }

  const admin = getSupabaseAdminClient()

  // Get user's chosen mentor(s)
  const { data: profile } = await admin
    .from('profiles')
    .select('mentor_id, mentor_id_2')
    .eq('id', user.id)
    .single()

  if (!profile?.mentor_id) redirect('/onboarding')
  const mentorId2: string | null = (profile as any).mentor_id_2 ?? null

  // Find mentor in static list first, then fall back to DB
  let mentor = LEADERS.find(l => l.id === profile.mentor_id) ?? null
  let leaderCvText: string | undefined

  // Always fetch DB row for leader_cv_text and leader_skill_scores (even for static leaders)
  const { data: dbLeaderRow } = await admin
    .from('leader_profiles')
    .select('leader_cv_text, leader_skill_scores')
    .eq('id', profile.mentor_id)
    .maybeSingle()
  if (dbLeaderRow) {
    leaderCvText = (dbLeaderRow as any).leader_cv_text ?? undefined
  }

  // Fetch second leader's skill scores (for target averaging)
  let dbLeaderRow2: { leader_skill_scores?: unknown } | null = null
  if (mentorId2) {
    const { data } = await admin
      .from('leader_profiles')
      .select('leader_skill_scores')
      .eq('id', mentorId2)
      .maybeSingle()
    dbLeaderRow2 = data
  }

  if (!mentor) {
    const { data: dbLeader } = await admin
      .from('leader_profiles')
      .select('*')
      .eq('id', profile.mentor_id)
      .single()
    if (dbLeader) {
      leaderCvText = (dbLeader as any).leader_cv_text ?? undefined
      // Map DB leader to Leader type for the AI agent
      mentor = {
        id: dbLeader.id,
        name: dbLeader.name,
        title: dbLeader.title ?? '',
        company: dbLeader.company ?? '',
        category: dbLeader.category ?? 'Leadership',
        quote: dbLeader.quote ?? '',
        photo_url: dbLeader.photo_url,
        g1: dbLeader.g1 ?? '#1a1a2e',
        g2: dbLeader.g2 ?? '#16213e',
        own_book: dbLeader.own_book ?? { title: '', url: '', why: '' },
        skills: dbLeader.skills ?? ['Leadership', 'Strategy', 'Execution', 'Communication', 'Vision'],
        career_ladder: dbLeader.career_ladder ?? [],
        spotify_url: dbLeader.spotify_url,
      } as unknown as typeof mentor
    }
  }

  if (!mentor) throw new Error('Leader not found. Please return to onboarding and select a leader.')

  // Check cache
  const ck = cacheKey.assessment(user.id, mentor!.id)
  const cached = await cacheGet<GapAnalysisOutput>(ck)

  const result = cached ?? await runGapAnalysis({ profileText, mentor: mentor!, leaderCvText })

  if (!cached) await cacheSet(ck, result, 3600)

  // Persist to DB
  await admin.from('assessments').insert({
    user_id: user.id,
    mentor_id: mentor!.id,
    profile_text: profileText,
    headline: result.headline,
    current_level: result.currentLevel,
    target_level: result.targetLevel,
    gaps: result.gaps,
    strengths: result.strengths,
    year_one_action: result.yearOneAction,
    mentor_parallel: result.mentorParallel,
  })

  // Score skills based on profile + leader(s) — replace any existing scores
  try {
    // Blend skill targets: average both leaders' scores when a second leader exists
    type SkillScoreEntry = { skill_name: string; stars: number }
    const scores1: SkillScoreEntry[] = (dbLeaderRow as any)?.leader_skill_scores ?? []
    const scores2: SkillScoreEntry[] = (dbLeaderRow2 as any)?.leader_skill_scores ?? []

    let blendedScores = scores1
    if (scores2.length > 0 && scores1.length > 0) {
      const map2 = Object.fromEntries(scores2.map(s => [s.skill_name, s.stars]))
      blendedScores = scores1.map(s => ({
        ...s,
        stars: map2[s.skill_name] != null
          ? Math.round((s.stars + map2[s.skill_name]) / 2)
          : s.stars,
      }))
    } else if (scores2.length > 0) {
      blendedScores = scores2
    }

    const skillResult = await runSkillScoring({
      profileText,
      assessment: result,
      mentor: mentor!,
      leaderSkillScores: blendedScores.map(s => ({
        ...s,
        dimension: (s as any).dimension ?? 'general',
      })),
    })

    const rows = skillResult.scores.map(s => ({
      user_id: user.id,
      dimension: s.dimension,
      skill_name: s.skill_name,
      current_pct: s.current_pct,
      next_role_pct: s.next_role_pct,
      target_pct: s.target_pct,
    }))

    // Upsert so re-running the assessment updates scores
    await admin
      .from('skill_scores')
      .upsert(rows, { onConflict: 'user_id,dimension,skill_name' })
  } catch (skillErr: unknown) {
    console.error('[skill-scoring] failed, writing defaults:', skillErr)
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
    await admin
      .from('skill_scores')
      .upsert(rows, { onConflict: 'user_id,dimension,skill_name' })
  }

  revalidatePath('/assessment')
  revalidatePath('/dashboard')
  redirect('/assessment')
}

/** Remove saved assessments so the user can upload a new CV or paste new text. */
export async function resetAssessmentForReuploadAction() {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  const { error } = await admin.from('assessments').delete().eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/assessment')
  revalidatePath('/dashboard')
  redirect('/assessment')
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
