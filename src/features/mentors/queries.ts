import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getUserMentor(userId: string) {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('mentor_id')
    .eq('id', userId)
    .single()
  return data?.mentor_id ?? null
}
