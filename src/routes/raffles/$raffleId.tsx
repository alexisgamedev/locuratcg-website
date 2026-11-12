import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CircleCheck, Ticket, Trophy, Users } from 'lucide-react'
import { Countdown } from '@/components/Countdown'
import { PrizeImage } from '@/components/PrizeImage'
import { SiteLayout } from '@/components/SiteLayout'
import { useAuth } from '@/lib/auth'
import { GAME_LABELS } from '@/lib/games'
import { PLAN } from '@/lib/plan'
import type { Raffle } from '@/lib/types'
import { getMyClub, getRaffle } from '@/server/functions'

export const Route = createFileRoute('/raffles/$raffleId')({
  loader: ({ params }) => getRaffle({ data: { id: params.raffleId } }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.prize_name} — Locura TCG` : 'Sorteo — Locura TCG' }],
  }),
  component: RafflePage,
})

function Skeleton() {
  return <div className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
}

/** Tells the visitor whether they are in this raffle. Membership is the only way in. */
function EntryPanel({ raffle }: { raffle: Raffle }) {
  const { isAuthenticated, isLoadingAuth, navigateToLogin, user } = useAuth()
  const club = useQuery({ queryKey: ['club', user?.id], queryFn: () => getMyClub(), enabled: isAuthenticated })

  if (raffle.status !== 'live') {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="serial">Sorteo cerrado</p>
        <p className="mt-2 font-heading text-lg text-foreground">
          {raffle.winner_name ? `${raffle.winner_name} se llevó este premio.` : 'Este sorteo ya cerró.'}
        </p>
      </div>
    )
  }

  if (isLoadingAuth) return <Skeleton />

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="serial">Participa en este sorteo</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Todos los miembros participan automáticamente. Hazte miembro por S/ {PLAN.pricePen} al mes y entras a este
          sorteo y a todos los demás.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/membership"
            className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Ver la membresía
          </Link>
          <button
            type="button"
            onClick={navigateToLogin}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground"
          >
            Ya soy miembro: iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  if (club.isLoading) return <Skeleton />

  if (!club.data?.isActive) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="serial">Solo para miembros</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {club.data?.membership
            ? 'Tu membresía venció. Renuévala para volver a participar en este y en todos los sorteos.'
            : 'Tu cuenta aún no es miembro. Activa tu membresía y participarás automáticamente en este y en todos los sorteos.'}
        </p>
        <Link
          to="/membership"
          className="mt-5 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
        >
          {club.data?.membership ? 'Renovar membresía' : 'Ver la membresía'}
        </Link>
      </div>
    )
  }

  const periodEnd = club.data.membership?.current_period_end
  const coversDraw = !raffle.draws_at || !periodEnd || new Date(periodEnd) > new Date(raffle.draws_at)

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <p className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
        <CircleCheck className="h-5 w-5 text-primary" /> Ya estás participando
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Tu membresía te incluye en este sorteo. No tienes que hacer nada más: el día del sorteo se elige a un miembro
        al azar.
      </p>
      {!coversDraw && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-4">
          <p className="text-xs leading-relaxed text-foreground">
            Tu membresía vence antes de la fecha de este sorteo. Renuévala para seguir participando.
          </p>
          <Link to="/membership" className="mt-2 inline-block text-xs font-semibold text-gold underline-offset-4 hover:underline">
            Agregar un mes más
          </Link>
        </div>
      )}
    </div>
  )
}

function RafflePage() {
  const { raffleId } = Route.useParams()
  const initial = Route.useLoaderData()
  const { data: raffle } = useQuery({
    queryKey: ['raffle', raffleId],
    queryFn: () => getRaffle({ data: { id: raffleId } }),
    initialData: initial,
  })

  if (!raffle) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
          <h1 className="font-display text-3xl text-foreground">Este sorteo no está aquí.</h1>
          <p className="mt-3 text-muted-foreground">Puede que ya se haya sorteado o que lo hayan retirado.</p>
          <Link
            to="/raffles"
            className="mt-8 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground"
          >
            Ver sorteos activos
          </Link>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <Link to="/raffles" className="serial inline-flex items-center gap-2 transition-colors hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Todos los sorteos
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3">
              <PrizeImage src={raffle.prize_image} alt={raffle.prize_name} className="aspect-[4/3] w-full rounded-xl" />
              <span className="absolute left-6 top-6 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
                {GAME_LABELS[raffle.game] || raffle.game}
              </span>
            </div>

            <p className="serial mt-8">{raffle.kicker || 'Premio'}</p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">{raffle.prize_name}</h1>

            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <dt className="serial">Valor comercial</dt>
                <dd className="mt-2 font-heading text-lg font-semibold text-foreground">
                  US${Number(raffle.retail_value || 0).toLocaleString('es-PE')}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <dt className="serial">Participantes</dt>
                <dd className="mt-2 font-heading text-lg font-semibold text-foreground">
                  {Number(raffle.entries_count || 0).toLocaleString('es-PE')}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <dt className="serial">Sorteo</dt>
                <dd className="mt-2 font-mono text-sm text-foreground">
                  {raffle.draws_at
                    ? new Date(raffle.draws_at).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
                    : 'Por definir'}
                </dd>
              </div>
            </dl>

            {raffle.winner_name && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
                <Trophy className="h-5 w-5 text-gold" />
                <p className="text-sm text-foreground">
                  Ganado por <span className="font-semibold">{raffle.winner_name}</span>
                  {raffle.draw_note ? ` · ${raffle.draw_note}` : ''}
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" /> Incluido en tu membresía
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
