import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Ticket } from 'lucide-react'
import { GAME_LABELS } from '@/lib/games'
import type { Raffle } from '@/lib/types'
import { Countdown } from './Countdown'
import { PrizeImage } from './PrizeImage'

export function progressPercent(raffle: Pick<Raffle, 'entries_count' | 'entry_goal'>) {
  const goal = Number(raffle.entry_goal) || 500
  return Math.min(100, Math.round((Number(raffle.entries_count || 0) / goal) * 100))
}

export function RaffleCard({ raffle }: { raffle: Raffle }) {
  const entries = Number(raffle.entries_count || 0)
  const pct = progressPercent(raffle)
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
            ${value.toLocaleString('en-US')}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="serial">{raffle.kicker || 'Live raffle'}</p>
        <h3 className="mt-2 font-heading text-lg font-semibold leading-snug text-foreground">{raffle.prize_name}</h3>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
          <Ticket className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs tracking-wide text-foreground">{raffle.entry_cost_points} pts</span>
          <span className="text-xs text-muted-foreground">per entry</span>
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono">{entries.toLocaleString('en-US')} entries</span>
            <span className="font-mono">{pct}% to full</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-holo transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="serial">Closes in</span>
            <Countdown target={raffle.draws_at} />
          </div>
        </div>
      </div>
    </Link>
  )
}
