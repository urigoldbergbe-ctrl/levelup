'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { LEADERS } from '@/data/leaders'

/** slot 1 = primary leader, slot 2 = second leader */
export async function selectMentorAction(mentorId: string, slot: 1 | 2 = 1) {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  // Resolve next-role info (used for checklist seeding on slot 1)
  let nextRoleTitle = 'Senior Manager'
  let nextRoleCo = 'your company'

  const staticMentor = LEADERS.find(l => l.id === mentorId)
  if (staticMentor) {
    const nextRole = staticMentor.career_ladder[1]
    nextRoleTitle = nextRole?.title ?? nextRoleTitle
    nextRoleCo = nextRole?.co ?? nextRoleCo
  } else {
    const { data: dbLeader } = await admin
      .from('leader_profiles')
      .select('id, name, career_ladder')
      .eq('id', mentorId)
      .eq('approved', true)
      .maybeSingle()

    if (!dbLeader) throw new Error('Leader not found')

    const ladder = (dbLeader.career_ladder as Array<{ title: string; co: string }> | null) ?? []
    if (ladder[1]) {
      nextRoleTitle = ladder[1].title
      nextRoleCo = ladder[1].co
    }
  }

  const field = slot === 1 ? 'mentor_id' : 'mentor_id_2'

  await admin
    .from('profiles')
    .upsert(
      { id: user.id, [field]: mentorId },
      { onConflict: 'id' }
    )

  // Only seed checklist when setting primary leader for the first time
  if (slot === 1) {
    const existingItems = await admin
      .from('checklist_items')
      .select('id')
      .eq('user_id', user.id)

    if (!existingItems.data?.length) {
      const defaultItems = [
        { dimension: 'technical',      requirement_id: 'tech-1',  label: `Lead a project specific to ${nextRoleTitle} at ${nextRoleCo}` },
        { dimension: 'technical',      requirement_id: 'tech-2',  label: 'Drive cross-functional initiative with measurable business impact' },
        { dimension: 'technical',      requirement_id: 'tech-3',  label: 'Build and present a financial model or business case to leadership' },
        { dimension: 'communication',  requirement_id: 'comm-1',  label: 'Deliver a director-level presentation on strategy' },
        { dimension: 'communication',  requirement_id: 'comm-2',  label: 'Establish relationships with 3+ senior stakeholders above your level' },
        { dimension: 'communication',  requirement_id: 'comm-3',  label: 'Receive exceeds-expectations performance rating' },
        { dimension: 'thinking',       requirement_id: 'think-1', label: 'Apply a named strategic framework to a real business decision' },
        { dimension: 'thinking',       requirement_id: 'think-2', label: 'Author a vision or strategy document adopted by your team' },
      ]

      await admin.from('checklist_items').insert(
        defaultItems.map(item => ({
          ...item,
          user_id: user.id,
          next_role_title: nextRoleTitle,
          completed: false,
        }))
      )
    }
  }

  revalidatePath('/onboarding')
  revalidatePath('/mentors')
  revalidatePath('/dashboard')

  if (slot === 1) {
    redirect('/onboarding')
  }
  // slot 2: client handles refresh via router.refresh()
}

export async function removeSecondMentorAction() {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  await admin
    .from('profiles')
    .update({ mentor_id_2: null })
    .eq('id', user.id)

  revalidatePath('/mentors')
  revalidatePath('/dashboard')
}
