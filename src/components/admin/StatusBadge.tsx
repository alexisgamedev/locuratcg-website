import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  draft: 'bg-secondary text-muted-foreground ring-border',
  live: 'bg-primary/15 text-primary ring-primary/30',
  drawn: 'bg-gold/15 text-gold ring-gold/40',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ring-1',
        STYLES[status] ?? STYLES.draft,
      )}
    >
      {status}
    </span>
  )
}
