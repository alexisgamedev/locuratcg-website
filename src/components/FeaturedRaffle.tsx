import { Link } from '@tanstack/react-router'
import { ArrowRight, Users } from 'lucide-react'
import { GAME_LABELS } from '@/lib/games'
import type { Raffle } from '@/lib/types'
import { useCountdown } from './Countdown'
import { PrizeImage } from './PrizeImage'
import { participantsLabel } from './RaffleCard'

/** The live raffle with the most valuable prize; ties go to the one that draws first. */
export function pickFeaturedRaffle(raffles: Raffle[]) {
  const live = raffles.filter((r) => r.status === 'live')
  if (live.length === 0) return null
  return live.reduce((best, r) => {
    const diff = Number(r.retail_value || 0) - Number(best.retail_value || 0)
    if (diff !== 0) return diff > 0 ? r : best
    if (!best.draws_at) return r
    if (!r.draws_at) return best
    return r.draws_at < best.draws_at ? r : best
  })
}

function BigCountdown({ target }: { target: string | null }) {
  const left = useCountdown(target)
  const parts = [
    { v: left?.d, l: 'días' },
    { v: left?.h, l: 'horas' },
    { v: left?.m, l: 'min' },
    { v: left?.s, l: 'seg' },
  ]
  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Tiempo restante para el sorteo">
      {parts.map((p) => (
        <div key={p.l} className="rounded-xl border border-border bg-background/70 px-1 py-2.5 text-center">
          <p className="font-mono text-xl font-bold tabular-nums text-foreground sm:text-2xl">
            {p.v === undefined ? '--' : String(p.v).padStart(2, '0')}
          </p>
          <p className="serial mt-1 !text-[0.55rem]">{p.l}</p>
        </div>
      ))}
    </div>
  )
}

/** Hero widget: the most important live raffle, with its countdown and how many members are in. */
export function FeaturedRaffle({ raffle }: { raffle: Raffle | null }) {
  if (!raffle) {
    return (
      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="relative rounded-[1.75rem] border border-dashed border-border bg-card/60 px-8 py-16 text-center">
          <p className="serial">Sorteo semanal</p>
          <p className="mt-4 font-heading text-xl font-semibold text-foreground">El próximo sorteo está por salir.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cada semana sale un nuevo premio. Con tu membresía activa participas sin hacer nada más.
          </p>
        </div>
      </div>
    )
  }

  const value = Number(raffle.retail_value || 0)
  const drawDate = raffle.draws_at
    ? new Date(raffle.draws_at).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Lima' })
    : null

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-holo/20 blur-2xl" />
      <Link
        to="/raffles/$raffleId"
        params={{ raffleId: raffle.id }}
        className="group relative block overflow-hidden rounded-[1.75rem] border border-border bg-card/80 p-3 transition-colors hover:border-primary/40"
      >
        <div className="relative overflow-hidden rounded-[1.25rem]">
          <PrizeImage
            src={raffle.prize_image}
            alt={raffle.prize_name}
            className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              En vivo
            </span>
            <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-gold ring-1 ring-gold/40 backdrop-blur">
              US${value.toLocaleString('es-PE')}
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {raffle.kicker || 'Sorteo de la semana'} · {GAME_LABELS[raffle.game] || raffle.game}
            </p>
            <p className="mt-1.5 font-heading text-lg font-semibold leading-snug text-white sm:text-xl">
              {raffle.prize_name}
            </p>
          </div>
        </div>

        <div className="px-2 pb-2 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="serial">Se sortea en</span>
            {drawDate && <span className="serial normal-case tracking-normal">Sorteo: {drawDate}</span>}
          </div>
          <div className="mt-2.5">
            <BigCountdown target={raffle.draws_at} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
              {participantsLabel(raffle.entries_count)}
            </span>
            <span className="glow-ion inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform group-hover:-translate-y-0.5">
              Ver sorteo
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
