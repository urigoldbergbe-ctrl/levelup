'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/journey', label: 'Journey' },
  { href: '/skills', label: 'Skills' },
  { href: '/readiness', label: 'Readiness' },
]

export default function TopNav({ authenticated = false }: { authenticated?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-[24px] bg-white/80 border-b border-ink/5">
      <Link href={authenticated ? '/dashboard' : '/'} className="font-display text-2xl font-500 tracking-tight text-ink">
        LevelUp
      </Link>

      {authenticated && (
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
