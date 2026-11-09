import { createFileRoute } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { PrizeImage } from '@/components/PrizeImage'
import { SiteLayout } from '@/components/SiteLayout'
import { GAME_LABELS } from '@/lib/games'
import { listRaffles } from '@/server/functions'

export const Route = createFileRoute('/winners')({
  head: () => ({
    meta: [
      { title: 'Winners — Pull Club' },
      { name: 'description', content: 'Every prize that has been drawn and the member who pulled it.' },
    ],
  }),
  loader: () => listRaffles(),
  component: WinnersPage,
})

function WinnersPage() {
  const drawn = Route.useLoaderData().filter((r) => r.status === 'drawn')

  return (
    <SiteLayout>
      <PageHero eyebrow="Hall of fame" title="The wall of" highlight="wins.">
        <p className="mt-5 max-w-xl text-muted-foreground">
          Every draw is public. Here's who walked away with what, and which tier they were on.
        </p>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        {drawn.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center">
            <Trophy className="mx-auto h-6 w-6 text-gold" />
            <p className="mt-4 font-heading text-lg text-foreground">No draws finished yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">The first winners will appear here after the next draw.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drawn.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <PrizeImage src={r.prize_image} alt={r.prize_name} className="aspect-[16/10] w-full" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="serial">{GAME_LABELS[r.game] || r.game}</span>
                    <Trophy className="h-4 w-4 text-gold" />
                  </div>
                  <h2 className="mt-3 font-heading text-base font-semibold leading-snug text-foreground">
                    {r.prize_name}
                  </h2>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary/25 to-holo/25 font-mono text-[11px] font-bold text-foreground ring-1 ring-border">
                      {(r.winner_initials || 'PL').slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.winner_name || 'Member'}</p>
                      <p className="serial mt-0.5">{r.winner_tier ? `${r.winner_tier} member` : 'Pull Club member'}</p>
                    </div>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      {r.draws_at
                        ? new Date(r.draws_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  )
}
