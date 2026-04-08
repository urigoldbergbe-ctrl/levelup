'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { LEADERS } from '@/data/leaders'
import { resetJourneyAndAssessmentForLeaderChange } from '@/features/mentors/leaderSwitch'

/** slot 1 = primary leader, slot 2 = second leader */
export async function selectMentorAction(mentorId: string, slot: 1 | 2 = 1) {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('mentor_id, learning_carryover_points')
    .eq('id', user.id)
    .maybeSingle()

  const previousPrimaryId = existingProfile?.mentor_id ?? null
  const isPrimaryLeaderChange =
    slot === 1 && previousPrimaryId != null && previousPrimaryId !== mentorId

  let carryoverDelta = 0
  if (isPrimaryLeaderChange) {
    carryoverDelta = await resetJourneyAndAssessmentForLeaderChange(admin, user.id)
  }

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

  if (slot === 1) {
    const patch: Record<string, unknown> = { mentor_id: mentorId }
    if (isPrimaryLeaderChange) {
      patch.current_semester = 1
      const prevCarry =
        (existingProfile as { learning_carryover_points?: number } | null)
          ?.learning_carryover_points ?? 0
      patch.learning_carryover_points = prevCarry + carryoverDelta
    }
    if (existingProfile) {
      await admin.from('profiles').update(patch).eq('id', user.id)
    } else {
      await admin.from('profiles').insert({ id: user.id, ...patch })
    }
  } else {
    await admin
      .from('profiles')
      .update({ mentor_id_2: mentorId })
      .eq('id', user.id)
  }

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
  revalidatePath('/home')
  revalidatePath('/journey')
  revalidatePath('/assessment')

  if (slot === 1) {
    if (isPrimaryLeaderChange) {
      redirect('/assessment?leader_change=1')
    }
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
  revalidatePath('/home')
}
