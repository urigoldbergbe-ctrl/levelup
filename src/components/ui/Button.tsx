'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-accent text-white shadow-accent hover:bg-accent-mid',
  secondary: 'bg-white text-ink border border-ink/20 hover:border-ink/40',
  ghost: 'bg-transparent text-ink hover:bg-mist',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-body font-500 tracking-[0.03em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
}
