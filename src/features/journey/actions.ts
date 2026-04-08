'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function markResourceCompleteAction(
  semester: number,
  type: 'book' | 'course' | 'podcast' | 'milestone',
  value: string | boolean
) {
  const user = await getUser()
  if (!user) redirect('/login')

  const admin = getSupabaseAdminClient()

  const { data: existing } = await admin
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('semester', semester)
    .single()

  if (existing) {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (type === 'book') {
      const books = existing.books_completed as string[]
      update.books_completed = books.includes(value as string)
        ? books.filter(b => b !== value)
        : [...books, value]
    } else if (type === 'course') update.course_completed = value
    else if (type === 'podcast') update.podcast_scheduled = value
    else if (type === 'milestone') update.milestone_achieved = value

    await admin.from('progress').update(update).eq('id', existing.id)
  } else {
    await admin.from('progress').insert({
      user_id: user.id,
      semester,
      books_completed: type === 'book' ? [value] : [],
      course_completed: type === 'course' ? value : false,
      podcast_scheduled: type === 'podcast' ? value : false,
      milestone_achieved: type === 'milestone' ? value : false,
    })
  }

  revalidatePath('/journey')
  revalidatePath('/home')
}
