import { createFileRoute } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { PrizeImage } from '@/components/PrizeImage'
import { SiteLayout } from '@/components/SiteLayout'
import { GAME_LABELS } from '@/lib/games'
import { tierLabel } from '@/lib/tiers'
import { listRaffles } from '@/server/functions'

export const Route = createFileRoute('/winners')({
  head: () => ({
    meta: [
      { title: 'Ganadores — Locura TCG' },
      { name: 'description', content: 'Todos los premios sorteados y el miembro que se los llevó.' },
    ],
  }),
  loader: () => listRaffles(),
  component: WinnersPage,
})

function WinnersPage() {
  const drawn = Route.useLoaderData().filter((r) => r.status === 'drawn')

  return (
    <SiteLayout>
      <PageHero eyebrow="Salón de la fama" title="El muro de" highlight="ganadores.">
        <p className="mt-5 max-w-xl text-muted-foreground">
          Todos los sorteos son públicos. Aquí ves quién se llevó qué y en qué nivel estaba.
        </p>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        {drawn.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center">
            <Trophy className="mx-auto h-6 w-6 text-gold" />
            <p className="mt-4 font-heading text-lg text-foreground">Todavía no hay sorteos finalizados.</p>
            <p className="mt-2 text-sm text-muted-foreground">Los primeros ganadores aparecerán aquí después del próximo sorteo.</p>
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
                      {(r.winner_initials || 'LT').slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.winner_name || 'Miembro'}</p>
                      <p className="serial mt-0.5">{r.winner_tier ? `Miembro ${tierLabel(r.winner_tier)}` : 'Miembro de Locura TCG'}</p>
                    </div>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      {r.draws_at
                        ? new Date(r.draws_at).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
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
