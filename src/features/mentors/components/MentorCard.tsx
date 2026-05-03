'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { Leader } from '@/types'

interface MentorCardProps {
  leader: Leader
  selected?: boolean
  isPrimary?: boolean
  isSecond?: boolean
  dimmed?: boolean
  onSelect: (id: string) => void
}

export default function MentorCard({ leader, selected, isPrimary, isSecond, dimmed, onSelect }: MentorCardProps) {
  const [showBio, setShowBio] = useState(false)

  return (
    <motion.button
      onClick={() => onSelect(leader.id)}
      onMouseEnter={() => leader.bio && setShowBio(true)}
      onMouseLeave={() => setShowBio(false)}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative w-full text-left rounded-2xl overflow-hidden cursor-pointer focus:outline-none',
        'aspect-[2/3] bg-ink',
        selected && 'ring-2 ring-accent ring-offset-2',
        dimmed && 'opacity-35'
      )}
    >
      {/* Portrait / gradient background */}
      {leader.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={leader.photo_url}
          alt={leader.name}
          className="absolute inset-0 w-full h-full object-cover object-top brightness-[0.72] saturate-[0.9]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${leader.g1} 0%, ${leader.g2} 100%)` }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.88)] via-transparent to-[rgba(0,0,0,0.2)]" />

      {/* Active leader badges */}
      {isPrimary && !selected && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-body font-500 z-10">
          Primary
        </div>
      )}
      {isSecond && !selected && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-violet text-white text-[10px] font-body font-500 z-10">
          2nd
        </div>
      )}
      {selected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-accent z-10">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}

      {/* Bio overlay — slides up on hover */}
      <AnimatePresence>
        {showBio && leader.bio && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/50 flex flex-col justify-end p-4 z-20"
          >
            <p className="text-[10px] font-body font-500 tracking-[0.12em] text-white/50 uppercase mb-1">
              {leader.company}
            </p>
            <p className="font-display text-base font-500 text-white leading-tight mb-2">
              {leader.name}
            </p>
            <p className="font-body text-xs text-white/75 leading-relaxed line-clamp-6">
              {leader.bio}
            </p>
            <p className="font-body text-[10px] text-accent mt-3 font-500">
              Click to select →
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default content (shown when bio not hovered) */}
      <div className={cn('absolute bottom-0 left-0 right-0 p-4 transition-opacity', showBio && leader.bio ? 'opacity-0' : 'opacity-100')}>
        <p className="text-[10px] font-body font-500 tracking-[0.12em] text-white/50 uppercase mb-1">
          {leader.company}
        </p>
        <p className="font-display text-xl font-500 text-white leading-tight">
          {leader.name}
        </p>
        <p className="text-xs font-body text-white/60 mt-0.5 leading-snug line-clamp-2">
          {leader.title}
        </p>
        {/* Category badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="px-1.5 py-0.5 bg-white/15 rounded text-[9px] font-body font-500 text-white/70 uppercase tracking-wide">
            {leader.category}
          </span>
          {leader.category2 && (
            <span className="px-1.5 py-0.5 bg-white/8 rounded text-[9px] font-body text-white/40 uppercase tracking-wide">
              {leader.category2}
            </span>
          )}
          {leader.category3 && (
            <span className="px-1.5 py-0.5 bg-white/8 rounded text-[9px] font-body text-white/40 uppercase tracking-wide">
              {leader.category3}
            </span>
          )}
        </div>
        {leader.bio && (
          <p className="text-[10px] font-body text-white/25 mt-1.5">Hover for bio</p>
        )}
      </div>
    </motion.button>
  )
}
