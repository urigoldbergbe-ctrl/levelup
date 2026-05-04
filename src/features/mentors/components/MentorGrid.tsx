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
        <div className="mb-8 p-5 glass-card">
          <p className="text-[10px] font-body font-600 text-ink-faint uppercase tracking-widest mb-3">
            {mentor2 ? 'Your current mentors' : 'Your current mentor'}
          </p>
          <div className="flex flex-wrap gap-3">
            {mentor1 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-mckinsey-light border border-mckinsey-blue/20 rounded-sm">
                <div className="w-2 h-2 rounded-full bg-mckinsey-blue" />
                <div>
                  <p className="font-body text-sm font-600 text-ink">{mentor1.name}</p>
                  <p className="font-body text-xs text-ink-faint">Primary mentor</p>
                </div>
              </div>
            )}
            {mentor2 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-mist border border-black/[0.08] rounded-sm">
                <div className="w-2 h-2 rounded-full bg-mckinsey-teal" />
                <div>
                  <p className="font-body text-sm font-600 text-ink">{mentor2.name}</p>
                  <p className="font-body text-xs text-ink-faint">Second mentor</p>
                </div>
                <button
                  onClick={handleRemoveSecond}
                  disabled={isPending}
                  className="ml-1 text-xs text-ink-faint hover:text-red-500 transition-colors"
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
              <p className="text-xs font-body text-ink-faint">Select below as:</p>
              <div className="flex gap-2">
                {([1, 2] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-body font-500 transition-all duration-200 border',
                      slot === s
                        ? 'bg-mckinsey-blue text-white border-mckinsey-blue'
                        : 'bg-white text-ink-mid border-black/[0.12] hover:border-mckinsey-blue/30 hover:text-mckinsey-blue'
                    )}
                    style={{ borderRadius: '2px' }}
                  >
                    {s === 1 ? 'New primary mentor' : 'Add as second mentor'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mentor2 && (
            <div className="mt-3 flex items-center gap-2">
              <p className="text-xs font-body text-ink-faint">Select below to:</p>
              <div className="flex gap-2">
                {([1, 2] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-body font-500 transition-all duration-200 border',
                      slot === s
                        ? 'bg-mckinsey-blue text-white border-mckinsey-blue'
                        : 'bg-white text-ink-mid border-black/[0.12] hover:border-mckinsey-blue/30 hover:text-mckinsey-blue'
                    )}
                    style={{ borderRadius: '2px' }}
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
            <span className="px-3 py-1 bg-mckinsey-light text-mckinsey-blue text-xs font-body font-600 border border-mckinsey-blue/20" style={{ borderRadius: '2px' }}>
              Your organisation
            </span>
            <div className="flex-1 h-px bg-black/[0.07]" />
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
            <span className="text-xs font-body font-600 text-ink-faint uppercase tracking-widest">
              Global mentors
            </span>
            <div className="flex-1 h-px bg-black/[0.07]" />
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
        <div className="fixed bottom-6 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-black/[0.12] shadow-lg px-6 py-4 flex items-center gap-6 animate-fade-up" style={{ borderRadius: '2px', borderTop: '3px solid #002F6C' }}>
          <div>
            <p className="text-[10px] font-body font-600 text-ink-faint uppercase tracking-widest">
              {slot === 1 ? 'Set as primary mentor' : 'Add as second mentor'}
            </p>
            <p className="font-body font-600 text-sm text-ink">
              {allLeaders.find(l => l.id === selectedId)?.name}
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-6 py-2.5 btn-brand text-white text-sm font-body font-600 disabled:opacity-60"
            style={{ borderRadius: '2px' }}
          >
            {isPending ? 'Saving…' : slot === 1 ? 'Set as primary →' : 'Add second mentor →'}
          </button>
          <button onClick={() => setSelectedId(null)} className="text-ink-faint hover:text-ink text-xl leading-none">×</button>
        </div>
      )}
    </div>
  )
}
