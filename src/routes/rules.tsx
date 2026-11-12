import { createFileRoute, Link } from '@tanstack/react-router'
import { BadgeCheck, ShieldCheck, Timer, Users } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { SiteLayout } from '@/components/SiteLayout'
import { PLAN, PLAN_DISCOUNTED } from '@/lib/plan'

export const Route = createFileRoute('/rules')({
  head: () => ({
    meta: [
      { title: 'Cómo funciona — Locura TCG' },
      {
        name: 'description',
        content: 'Cómo funciona la membresía, quiénes participan en cada sorteo, cuándo se sortean los premios y cómo se elige a los ganadores.',
      },
    ],
  }),
  component: RulesPage,
})

const RULES = [
  {
    icon: BadgeCheck,
    title: 'Una sola membresía',
    body: `Hay un único plan mensual${PLAN_DISCOUNTED ? `: S/ ${PLAN.pricePen} al mes como precio de lanzamiento (el precio regular es S/ ${PLAN.regularPricePen})` : ` de S/ ${PLAN.pricePen}`}. Cada pago cubre ${PLAN.periodDays} días de membresía.`,
  },
  {
    icon: Users,
    title: 'Participas automáticamente',
    body: 'Mientras tu membresía esté vigente, participas en todos los sorteos activos sin hacer nada más. Cada miembro cuenta una sola vez por sorteo, así que todos tienen la misma probabilidad.',
  },
  {
    icon: Timer,
    title: 'Cada sorteo tiene fecha',
    body: 'La cuenta regresiva de cada sorteo marca cuándo se realiza. En ese momento se elige al azar a uno de los miembros con membresía vigente. Si tu membresía vence antes de esa fecha, no entras a ese sorteo.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparencia y requisitos',
    body: 'Los miembros deben ser mayores de 18 años. Una membresía por persona. Los trabajadores y proveedores de Locura TCG no pueden participar. Si no podemos enviar un premio a tu dirección, te ofreceremos un crédito en tienda por el mismo valor.',
  },
]

function RulesPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Las reglas de la casa" title="Así funciona" highlight="Locura TCG.">
        <p className="mt-5 max-w-xl text-muted-foreground">
          Una sola membresía, la misma probabilidad para todos y un sorteo publicado para cada premio.
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
          <h2 className="font-heading text-lg font-semibold text-foreground">¿Listo para participar?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Activa tu membresía y entras al toque a todos los sorteos activos.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/membership"
              className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Empieza tu membresía
            </Link>
            <Link
              to="/raffles"
              className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground"
            >
              Ver sorteos activos
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
