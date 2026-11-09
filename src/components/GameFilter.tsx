import { GAME_FILTERS } from '@/lib/games'
import { cn } from '@/lib/utils'

export type GameFilterId = (typeof GAME_FILTERS)[number]['id']

export function GameFilter({ value, onChange }: { value: GameFilterId; onChange: (v: GameFilterId) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {GAME_FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            'whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors',
            value === f.id
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border bg-card/50 text-muted-foreground hover:text-foreground',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
