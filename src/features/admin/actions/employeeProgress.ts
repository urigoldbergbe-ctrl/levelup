'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

interface ProgressRowUpdate {
  id: string
  semester: number
  books_completed: string[]
  course_completed: boolean
  podcast_scheduled: boolean
  milestone_achieved: boolean
  coach_assignment_completed?: boolean
  custom_goal?: string | null
}

export async function updateEmployeeProgressAction(
  targetUserId: string,
  rows: ProgressRowUpdate[]
) {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  // Verify manager/admin permission
  const { data: membership } = await admin
    .from('org_memberships')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['hr_admin', 'owner', 'manager'])
    .limit(1)
    .maybeSingle()

  if (!membership) throw new Error('Permission denied')

  for (const row of rows) {
    await admin.from('progress').upsert(
      {
        id: row.id,
        user_id: targetUserId,
        semester: row.semester,
        books_completed: row.books_completed,
        course_completed: row.course_completed,
        podcast_scheduled: row.podcast_scheduled,
        milestone_achieved: row.milestone_achieved,
        coach_assignment_completed: row.coach_assignment_completed ?? false,
        custom_goal: row.custom_goal ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  }

  revalidatePath(`/admin/team/${targetUserId}`)
}