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
      { title: 'Sorteos activos — Locura TCG' },
      {
        name: 'description',
        content:
          'Todos los premios de Pokémon y One Piece abiertos ahora mismo. Con tu membresía participas automáticamente en todos.',
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
      <PageHero eyebrow="En juego" title="Sorteos abiertos," highlight="todos para los miembros.">
        <p className="mt-5 max-w-xl text-muted-foreground">
          {live.length === 1 ? 'Hay 1 premio activo' : `Hay ${live.length} premios activos`} ahora mismo. Si tu
          membresía está activa, ya participas en todos: no hay nada más que hacer.
        </p>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="serial">{shown.length === 1 ? '1 sorteo' : `${shown.length} sorteos`}</p>
          <GameFilter value={game} onChange={setGame} />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <RaffleCard key={r.id} raffle={r} />
          ))}
        </div>
        {shown.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-14 text-center">
            <p className="font-heading text-lg text-foreground">Aún no hay sorteos abiertos de este juego.</p>
            <p className="mt-2 text-sm text-muted-foreground">Cada semana salen nuevos sorteos. ¡Vuelve pronto!</p>
          </div>
        )}
      </section>
    </SiteLayout>
  )
}
