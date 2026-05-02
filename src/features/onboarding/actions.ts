'use server'

import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

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