'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { Leader } from '@/types'

interface MentorCardProps {
  leader: Leader
  selected?: boolean
  dimmed?: boolean
  onSelect: (id: string) => void
}

export default function MentorCard({ leader, selected, dimmed, onSelect }: MentorCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(leader.id)}
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
          className="absolute inset-0 w-full h-full object-cover object-top brightness-[0.32] saturate-[0.6]"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${leader.g1} 0%, ${leader.g2} 100%)` }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.88)] via-transparent to-[rgba(0,0,0,0.2)]" />

      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-accent">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[10px] font-body font-500 tracking-[0.12em] text-white/50 uppercase mb-1">
          {leader.company}
        </p>
        <p className="font-display text-xl font-500 text-white leading-tight">
          {leader.name}
        </p>
        <p className="text-xs font-body text-white/60 mt-0.5 leading-snug line-clamp-2">
          {leader.title}
        </p>
      </div>
    </motion.button>
  )
}
