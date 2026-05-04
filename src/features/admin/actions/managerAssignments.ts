'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

/** Assign an employee to a manager (idempotent) */
export async function assignDirectReportAction(managerId: string, employeeId: string) {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()
  await admin.from('manager_assignments').upsert(
    { manager_id: managerId, employee_id: employeeId },
    { onConflict: 'manager_id,employee_id' }
  )
  revalidatePath('/admin/members')
  revalidatePath('/admin/team')
}

/** Remove an employee from a manager's direct reports */
export async function removeDirectReportAction(managerId: string, employeeId: string) {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()
  await admin.from('manager_assignments')
    .delete()
    .eq('manager_id', managerId)
    .eq('employee_id', employeeId)
  revalidatePath('/admin/members')
  revalidatePath('/admin/team')
}

/** Promote a member to the manager role in org_memberships */
export async function setMemberRoleAction(orgId: string, userId: string, role: string) {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()
  await admin.from('org_memberships')
    .update({ role })
    .eq('org_id', orgId)
    .eq('user_id', userId)
  revalidatePath('/admin/members')
}

/** Update a specific employee's progress field (used by managers from their team tab) */
export async function updateEmployeeProgressAction(
  employeeId: string,
  semester: number,
  updates: {
    course_completed?: boolean
    podcast_scheduled?: boolean
    milestone_achieved?: boolean
    coach_assignment_completed?: boolean
    custom_goal?: string
  }
) {
  const user = await getUser()
  if (!user) redirect('/login')
  const admin = getSupabaseAdminClient()

  await admin.from('progress').upsert(
    { user_id: employeeId, semester, ...updates },
    { onConflict: 'user_id,semester' }
  )

  // Trigger journey re-generation for this employee based on updated progress
  try {
    const { data: profile } = await admin.from('profiles').select('mentor_id').eq('id', employeeId).maybeSingle()
    const { data: assessment } = await admin.from('assessments').select('gaps, profile_text')
      .eq('user_id', employeeId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    const { data: checklistItems } = await admin.from('checklist_items')
      .select('label, custom_label, completed').eq('user_id', employeeId)

    if (profile?.mentor_id && assessment) {
      const { LEADERS } = await import('@/data/leaders')
      let mentor = LEADERS.find(l => l.id === profile.mentor_id) ?? null
      if (!mentor) {
        const { data: dbLeader } = await admin.from('leader_profiles').select('*').eq('id', profile.mentor_id).maybeSingle()
        if (dbLeader) {
          mentor = { id: dbLeader.id, name: dbLeader.name, title: dbLeader.title ?? '', company: dbLeader.company ?? '',
            category: dbLeader.category ?? 'Leadership', quote: dbLeader.quote ?? '', photo_url: dbLeader.photo_url ?? null,
            g1: '#1a1a2e', g2: '#16213e', own_book: { title: '', url: '', why: '' },
            skills: dbLeader.skills ?? [], career_ladder: [], spotify_url: null,
          } as any
        }
      }
      if (mentor) {
        const { runCurriculumGeneration } = await import('@/lib/ai/agents/curriculum.agent')
        const { data: libraryRows } = await admin.from('library_items')
          .select('id, type, title, author, url, description, platform, gap_tags').limit(200)
        const completed = (checklistItems ?? []).filter(i => i.completed).map(i => i.custom_label || i.label)
        const pending = (checklistItems ?? []).filter(i => !i.completed).map(i => i.custom_label || i.label).slice(0, 5)
        const profileContext = [(assessment as any).profile_text?.slice(0, 400) ?? '',
          `\nCompleted milestones: ${completed.join('; ')}\nPending: ${pending.join('; ')}`].join('\n').trim()
        const globalLibrary = (libraryRows ?? []).map((row: any) => ({
          id: String(row.id), type: row.type, title: String(row.title),
          author: row.author ?? null, url: row.url ?? null, description: row.description ?? null,
          platform: row.platform ?? null, gap_tags: Array.isArray(row.gap_tags) ? row.gap_tags : [],
        }))
        const result = await runCurriculumGeneration({
          leader: { name: mentor.name, title: mentor.title, company: mentor.company, category: mentor.category,
            skills: mentor.skills, quote: mentor.quote ?? '', photoUrl: mentor.photo_url ?? '',
            spotifyUrl: mentor.spotify_url ?? '', skillScores: [], books: [], newsAlerts: [] },
          skillGaps: (assessment as any).gaps,
          globalLibrary,
          profileContext,
        })
        await admin.from('user_curriculum').upsert(
          { user_id: employeeId, mentor_id: mentor.id, content: result, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      }
    }
  } catch (err) {
    console.error('[manager regen]', err)
  }

  revalidatePath('/admin/team')
}
