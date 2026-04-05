'use client'

import { cn } from '@/lib/utils/cn'
import type { LeaderCategory } from '@/types'

const CATEGORIES: Array<'All' | LeaderCategory> = [
  'All', 'Strategy', 'Marketing', 'Sales', 'Product', 'Data', 'HR', 'Operations', 'Engineering',
]

interface MentorFilterProps {
  active: string
  onChange: (cat: string) => void
}

export default function MentorFilter({ active, onChange }: MentorFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs font-body font-500 tracking-wide transition-colors',
            active === cat
              ? 'bg-ink text-white'
              : 'bg-white border border-ink/15 text-ink-mid hover:border-ink/40 hover:text-ink'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
