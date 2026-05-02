'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import type {
  LeaderSkillScore,
  LeaderFormData,
  CatalogBook,
  CatalogPodcast,
  CatalogCourse,
  LeaderCatalog,
} from './types'

// Re-export types so callers can import from either place
export type {
  LeaderSkillScore,
  LeaderFormData,
  CatalogBook,
  CatalogPodcast,
  CatalogCourse,
  LeaderCatalog,
} from './types'

async function assertHrAdmin(userId: string): Promise<string> {
  const admin = getSupabaseAdminClient()
  const { data } = await admin
    .from('org_memberships')
    .select('org_id, role')
    .eq('user_id', userId)
    .in('role', ['hr_admin', 'owner'])
    .limit(1)
    .maybeSingle()

  if (!data) throw new Error('Unauthorised: HR admin role required.')
  return data.org_id
}

export async function createLeaderAction(data: LeaderFormData) {
  const user = await getUser()
  if (!user) redirect('/login')

  const orgId = await assertHrAdmin(user.id)
  const admin = getSupabaseAdminClient()

  const id = randomUUID()

  await admin.from('leader_profiles').insert({
    id,
    org_id: orgId,
    name: data.name,
    title: data.title,
    company: data.company,
    category: data.category,
    category2: data.category2?.trim() || null,
    category3: data.category3?.trim() || null,
    bio: data.bio?.trim() || null,
    quote: data.quote,
    photo_url: data.photoUrl || null,
    spotify_url: data.spotifyUrl || null,
    leader_cv_text: data.cvText || null,
    skills: data.skills.filter(Boolean),
    leader_skill_scores: data.skillScores ?? [],
    book_recommendations: data.books.filter(b => b.title),
    news_alerts: data.newsAlerts.filter(Boolean),
    own_book: data.books[0] ?? null,
    approved: true,
    is_custom: true,
    created_by: user.id,
  })

  // Kick off curriculum generation (catalog starts empty for new leaders)
  try {
    await triggerCurriculumGeneration(id, data)
  } catch {
    // Non-blocking — curriculum generates in background
  }

  revalidatePath('/admin/mentors')
  revalidatePath('/mentors')
  redirect('/admin/mentors')
}

export async function updateLeaderAction(leaderId: string, data: LeaderFormData) {
  const user = await getUser()
  if (!user) redirect('/login')

  const orgId = await assertHrAdmin(user.id)
  const admin = getSupabaseAdminClient()

  await admin
    .from('leader_profiles')
    .update({
      name: data.name,
      title: data.title,
      company: data.company,
      category: data.category,
      category2: data.category2?.trim() || null,
      category3: data.category3?.trim() || null,
      bio: data.bio?.trim() || null,
      quote: data.quote,
      photo_url: data.photoUrl || null,
      spotify_url: data.spotifyUrl || null,
      leader_cv_text: data.cvText !== undefined ? (data.cvText || null) : undefined,
      skills: data.skills.filter(Boolean),
      leader_skill_scores: data.skillScores ?? [],
      book_recommendations: data.books.filter(b => b.title),
      news_alerts: data.newsAlerts.filter(Boolean),
      own_book: data.books[0] ?? null,
    })
    .eq('id', leaderId)
    .eq('org_id', orgId)

  revalidatePath('/admin/mentors')
  revalidatePath(`/admin/mentors/${leaderId}/edit`)
  revalidatePath('/mentors')
  redirect('/admin/mentors')
}

export async function deleteLeaderAction(leaderId: string) {
  const user = await getUser()
  if (!user) redirect('/login')

  const orgId = await assertHrAdmin(user.id)
  const admin = getSupabaseAdminClient()

  await admin
    .from('leader_profiles')
    .delete()
    .eq('id', leaderId)
    .eq('org_id', orgId)

  revalidatePath('/admin/mentors')
  revalidatePath('/mentors')
  redirect('/admin/mentors')
}

export async function generateCurriculumAction(leaderId: string) {
  const user = await getUser()
  if (!user) redirect('/login')

  await assertHrAdmin(user.id)
  const admin = getSupabaseAdminClient()

  const [{ data: leader }, { data: libraryItems }] = await Promise.all([
    admin.from('leader_profiles').select('*').eq('id', leaderId).single(),
    admin.from('global_library').select('*').order('type').order('title'),
  ])

  if (!leader) throw new Error('Leader not found')

  const leaderData: LeaderFormData = {
    name: leader.name,
    title: leader.title ?? '',
    company: leader.company ?? '',
    category: leader.category ?? '',
    category2: (leader as { category2?: string | null }).category2 ?? null,
    category3: (leader as { category3?: string | null }).category3 ?? null,
    bio: (leader as { bio?: string | null }).bio ?? '',
    quote: leader.quote ?? '',
    photoUrl: leader.photo_url ?? '',
    spotifyUrl: leader.spotify_url ?? '',
    skills: (leader.skills as string[]) ?? [],
    skillScores: ((leader as any).leader_skill_scores as LeaderSkillScore[]) ?? [],
    books: (leader.book_recommendations as LeaderFormData['books']) ?? [],
    newsAlerts: (leader.news_alerts as string[]) ?? [],
  }

  await triggerCurriculumGeneration(leaderId, leaderData, libraryItems ?? [])
  revalidatePath(`/admin/mentors/${leaderId}/edit`)
  revalidatePath('/journey')
}

export async function saveCatalogAction(leaderId: string, catalog: LeaderCatalog) {
  const user = await getUser()
  if (!user) redirect('/login')

  const orgId = await assertHrAdmin(user.id)
  const admin = getSupabaseAdminClient()

  const { error } = await admin
    .from('leader_profiles')
    .update({
      catalog_books: catalog.books,
      catalog_podcasts: catalog.podcasts,
      catalog_courses: catalog.courses,
      news_alerts: catalog.newsAlerts.filter(Boolean),
    })
    .eq('id', leaderId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/mentors/${leaderId}/catalog`)
  revalidatePath('/admin/mentors')
}

export async function suggestLeaderSkillsAction(
  profileText: string,
  leaderName: string,
): Promise<{ technical: Record<string, number>; communication: Record<string, number>; thinking: Record<string, number> }> {
  const user = await getUser()
  if (!user) redirect('/login')
  await assertHrAdmin(user.id)

  const { suggestLeaderSkills } = await import('@/lib/ai/agents')
  return suggestLeaderSkills(profileText, leaderName)
}

async function triggerCurriculumGeneration(
  leaderId: string,
  data: LeaderFormData,
  globalLibrary?: any[],
) {
  const admin = getSupabaseAdminClient()

  await admin.from('leader_curriculum').upsert({
    leader_id: leaderId,
    status: 'generating',
    content: {},
    generated_at: new Date().toISOString(),
  }, { onConflict: 'leader_id' })

  const { runCurriculumGeneration } = await import('@/lib/ai/agents')
  const result = await runCurriculumGeneration({ leader: data, globalLibrary: globalLibrary ?? [] })

  await admin.from('leader_curriculum').upsert({
    leader_id: leaderId,
    status: 'done',
    content: result,
    generated_at: new Date().toISOString(),
  }, { onConflict: 'leader_id' })
}
