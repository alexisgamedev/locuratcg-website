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
      { title: 'Membresía — Locura TCG' },
      {
        name: 'description',
        content:
          'Tres niveles de membresía que recargan tu bóveda con puntos cada mes. Úsalos en los sorteos de Pokémon y One Piece que más te interesan.',
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
        throw new Error('Culqi aún no está conectado. Agrega CULQI_PUBLIC_KEY y CULQI_SECRET_KEY a tu archivo .env.')
      }
      const tokenId = await openCulqiCheckout(checkout)
      return confirmPayment({ data: { tier: tier.id, tokenId } })
    },
    onSuccess: (res) => {
      toast.success(
        res?.granted
          ? `Pago aprobado: ${res.granted} puntos llegaron a tu bóveda.`
          : `Pago aprobado: ya estás en el nivel ${tier.name}.`,
      )
      queryClient.invalidateQueries({ queryKey: ['club'] })
      navigate({ to: '/dashboard' })
    },
    onError: (e: Error) => toast.error(e?.message || 'No se pudo completar.'),
  })

  return (
    <button
      type="button"
      onClick={() => (isAuthenticated ? join.mutate() : navigateToLogin())}
      disabled={join.isPending}
      className={`relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${tier.featured ? 'glow-ion bg-primary text-primary-foreground' : 'border border-border bg-background/60 text-foreground hover:border-primary/40'}`}
    >
      {join.isPending ? 'Abriendo pago seguro…' : `Unirme a ${tier.name}`}
      <ArrowRight className="h-4 w-4" />
    </button>
  )
}

const PROMISES = [
  'Participa en todos los sorteos activos',
  'Puntos guardados que no vencen mientras seas miembro',
  'Sorteo público para cada premio',
  'Cancela desde tu bóveda cuando quieras',
]

function MembershipPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Membresía" title="Una membresía." highlight="Puntos cada mes." glow>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Elige cuántos puntos quieres recibir en tu bóveda cada mes. Todos los niveles pueden participar en todos los
          sorteos: la única diferencia es cuántas balas tienes.
        </p>
        <div className="mt-6 inline-flex items-start gap-2.5 rounded-xl border border-border bg-card/60 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Se cobra mensualmente en soles (PEN) a través de Culqi. Los puntos de tu primer mes llegan a tu bóveda
            apenas Culqi aprueba el pago.
          </p>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} priceSuffix="/mes" pointsBig action={<JoinButton tier={tier} />} />
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
            Los miembros deben ser mayores de 18 años. Una membresía por persona.{' '}
            <Link to="/rules" className="underline underline-offset-4 hover:text-foreground">
              Lee las reglas del club
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  )
}
