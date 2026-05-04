'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const NAV_LINKS: {
  href: string
  label: string
  tabLabel?: string
  icon: string
  tourLabel?: string
}[] = [
  { href: '/home',     label: 'Home',      tabLabel: 'Home',    icon: '⌂' },
  { href: '/mentors',  label: 'Mentors',   icon: '◈' },
  { href: '/progress', label: 'Progress',  tabLabel: 'Progress', icon: '◉', tourLabel: 'Progress' },
  { href: '/journey',  label: 'Journey',   icon: '◷', tourLabel: 'Journey' },
  { href: '/coaching', label: 'Coaching',  tabLabel: 'Coach',    icon: '◇', tourLabel: 'Coaching' },
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
      <nav className="hidden md:flex sticky top-0 z-50 items-center justify-between px-8 h-[64px] bg-white/90 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <Link
          href={authenticated ? '/home' : '/'}
          className="flex items-center gap-2.5 mr-8 group"
        >
          <Image
            src="/logo.png"
            alt="LevelUp"
            width={36}
            height={36}
            className="rounded-xl group-hover:scale-105 transition-transform duration-200"
          />
          <span className="font-body font-700 text-lg tracking-tight text-ink">
            LevelUp
          </span>
        </Link>

        {/* Nav links */}
        {authenticated && (
          <div className="flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(link => {
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-tour-nav={link.tourLabel}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-body font-500 transition-all duration-200',
                    active
                      ? 'text-mckinsey-blue nav-active'
                      : 'text-ink-mid hover:text-ink hover:bg-black/[0.04]'
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
              className="px-3 py-1.5 text-xs font-body font-500 text-accent border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors"
            >
              Admin
            </Link>
          )}

          {authenticated && (
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 text-ink-faint hover:text-ink-mid transition-colors rounded-lg hover:bg-black/[0.04]"
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
              className="px-5 py-2 text-sm font-body font-600 text-white rounded-xl transition-all duration-200 btn-brand"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* ── Mobile: top bar ──────────────────────────────────── */}
      <nav className="md:hidden flex sticky top-0 z-50 items-center justify-between px-5 h-[56px] bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <Link href={authenticated ? '/home' : '/'} className="flex items-center gap-2">
          <Image src="/logo.png" alt="LevelUp" width={30} height={30} className="rounded-lg" />
          <span className="font-body font-700 text-base text-ink">LevelUp</span>
        </Link>
        {!authenticated && (
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm font-body font-600 text-white rounded-lg btn-brand"
          >
            Sign in
          </Link>
        )}
        {authenticated && isAdmin && (
          <Link href="/superadmin" className="text-xs font-body text-accent px-3 py-1.5 border border-accent/20 rounded-lg">
            Admin
          </Link>
        )}
      </nav>

      {/* ── Mobile: bottom tab bar ───────────────────────────── */}
      {authenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center bg-white/95 backdrop-blur-xl border-t border-black/[0.06] pb-safe">
          {NAV_LINKS.map(link => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                data-tour-nav={link.tourLabel}
                className={cn(
                  'relative flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors duration-200',
                  active ? 'text-mckinsey-blue' : 'text-ink-faint hover:text-ink-mid'
                )}
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span className="text-[9px] font-body font-500 leading-none">{link.tabLabel ?? link.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-mckinsey-blue" />
                )}
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
