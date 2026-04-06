import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Per-request server Supabase client.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}

/** Get the currently authenticated user, or null. */
export async function getUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** Get the user's profile row from public.profiles. */
export async function getUserProfile(userId: string) {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}
