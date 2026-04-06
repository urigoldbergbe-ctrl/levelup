'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/superadmin', label: 'Overview', exact: true },
  { href: '/superadmin/orgs', label: 'Organizations' },
  { href: '/superadmin/users', label: 'Users' },
  { href: '/superadmin/leaders', label: 'Leaders' },
  { href: '/superadmin/library', label: 'Content Library' },
  { href: '/superadmin/assessments', label: 'Assessments' },
]

export default function SuperAdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {NAV.map(item => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 rounded-lg text-sm font-body transition-colors',
              active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
