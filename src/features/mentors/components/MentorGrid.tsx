'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import MentorCard from './MentorCard'
import MentorFilter from './MentorFilter'
import { selectMentorAction, removeSecondMentorAction } from '../actions'
import { saveMentorForOnboardingAction } from '@/features/onboarding/actions'
import type { Leader } from '@/types'
import { cn } from '@/lib/utils/cn'

interface Props {
  leaders: Leader[]
  orgLeaders?: Leader[]
  currentMentorId?: string | null
  currentMentorId2?: string | null
  /** When provided, clicking a card calls this instead of the normal save flow */
  onSelect?: (id: string) => void
}

export default function MentorGrid({
  leaders,
  orgLeaders = [],
  currentMentorId,
  currentMentorId2,
  onSelect: onSelectOverride,
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
    if (onSelectOverride) {
      // In onboarding mode: silently save mentor (no redirect) then advance client step
      startTransition(async () => {
        await saveMentorForOnboardingAction(id)
        onSelectOverride(id)
      })
      return
    }
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

      {/* Current mentors banner */}
      {(mentor1 || mentor2) && (
        <div className="mb-8 p-5 glass-card rounded-2xl">
          <p className="text-xs font-body font-500 text-white/40 uppercase tracking-wider mb-3">
            {mentor2 ? 'Your current mentors' : 'Your current mentor'}
          </p>
          <div className="flex flex-wrap gap-3">
            {mentor1 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.05] rounded-xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <div>
                  <p className="font-body text-sm font-500 text-white">{mentor1.name}</p>
                  <p className="font-body text-xs text-white/30">Primary mentor</p>
                </div>
              </div>
            )}
            {mentor2 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.05] rounded-xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-violet" />
                <div>
                  <p className="font-body text-sm font-500 text-white">{mentor2.name}</p>
                  <p className="font-body text-xs text-white/30">Second mentor</p>
                </div>
                <button
                  onClick={handleRemoveSecond}
                  disabled={isPending}
                  className="ml-1 text-xs text-white/30 hover:text-red-400 transition-colors"
                  title="Remove second mentor"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Slot selector */}
          {mentor1 && !mentor2 && (
            <div className="mt-4 flex items-center gap-3">
              <p className="text-xs font-body text-white/30">Select below as:</p>
              <div className="flex gap-2">
                {([1, 2] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-body font-500 transition-all duration-200 border',
                      slot === s
                        ? 'bg-white text-cinema-bg border-white'
                        : 'bg-white/[0.04] text-white/40 border-white/10 hover:border-white/20 hover:text-white/60'
                    )}
                  >
                    {s === 1 ? 'New primary mentor' : 'Add as second mentor'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mentor2 && (
            <div className="mt-3 flex items-center gap-2">
              <p className="text-xs font-body text-white/30">Select below to:</p>
              <div className="flex gap-2">
                {([1, 2] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-body font-500 transition-all duration-200 border',
                      slot === s
                        ? 'bg-white text-cinema-bg border-white'
                        : 'bg-white/[0.04] text-white/40 border-white/10 hover:border-white/20 hover:text-white/60'
                    )}
                  >
                    {s === 1 ? 'Change primary' : 'Change 2nd mentor'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Org mentors section */}
      {orgLeaders.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-body font-500 rounded-full border border-accent/20">
              Your organisation
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
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
            <span className="text-xs font-body font-500 text-white/25 uppercase tracking-wider">
              Global mentors
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
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
        <div className="fixed bottom-6 md:bottom-6 bottom-24 left-1/2 -translate-x-1/2 z-50 glass-card rounded-2xl shadow-poster px-6 py-4 flex items-center gap-6 animate-fade-up border border-accent/20">
          <div>
            <p className="text-xs font-body text-white/40 uppercase tracking-wider">
              {slot === 1 ? 'Set as primary mentor' : 'Add as second mentor'}
            </p>
            <p className="font-body font-600 text-sm text-white">
              {allLeaders.find(l => l.id === selectedId)?.name}
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-6 py-2.5 bg-accent text-white text-sm font-body font-600 rounded-xl hover:shadow-accent hover:scale-105 transition-all duration-300 disabled:opacity-60"
          >
            {isPending ? 'Saving…' : slot === 1 ? 'Set as primary →' : 'Add second mentor →'}
          </button>
          <button onClick={() => setSelectedId(null)} className="text-white/30 hover:text-white/60 text-xl leading-none">×</button>
        </div>
      )}
    </div>
  )
}
