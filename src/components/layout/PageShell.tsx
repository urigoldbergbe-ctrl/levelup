import { cn } from '@/lib/utils/cn'

export default function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn('max-w-7xl mx-auto px-6 py-12', className)}>
      {children}
    </main>
  )
}
