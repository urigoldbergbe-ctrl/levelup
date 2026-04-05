'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function updateSkillScoreAction(
  skillName: string,
  dimension: string,
  newPct: number,
) {
  const user = await getUser()
  if (!user) redirect('/login')

  const clamped = Math.max(0, Math.min(100, Math.round(newPct)))

  const admin = getSupabaseAdminClient()
  await admin
    .from('skill_scores')
    .update({ current_pct: clamped })
    .eq('user_id', user.id)
    .eq('skill_name', skillName)
    .eq('dimension', dimension)

  revalidatePath('/skills')
}
