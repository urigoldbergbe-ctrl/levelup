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

async function assertHrAdminForOrg(userId: string, orgId: string) {
  const admin = getSupabaseAdminClient()
  const { data } = await admin
    .from('org_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .in('role', ['hr_admin', 'owner'])
    .maybeSingle()

  if (!data) throw new Error('Unauthorised: HR admin role required for this organisation.')
}

function slugifyOrgName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'org'
}

/** Invite payload for org HR / owners (not platform superadmin). */
export interface OrgInviteUserPayload {
  email: string
  name: string
  orgId: string
  role: 'member' | 'hr_admin' | 'manager'
  password?: string
}

export async function inviteOrgUserAction(payload: OrgInviteUserPayload) {
  const caller = await getUser()
  if (!caller) redirect('/login')

  await assertHrAdminForOrg(caller.id, payload.orgId)
  const admin = getSupabaseAdminClient()

  const createParams: Parameters<typeof admin.auth.admin.createUser>[0] = {
    email: payload.email,
    user_metadata: { name: payload.name },
    email_confirm: true,
  }
  if (payload.password) {
    createParams.password = payload.password
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser(createParams)

  if (authError && !authError.message.includes('already been registered')) {
    throw new Error(authError.message)
  }

  const userId = authData?.user?.id

  if (userId) {
    await admin.from('profiles').upsert(
      { id: userId, name: payload.name },
      { onConflict: 'id' },
    )

    await admin.from('org_memberships').upsert(
      { org_id: payload.orgId, user_id: userId, role: payload.role },
      { onConflict: 'org_id,user_id' },
    )
  }

  await admin.from('pending_invites').upsert(
    {
      org_id: payload.orgId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      invited_by: caller.id,
    },
    { onConflict: 'org_id,email' },
  )

  revalidatePath('/admin/members')
}

export async function batchInviteOrgUsersAction(rows: OrgInviteUserPayload[]) {
  const results: { email: string; ok: boolean; error?: string }[] = []
  for (const row of rows) {
    try {
      await inviteOrgUserAction(row)
      results.push({ email: row.email, ok: true })
    } catch (err) {
      results.push({ email: row.email, ok: false, error: err instanceof Error ? err.message : 'Failed' })
    }
  }
  return results
}

export async function updateOrganizationNameAction(orgId: string, name: string) {
  const user = await getUser()
  if (!user) redirect('/login')

  await assertHrAdminForOrg(user.id, orgId)
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Organisation name is required.')

  const admin = getSupabaseAdminClient()
  const baseSlug = slugifyOrgName(trimmed)

  let slug = baseSlug
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = attempt === 0 ? '' : `-${orgId.slice(0, 8)}${attempt > 1 ? `-${attempt}` : ''}`
    slug = `${baseSlug}${suffix}`
    const { error } = await admin.from('organizations').update({ name: trimmed, slug }).eq('id', orgId)
    if (!error) {
      revalidatePath('/admin/members')
      revalidatePath('/admin')
      return
    }
    if (!error.message.includes('unique') && !error.message.includes('duplicate')) {
      throw new Error(error.message)
    }
  }
  throw new Error('Could not save a unique URL slug for this name. Try a slightly different name.')
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
