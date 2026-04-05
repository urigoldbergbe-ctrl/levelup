'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/journey', label: 'Journey' },
  { href: '/skills', label: 'Skills' },
  { href: '/readiness', label: 'Readiness' },
]

export default function TopNav({ authenticated = false, isAdmin = false }: { authenticated?: boolean; isAdmin?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-[24px] bg-white/80 border-b border-ink/5">
      <Link href={authenticated ? '/dashboard' : '/'} className="font-display text-2xl font-500 tracking-tight text-ink">
        LevelUp
      </Link>

      {authenticated && (
        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-body font-500 transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-accent/8 text-accent'
                    : 'text-ink-mid hover:text-ink hover:bg-mist'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {isAdmin && (
            <Link
              href="/superadmin"
              className="px-3 py-2 text-sm font-body text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
              title="Platform admin"
            >
              Platform Admin
            </Link>
          )}

          {/* Separator + sign out */}
          <div className="hidden md:block w-px h-5 bg-ink/10 mx-2" />
          <button
            onClick={handleSignOut}
            className="px-3 py-2 text-sm font-body text-ink-faint hover:text-ink-mid transition-colors rounded-lg hover:bg-mist"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}

      {!authenticated && (
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-body text-ink-mid hover:text-ink transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-accent text-white text-sm font-body rounded-xl hover:bg-accent-mid transition-colors"
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  )
}
