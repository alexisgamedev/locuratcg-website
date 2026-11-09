import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Coins, Plus, Sparkles, Target, Ticket, Trophy } from 'lucide-react'
import { GameFilter, type GameFilterId } from '@/components/GameFilter'
import { PrizeImage } from '@/components/PrizeImage'
import { RaffleCard } from '@/components/RaffleCard'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { TierCard } from '@/components/TierCard'
import { TIERS } from '@/lib/tiers'
import type { Raffle } from '@/lib/types'
import { listRaffles } from '@/server/functions'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Pull Club — TCG prize raffles for Pokémon & One Piece collectors' },
      {
        name: 'description',
        content:
          "A membership club for TCG collectors. Your plan adds points to your vault every month, and you spend them on entries for the Pokémon and One Piece prizes you're chasing.",
      },
    ],
  }),
  loader: () => listRaffles(),
  component: HomePage,
})

// Hero art. Swap for your own file in /public when you move off Base44's image host.
const HERO_IMAGE = 'https://media.base44.com/images/public/6af216ac73a68f900ab673c0/7fbacb10e_generated_image.png'

function Hero({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 halo-grid opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-holo/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Season 04 · Pokémon &amp; One Piece
          </p>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-[4.4rem]">
            Keep the cards
            <br />
            you're <span className="text-holo">chasing.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Your membership drops points into your vault every month. Spend them on entries for the exact Pokémon and
            One Piece prizes you want — no bundles, no filler, no wasted tickets.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/membership"
              className="glow-ion inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Start your membership
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/raffles"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-card"
            >
              <Ticket className="h-4 w-4 text-primary" />
              See live raffles
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

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-holo/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card/80 p-3">
            <div className="relative overflow-hidden rounded-[1.25rem]">
              <PrizeImage src={HERO_IMAGE} alt="Graded holo card under a spotlight" className="aspect-[4/5] w-full" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">This week's grail</p>
                  <p className="mt-1 font-heading text-sm font-semibold text-white">Charizard ex · PSA 10</p>
                </div>
                <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] text-white ring-1 ring-white/20">
                  140 pts
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -left-4 top-8 hidden rounded-xl border border-border bg-background/90 px-4 py-3 backdrop-blur sm:block">
            <p className="serial">Your vault</p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" /> +400 pts
            </p>
          </div>
          <div className="absolute -right-3 bottom-16 hidden rounded-xl border border-border bg-background/90 px-4 py-3 backdrop-blur sm:block">
            <p className="serial">Entry confirmed</p>
            <p className="mt-1 font-mono text-sm text-foreground">#04,218</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  {
    n: '01',
    icon: Sparkles,
    title: 'Pick your tier',
    body: 'Rookie, Collector or Master. Each one sets how many vault points land in your account every month.',
  },
  {
    n: '02',
    icon: Coins,
    title: 'Points hit your vault',
    body: 'Your allowance arrives automatically on each renewal. No codes, no claiming, no expiry while you stay a member.',
  },
  {
    n: '03',
    icon: Target,
    title: 'Spend them where it counts',
    body: 'Drop points on the raffles you actually care about. Stack entries on one grail or spread them across ten prizes.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/70 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="serial">How the club works</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            Three moves. Then it's just luck.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Points are the only currency in the club — earn them monthly, aim them at whatever is on the table.
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

function Tiers() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="serial">Membership tiers</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            Points scale with the plan.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cancel anytime. Points already in your vault stay yours until the next draw.
          </p>
        </div>
        <Link to="/membership" className="serial transition-colors hover:text-primary">
          Compare every perk →
        </Link>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            priceSuffix="/mo"
            action={
              <Link
                to="/membership"
                className={`relative mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${tier.featured ? 'glow-ion bg-primary text-primary-foreground' : 'border border-border bg-background/60 text-foreground hover:border-primary/40'}`}
              >
                Choose {tier.name}
              </Link>
            }
          />
        ))}
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
            <p className="serial">Hall of fame</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
              Real members. Real pulls.
            </h2>
          </div>
          <Link to="/winners" className="serial transition-colors hover:text-primary">
            See all winners →
          </Link>
        </div>
        {shown.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            The first draws are coming up. Winners land here as soon as each raffle closes.
          </p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((w) => (
              <div key={w.id} className="rounded-2xl border border-border bg-background/60 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary/25 to-holo/25 font-mono text-xs font-bold text-foreground ring-1 ring-border">
                    {(w.winner_initials || 'PL').slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{w.winner_name || 'Member'}</p>
                    <p className="serial mt-1">{w.winner_tier ? `${w.winner_tier} member` : 'Pull Club member'}</p>
                  </div>
                  <Trophy className="ml-auto h-4 w-4 text-gold" />
                </div>
                <p className="mt-4 text-sm leading-snug text-foreground/85">{w.prize_name}</p>
                <p className="serial mt-3">
                  Won{' '}
                  {w.draws_at
                    ? new Date(w.draws_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'recently'}
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
    q: 'How do points turn into entries?',
    a: 'Every raffle lists a point cost per entry. Pick a raffle, choose how many entries you want, and the points come straight out of your vault. Entries stack, so you can go deep on one prize or spread them out.',
  },
  {
    q: 'What happens to unused points?',
    a: "They stay in your vault. Points don't disappear while your membership is active, so you can save up for a grail instead of spending them the day they arrive.",
  },
  {
    q: 'How are winners drawn?',
    a: 'Each raffle has a published draw date. At that time every entry is loaded into a public random draw, and the winner is announced on the winners page and by email.',
  },
  {
    q: 'Can I cancel my membership?',
    a: 'Yes, anytime from your vault. You keep access until the end of the period you already paid for, and any entries already placed stay in their raffles.',
  },
]

function Faq() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <p className="serial">Questions</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">Before you join.</h2>
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
  const entries = live.reduce((sum, r) => sum + Number(r.entries_count || 0), 0)
  const stats = [
    { label: 'Live prizes', value: String(live.length) },
    { label: 'Value on the table', value: `$${value.toLocaleString('en-US')}` },
    { label: 'Entries placed', value: entries.toLocaleString('en-US') },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero stats={stats} />

        <section id="raffles" className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="serial">Live now</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                On the table right now
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
              <p className="font-heading text-lg text-foreground">Nothing open in this game right now.</p>
              <p className="mt-2 text-sm text-muted-foreground">New raffles drop every week — check back soon.</p>
            </div>
          )}
        </section>

        <HowItWorks />
        <Tiers />
        <HallOfFame winners={drawn} />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  )
}
