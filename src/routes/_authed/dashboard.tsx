import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Sparkles, Ticket, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { Countdown } from '@/components/Countdown'
import { GAME_LABELS } from '@/lib/games'
import { PLAN } from '@/lib/plan'
import { cancelMembership, getMyClub, listRaffles } from '@/server/functions'

export const Route = createFileRoute('/_authed/dashboard')({
  head: () => ({ meta: [{ title: 'Mi cuenta — Locura TCG' }] }),
  component: DashboardPage,
})

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
}

function DashboardPage() {
  const { user } = Route.useRouteContext()
  const [confirming, setConfirming] = useState(false)
  const { data, isLoading, refetch } = useQuery({ queryKey: ['club', user.id], queryFn: () => getMyClub() })
  const raffles = useQuery({ queryKey: ['raffles'], queryFn: () => listRaffles() })

  const cancel = useMutation({
    mutationFn: () => cancelMembership(),
    onSuccess: () => {
      toast.success('Membresía cancelada. Sigues participando hasta el final de tu periodo.')
      setConfirming(false)
      refetch()
    },
    onError: (e: Error) => toast.error(e?.message || 'No se pudo cancelar en este momento.'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    )
  }

  const membership = data?.membership
  const isActive = Boolean(data?.isActive)
  const past = data?.entries ?? []
  const live = (raffles.data ?? []).filter((r) => r.status === 'live')

  if (!membership) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <Sparkles className="mx-auto h-6 w-6 text-primary" />
        <h1 className="mt-5 font-display text-3xl text-foreground">Aún no eres miembro.</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Ya iniciaste sesión. Activa tu membresía y participarás automáticamente en todos los sorteos activos.
        </p>
        <Link
          to="/membership"
          className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground"
        >
          Ver la membresía
        </Link>
      </div>
    )
  }

  const firstName = String(user.full_name || '').split(' ')[0] || 'coleccionista'
  const canceled = membership.status === 'canceled'
  const status = !isActive ? 'Vencida' : canceled ? 'Cancelada' : 'Activa'
  const periodEnd = membership.current_period_end ? longDate(membership.current_period_end) : null

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <p className="serial">Mi cuenta</p>
      <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">¡Hola, {firstName}!</h1>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="serial">{PLAN.name}</p>
              <p className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                {isActive ? 'Estás participando en todos los sorteos.' : 'Tu membresía venció.'}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ring-1 ${isActive && !canceled ? 'bg-primary/15 text-primary ring-primary/30' : 'bg-secondary text-muted-foreground ring-border'}`}
            >
              {status}
            </span>
          </div>

          <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
            {!isActive
              ? `Tu periodo terminó${periodEnd ? ` el ${periodEnd}` : ''}. Renueva para volver a participar en los sorteos.`
              : canceled
                ? `Cancelaste tu membresía. Sigues participando hasta el ${periodEnd}.`
                : `Tu membresía está pagada hasta el ${periodEnd}. Renuévala antes de esa fecha para no dejar de participar.`}
          </p>

          <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/membership"
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              {isActive ? 'Agregar un mes más' : 'Renovar membresía'}
            </Link>
            <Link
              to="/raffles"
              className="flex-1 rounded-full border border-border px-5 py-2.5 text-center text-sm font-semibold text-foreground"
            >
              Ver sorteos activos
            </Link>
          </div>

          {isActive &&
            !canceled &&
            (confirming ? (
              <div className="relative mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                <p className="text-xs text-foreground">
                  ¿Cancelar tu membresía? Seguirás participando hasta el {periodEnd}.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => cancel.mutate()}
                    disabled={cancel.isPending}
                    className="rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
                  >
                    {cancel.isPending ? 'Cancelando…' : 'Sí, cancelar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-full border border-border px-4 py-2 text-xs text-foreground"
                  >
                    Mantener membresía
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="relative mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Cancelar membresía
              </button>
            ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-7">
          <p className="serial">Sorteos anteriores</p>
          {past.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aquí verás los sorteos en los que ya participaste, apenas se realice el primero.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {past.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/raffles/$raffleId"
                    params={{ raffleId: e.raffle_id }}
                    className="flex items-center gap-3 py-3 transition-colors hover:text-primary"
                  >
                    <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{e.raffle_title}</span>
                    <span className="serial shrink-0">{GAME_LABELS[e.game] || e.game}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <p className="serial">{isActive ? 'Sorteos en los que participas' : 'Sorteos activos'}</p>
          <span className="serial">{live.length} en juego</span>
        </div>
        {live.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-12 text-center">
            <Ticket className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No hay sorteos abiertos ahora mismo. Cada semana sale uno nuevo.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {live.map((r) => (
              <Link
                key={r.id}
                to="/raffles/$raffleId"
                params={{ raffleId: r.id }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                  <Ticket className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.prize_name}</p>
                  <p className="serial mt-1">
                    {GAME_LABELS[r.game] || r.game} · {isActive ? 'Participando' : 'No participas'}
                  </p>
                </div>
                <Countdown target={r.draws_at} className="shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
