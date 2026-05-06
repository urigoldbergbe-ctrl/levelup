import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = [
  '/home',
  '/dashboard',
  '/onboarding',
  '/assessment',
  '/journey',
  '/coaching',
  '/readiness',
  '/progress',
  '/mentors',
  '/skills',
  '/admin',
  '/superadmin',
]
const AUTH_ONLY = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && PROTECTED.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && AUTH_ONLY.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (user && path.startsWith('/admin')) {
    const { data: rows } = await supabase
      .from('org_memberships')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['manager', 'hr_admin', 'owner'])

    const roleList = rows?.map(r => r.role) ?? []
    const canFullAdmin = roleList.some(r => r === 'hr_admin' || r === 'owner')
    const isManager = roleList.includes('manager')

    if (isManager && !canFullAdmin && !path.startsWith('/admin/team')) {
      return NextResponse.redirect(new URL('/admin/team', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
