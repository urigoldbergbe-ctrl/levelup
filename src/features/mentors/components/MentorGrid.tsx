'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import MentorCard from './MentorCard'
import MentorFilter from './MentorFilter'
import { selectMentorAction, removeSecondMentorAction } from '../actions'
import type { Leader } from '@/types'
import { cn } from '@/lib/utils/cn'

interface Props {
  leaders: Leader[]
  orgLeaders?: Leader[]
  currentMentorId?: string | null
  currentMentorId2?: string | null
}

export default function MentorGrid({
  leaders,
  orgLeaders = [],
  currentMentorId,
  currentMentorId2,
}: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [slot, setSlot] = useState<1 | 2>(currentMentorId ? 2 : 1)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const allLeaders = [...orgLeaders, ...leaders]
  const filtered = activeCategory === 'All'
    ? leaders
    : leaders.filter(l =>
        l.category === activeCategory ||
        l.category2 === activeCategory ||
        l.category3 === activeCategory
      )

  const mentor1 = allLeaders.find(l => l.id === currentMentorId)
  const mentor2 = allLeaders.find(l => l.id === currentMentorId2)

  function handleSelect(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  function handleConfirm() {
    if (!selectedId) return
    startTransition(async () => {
      await selectMentorAction(selectedId, slot)
      // Slot 2 stays on /mentors — force refresh since redirect won't re-render same page
      if (slot === 2) {
        setSelectedId(null)
        router.refresh()
      }
    })
  }

  function handleRemoveSecond() {
    startTransition(async () => {
      await removeSecondMentorAction()
      router.refresh()
    })
  }

  return (
    <div>

      {/* Current leaders banner */}
      {(mentor1 || mentor2) && (
        <div className="mb-8 p-5 bg-mist rounded-2xl border border-ink/5">
          <p className="text-xs font-body font-500 text-ink-mid uppercase tracking-wider mb-3">
            Your current leader{mentor2 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-3">
            {mentor1 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-ink/8 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <div>
                  <p className="font-body text-sm font-500 text-ink">{mentor1.name}</p>
                  <p className="font-body text-xs text-ink-faint">Primary leader</p>
                </div>
              </div>
            )}
            {mentor2 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-ink/8 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-violet" />
                <div>
                  <p className="font-body text-sm font-500 text-ink">{mentor2.name}</p>
                  <p className="font-body text-xs text-ink-faint">Second leader</p>
                </div>
                <button
                  onClick={handleRemoveSecond}
                  disabled={isPending}
                  className="ml-1 text-xs text-ink-faint hover:text-red-500 transition-colors"
                  title="Remove second leader"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Slot selector */}
          {mentor1 && !mentor2 && (
            <div className="mt-4 flex items-center gap-3">
              <p className="text-xs font-body text-ink-mid">Select below as:</p>
              <div className="flex gap-2">
                {([1, 2] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-body font-500 transition-colors border',
                      slot === s
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink-mid border-ink/15 hover:border-ink/40'
                    )}
                  >
                    {s === 1 ? 'New primary leader' : 'Add as second leader'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mentor2 && (
            <div className="mt-3 flex items-center gap-2">
              <p className="text-xs font-body text-ink-mid">Select below to:</p>
              <div className="flex gap-2">
                {([1, 2] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-body font-500 transition-colors border',
                      slot === s
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink-mid border-ink/15 hover:border-ink/40'
                    )}
                  >
                    {s === 1 ? 'Change primary' : 'Change 2nd leader'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Org leaders section */}
      {orgLeaders.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-body font-500 rounded-full">
              Your organisation
            </span>
            <div className="flex-1 h-px bg-ink/5" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {orgLeaders.map(leader => (
              <MentorCard
                key={leader.id}
                leader={leader}
                selected={selectedId === leader.id}
                isPrimary={leader.id === currentMentorId}
                isSecond={leader.id === currentMentorId2}
                dimmed={!!selectedId && selectedId !== leader.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-10 mb-4">
            <span className="text-xs font-body font-500 text-ink-faint uppercase tracking-wider">
              Global leaders
            </span>
            <div className="flex-1 h-px bg-ink/5" />
          </div>
        </div>
      )}

      <MentorFilter active={activeCategory} onChange={setActiveCategory} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(leader => (
          <MentorCard
            key={leader.id}
            leader={leader}
            selected={selectedId === leader.id}
            isPrimary={leader.id === currentMentorId}
            isSecond={leader.id === currentMentorId2}
            dimmed={!!selectedId && selectedId !== leader.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Sticky confirm bar */}
      {selectedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-6">
          <div>
            <p className="text-xs font-body text-white/50 uppercase tracking-wider">
              {slot === 1 ? 'Set as primary leader' : 'Add as second leader'}
            </p>
            <p className="font-body font-500 text-sm">
              {allLeaders.find(l => l.id === selectedId)?.name}
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-6 py-2 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors disabled:opacity-60"
          >
            {isPending ? 'Saving…' : slot === 1 ? 'Set as primary →' : 'Add second leader →'}
          </button>
          <button onClick={() => setSelectedId(null)} className="text-white/40 hover:text-white/70 text-xl leading-none">×</button>
        </div>
      )}
    </div>
  )
}
