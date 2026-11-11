import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Trash2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { RaffleForm } from '@/components/admin/RaffleForm'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getTier } from '@/lib/tiers'
import { adminGetRaffle, deleteRaffle, drawRaffleNow } from '@/server/admin-functions'

export const Route = createFileRoute('/admin/raffles/$raffleId')({
  component: EditRafflePage,
})

function EditRafflePage() {
  const { raffleId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirm, setConfirm] = useState<'draw' | 'delete' | null>(null)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'raffle', raffleId],
    queryFn: () => adminGetRaffle({ data: { id: raffleId } }),
  })

  const draw = useMutation({
    mutationFn: () => drawRaffleNow({ data: { id: raffleId } }),
    onSuccess: (res) => {
      toast.success(res.winner ? `Winner: ${res.winner.name} (${res.winner.email})` : 'Closed with no entries.')
      setConfirm(null)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['admin', 'raffles'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: () => deleteRaffle({ data: { id: raffleId } }),
    onSuccess: () => {
      toast.success('Raffle deleted.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'raffles'] })
      navigate({ to: '/admin' })
    },
    onError: (e: Error) => {
      toast.error(e.message)
      setConfirm(null)
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-14">
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    )
  }
  const raffle = data?.raffle
  if (!raffle) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl text-foreground">Raffle not found.</h1>
        <Link to="/admin" className="mt-6 inline-flex text-sm text-primary hover:underline">
          Back to raffles
        </Link>
      </div>
    )
  }
  const entrants = data.entrants
  const totalEntries = entrants.reduce((s, e) => s + e.tickets, 0)

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="serial">Edit raffle</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-foreground">{raffle.prize_name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={raffle.status} />
          {raffle.status !== 'draft' && (
            <Link
              to="/raffles/$raffleId"
              params={{ raffleId: raffle.id }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              View on site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {raffle.status === 'drawn' ? (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
          <Trophy className="h-5 w-5 text-gold" />
          <p className="text-sm text-foreground">
            {raffle.winner_name ? (
              <>
                Won by <span className="font-semibold">{raffle.winner_name}</span>
                {raffle.winner_tier ? ` (${raffle.winner_tier})` : ''}
                {raffle.draw_note ? ` · ${raffle.draw_note}` : ''}
              </>
            ) : (
              raffle.draw_note || 'Closed.'
            )}
          </p>
        </div>
      ) : (
        <RaffleForm raffle={raffle} onSaved={() => refetch()} />
      )}

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <p className="serial">Entrants</p>
          <span className="serial">
            {entrants.length} members · {totalEntries} entries
          </span>
        </div>
        {entrants.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No entries yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/60">
                <tr className="serial">
                  <th className="px-4 py-3 font-normal">Member</th>
                  <th className="px-4 py-3 font-normal">Tier</th>
                  <th className="px-4 py-3 text-right font-normal">Entries</th>
                  <th className="px-4 py-3 text-right font-normal">Chance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entrants.map((e) => (
                  <tr key={e.user_id}>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{e.full_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{e.tier ? getTier(e.tier).name : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">{e.tickets}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {Math.round((e.tickets / totalEntries) * 1000) / 10}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {raffle.status !== 'drawn' && (
        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <p className="serial">Actions</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            {raffle.status === 'live' && (
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Raffles draw automatically once their draw date passes. Draw now to pick a winner early.
                </p>
                {confirm === 'draw' ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => draw.mutate()}
                      disabled={draw.isPending}
                      className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
                    >
                      {draw.isPending ? 'Drawing…' : 'Yes, draw now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm(null)}
                      className="rounded-full border border-border px-4 py-2 text-xs text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirm('draw')}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs font-semibold text-gold"
                  >
                    <Trophy className="h-3.5 w-3.5" /> Draw winner now
                  </button>
                )}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Delete is only possible before anyone has entered.</p>
              {confirm === 'delete' ? (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => remove.mutate()}
                    disabled={remove.isPending}
                    className="rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
                  >
                    {remove.isPending ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(null)}
                    className="rounded-full border border-border px-4 py-2 text-xs text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirm('delete')}
                  disabled={entrants.length > 0}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete raffle
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
