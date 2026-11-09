import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, Info } from 'lucide-react'
import { toast } from 'sonner'
import { PageHero } from '@/components/PageHero'
import { SiteLayout } from '@/components/SiteLayout'
import { TierCard } from '@/components/TierCard'
import { useAuth } from '@/lib/auth'
import { openCulqiCheckout } from '@/lib/culqi'
import { TIERS, type Tier } from '@/lib/tiers'
import { confirmPayment, startCheckout } from '@/server/functions'

export const Route = createFileRoute('/membership')({
  head: () => ({
    meta: [
      { title: 'Membership — Pull Club' },
      {
        name: 'description',
        content:
          'Three membership tiers, each topping up your vault with points every month. Spend them on the Pokémon and One Piece raffles you care about.',
      },
    ],
  }),
  component: MembershipPage,
})

function JoinButton({ tier }: { tier: Tier }) {
  const { isAuthenticated, navigateToLogin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const join = useMutation({
    mutationFn: async () => {
      const checkout = await startCheckout({ data: { tier: tier.id } })
      if (!checkout.configured) {
        throw new Error("Culqi isn't connected yet. Add CULQI_PUBLIC_KEY and CULQI_SECRET_KEY to your .env file.")
      }
      const tokenId = await openCulqiCheckout(checkout)
      return confirmPayment({ data: { tier: tier.id, tokenId } })
    },
    onSuccess: (res) => {
      toast.success(
        res?.granted
          ? `Payment approved — ${res.granted} points landed in your vault.`
          : `Payment approved — you're on the ${tier.name} tier.`,
      )
      queryClient.invalidateQueries({ queryKey: ['club'] })
      navigate({ to: '/dashboard' })
    },
    onError: (e: Error) => toast.error(e?.message || "That didn't go through."),
  })

  return (
    <button
      type="button"
      onClick={() => (isAuthenticated ? join.mutate() : navigateToLogin())}
      disabled={join.isPending}
      className={`relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${tier.featured ? 'glow-ion bg-primary text-primary-foreground' : 'border border-border bg-background/60 text-foreground hover:border-primary/40'}`}
    >
      {join.isPending ? 'Opening secure checkout…' : `Join ${tier.name}`}
      <ArrowRight className="h-4 w-4" />
    </button>
  )
}

const PROMISES = [
  'Entries in every live raffle',
  "Points banked, never expired while you're a member",
  'Public draw for every prize',
  'Cancel from your vault anytime',
]

function MembershipPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Membership" title="One membership." highlight="Points every month." glow>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Pick how many points you want landing in your vault each month. Every tier can enter every raffle — the only
          difference is how much ammo you get.
        </p>
        <div className="mt-6 inline-flex items-start gap-2.5 rounded-xl border border-border bg-card/60 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Billed monthly in Peruvian soles (PEN) through Culqi. Your first month's points land in your vault the
            moment Culqi approves the payment.
          </p>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} priceSuffix="/month" pointsBig action={<JoinButton tier={tier} />} />
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-card/50 p-7 sm:p-9">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((p) => (
              <div key={p} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground/85">{p}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Members must be 18+. One membership per person.{' '}
            <Link to="/rules" className="underline underline-offset-4 hover:text-foreground">
              Read the club rules
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  )
}
