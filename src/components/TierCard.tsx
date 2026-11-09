import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { Tier } from '@/lib/tiers'

export function TierCard({ tier, priceSuffix, pointsBig = false, action }: {
  tier: Tier
  priceSuffix: string
  pointsBig?: boolean
  action: ReactNode
}) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 ring-1 ${tier.ring} ${tier.featured ? 'lg:-mt-4 lg:mb-4' : ''}`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${tier.accent}`} />
      {tier.featured && (
        <span className="absolute right-5 top-5 rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-primary-foreground">
          Most picked
        </span>
      )}
      <div className="relative">
        <p className="serial">{tier.name}</p>
        <p className="mt-4 flex items-baseline gap-1.5">
          <span className="font-display text-4xl text-foreground">S/ {tier.pricePen}</span>
          <span className="text-sm text-muted-foreground">{priceSuffix}</span>
        </p>
        {pointsBig ? (
          <p className="mt-3 flex items-baseline gap-1.5 font-mono text-primary">
            <span className="text-2xl">+{tier.points}</span>
            <span className="text-xs text-muted-foreground">pts / month</span>
          </p>
        ) : (
          <p className="mt-3 flex items-center gap-2 font-mono text-sm text-primary">
            +{tier.points} pts <span className="text-muted-foreground">each month</span>
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">{tier.tagline}</p>
      </div>
      <ul className="relative mt-7 flex-1 space-y-3">
        {tier.perks.map((perk) => (
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
