'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export default function Card({ className, children, hover = false }: CardProps) {
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={cn('rounded-2xl bg-white shadow-sm border border-ink/5', className)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={cn('rounded-2xl bg-white shadow-sm border border-ink/5', className)}>
      {children}
    </div>
  )
}
