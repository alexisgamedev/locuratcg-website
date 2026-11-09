import { createFileRoute, Link } from '@tanstack/react-router'
import { Coins, ShieldCheck, Ticket, Timer } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { SiteLayout } from '@/components/SiteLayout'

export const Route = createFileRoute('/rules')({
  head: () => ({
    meta: [
      { title: 'How it works — Pull Club' },
      {
        name: 'description',
        content: 'How membership points work, what an entry costs, when raffles draw, and how winners are picked.',
      },
    ],
  }),
  component: RulesPage,
})

const RULES = [
  {
    icon: Coins,
    title: 'Points come first',
    body: 'Every membership tier adds a fixed number of vault points on each monthly renewal — 150 for Rookie, 400 for Collector, 900 for Master. Points are the only way to enter a raffle.',
  },
  {
    icon: Ticket,
    title: 'Entries are your call',
    body: 'Each raffle lists a point cost per entry. You choose how many entries to take, from 1 to 20 at a time. Points leave your vault the moment entries are confirmed.',
  },
  {
    icon: Timer,
    title: 'Every raffle has a draw date',
    body: 'The countdown on each raffle is the entry deadline. At the draw, every entry placed is loaded into a public random draw and one is picked.',
  },
  {
    icon: ShieldCheck,
    title: 'Fairness and eligibility',
    body: "Members must be 18 or over. One membership per person. Employees and contractors of Pull Club aren't eligible. If a prize can't be shipped to your address, we'll offer a store credit of the same value.",
  },
]

function RulesPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="The house rules" title="How Pull Club" highlight="actually works.">
        <p className="mt-5 max-w-xl text-muted-foreground">
          No confusing ticket bundles. One currency, one clear cost per entry, and a published draw for every prize.
        </p>
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="space-y-4">
          {RULES.map((r) => (
            <div key={r.title} className="flex gap-5 rounded-2xl border border-border bg-card p-6 sm:p-7">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/25">
                <r.icon className="h-5 w-5 text-primary" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">{r.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-7">
          <h2 className="font-heading text-lg font-semibold text-foreground">Ready to aim your points?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a tier, get your first points immediately, and put them on whichever prize you want most.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/membership"
              className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Start your membership
            </Link>
            <Link
              to="/raffles"
              className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground"
            >
              Browse live raffles
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
