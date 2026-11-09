import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Coins, Sparkles, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { GAME_LABELS } from '@/lib/games'
import { getTier } from '@/lib/tiers'
import { cancelMembership, getMyClub } from '@/server/functions'

export const Route = createFileRoute('/_authed/dashboard')({
  head: () => ({ meta: [{ title: 'My vault — Pull Club' }] }),
  component: DashboardPage,
})

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function DashboardPage() {
  const { user } = Route.useRouteContext()
  const [confirming, setConfirming] = useState(false)
  const { data, isLoading, refetch } = useQuery({ queryKey: ['club', user.id], queryFn: () => getMyClub() })

  const cancel = useMutation({
    mutationFn: () => cancelMembership(),
    onSuccess: () => {
      toast.success('Membership canceled. You keep access until your renewal date.')
      setConfirming(false)
      refetch()
    },
    onError: (e: Error) => toast.error(e?.message || 'Could not cancel right now.'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    )
  }

  const membership = data?.membership
  const entries = data?.entries ?? []
  const transactions = data?.transactions ?? []

  if (!membership) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <Sparkles className="mx-auto h-6 w-6 text-primary" />
        <h1 className="mt-5 font-display text-3xl text-foreground">Your vault is empty.</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          You're signed in but not a member yet. Pick a tier and points land in your vault right away.
        </p>
        <Link
          to="/membership"
          className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground"
        >
          Choose a tier
        </Link>
      </div>
    )
  }

  const tier = getTier(membership.tier)
  const firstName = String(user.full_name || '').split(' ')[0] || 'collector'
  const totalEntries = entries.reduce((sum, e) => sum + Number(e.tickets || 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <p className="serial">My vault</p>
      <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">Hey {firstName}.</h1>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="serial">Points balance</p>
              <p className="mt-3 flex items-end gap-2">
                <span className="font-display text-5xl text-foreground">
                  {Number(membership.points_balance || 0).toLocaleString('en-US')}
                </span>
                <span className="pb-2 font-mono text-sm text-muted-foreground">pts</span>
              </p>
            </div>
            <span className="rounded-full bg-primary/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary ring-1 ring-primary/30">
              {tier.name} tier
            </span>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
            <div>
              <p className="serial">Monthly drop</p>
              <p className="mt-1.5 font-mono text-sm text-foreground">+{membership.monthly_points || tier.points} pts</p>
            </div>
            <div>
              <p className="serial">Status</p>
              <p className="mt-1.5 font-mono text-sm capitalize text-foreground">{membership.status}</p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/raffles"
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Spend points
            </Link>
            <Link
              to="/membership"
              className="flex-1 rounded-full border border-border px-5 py-2.5 text-center text-sm font-semibold text-foreground"
            >
              Change tier
            </Link>
          </div>

          {membership.status === 'active' &&
            (confirming ? (
              <div className="relative mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                <p className="text-xs text-foreground">Cancel your membership?</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => cancel.mutate()}
                    disabled={cancel.isPending}
                    className="rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
                  >
                    {cancel.isPending ? 'Canceling…' : 'Yes, cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-full border border-border px-4 py-2 text-xs text-foreground"
                  >
                    Keep membership
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="relative mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Cancel membership
              </button>
            ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-7">
          <p className="serial">Points activity</p>
          {transactions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No activity yet — your first drop is on its way.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm text-foreground">{t.description}</p>
                    <p className="serial mt-1">{shortDate(t.created_date)}</p>
                  </div>
                  <span className={`font-mono text-sm ${t.amount > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {t.amount > 0 ? '+' : ''}
                    {t.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <p className="serial">My entries</p>
          <span className="serial">{totalEntries} total</span>
        </div>
        {entries.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-12 text-center">
            <Ticket className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              You haven't placed any entries yet. Find a prize worth your points.
            </p>
            <Link
              to="/raffles"
              className="mt-5 inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              See live raffles
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {entries.map((e) => (
              <Link
                key={e.id}
                to="/raffles/$raffleId"
                params={{ raffleId: e.raffle_id }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                  <Ticket className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.raffle_title}</p>
                  <p className="serial mt-1">
                    {GAME_LABELS[e.game] || e.game} · {e.tickets} {Number(e.tickets) === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">
                  <Coins className="h-3 w-3" /> {e.points_spent}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
