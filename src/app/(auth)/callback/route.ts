import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { resolvePostLoginPath } from '@/lib/auth/postLoginRedirect'

function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/home'
  return next
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextRaw = searchParams.get('next') ?? '/home'
  const next = safeInternalPath(nextRaw)

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      let path = next
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: rows } = await supabase
          .from('org_memberships')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['manager', 'hr_admin', 'owner'])
        path = resolvePostLoginPath(next, rows)
      }
      return NextResponse.redirect(`${origin}${path}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
