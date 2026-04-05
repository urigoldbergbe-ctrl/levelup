'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import MentorCard from './MentorCard'
import MentorFilter from './MentorFilter'
import { selectMentorAction } from '../actions'
import type { Leader } from '@/types'

export default function MentorGrid({ leaders }: { leaders: Leader[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filtered = activeCategory === 'All'
    ? leaders
    : leaders.filter(l => l.category === activeCategory)

  function handleSelect(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  function handleConfirm() {
    if (!selectedId) return
    startTransition(async () => {
      await selectMentorAction(selectedId)
    })
  }

  return (
    <div>
      <MentorFilter active={activeCategory} onChange={setActiveCategory} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(leader => (
          <MentorCard
            key={leader.id}
            leader={leader}
            selected={selectedId === leader.id}
            dimmed={!!selectedId && selectedId !== leader.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Sticky confirm bar */}
      {selectedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-6">
          <div>
            <p className="text-xs font-body text-white/50 uppercase tracking-wider">Selected</p>
            <p className="font-body font-500 text-sm">
              {leaders.find(l => l.id === selectedId)?.name}
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-6 py-2 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors disabled:opacity-60"
          >
            {isPending ? 'Setting up…' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  )
}
