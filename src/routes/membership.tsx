import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, Info } from 'lucide-react'
import { toast } from 'sonner'
import { PageHero } from '@/components/PageHero'
import { PlanCard } from '@/components/PlanCard'
import { SiteLayout } from '@/components/SiteLayout'
import { useAuth } from '@/lib/auth'
import { openCulqiCheckout } from '@/lib/culqi'
import { PLAN, PLAN_DISCOUNTED } from '@/lib/plan'
import { confirmPayment, getMyClub, startCheckout } from '@/server/functions'

export const Route = createFileRoute('/membership')({
  head: () => ({
    meta: [
      { title: 'Membresía — Locura TCG' },
      {
        name: 'description',
        content:
          'Una sola membresía mensual. Mientras esté activa, participas automáticamente en todos los sorteos de Pokémon y One Piece.',
      },
    ],
  }),
  component: MembershipPage,
})

function JoinButton() {
  const { isAuthenticated, navigateToLogin, user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const club = useQuery({ queryKey: ['club', user?.id], queryFn: () => getMyClub(), enabled: isAuthenticated })
  const isMember = Boolean(club.data?.isActive)

  const join = useMutation({
    mutationFn: async () => {
      const checkout = await startCheckout()
      if (!checkout.configured) {
        throw new Error('Culqi aún no está conectado. Agrega CULQI_PUBLIC_KEY y CULQI_SECRET_KEY a tu archivo .env.')
      }
      const tokenId = await openCulqiCheckout(checkout)
      return confirmPayment({ data: { tokenId } })
    },
    onSuccess: () => {
      toast.success('Pago aprobado: ya participas en todos los sorteos activos.')
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
      className="glow-ion relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {join.isPending ? 'Abriendo pago seguro…' : isMember ? 'Agregar un mes más' : 'Unirme al club'}
      <ArrowRight className="h-4 w-4" />
    </button>
  )
}

const PROMISES = [
  'Participas en todos los sorteos activos',
  'La misma probabilidad para cada miembro',
  'Sorteo público para cada premio',
  'Cancela desde tu cuenta cuando quieras',
]

function MembershipPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Membresía" title="Una membresía." highlight="Todos los sorteos." glow>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Un solo plan. Mientras tu membresía esté activa, participas automáticamente
          en todos los sorteos, con la misma probabilidad que cualquier otro miembro.
        </p>
        <div className="mt-6 inline-flex items-start gap-2.5 rounded-xl border border-border bg-card/60 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {PLAN_DISCOUNTED
              ? `Precio de lanzamiento: S/ ${PLAN.pricePen} al mes en lugar de S/ ${PLAN.regularPricePen}. `
              : ''}
            Se paga en soles (PEN) a través de Culqi. Cada pago cubre {PLAN.periodDays} días y empiezas a participar
            apenas Culqi lo aprueba.
          </p>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <PlanCard action={<JoinButton />} />

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
