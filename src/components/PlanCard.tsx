import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { PLAN, PLAN_DISCOUNTED } from '@/lib/plan'

/** The club's single subscription: price (with the launch discount, if any), perks and a call to action. */
export function PlanCard({ action }: { action: ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 ring-1 ring-primary/50 sm:p-9">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/25 to-transparent" />
      {PLAN_DISCOUNTED && (
        <span className="relative mb-4 self-start rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-primary-foreground">
          Precio de lanzamiento
        </span>
      )}
      <div className="relative">
        <p className="serial">{PLAN.name}</p>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-display text-5xl text-foreground">S/ {PLAN.pricePen}</span>
          <span className="text-sm text-muted-foreground">/mes</span>
          {PLAN_DISCOUNTED && (
            <span className="text-lg text-muted-foreground line-through decoration-holo/70">
              <span className="sr-only">Precio regular: </span>S/ {PLAN.regularPricePen}
            </span>
          )}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{PLAN.tagline}</p>
      </div>
      <ul className="relative mt-7 flex-1 space-y-3">
        {PLAN.perks.map((perk) => (
          <li key={perk} className="flex gap-2.5 text-sm text-foreground/85">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {perk}
          </li>
        ))}
      </ul>
      {action}
    </div>
  )
}
