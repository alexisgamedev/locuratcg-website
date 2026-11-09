import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { GameFilter, type GameFilterId } from '@/components/GameFilter'
import { PageHero } from '@/components/PageHero'
import { RaffleCard } from '@/components/RaffleCard'
import { SiteLayout } from '@/components/SiteLayout'
import { listRaffles } from '@/server/functions'

export const Route = createFileRoute('/raffles/')({
  head: () => ({
    meta: [
      { title: 'Live raffles — Pull Club' },
      {
        name: 'description',
        content:
          'Every Pokémon and One Piece prize currently open for entries. Spend your vault points on the ones you want.',
      },
    ],
  }),
  loader: () => listRaffles(),
  component: RafflesPage,
})

function RafflesPage() {
  const raffles = Route.useLoaderData()
  const [game, setGame] = useState<GameFilterId>('all')
  const live = raffles.filter((r) => r.status === 'live')
  const shown = live.filter((r) => game === 'all' || r.game === game)

  return (
    <SiteLayout>
      <PageHero eyebrow="On the table" title="Open raffles," highlight="ready for your points.">
        <p className="mt-5 max-w-xl text-muted-foreground">
          {live.length} prizes are live right now. Every entry costs points from your vault — put them all on one
          grail, or spread them across a few.
        </p>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="serial">{shown.length} raffles shown</p>
          <GameFilter value={game} onChange={setGame} />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <RaffleCard key={r.id} raffle={r} />
          ))}
        </div>
        {shown.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-14 text-center">
            <p className="font-heading text-lg text-foreground">Nothing open in this game yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">New raffles drop every week — check back soon.</p>
          </div>
        )}
      </section>
    </SiteLayout>
  )
}
