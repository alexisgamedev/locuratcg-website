import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Coins, Minus, Plus, Ticket, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { Countdown } from '@/components/Countdown'
import { PrizeImage } from '@/components/PrizeImage'
import { progressPercent } from '@/components/RaffleCard'
import { SiteLayout } from '@/components/SiteLayout'
import { useAuth } from '@/lib/auth'
import { GAME_LABELS } from '@/lib/games'
import type { Raffle } from '@/lib/types'
import { cn } from '@/lib/utils'
import { enterRaffle, getMyClub, getRaffle } from '@/server/functions'

const MAX_PER_ORDER = 20

export const Route = createFileRoute('/raffles/$raffleId')({
  loader: ({ params }) => getRaffle({ data: { id: params.raffleId } }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.prize_name} — Pull Club` : 'Raffle — Pull Club' }],
  }),
  component: RafflePage,
})

function Skeleton() {
  return <div className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
}

function EntryPanel({ raffle }: { raffle: Raffle }) {
  const { isAuthenticated, isLoadingAuth, navigateToLogin, user } = useAuth()
  const queryClient = useQueryClient()
  const [count, setCount] = useState(1)

  const club = useQuery({ queryKey: ['club', user?.id], queryFn: () => getMyClub(), enabled: isAuthenticated })
  const membership = club.data?.membership
  const balance = Number(membership?.points_balance ?? 0)
  const total = Number(raffle.entry_cost_points || 0) * count
  const affordable = balance >= total

  const enter = useMutation({
    mutationFn: () => enterRaffle({ data: { raffleId: raffle.id, entries: count } }),
    onSuccess: () => {
      toast.success(`${count} ${count === 1 ? 'entry' : 'entries'} locked in. Good luck.`)
      queryClient.invalidateQueries({ queryKey: ['club'] })
      queryClient.invalidateQueries({ queryKey: ['raffle', raffle.id] })
    },
    onError: (e: Error) => toast.error(e?.message || "That didn't go through."),
  })

  if (raffle.status !== 'live') {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="serial">Drawing closed</p>
        <p className="mt-2 font-heading text-lg text-foreground">
          {raffle.winner_name ? `${raffle.winner_name} took this one.` : 'This raffle has closed.'}
        </p>
      </div>
    )
  }

  if (isLoadingAuth) return <Skeleton />

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="serial">Enter this raffle</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sign in to use your vault points. Not a member yet? Pick a tier and your first points arrive immediately.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={navigateToLogin}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Sign in to enter
          </button>
          <Link
            to="/membership"
            className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground"
          >
            See membership tiers
          </Link>
        </div>
      </div>
    )
  }

  if (club.isLoading) return <Skeleton />

  if (!membership || membership.status !== 'active') {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="serial">Members only</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {membership
            ? 'Your membership is canceled. Rejoin a tier to keep entering raffles.'
            : "Your account isn't a member yet. Join a tier to receive points every month and start entering."}
        </p>
        <Link
          to="/membership"
          className="mt-5 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
        >
          Choose a tier
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="serial">Enter this raffle</p>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary">
          <Coins className="h-3 w-3" /> {balance} pts
        </span>
      </div>
      <p className="mt-4 font-mono text-3xl text-foreground">
        {raffle.entry_cost_points} <span className="text-sm text-muted-foreground">pts / entry</span>
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCount((c) => Math.max(1, c - 1))}
          disabled={count <= 1}
          aria-label="Fewer entries"
          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-foreground disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1 rounded-lg border border-border bg-background/60 py-2.5 text-center font-mono text-lg text-foreground">
          {count}
        </div>
        <button
          type="button"
          onClick={() => setCount((c) => Math.min(MAX_PER_ORDER, c + 1))}
          disabled={count >= MAX_PER_ORDER}
          aria-label="More entries"
          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-foreground disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className={cn('font-mono', affordable ? 'text-foreground' : 'text-destructive')}>{total} pts</span>
      </div>
      <button
        type="button"
        onClick={() => enter.mutate()}
        disabled={!affordable || enter.isPending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Ticket className="h-4 w-4" />
        {enter.isPending ? 'Locking in…' : affordable ? `Spend ${total} pts` : 'Not enough points'}
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Points come out of your vault right away. Entries can't be reversed.
      </p>
    </div>
  )
}

function RafflePage() {
  const { raffleId } = Route.useParams()
  const initial = Route.useLoaderData()
  // Re-fetched after an entry so the counts update.
  const { data: raffle } = useQuery({
    queryKey: ['raffle', raffleId],
    queryFn: () => getRaffle({ data: { id: raffleId } }),
    initialData: initial,
  })

  if (!raffle) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
          <h1 className="font-display text-3xl text-foreground">This raffle isn't here.</h1>
          <p className="mt-3 text-muted-foreground">It may have been drawn or taken down.</p>
          <Link
            to="/raffles"
            className="mt-8 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground"
          >
            See live raffles
          </Link>
        </div>
      </SiteLayout>
    )
  }

  const pct = progressPercent(raffle)

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <Link to="/raffles" className="serial inline-flex items-center gap-2 transition-colors hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> All raffles
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3">
              <PrizeImage src={raffle.prize_image} alt={raffle.prize_name} className="aspect-[4/3] w-full rounded-xl" />
              <span className="absolute left-6 top-6 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
                {GAME_LABELS[raffle.game] || raffle.game}
              </span>
            </div>

            <p className="serial mt-8">{raffle.kicker || 'Prize'}</p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">{raffle.prize_name}</h1>

            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <dt className="serial">Retail value</dt>
                <dd className="mt-2 font-heading text-lg font-semibold text-foreground">
                  ${Number(raffle.retail_value || 0).toLocaleString('en-US')}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <dt className="serial">Entries</dt>
                <dd className="mt-2 font-heading text-lg font-semibold text-foreground">
                  {Number(raffle.entries_count || 0).toLocaleString('en-US')}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <dt className="serial">Draw</dt>
                <dd className="mt-2 font-mono text-sm text-foreground">
                  {raffle.draws_at
                    ? new Date(raffle.draws_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'TBA'}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="serial">Entry momentum</span>
                <span className="font-mono">{pct}% of goal</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-holo" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {raffle.winner_name && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
                <Trophy className="h-5 w-5 text-gold" />
                <p className="text-sm text-foreground">
                  Won by <span className="font-semibold">{raffle.winner_name}</span>
                  {raffle.draw_note ? ` · ${raffle.draw_note}` : ''}
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4 text-primary" /> {raffle.entry_cost_points} pts per entry
              </span>
              <span className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                <Countdown target={raffle.draws_at} />
              </span>
            </div>
            <EntryPanel raffle={raffle} />
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
