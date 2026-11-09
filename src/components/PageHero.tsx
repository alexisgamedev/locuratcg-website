import type { ReactNode } from 'react'

/** The grid-backed header band used at the top of the inner pages. */
export function PageHero({
  eyebrow,
  title,
  highlight,
  children,
  glow = false,
}: {
  eyebrow: string
  title: string
  highlight: string
  children?: ReactNode
  glow?: boolean
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="pointer-events-none absolute inset-0 halo-grid opacity-60" />
      {glow && (
        <div className="pointer-events-none absolute -left-28 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
      )}
      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <p className="serial">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.02] text-foreground sm:text-5xl">
          {title} <span className="text-holo">{highlight}</span>
        </h1>
        {children}
      </div>
    </section>
  )
}
