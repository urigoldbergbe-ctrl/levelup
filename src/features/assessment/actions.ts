'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { runGapAnalysis, runSkillScoring } from '@/lib/ai/agents'
import { runCurriculumGeneration } from '@/lib/ai/agents/curriculum.agent'
import { cacheGet, cacheSet, cacheKey } from '@/lib/cache/redis'
import { LEADERS } from '@/data/leaders'
import { applyPendingLearningCarryoverToSkillScores } from '@/features/mentors/leaderSwitch'
import type { GapAnalysisOutput } from '@/lib/ai/types'
import type { GlobalLibraryItem } from '@/lib/ai/agents/curriculum.agent'
import type { LeaderFormData } from '@/features/admin/types'
import { getGlobalFeedbackSummary } from '@/features/recommendations/actions'

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

  if (!mentor) throw new Error('Mentor not found. Please return to onboarding and select a mentor.')

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

  await applyPendingLearningCarryoverToSkillScores(admin, user.id)

  // Generate per-user personalised curriculum using the user's actual gaps
  try {
    const { data: libraryRows } = await admin
      .from('library_items')
      .select('id, type, title, author, url, description, platform, gap_tags')
      .limit(200)

    const globalLibrary: GlobalLibraryItem[] = (libraryRows ?? []).map(row => ({
      id: String(row.id),
      type: row.type as 'book' | 'podcast' | 'course',
      title: String(row.title),
      author: row.author ? String(row.author) : null,
      url: row.url ? String(row.url) : null,
      description: row.description ? String(row.description) : null,
      platform: row.platform ? String(row.platform) : null,
      gap_tags: Array.isArray(row.gap_tags) ? (row.gap_tags as string[]) : [],
    }))

    const leaderFormData: LeaderFormData = {
      name: mentor!.name,
      title: mentor!.title,
      company: mentor!.company,
      category: mentor!.category,
      skills: mentor!.skills,
      quote: mentor!.quote ?? '',
      photoUrl: mentor!.photo_url ?? '',
      spotifyUrl: mentor!.spotify_url ?? '',
      skillScores: [],
      books: [],
      newsAlerts: [],
    }

    // Fetch global community feedback for AI learning
    const feedbackSummary = await getGlobalFeedbackSummary(20).catch(() => ({ topRated: [], poorRated: [] }))

    const curriculumResult = await runCurriculumGeneration({
      leader: leaderFormData,
      skillGaps: result.gaps,
      globalLibrary,
      profileContext: profileText.slice(0, 800),
      wellRatedItems: feedbackSummary.topRated,
      poorlyRatedItems: feedbackSummary.poorRated,
    })

    // Upsert per-user curriculum (one record per user, overwritten on re-assessment)
    await admin
      .from('user_curriculum')
      .upsert(
        {
          user_id: user.id,
          mentor_id: mentor!.id,
          content: curriculumResult,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
  } catch (currErr) {
    // Non-fatal — journey falls back to admin curriculum or static
    console.error('[curriculum-gen] failed, journey will use fallback:', currErr)
  }

  revalidatePath('/assessment')
  revalidatePath('/home')
  revalidatePath('/journey')
  revalidatePath('/progress')
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
  revalidatePath('/home')
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

  revalidatePath('/progress')
  revalidatePath('/home')
}

/** Edit a single gap's description inline and auto-trigger journey regen */
export async function editAssessmentGapAction(
  gapIndex: number,
  newWhy: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()
  const { data: row } = await admin
    .from('assessments')
    .select('id, gaps')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!row) return { ok: false, error: 'No assessment found' }
  const gaps = (row.gaps as { skill: string; why: string; category: string }[]).map((g, i) =>
    i === gapIndex ? { ...g, why: newWhy } : g
  )
  const { error } = await admin.from('assessments').update({ gaps }).eq('id', row.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/progress')
  return { ok: true }
}

/** Add a custom checklist goal in a given dimension */
export async function addCustomGoalAction(
  dimension: string,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()
  const { error } = await admin.from('checklist_items').insert({
    user_id: user.id,
    dimension,
    label: label.trim(),
    completed: false,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/progress')
  return { ok: true }
}

export async function updateChecklistLabelAction(itemId: string, label: string) {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()
  await admin
    .from('checklist_items')
    .update({ custom_label: label.trim() || null })
    .eq('id', itemId)
    .eq('user_id', user.id)
  revalidatePath('/progress')
}

/**
 * Re-generates the user's curriculum using their current progress and checklist
 * as additional context. This lets progress changes feed back into recommendations.
 */
export async function rerunCurriculumFromProgressAction(): Promise<{ ok: boolean; error?: string }> {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  try {
    // Fetch user data
    const [{ data: profile }, { data: assessment }, { data: checklistItems }, { data: progressRows }] =
      await Promise.all([
        admin.from('profiles').select('mentor_id').eq('id', user.id).single(),
        admin.from('assessments').select('gaps, profile_text').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(1).maybeSingle(),
        admin.from('checklist_items').select('label, custom_label, completed, dimension').eq('user_id', user.id),
        admin.from('progress').select('*').eq('user_id', user.id),
      ])

    if (!profile?.mentor_id) return { ok: false, error: 'No mentor selected' }
    if (!assessment) return { ok: false, error: 'Complete your assessment first' }

    // Find mentor — check static list first, then fall back to DB (same logic as runAssessmentAction)
    let mentor: (typeof LEADERS)[0] | null = LEADERS.find(l => l.id === profile.mentor_id) ?? null
    if (!mentor) {
      const { data: dbLeader } = await admin
        .from('leader_profiles')
        .select('*')
        .eq('id', profile.mentor_id)
        .maybeSingle()
      if (dbLeader) {
        mentor = {
          id: dbLeader.id,
          name: dbLeader.name,
          title: dbLeader.title ?? '',
          company: dbLeader.company ?? '',
          category: dbLeader.category ?? 'Leadership',
          quote: dbLeader.quote ?? '',
          photo_url: dbLeader.photo_url ?? null,
          g1: dbLeader.g1 ?? '#1a1a2e',
          g2: dbLeader.g2 ?? '#16213e',
          own_book: dbLeader.own_book ?? { title: '', url: '', why: '' },
          skills: dbLeader.skills ?? ['Leadership', 'Strategy', 'Execution', 'Communication', 'Vision'],
          career_ladder: dbLeader.career_ladder ?? [],
          spotify_url: dbLeader.spotify_url ?? null,
        } as unknown as (typeof LEADERS)[0]
      }
    }
    if (!mentor) return { ok: false, error: 'Mentor not found — please return to onboarding and re-select a mentor' }

    // Build a rich context from progress
    const completedItems = (checklistItems ?? []).filter(i => i.completed)
      .map(i => i.custom_label || i.label)
    const pendingItems = (checklistItems ?? []).filter(i => !i.completed)
      .map(i => i.custom_label || i.label)
    const progressContext = [
      `Completed milestones: ${completedItems.length > 0 ? completedItems.join('; ') : 'none yet'}`,
      `Pending milestones: ${pendingItems.slice(0, 5).join('; ')}`,
      progressRows?.length ? `Active semesters: ${progressRows.length}` : '',
    ].filter(Boolean).join('\n')

    const profileContext = [
      (assessment as any).profile_text?.slice(0, 400) ?? '',
      '\nProgress update:\n' + progressContext,
    ].join('\n').trim()

    // Fetch library
    const { data: libraryRows } = await admin
      .from('library_items')
      .select('id, type, title, author, url, description, platform, gap_tags')
      .limit(200)

    const globalLibrary: GlobalLibraryItem[] = (libraryRows ?? []).map(row => ({
      id: String(row.id),
      type: row.type as 'book' | 'podcast' | 'course',
      title: String(row.title),
      author: row.author ? String(row.author) : null,
      url: row.url ? String(row.url) : null,
      description: row.description ? String(row.description) : null,
      platform: row.platform ? String(row.platform) : null,
      gap_tags: Array.isArray(row.gap_tags) ? (row.gap_tags as string[]) : [],
    }))

    const leaderFormData: LeaderFormData = {
      name: mentor.name,
      title: mentor.title,
      company: mentor.company,
      category: mentor.category,
      skills: mentor.skills,
      quote: mentor.quote ?? '',
      photoUrl: mentor.photo_url ?? '',
      spotifyUrl: mentor.spotify_url ?? '',
      skillScores: [],
      books: [],
      newsAlerts: [],
    }

    const feedbackSummary = await getGlobalFeedbackSummary(20).catch(() => ({ topRated: [], poorRated: [] }))

    const curriculumResult = await runCurriculumGeneration({
      leader: leaderFormData,
      skillGaps: assessment.gaps as Array<{ skill: string; category: string; why: string }>,
      globalLibrary,
      profileContext,
      wellRatedItems: feedbackSummary.topRated,
      poorlyRatedItems: feedbackSummary.poorRated,
    })

    await admin
      .from('user_curriculum')
      .upsert(
        { user_id: user.id, mentor_id: mentor.id, content: curriculumResult, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    revalidatePath('/journey')
    revalidatePath('/progress')
    return { ok: true }
  } catch (err) {
    console.error('[rerunCurriculumFromProgress]', err)
    return { ok: false, error: String(err) }
  }
}
