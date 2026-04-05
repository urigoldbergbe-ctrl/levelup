'use server'

import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { LEADERS } from '@/data/leaders'

export async function selectMentorAction(mentorId: string) {
  const user = await getUser()
  if (!user) redirect('/login')

  const mentor = LEADERS.find(l => l.id === mentorId)
  if (!mentor) throw new Error('Leader not found')

  const admin = getSupabaseAdminClient()

  // Update profile
  await admin
    .from('profiles')
    .update({ mentor_id: mentorId })
    .eq('id', user.id)

  // Seed default checklist items for this user based on mentor's second career role
  const nextRole = mentor.career_ladder[1]
  const existingItems = await admin
    .from('checklist_items')
    .select('id')
    .eq('user_id', user.id)

  if (!existingItems.data?.length) {
    const defaultItems = [
      { dimension: 'technical', requirement_id: 'tech-1', label: `Lead a project specific to ${nextRole.title} at ${nextRole.co}` },
      { dimension: 'technical', requirement_id: 'tech-2', label: 'Drive cross-functional initiative with measurable business impact' },
      { dimension: 'technical', requirement_id: 'tech-3', label: 'Build and present a financial model or business case to leadership' },
      { dimension: 'communication', requirement_id: 'comm-1', label: `Deliver a director-level presentation on strategy` },
      { dimension: 'communication', requirement_id: 'comm-2', label: 'Establish relationships with 3+ senior stakeholders above your level' },
      { dimension: 'communication', requirement_id: 'comm-3', label: 'Receive exceeds-expectations performance rating' },
      { dimension: 'thinking', requirement_id: 'think-1', label: 'Apply a named strategic framework to a real business decision' },
      { dimension: 'thinking', requirement_id: 'think-2', label: 'Author a vision or strategy document adopted by your team' },
    ]

    await admin.from('checklist_items').insert(
      defaultItems.map(item => ({
        ...item,
        user_id: user.id,
        next_role_title: nextRole.title,
        completed: false,
      }))
    )
  }

  redirect('/assessment')
}
