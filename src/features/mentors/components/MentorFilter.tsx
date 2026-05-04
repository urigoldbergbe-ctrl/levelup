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
            'px-4 py-1.5 text-xs font-body font-500 tracking-wide transition-all duration-200',
            active === cat
              ? 'bg-mckinsey-blue text-white border border-mckinsey-blue'
              : 'bg-white text-ink-mid border border-black/[0.12] hover:border-mckinsey-blue/30 hover:text-mckinsey-blue hover:bg-mckinsey-light'
          )}
          style={{ borderRadius: '2px' }}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
