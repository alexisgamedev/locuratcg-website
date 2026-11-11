import { createFileRoute, Link } from '@tanstack/react-router'
import { Coins, ShieldCheck, Ticket, Timer } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { SiteLayout } from '@/components/SiteLayout'

export const Route = createFileRoute('/rules')({
  head: () => ({
    meta: [
      { title: 'Cómo funciona — Locura TCG' },
      {
        name: 'description',
        content: 'Cómo funcionan los puntos de la membresía, cuánto cuesta un boleto, cuándo se sortean los premios y cómo se elige a los ganadores.',
      },
    ],
  }),
  component: RulesPage,
})

const RULES = [
  {
    icon: Coins,
    title: 'Primero, los puntos',
    body: 'Cada nivel de membresía suma una cantidad fija de puntos a tu bóveda en cada renovación mensual: 150 para Novato, 400 para Coleccionista y 900 para Maestro. Los puntos son la única forma de participar en un sorteo.',
  },
  {
    icon: Ticket,
    title: 'Tú decides tus boletos',
    body: 'Cada sorteo indica cuántos puntos cuesta un boleto. Tú eliges cuántos boletos llevar, de 1 a 20 por vez. Los puntos salen de tu bóveda en cuanto se confirman los boletos.',
  },
  {
    icon: Timer,
    title: 'Cada sorteo tiene fecha',
    body: 'La cuenta regresiva de cada sorteo es el plazo para participar. Al momento del sorteo, todos los boletos entran a un sorteo aleatorio público y se elige uno.',
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
          Nada de combos de boletos confusos. Una sola moneda, un costo claro por boleto y un sorteo publicado para cada premio.
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
          <h2 className="font-heading text-lg font-semibold text-foreground">¿Listo para usar tus puntos?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Elige un nivel, recibe tus primeros puntos al toque y ponlos en el premio que más quieras.
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
