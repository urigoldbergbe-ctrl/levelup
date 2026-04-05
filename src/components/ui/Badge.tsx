import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  color?: 'indigo' | 'emerald' | 'amber' | 'violet'
  children: React.ReactNode
  className?: string
}

const colors = {
  indigo: 'bg-accent/10 text-accent',
  emerald: 'bg-emerald/10 text-emerald',
  amber: 'bg-amber/10 text-amber',
  violet: 'bg-violet/10 text-violet',
}

export default function Badge({ color = 'indigo', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body tracking-wide',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}
