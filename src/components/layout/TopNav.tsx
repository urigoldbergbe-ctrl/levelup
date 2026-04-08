'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const NAV_LINKS: {
  href: string
  label: string
  /** Shorter label for the mobile tab bar (6 tabs) */
  tabLabel?: string
  icon: string
}[] = [
  { href: '/dashboard',  label: 'Dashboard',  icon: '⌂' },
  { href: '/mentors',    label: 'Leaders',     icon: '◈' },
  { href: '/assessment', label: 'Assessment',  tabLabel: 'Assess', icon: '◎' },
  { href: '/journey',    label: 'Journey',     icon: '◷' },
  { href: '/coaching',   label: 'Coaching',    tabLabel: 'Coach', icon: '◇' },
  { href: '/readiness',  label: 'Progress',    icon: '◉' },
]

export default function TopNav({
  authenticated = false,
  isAdmin = false,
}: {
  authenticated?: boolean
  isAdmin?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* ── Desktop top bar ─────────────────────────────────── */}
      <nav className="hidden md:flex sticky top-0 z-50 items-center justify-between px-8 h-[64px] bg-cinema-bg/80 backdrop-blur-2xl border-b border-white/[0.06]">
        {/* Logo */}
        <Link
          href={authenticated ? '/dashboard' : '/'}
          className="font-display text-2xl font-500 tracking-tight text-white hover:text-glow transition-all duration-300 mr-8"
        >
          LevelUp
        </Link>

        {/* Nav links */}
        {authenticated && (
          <div className="flex items-center gap-1 flex-1">
            {NAV_LINKS.map(link => {
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-body font-500 transition-all duration-200',
                    active
                      ? 'text-white nav-active'
                      : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {authenticated && isAdmin && (
            <Link
              href="/superadmin"
              className="px-3 py-1.5 text-xs font-body font-500 text-accent-mid border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors"
            >
              Admin
            </Link>
          )}

          {authenticated && (
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}

          {!authenticated && (
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-body font-500 text-white border border-white/15 rounded-xl hover:bg-white/[0.06] hover:border-white/25 transition-all duration-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* ── Mobile: top bar (logo + sign in) ────────────────── */}
      <nav className="md:hidden flex sticky top-0 z-50 items-center justify-between px-5 h-[56px] bg-cinema-bg/90 backdrop-blur-2xl border-b border-white/[0.06]">
        <Link
          href={authenticated ? '/dashboard' : '/'}
          className="font-display text-xl font-500 text-white"
        >
          LevelUp
        </Link>
        {!authenticated && (
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm font-body text-white border border-white/15 rounded-lg"
          >
            Sign in
          </Link>
        )}
        {authenticated && isAdmin && (
          <Link href="/superadmin" className="text-xs font-body text-accent-mid px-3 py-1.5 border border-accent/20 rounded-lg">
            Admin
          </Link>
        )}
      </nav>

      {/* ── Mobile: bottom tab bar ───────────────────────────── */}
      {authenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center bg-cinema-bg/95 backdrop-blur-2xl border-t border-white/[0.08] pb-safe">
          {NAV_LINKS.map(link => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors duration-200',
                  active ? 'text-accent' : 'text-white/30 hover:text-white/60'
                )}
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span className="text-[9px] font-body font-500 leading-none">{link.tabLabel ?? link.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full shadow-glow" />
                )}
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
