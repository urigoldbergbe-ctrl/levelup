'use server'

import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { LEADERS } from '@/data/leaders'

export async function saveLeaderChoiceReasonAction(reason: string) {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()
  await admin
    .from('profiles')
    .update({ leader_choice_reason: reason })
    .eq('id', user.id)
  // Non-critical — ignore errors silently
}

/**
 * Saves the mentor choice during onboarding WITHOUT triggering a server-side redirect.
 * This lets the client-side OnboardingFlow advance to the next step.
 */
export async function saveMentorForOnboardingAction(mentorId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getUser()
    if (!user) return { ok: false, error: 'Not authenticated' }

    const admin = getSupabaseAdminClient()

    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, mentor_id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      await admin.from('profiles').update({ mentor_id: mentorId }).eq('id', user.id)
    } else {
      await admin.from('profiles').insert({ id: user.id, mentor_id: mentorId })
    }

    // Seed checklist if not already done
    const { data: existingItems } = await admin
      .from('checklist_items')
      .select('id')
      .eq('user_id', user.id)

    if (!existingItems?.length) {
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
          .select('career_ladder')
          .eq('id', mentorId)
          .maybeSingle()
        const ladder = (dbLeader?.career_ladder as Array<{ title: string; co: string }> | null) ?? []
        if (ladder[1]) {
          nextRoleTitle = ladder[1].title
          nextRoleCo = ladder[1].co
        }
      }

      await admin.from('checklist_items').insert([
        { user_id: user.id, dimension: 'technical',     requirement_id: 'tech-1',  label: `Lead a project specific to ${nextRoleTitle} at ${nextRoleCo}`, next_role_title: nextRoleTitle, completed: false },
        { user_id: user.id, dimension: 'technical',     requirement_id: 'tech-2',  label: 'Drive cross-functional initiative with measurable business impact', next_role_title: nextRoleTitle, completed: false },
        { user_id: user.id, dimension: 'technical',     requirement_id: 'tech-3',  label: 'Build and present a financial model or business case to leadership', next_role_title: nextRoleTitle, completed: false },
        { user_id: user.id, dimension: 'communication', requirement_id: 'comm-1',  label: 'Deliver a director-level presentation on strategy', next_role_title: nextRoleTitle, completed: false },
        { user_id: user.id, dimension: 'communication', requirement_id: 'comm-2',  label: 'Establish relationships with 3+ senior stakeholders above your level', next_role_title: nextRoleTitle, completed: false },
        { user_id: user.id, dimension: 'communication', requirement_id: 'comm-3',  label: 'Receive exceeds-expectations performance rating', next_role_title: nextRoleTitle, completed: false },
        { user_id: user.id, dimension: 'thinking',      requirement_id: 'think-1', label: 'Apply a named strategic framework to a real business decision', next_role_title: nextRoleTitle, completed: false },
        { user_id: user.id, dimension: 'thinking',      requirement_id: 'think-2', label: 'Author a vision or strategy document adopted by your team', next_role_title: nextRoleTitle, completed: false },
      ])
    }

    return { ok: true }
  } catch (err) {
    console.error('[saveMentorForOnboardingAction]', err)
    return { ok: false, error: String(err) }
  }
}