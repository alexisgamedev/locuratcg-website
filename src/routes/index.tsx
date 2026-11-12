import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CalendarClock, Plus, Sparkles, Ticket, Trophy, Users } from 'lucide-react'
import { GameFilter, type GameFilterId } from '@/components/GameFilter'
import { PlanCard } from '@/components/PlanCard'
import { FeaturedRaffle, pickFeaturedRaffle } from '@/components/FeaturedRaffle'
import { RaffleCard } from '@/components/RaffleCard'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import type { Raffle } from '@/lib/types'
import { listRaffles } from '@/server/functions'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Locura TCG — Sorteos de premios TCG para coleccionistas de Pokémon y One Piece' },
      {
        name: 'description',
        content:
          'Un club de membresía para coleccionistas de TCG. Con una sola suscripción participas automáticamente en todos los sorteos de Pokémon y One Piece.',
      },
    ],
  }),
  loader: () => listRaffles(),
  component: HomePage,
})

function Hero({ stats, featured }: { stats: { label: string; value: string }[]; featured: Raffle | null }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 halo-grid opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-holo/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Temporada 0 · Un sorteo cada semana
          </p>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-[4.4rem]">
            Quédate con las cartas
            <br />
            que tanto <span className="text-holo">buscas.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Una sola membresía te mete a todos los sorteos de Pokémon y One Piece. No hay nada que comprar
            ni que hacer: mientras seas miembro, ya estás participando.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/membership"
              className="glow-ion inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Empieza tu membresía
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/raffles"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-card"
            >
              <Ticket className="h-4 w-4 text-primary" />
              Ver sorteos activos
            </Link>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="serial">{s.label}</dt>
                <dd className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <FeaturedRaffle raffle={featured} />
      </div>
    </section>
  )
}

const STEPS = [
  {
    n: '01',
    icon: Sparkles,
    title: 'Hazte miembro',
    body: 'Un solo plan mensual, sin letra chica. Activas tu membresía y listo.',
  },
  {
    n: '02',
    icon: Users,
    title: 'Ya estás participando',
    body: 'Entras automáticamente a todos los sorteos activos, sin comprar boletos ni hacer nada más.',
  },
  {
    n: '03',
    icon: CalendarClock,
    title: 'Cada semana, un sorteo',
    body: 'Cada premio tiene su fecha. A esa hora se elige a un miembro al azar, todos con la misma probabilidad.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/70 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="serial">Cómo funciona el club</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            Tres pasos. Lo demás es pura suerte.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tu membresía es tu entrada: mientras esté activa, participas en todo lo que esté en juego.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="foil-swipe group relative overflow-hidden rounded-2xl border border-border bg-background/60 p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/25">
                  <s.icon className="h-5 w-5 text-primary" />
                </span>
                <span className="font-mono text-xs tracking-[0.24em] text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Plan() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <p className="serial">Membresía</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            Un plan. Todos los sorteos.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Todos los miembros tienen la misma probabilidad en cada sorteo.
            Cancela cuando quieras.
          </p>
          <Link to="/rules" className="serial mt-6 inline-block transition-colors hover:text-primary">
            Lee cómo funcionan los sorteos →
          </Link>
        </div>
        <PlanCard
          action={
            <Link
              to="/membership"
              className="glow-ion relative mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Empieza tu membresía
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    </section>
  )
}

function HallOfFame({ winners }: { winners: Raffle[] }) {
  const shown = winners.slice(0, 4)
  return (
    <section className="border-y border-border/70 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="serial">Salón de la fama</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
              Miembros reales. Pulls reales.
            </h2>
          </div>
          <Link to="/winners" className="serial transition-colors hover:text-primary">
            Ver todos los ganadores →
          </Link>
        </div>
        {shown.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Los primeros sorteos están por llegar. Los ganadores aparecerán aquí apenas cierre cada sorteo.
          </p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((w) => (
              <div key={w.id} className="rounded-2xl border border-border bg-background/60 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary/25 to-holo/25 font-mono text-xs font-bold text-foreground ring-1 ring-border">
                    {(w.winner_initials || 'LT').slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{w.winner_name || 'Miembro'}</p>
                    <p className="serial mt-1">Miembro de Locura TCG</p>
                  </div>
                  <Trophy className="ml-auto h-4 w-4 text-gold" />
                </div>
                <p className="mt-4 text-sm leading-snug text-foreground/85">{w.prize_name}</p>
                <p className="serial mt-3">
                  {w.draws_at
                    ? `Ganó el ${new Date(w.draws_at).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })}`
                    : 'Ganó hace poco'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const FAQ = [
  {
    q: '¿Qué tengo que hacer para participar en un sorteo?',
    a: 'Nada más que ser miembro. Mientras tu membresía esté vigente, participas automáticamente en todos los sorteos activos.',
  },
  {
    q: '¿Todos tienen la misma probabilidad?',
    a: 'Sí. Cada miembro cuenta una sola vez en cada sorteo, así que todos tienen exactamente la misma probabilidad de ganar.',
  },
  {
    q: '¿Cómo se eligen los ganadores?',
    a: 'Cada sorteo tiene una fecha publicada. A esa hora se elige al azar a uno de los miembros con membresía vigente, y el ganador se anuncia en la página de ganadores y por correo.',
  },
  {
    q: '¿Puedo cancelar mi membresía?',
    a: 'Sí, cuando quieras desde tu cuenta. Sigues participando en los sorteos hasta el final del periodo que ya pagaste.',
  },
]

function Faq() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <p className="serial">Preguntas</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">Antes de unirte.</h2>
      <div className="mt-10 divide-y divide-border border-y border-border">
        {FAQ.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="font-heading text-base font-semibold text-foreground">{item.q}</span>
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function HomePage() {
  const raffles = Route.useLoaderData()
  const [game, setGame] = useState<GameFilterId>('all')

  const live = raffles.filter((r) => r.status === 'live')
  const drawn = raffles.filter((r) => r.status === 'drawn')
  const shown = live.filter((r) => game === 'all' || r.game === game)
  const value = live.reduce((sum, r) => sum + Number(r.retail_value || 0), 0)
  const members = Number(live[0]?.entries_count || 0)
  const stats = [
    { label: 'Premios activos', value: String(live.length) },
    { label: 'Valor en juego', value: `US$${value.toLocaleString('es-PE')}` },
    { label: 'Miembros en juego', value: members.toLocaleString('es-PE') },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero stats={stats} featured={pickFeaturedRaffle(live)} />

        <section id="raffles" className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="serial">En vivo</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                En juego ahora mismo
              </h2>
            </div>
            <GameFilter value={game} onChange={setGame} />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r) => (
              <RaffleCard key={r.id} raffle={r} />
            ))}
          </div>
          {shown.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-14 text-center">
              <p className="font-heading text-lg text-foreground">No hay sorteos abiertos de este juego por ahora.</p>
              <p className="mt-2 text-sm text-muted-foreground">Cada semana salen nuevos sorteos. ¡Vuelve pronto!</p>
            </div>
          )}
        </section>

        <HowItWorks />
        <Plan />
        <HallOfFame winners={drawn} />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  )
}
