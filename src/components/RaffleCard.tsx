import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Users } from 'lucide-react'
import { GAME_LABELS } from '@/lib/games'
import type { Raffle } from '@/lib/types'
import { Countdown } from './Countdown'
import { PrizeImage } from './PrizeImage'

/** "1 miembro participa" / "24 miembros participan" */
export function participantsLabel(count: number) {
  const n = Number(count || 0)
  return n === 1 ? '1 miembro participa' : `${n.toLocaleString('es-PE')} miembros participan`
}

export function RaffleCard({ raffle }: { raffle: Raffle }) {
  const value = Number(raffle.retail_value || 0)

  return (
    <Link
      to="/raffles/$raffleId"
      params={{ raffleId: raffle.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:glow-ion"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <PrizeImage
          src={raffle.prize_image}
          alt={raffle.prize_name}
          className="h-full w-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
            {GAME_LABELS[raffle.game] || raffle.game}
          </span>
          <span className="rounded-full bg-gold/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-gold ring-1 ring-gold/40">
            US${value.toLocaleString('es-PE')}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="serial">{raffle.kicker || 'Sorteo activo'}</p>
        <h3 className="mt-2 font-heading text-lg font-semibold leading-snug text-foreground">{raffle.prize_name}</h3>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">{participantsLabel(raffle.entries_count)}</span>
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="serial">Se sortea en</span>
          <Countdown target={raffle.draws_at} />
        </div>
      </div>
    </Link>
  )
}
