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
            'px-4 py-1.5 rounded-full text-xs font-body font-500 tracking-wide transition-all duration-200',
            active === cat
              ? 'bg-white text-cinema-bg shadow-sm'
              : 'bg-white/[0.04] border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70 hover:bg-white/[0.07]'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
