import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { PrizeImage } from '@/components/PrizeImage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { GAME_LABELS } from '@/lib/games'
import { adminListRaffles } from '@/server/admin-functions'

export const Route = createFileRoute('/admin/')({
  component: AdminRafflesPage,
})

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-PE', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function AdminRafflesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'raffles'], queryFn: () => adminListRaffles() })

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="serial">Admin</p>
          <h1 className="mt-3 font-display text-3xl text-foreground">Sorteos</h1>
        </div>
        <Link
          to="/admin/raffles/new"
          className="glow-ion inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nuevo sorteo
        </Link>
      </div>

      {data && (
        <dl className="mt-8 grid grid-cols-3 gap-4 sm:max-w-xl">
          {[
            { label: 'Cuentas', value: data.stats.users },
            { label: 'Miembros activos', value: data.stats.members },
            { label: 'Boletos jugados', value: data.stats.entries },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <dt className="serial">{s.label}</dt>
              <dd className="mt-2 font-heading text-2xl font-bold text-foreground">{s.value.toLocaleString('es-PE')}</dd>
            </div>
          ))}
        </dl>
      )}

      {isLoading ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl border border-border bg-card" />
      ) : (
        <div className="mt-8 space-y-3">
          {data?.raffles.map((r) => (
            <Link
              key={r.id}
              to="/admin/raffles/$raffleId"
              params={{ raffleId: r.id }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <PrizeImage src={r.prize_image} alt={r.prize_name} className="h-14 w-14 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.prize_name}</p>
                <p className="serial mt-1">
                  {GAME_LABELS[r.game] || r.game} · {r.entry_cost_points} pts/boleto · {r.entries_count} boletos
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="serial">{r.status === 'drawn' ? 'Sorteado' : 'Se sortea'}</p>
                <p className="mt-1 font-mono text-xs text-foreground">{formatDate(r.draws_at)}</p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
          {data?.raffles.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Aún no hay sorteos. Crea el primero.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
